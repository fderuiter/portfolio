/**
 * Chunk-level circular dependency gate for the webpack production build (#853).
 *
 * `npm run lint:boundaries` proves the module graph is acyclic, but webpack can
 * still produce a cycle one layer down, between runtime chunks. Every entrypoint
 * and every async entrypoint (a Web Worker created with
 * `new Worker(new URL("./x.ts", import.meta.url))`) gets a chunk that carries its
 * own webpack runtime. When runtime chunk A can start async entrypoint B and B's
 * runtime chunk can, directly or transitively, start A again, webpack cannot
 * hash either chunk from the other's final hash. It then prints
 * "Circular dependency between chunks with runtime" as a warning and hashes them
 * in an arbitrary order, which weakens long-term caching.
 *
 * This plugin repeats webpack's own analysis after the chunk graph is sealed,
 * names every chunk in the cycle together with the module that starts each
 * async entrypoint, and fails the compilation instead of warning. It never
 * removes webpack's warning; it adds an error beside it.
 *
 * Deliberately free of runtime imports so that `next.config.ts` can load it
 * before webpack is resolved. The structural interfaces below describe only the
 * parts of webpack's API the analysis reads.
 */

/** The warning text webpack emits for a runtime chunk cycle (lib/Compilation.js). */
export const WEBPACK_RUNTIME_CHUNK_CYCLE_WARNING =
  "Circular dependency between chunks with runtime";

/** A webpack module, reduced to what is needed to name it. */
export interface ChunkCycleModuleLike {
  identifier(): string;
  nameForCondition?(): string | null;
}

/** Where an async entrypoint was requested from. */
export interface ChunkCycleOriginLike {
  module?: ChunkCycleModuleLike | null;
  request?: string | null;
}

/** An entrypoint or async entrypoint. Its last chunk carries the runtime. */
export interface ChunkCycleEntrypointLike {
  name?: string | null;
  chunks: ChunkCycleChunkLike[];
  origins?: ChunkCycleOriginLike[];
}

/** A webpack chunk, reduced to what the runtime-cycle analysis reads. */
export interface ChunkCycleChunkLike {
  name?: string | null;
  id?: string | number | null;
  hasRuntime(): boolean;
  getAllReferencedAsyncEntrypoints(): Iterable<ChunkCycleEntrypointLike>;
}

/** A webpack compilation, reduced to what the plugin reads and writes. */
export interface ChunkCycleCompilationLike {
  chunks: Iterable<ChunkCycleChunkLike>;
  chunkGraph?: {
    getChunkEntryModulesIterable(
      chunk: ChunkCycleChunkLike
    ): Iterable<ChunkCycleModuleLike>;
  };
  warnings: Array<{ message: string }>;
  errors: unknown[];
  hooks: {
    afterSeal: {
      tap(name: string, callback: () => void): void;
    };
  };
}

/** A webpack compiler, reduced to what the plugin reads. */
export interface ChunkCycleCompilerLike {
  context?: string;
  webpack?: { WebpackError?: new (message: string) => Error };
  hooks: {
    compilation: {
      tap(
        name: string,
        callback: (compilation: ChunkCycleCompilationLike) => void
      ): void;
    };
  };
}

/** One edge between runtime chunks: `from` can start the async entrypoint whose runtime is `to`. */
export interface RuntimeChunkEdge {
  from: string;
  to: string;
  /** Who requested the async entrypoint, e.g. `lib/a.ts requests "./worker.ts"`. */
  via: string[];
}

/** A strongly connected set of runtime chunks, i.e. one cycle to break. */
export interface RuntimeChunkCycle {
  /** Chunk labels in the cycle, sorted. */
  chunks: string[];
  /** Entry modules of each chunk in the cycle, keyed by chunk label. */
  entryModules: Record<string, string[]>;
  /** Edges that stay inside the cycle. */
  edges: RuntimeChunkEdge[];
}

/** Adjacency list of runtime chunk labels. */
export type RuntimeChunkGraph = Map<string, string[]>;

/**
 * Finds every cycle in a runtime chunk graph: each strongly connected component
 * with more than one chunk, and each chunk that references itself. Uses
 * Tarjan's algorithm so that a large graph is analysed in linear time, and
 * returns components sorted for deterministic output.
 */
export function findRuntimeChunkCycles(graph: RuntimeChunkGraph): string[][] {
  const indexOf = new Map<string, number>();
  const lowLink = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let nextIndex = 0;

  const nodes = new Set<string>(graph.keys());
  for (const targets of graph.values()) {
    for (const target of targets) nodes.add(target);
  }

  const visit = (node: string): void => {
    indexOf.set(node, nextIndex);
    lowLink.set(node, nextIndex);
    nextIndex++;
    stack.push(node);
    onStack.add(node);

    for (const target of graph.get(node) ?? []) {
      if (!indexOf.has(target)) {
        visit(target);
        lowLink.set(
          node,
          Math.min(lowLink.get(node) as number, lowLink.get(target) as number)
        );
      } else if (onStack.has(target)) {
        lowLink.set(
          node,
          Math.min(lowLink.get(node) as number, indexOf.get(target) as number)
        );
      }
    }

    if (lowLink.get(node) === indexOf.get(node)) {
      const component: string[] = [];
      let member: string | undefined;
      do {
        member = stack.pop() as string;
        onStack.delete(member);
        component.push(member);
      } while (member !== node);

      const selfReferencing = (graph.get(node) ?? []).includes(node);
      if (component.length > 1 || selfReferencing) {
        components.push(component.sort());
      }
    }
  };

  for (const node of [...nodes].sort()) {
    if (!indexOf.has(node)) visit(node);
  }

  return components.sort((a, b) => a[0].localeCompare(b[0]));
}

function chunkLabel(chunk: ChunkCycleChunkLike): string {
  if (chunk.name) return chunk.name;
  if (chunk.id !== undefined && chunk.id !== null) return String(chunk.id);
  return "(unnamed chunk)";
}

function toPosix(value: string): string {
  return value.split("\\").join("/");
}

function moduleLabel(
  module: ChunkCycleModuleLike | null | undefined,
  context: string | undefined
): string {
  if (!module) return "(unknown module)";
  const resource = module.nameForCondition?.() ?? module.identifier();
  const normalized = toPosix(resource);
  const root = context ? toPosix(context).replace(/\/+$/, "") + "/" : "";
  return root && normalized.startsWith(root)
    ? normalized.slice(root.length)
    : normalized;
}

/**
 * Builds the runtime chunk graph from a sealed compilation and returns every
 * cycle in it with enough detail to find the code responsible. Mirrors the
 * edges webpack itself uses in `Compilation#createHash`: runtime chunk to the
 * runtime chunk of each async entrypoint it can reach.
 */
export function analyzeRuntimeChunkCycles(
  compilation: ChunkCycleCompilationLike,
  context?: string
): RuntimeChunkCycle[] {
  const graph: RuntimeChunkGraph = new Map();
  const edgeDetails = new Map<string, Set<string>>();
  const runtimeChunks = new Map<string, ChunkCycleChunkLike>();

  for (const chunk of compilation.chunks) {
    if (!chunk.hasRuntime()) continue;
    const from = chunkLabel(chunk);
    runtimeChunks.set(from, chunk);
    const targets = new Set<string>(graph.get(from) ?? []);

    for (const entrypoint of chunk.getAllReferencedAsyncEntrypoints()) {
      const runtimeChunk = entrypoint.chunks[entrypoint.chunks.length - 1];
      if (!runtimeChunk) continue;
      const to = chunkLabel(runtimeChunk);
      targets.add(to);

      const key = `${from}\u0000${to}`;
      const via = edgeDetails.get(key) ?? new Set<string>();
      for (const origin of entrypoint.origins ?? []) {
        const requester = moduleLabel(origin.module, context);
        via.add(
          origin.request
            ? `${requester} requests "${origin.request}"`
            : requester
        );
      }
      edgeDetails.set(key, via);
    }

    graph.set(from, [...targets].sort());
  }

  return findRuntimeChunkCycles(graph).map((chunks) => {
    const members = new Set(chunks);
    const entryModules: Record<string, string[]> = {};
    for (const label of chunks) {
      const chunk = runtimeChunks.get(label);
      const modules =
        chunk && compilation.chunkGraph
          ? [...compilation.chunkGraph.getChunkEntryModulesIterable(chunk)]
          : [];
      entryModules[label] = modules.map((m) => moduleLabel(m, context)).sort();
    }

    const edges: RuntimeChunkEdge[] = [];
    for (const from of chunks) {
      for (const to of graph.get(from) ?? []) {
        if (!members.has(to)) continue;
        const via = [...(edgeDetails.get(`${from}\u0000${to}`) ?? [])].sort();
        edges.push({ from, to, via });
      }
    }

    return { chunks, entryModules, edges };
  });
}

/**
 * Renders cycles as the build error text: which chunks, which entry modules,
 * and which request closes each edge.
 */
export function formatRuntimeChunkCycles(cycles: RuntimeChunkCycle[]): string {
  const lines = [
    `Chunk-level circular dependency (AGENTS.md section 21, #853): ${cycles.length} runtime chunk cycle(s).`,
    "Runtime chunks in a cycle cannot be hashed from each other's content, so webpack falls back to an arbitrary order.",
  ];

  cycles.forEach((cycle, index) => {
    lines.push("", `Cycle ${index + 1}: ${cycle.chunks.join(", ")}`);
    for (const label of cycle.chunks) {
      const modules = cycle.entryModules[label] ?? [];
      lines.push(
        `  chunk ${label}: entry ${modules.length > 0 ? modules.join(", ") : "(none recorded)"}`
      );
    }
    for (const edge of cycle.edges) {
      const via = edge.via.length > 0 ? ` via ${edge.via.join("; ")}` : "";
      lines.push(`  ${edge.from} -> ${edge.to}${via}`);
    }
  });

  lines.push(
    "",
    "Break the reference rather than silencing the warning: a worker's import graph must not reach the module that constructs that worker."
  );
  return lines.join("\n");
}

/**
 * Webpack plugin that turns a runtime chunk cycle into a compilation error.
 * Registered for every compilation (client, server and edge) from
 * `next.config.ts`, so `npm run build` fails on Vercel and in CI.
 */
export class ChunkCycleGuardPlugin {
  static readonly pluginName = "ChunkCycleGuardPlugin";

  apply(compiler: ChunkCycleCompilerLike): void {
    const ErrorClass = compiler.webpack?.WebpackError ?? Error;

    compiler.hooks.compilation.tap(
      ChunkCycleGuardPlugin.pluginName,
      (compilation) => {
        compilation.hooks.afterSeal.tap(
          ChunkCycleGuardPlugin.pluginName,
          () => {
            const cycles = analyzeRuntimeChunkCycles(
              compilation,
              compiler.context
            );
            if (cycles.length > 0) {
              compilation.errors.push(
                new ErrorClass(formatRuntimeChunkCycles(cycles))
              );
              return;
            }

            // Webpack found a cycle this analysis did not: escalate its own
            // warning so a divergence between the two can never pass silently.
            const webpackWarning = compilation.warnings.find((warning) =>
              String(warning.message).includes(
                WEBPACK_RUNTIME_CHUNK_CYCLE_WARNING
              )
            );
            if (webpackWarning) {
              compilation.errors.push(
                new ErrorClass(
                  `Chunk-level circular dependency (AGENTS.md section 21, #853), reported by webpack:\n${webpackWarning.message}`
                )
              );
            }
          }
        );
      }
    );
  }
}
