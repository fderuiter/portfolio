# 0033. Bound Pre-Commit Test Scope to the Staged Module Graph

Date: 2026-09-11

## Status

Accepted

## Context

`.husky/pre-commit` (established by ADR 0029) ran the full `npm run test` suite (2,300+ tests across 280+ files) and then `npm run verify` on every commit. `npm run verify` includes `checkSubRoutePerformance` (`lib/dx/doctor.ts`), which validates recorded production benchmark evidence against `git status --porcelain` and rejects it as stale whenever the working tree is not clean. A normal commit is, by definition, not clean until it lands — staged changes make the tree dirty — so `npm run verify` from `.husky/pre-commit` could reject a commit for stale benchmark evidence regardless of whether the change under review was correct. Combined with the full-suite runtime (minutes per commit), this made a routine, correct commit uncommittable without a hook bypass.

## Decision

`.husky/pre-commit` no longer runs the full test suite or `npm run verify`. It runs `npm run test:staged` (`scripts/test-staged.ts`), which resolves the set of staged files (`git diff --cached --name-only --diff-filter=ACMR`) and passes them to `vitest related --run --passWithNoTests`, per AGENTS.md's testing invariants. This exercises exactly the tests whose module graph the commit touches, skipping cleanly (`--passWithNoTests`) when a commit has no code-relevant staged files (e.g. a docs-only change).

Pre-commit retains `npx lint-staged` (formatting + ESLint autofix), `npm run typecheck` (whole-program, since TypeScript has no cheap "affected" mode), `npm run lint:boundaries` (fast, per ADR 0029), `npm run audit:security`, and `npm run check-docs-drift` — the same staged-appropriate safeguards as before, minus the two checks that required a clean tree or full-suite runtime.

The full, clean-tree `npm run verify` (and `npm run quality`, which wraps it with the production benchmark assertion) remains the authoritative publication gate: it still runs in CI (`.github/workflows/ci.yml`) on every push, and is the release-readiness check tracked by #611. Pre-commit is a fast local correctness gate; `verify`/`quality`/CI are the comprehensive gate before a change is considered publishable.

## Consequences

### Positive

- A correct, staged commit can no longer be rejected by evidence from a prior clean-tree benchmark run.
- Commit-time test feedback scales with the size of the change instead of the size of the repository.
- The full verification suite still runs in CI, so no safeguard is lost — only its trigger point moves from "every commit" to "every push."

### Negative / Trade-offs

- `vitest related` depends on accurate module-graph resolution; a change that affects behavior without a direct import edge (e.g. through a generated artifact or runtime config) will not automatically select its tests at commit time. CI's full run remains the backstop for this gap.
- Contributors must run `npm run verify` (or `npm run quality`) explicitly before opening a pull request to catch what pre-commit no longer checks locally.
