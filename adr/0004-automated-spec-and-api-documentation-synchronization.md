# 0004. Automated Technical Specifications & API Documentation Synchronization

Date: 2026-08-15

## Status

Accepted

## Context

As the portfolio application expands with multiple API endpoints (`/api/telemetry`, `/api/telemetry/sync`, `/api/case-studies`), complex systems engineering modules, and public developer reference materials, documentation drift poses significant risks. When route parameters, return types, or internal architectural invariants shift without corresponding documentation updates, technical debt accumulates, onboarding friction increases, and client-server schema mismatches occur.

Simultaneously, intermediate agent scratchpads, informal brainstorming notes, and temporary logs can pollute formal documentation directories if boundaries are not strictly defined and enforced.

## Decision

We establish an automated, zero-drift technical documentation and API specification workflow across four foundational pillars:

### 1. Schema-Driven API Registry & 100% Route Coverage

- All API endpoints declare their request, query, and response contracts using centralized Zod schemas in `lib/schemas.ts`.
- The programmatic OpenAPI generator (`scripts/generate-openapi.ts`) outputs `openapi.json` directly from these contracts.
- Automated route discovery scans `app/api/**/route.ts` to guarantee that 100% of API endpoints are documented in `openapi.json`. Any undocumented API route causes CI and developer verification to fail immediately.

### 2. Lockstep TypeDoc Markdown Compilation

- Code-level library, hook, and type documentation is compiled into markdown files in `docs/` via `typedoc` and `typedoc-plugin-markdown`.
- `scripts/check-drift.ts` verifies that `docs/` is perfectly synchronized with git status. If any uncommitted modifications or untracked documentation files exist, the check fails.
- Re-compilation is tied directly into build and DX workflows via `npm run compile-docs` and `npm run doctor:fix`.

### 3. Tiered DX Invariant Verification & Auto-Remediation

- The DX Doctor suite (`scripts/dx.ts` and `lib/dx/doctor.ts`) verifies documentation parity, route indexing, and OpenAPI synchronization as core repository invariants.
- Running `npm run doctor:fix` automatically synchronizes `openapi.json` and recompiles TypeDoc documentation.
- The `npm run quality` command bundles TypeScript checks, markdown linting, doc drift verification, and architectural invariant checks into a single gate for pre-commit (`.husky/pre-commit`) and CI (`.github/workflows/ci.yml`).

### 4. Strict Documentation Hygiene & Scratchpad Isolation

- Formal documentation is strictly partitioned into `docs/`, `adr/`, `ARCHITECTURE.md`, `AGENTS.md`, and `README.md`.
- Informal scratchpads, intermediate agent traces, and temporary brainstorming artifacts (`.agents/`, `scratch/`, `tmp/`) are explicitly excluded from markdown linting and git tracking.

## Invariant Compliance

- **AGENTS.md Invariant 5 (Hygiene)**: Intermediate agent tracking files and scratch notes are isolated and excluded.
- **AGENTS.md Invariant 6 (DX & Quality)**: All 9 architectural invariants, TypeDoc parity, and OpenAPI synchronization pass via `npm run quality` and `npm run verify`.

## Consequences

### Positive

- Zero documentation drift between running API handlers, TypeScript types, and published specifications.
- Automated detection of new or altered routes that lack OpenAPI contracts.
- Frictionless one-command developer remediation via `npm run doctor:fix`.
- Clean separation between immutable architectural records, generated reference docs, and informal scratch notes.

### Negative / Trade-offs

- Developers must regenerate `openapi.json` and `docs/` (or run `npm run doctor:fix`) when modifying public library exports or API routes before committing.
