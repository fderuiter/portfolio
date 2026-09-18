import { compileTerms } from "./term-compiler";

/**
 * Raw blog post data shape conforming to the BlogPost Prisma model.
 */
export interface BlogPostData {
  id: string;
  slug: string;
  title: string;
  dek: string;
  body: string;
  pillar: string;
  tags: string;
  published: boolean;
  reading_time_minutes: number | null;
  hero_image_url: string | null;
  created_at: Date;
  updated_at: Date;
}

const rawFallbackBlogPosts: BlogPostData[] = [
  {
    id: "fallback-blog-1",
    slug: "cdisc-odm-sdtm-clinical-data-pipelines",
    title: "Architecting CDISC ODM & SDTM Clinical Data Pipelines",
    dek: "How to design deterministic, streaming XML compilation pipelines for FDA-compliant CDISC ODM and SDTM datasets without memory blowouts.",
    pillar: "clinical-data-engineering",
    tags: "cdisc, odm, sdtm, edc, fda, clinical-data-systems",
    published: true,
    reading_time_minutes: 6,
    hero_image_url: null,
    created_at: new Date("2026-03-01T00:00:00.000Z"),
    updated_at: new Date("2026-03-01T00:00:00.000Z"),
    body: `
<h3>The Challenge: Memory Exhaustion in Clinical Data Ingestion</h3>
<p>Electronic Data Capture (EDC) systems produce massive XML payloads conforming to the <strong>CDISC Operational Data Model (ODM)</strong> standard. When clinical studies scale to hundreds of trial sites and tens of thousands of subject records, naive DOM-based parsers consume gigabytes of memory, leading to garbage collection pauses, latency spikes, and serverless worker crashes.</p>

<h3>Streaming XML Tokenization Architecture</h3>
<p>By transitioning from in-memory DOM representations to an event-driven SAX/streaming architecture, clinical trial domains can be processed record-by-record. Each study event, form definition, and item group is compiled directly into strongly-typed domain representations while keeping heap memory strictly bounded under 50 MB regardless of payload size.</p>

<pre><code class="language-typescript">
interface ItemDataRecord {
  itemOID: string;
  value: string;
  transactionType?: "Insert" | "Update" | "Upsert";
}

interface ClinicalSubjectStream {
  studyOID: string;
  subjectKey: string;
  items: AsyncIterable&lt;ItemDataRecord&gt;;
}
</code></pre>

<h3>Enforcing SDTM Regulatory Conformance</h3>
<p>The FDA mandates strict adherence to CDISC SDTM guidelines for regulatory trial submissions. The transformation pipeline applies declarative schema mappings, validates controlled terminologies against NCI EVS dictionaries, and generates 21 CFR Part 11 compliant audit trails with cryptographic hash verification to ensure zero untracked data mutations.</p>
`.trim(),
  },
  {
    id: "fallback-blog-2",
    slug: "statecharts-invariant-verification-high-assurance-frontends",
    title: "Statecharts and Invariant Verification in High-Assurance Frontends",
    dek: "Applying formal specification and statechart modeling to frontend UI state transitions, guaranteeing zero unreachable error states in mission-critical workflows.",
    pillar: "formal-verification",
    tags: "formal-methods, verification, statecharts, invariants, tla, distributed-systems",
    published: true,
    reading_time_minutes: 8,
    hero_image_url: null,
    created_at: new Date("2026-03-05T00:00:00.000Z"),
    updated_at: new Date("2026-03-05T00:00:00.000Z"),
    body: `
<h3>The Hidden Fragility of Boolean UI Flags</h3>
<p>In high-assurance frontend applications—such as clinical dosing calculators and telemetry mission consoles—relying on disconnected boolean flags (such as <code>isLoading</code>, <code>isError</code>, and <code>isSubmitting</code>) creates exponential combinatorial state explosion. Inevitably, impossible states emerge: a view simultaneously rendering stale error dialogs while spinning in an active network fetch.</p>

<h3>Formal Statecharts as Execution Contracts</h3>
<p>By defining user interfaces as mathematical hierarchical state machines (statecharts), state transitions become deterministic, closed, and mathematically bounded. We specify every valid state, event, and transition matrix explicitly:</p>

<pre><code class="language-typescript">
type DosingWorkflowState =
  | { status: "idle" }
  | { status: "calculating"; inputHash: string }
  | { status: "verified"; dosageMg: number; auditSig: string }
  | { status: "flagged_contraindication"; code: string; rationale: string };
</code></pre>

<h3>Model Checking and Invariant Proofs</h3>
<p>Using automated state space exploration, we test exhaustive reachability across every possible user interaction sequence. Any transition that violates safety invariants—such as dispensing medication without double-entry confirmation or persisting unvalidated payloads—is intercepted during static verification before runtime compilation.</p>
`.trim(),
  },
  {
    id: "fallback-blog-3",
    slug: "sub-pixel-canvas-deterministic-browser-physics",
    title:
      "Sub-Pixel Canvas Rasterization and Deterministic 60 FPS Browser Physics",
    dek: "Techniques for deterministic fixed-timestep physics simulations, sub-pixel rasterization, and zero-allocation game loops in modern browser runtimes.",
    pillar: "browser-graphics-engineering",
    tags: "browser-physics, canvas, game-loop, webgl, performance, 60fps",
    published: true,
    reading_time_minutes: 7,
    hero_image_url: null,
    created_at: new Date("2026-03-10T00:00:00.000Z"),
    updated_at: new Date("2026-03-10T00:00:00.000Z"),
    body: `
<h3>Variable Frame Timesteps: The Source of Simulation Drift</h3>
<p>Modern browser displays vary widely across 60 Hz mobile panels, 120 Hz ProMotion laptop screens, and 144 Hz desktop gaming monitors. Coupling physics updates directly to <code>requestAnimationFrame</code> timestamp deltas introduces numerical integration drift and collision tunneling across differing client hardware.</p>

<h3>Fixed-Timestep Accumulators</h3>
<p>To guarantee bit-identical, reproducible physics simulations regardless of screen refresh rate, we decouple physical integration from graphical interpolation. The simulation advances in deterministic fixed slices (e.g. exactly 16.666ms), while visual transforms interpolate smoothly between previous and current spatial coordinates:</p>

<pre><code class="language-typescript">
while (accumulator &gt;= FIXED_TIMESTEP_MS) {
  integrateRigidBodies(state, FIXED_TIMESTEP_MS);
  resolveCollisions(state);
  accumulator -= FIXED_TIMESTEP_MS;
}
const alpha = accumulator / FIXED_TIMESTEP_MS;
renderInterpolated(state, alpha);
</code></pre>

<h3>Zero-Allocation Geometry Pipelines</h3>
<p>JavaScript garbage collection spikes are the primary cause of dropped frames during complex 2D canvas rendering. By reusing contiguous <code>Float64Array</code> memory pools and object rings for particle buffers and spatial partitioning grids, heap memory allocations drop to zero during active simulation cycles.</p>
`.trim(),
  },
  {
    id: "fallback-blog-4",
    slug: "ast-compilers-vs-regex-clinical-form-validation",
    title: "Why AST Compilers Replace Regex in Clinical Form Validation",
    dek: "Why regular expressions fail under regulatory scrutiny, and how Abstract Syntax Tree compilation guarantees sound semantic evaluation in clinical eCRF design.",
    pillar: "formal-verification",
    tags: "ast-compilers, compilers, parsing, formal-methods, json-schema, validation",
    published: true,
    reading_time_minutes: 6,
    hero_image_url: null,
    created_at: new Date("2026-03-15T00:00:00.000Z"),
    updated_at: new Date("2026-03-15T00:00:00.000Z"),
    body: `
<h3>The Catastrophic Limitations of Regular Expressions</h3>
<p>When authoring electronic Case Report Forms (eCRF) for multi-cohort pharmaceutical clinical trials, validation dynamics involve interdependent arithmetic formulas, cross-form consistency constraints, and historical visit delta assertions. Engineering teams frequently attempt to patch these rules with complex regular expressions, rapidly encountering catastrophic backtracking, unmaintainable pattern soup, and silent validation escapes.</p>

<h3>Building a Domain-Specific AST Evaluator</h3>
<p>Instead of ad-hoc string regex manipulation, our clinical schema engine transforms domain expressions into structured Abstract Syntax Trees (ASTs). Rules such as <code>LAB.CREATININE &gt; 1.5 AND VISITA.DOSE != NULL</code> are tokenized and parsed into recursive node hierarchies:</p>

<pre><code class="language-typescript">
type ASTNode =
  | { type: "Literal"; value: string | number | boolean }
  | { type: "Identifier"; fieldRef: string }
  | { type: "BinaryExpression"; operator: "+" | "-" | "&gt;" | "&lt;" | "=="; left: ASTNode; right: ASTNode }
  | { type: "LogicalExpression"; operator: "AND" | "OR"; left: ASTNode; right: ASTNode };
</code></pre>

<h3>Guaranteed Termination and Regulatory Auditability</h3>
<p>Because clinical validation scripts must never freeze an investigator's browser session, AST traversal strictly prohibits unbounded recursion and unbounded loops. Every rule evaluation produces a deterministic derivation graph, fulfilling 21 CFR Part 11 audit requirements with verifiable step-by-step mathematical reasoning.</p>
`.trim(),
  },
];

/**
 * Static safety net for the blog's Resilient Hybrid Fallback service.
 * Authored blog posts are persisted in the database via `/admin` and
 * served through `BlogPostService`.
 */
export const FALLBACK_BLOG_POSTS: BlogPostData[] = rawFallbackBlogPosts.map(
  (post) => ({
    ...post,
    body: compileTerms(post.body),
  })
);
