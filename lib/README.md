# TS Deep Modules & Architectural Seams (`lib/`)

Modules in `lib/` are structured as **Deep Modules**: a lot of rich behaviour behind a small, well-typed interface placed at a clean seam.

---

## 1. Directory Structure & Boundary Invariants

Every module package under `lib/` (e.g., `lib/crf/`, `lib/laser-loon/`, `lib/neuro/`, `lib/arcade/`, `lib/clinical-trial-chaos/`, `lib/services/`) follows depth-based encapsulation:

```text
lib/
  <package-name>/
    index.ts          ← Main public entry point.
    presets.ts        ← Secondary public entry point (optional).
    types.ts          ← Type contracts entry point (optional).
    internal/         ← Private implementation (hidden from outside).
    presets/          ← Private package subfolder (hidden from outside).
    core/             ← Private package subfolder (hidden from outside).
```

### The 4 Canonical Boundary Rules

1. **Root Entry Points Are the Only Public Surface (`entrypoint-boundary-from-app`)**:
   Outside code (`app/`, `components/`, `scripts/`) may only import from root files directly under `lib/<package>/` (e.g., `import { evaluateStudy } from "@/lib/crf"` or `import { STUDY_PRESETS } from "@/lib/crf/presets"`). Importing directly into subfolders (e.g., `@/lib/crf/presets/oncology-recist`) is strictly forbidden.

2. **Intra-Module Freedom with Inter-Module Seams (`entrypoint-boundary-across-packages`)**:
   Files within a package (e.g., `lib/crf/*`) can import each other freely. When crossing package boundaries (e.g., `lib/laser-loon/` importing from `lib/arcade/`), access must go through the other package's public root entry point (`@/lib/arcade`), never its internal subfolders.

3. **Tests Exercise Modules Through Entry Points (`tests-through-entrypoints`)**:
   Unit and integration tests (`__tests__/`) must test behavior through public module entry points. Tests cannot reach into private internals or subfolders.

4. **Zero Circular Dependencies (`no-circular`)**:
   No dependency cycles (`A → B → A` or `A → B → C → A`) are allowed anywhere across the workspace.

---

## 2. Entry Points vs. Monolithic Barrels

Do not funnel everything into a monolithic 5,000-line `index.ts`. A module may expose multiple distinct root entry points:

- `lib/<pkg>/index.ts` (primary API)
- `lib/<pkg>/types.ts` (public types)
- `lib/<pkg>/presets.ts` (catalog / presets)

Subfolder internals remain private regardless of how many root entry points exist.

---

## 3. Running Boundary Verification

Enforced deterministically via [dependency-cruiser](https://github.com/sverweij/dependency-cruiser):

```bash
# Run boundary linter
npm run lint:boundaries

# Run boundary checks as part of typecheck and linting
npm run check

# Run full invariant diagnostics
npm run verify
```
