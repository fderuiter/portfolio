# ADR 0023: Diátaxis Documentation Architecture & Zero-Drift TypeDoc Governance

## Status
Accepted

## Context
As the portfolio has expanded across clinical trial systems, formal verification engines, embedded Garmin emulators, and transactional notification services, our documentation ecosystem required structural clarity.
Previously, generated TypeDoc markdown reference files, human onboarding guides, architectural explanations, and runbooks were intermingled within a flat `docs/` folder. This created cognitive friction for contributors, made discovering how-to guides difficult, and risked accidental drift between machine-compiled reference docs and authored conceptual guides.

## Decision
We adopt the **Diátaxis Documentation Framework**, partitioning all repository documentation into four distinct, non-overlapping quadrants with dedicated directories under `docs/`:

1. **Tutorials (`docs/tutorials/`)**: Learning-oriented, step-by-step onboarding journeys for new engineers (e.g. setting up the local development environment, seeding the hybrid database, running full verification suites).
2. **How-To Guides (`docs/how-to/`)**: Goal-oriented recipes for solving specific engineering problems (e.g. adding a new case study, adding an API route with `createApiHandler`, provisioning Resend credentials, running synthetic probes).
3. **Reference (`docs/reference/`)**: Information-oriented, machine-compiled specifications and API contracts:
   - `docs/reference/api/`: Machine-generated TypeDoc markdown reference compiled strictly from `lib/`, `hooks/`, and `types/`.
   - `openapi.json`: Single source of truth for REST API endpoints.
   - CLI command syntaxes and schema catalogs.
4. **Explanation (`docs/explanation/`)**: Understanding-oriented discussions of architectural decisions, formal verification theory, CDISC protocol compilation, and browser graphics lifecycle.

### TypeDoc & Drift Governance
- `package.json` compile scripts (`compile-docs`) are re-targeted to output exclusively into `docs/reference/api/`.
- `scripts/check-drift.ts` and `npm run check-docs-drift` are updated to enforce zero uncommitted drift within `docs/reference/api/` while validating internal cross-link integrity across all four Diátaxis quadrants.

## Consequences
- **Positive**:
  - Provides clear mental models for developers and autonomous agents navigating repository documentation.
  - Isolates machine-generated TypeDoc files from human-written documentation, preventing accidental overwrite or merge conflicts.
  - Enforces zero-drift automated verification across pre-commit hooks and CI.
- **Negative**:
  - Requires updating legacy file paths and references in `AGENTS.md` and `README.md`.
