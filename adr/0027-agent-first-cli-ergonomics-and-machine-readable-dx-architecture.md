# ADR 0027: Agent-First CLI Ergonomics, Machine-Readable DX, and Document-Driven Terminal Architecture

## Status

Accepted

## Context

The portfolio repository contains a rich Developer Experience (DX) suite in `scripts/dx.ts` and `lib/dx/` (`doctor`, `verify`, `dead-code`, `analyze`, `scaffold`, `commit`, `branch`, `env`, `bench`). However, when evaluated against the **Agent DX CLI Scale** ("Rewrite Your CLI for AI Agents"), several architectural limitations impeded autonomous AI agents and CI bots:

1. **Brittle Heuristic Parsing**: Commands emitted only ANSI-formatted text or tabular output. AI agents and CI bots had to parse logs via fragile regex patterns to identify invariant failures or unreferenced exports.
2. **Interactive Roadblocks**: Wizards such as `dx commit`, `dx scaffold`, and `dx branch` relied exclusively on interactive Node.js `readline` prompts without complete non-interactive command-line flag interfaces, blocking headless agent workflows.
3. **Missing Auto-Remediation CTAs**: When architectural invariants failed (e.g. unindexed routes, outdated `.env.example`, missing OpenAPI schemas), the CLI did not consistently emit exact, copy-pasteable remediation commands (`npm run doctor:fix`).
4. **Lack of Schema Introspection**: Agents had no machine-readable way to query the CLI's available commands, argument schemas, mutability flags, and expected outputs at runtime (`--help --json` / `dx describe`).

## Decision

We adopt an **Agent-First CLI Standard** across all DX tooling in `scripts/dx.ts` and `lib/dx/`, adhering to the 7 axes of the **Agent DX CLI Scale** and the 8 principles of **Document-Driven CLI Output (`design-cli-output`)**:

1. **Zero-Dependency Argument Parser & Input Hardening (`lib/dx/cli-parser.ts`)**:
   - Parse global flags (`--json`, `--yes` / `-y`, `--dry-run`, `--ci`, `--fix`) and named options (`--type`, `--name`, `--scope`, `--subject`, `--limit`, `--filter`) robustly.
   - Enforce Axis 5 input hardening: reject control characters, path traversals (`../`), and invalid identifier types before subcommand dispatch.

2. **Uniform Actionable JSON Envelope (`--json`)**:
   - All subcommands (`doctor`, `dead-code`, `analyze`, `bench`, `scaffold`, `env`, `describe`) support `--json` emitting a typed envelope:
     ```typescript
     export interface DxEnvelope<T = unknown> {
       success: boolean;
       command: string;
       timestamp: string;
       durationMs: number;
       data: T;
       remediations: RemediationAction[];
     }
     ```
   - In `--json` mode, pure JSON is written to `stdout` with zero ANSI noise. On invariant failures, process exit code is set to `1` (UNIX standard), maintaining CI fast-fail behavior while preserving clean JSON on `stdout`.

3. **Autonomous Non-Interactive CLI Bypasses**:
   - `dx commit`: Accepts `--type <type>`, `--scope <scope>`, `--subject <msg>`, `--breaking`, `--body <body>`, `--yes` / `-y`, `--dry-run`.
   - `dx scaffold`: Accepts `--type <type>`, `--name <name>`, `--yes` / `-y`, `--dry-run`, `--json` (alongside positional `dx scaffold <type> <name>`).
   - `dx branch`: Accepts `--prefix <prefix>`, `--name <slug>` / `--slug <slug>`, `--checkout` / `--no-checkout`, `--yes` / `-y`.
   - Interactive readline prompts are automatically bypassed whenever required flags are provided or `--yes` is specified.

4. **Runtime Schema Introspection (`dx describe` / `dx --help --json`)**:
   - Expose a machine-readable JSON command discovery registry detailing command names, aliases, descriptions, option flags, argument types, default values, mutability, and payload schemas.

5. **Token & Context Window Discipline (`--limit`, `--filter`)**:
   - `dx dead-code` and `dx analyze` support `--limit <n>` and `--filter <pattern>` to allow agents to constrain payload sizes while reporting total dataset metrics in summary headers.

6. **8-Principle Document-Driven ANSI Rendering (`design-cli-output`)**:
   - For TTY/human output, replace raw tables and generic bullet lists with:
     - Document title hierarchy (`# DX DOCTOR — Architectural Invariant Health`)
     - Narrative section headings (`### What's Actionable`, `### Production Chunk Inventory`)
     - Invisible column padding (`padEnd`/`padStart` with `·` interpuncts)
     - Prescriptive empty states with guidance rather than "No items"
     - Clear copy-pasteable CTA code blocks (`npm run doctor:fix`).

## Consequences

- **Positive**:
  - Eliminates all regex-based log scraping for AI agents and CI pipelines.
  - Enables fully autonomous feature scaffolding, commit authoring, and branch management.
  - Reduces agent context window consumption via `--limit` and field discipline.
  - Delivers self-documenting runtime introspection via `dx describe`.
  - Upgrades human terminal readability with clean, scannable ANSI document layouts.
- **Negative**:
  - Requires maintaining the `cli-parser` schema definitions in lockstep with new `dx` subcommands.
