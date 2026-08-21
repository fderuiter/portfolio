# Contributing to Portfolio Hub

Welcome! We are excited that you want to contribute to Portfolio Hub. This guide provides comprehensive setup workflows, architectural standards, feature creation rules, and instructions for using our interactive CLI scaffolding helper.

---

## 1. Context & Objectives

The primary goal of Portfolio Hub is to maintain a unified, high-performance showcase of systems engineering, machine learning engines, clinical data processors, and interactive arcade modules.

To prevent route drift, unindexed navigation entries, and architectural regression, human contributor guidelines align **100%** with automated agent rules in [`AGENTS.md`](./AGENTS.md).

### Core Standards
- **Node.js**: `>=22.0.0` (Sole supported runtime).
- **Package Manager**: `npm >= 10.0.0` (Sole supported package manager; `bun`, `yarn`, and `pnpm` are unsupported).
- **Quality Gates**: Zero TypeScript errors, zero ESLint warnings, 100% route indexing parity, zero uncommitted documentation drift.
- **Architectural Slices**: All new features must be created via the scaffolding CLI to guarantee companion test files and automatic navigation indexing across the 5-Point Discovery Matrix.

---

## 2. Developer Onboarding & Setup Workflows

### Prerequisites
Ensure Node.js 22+ and npm 10+ are installed on your system:
```bash
node -v  # Must be >= v22.0.0
npm -v   # Must be >= 10.0.0
```

### Automated Interactive Setup
Run the developer onboarding setup wizard:
```bash
npm run setup
```
This automated workflow checks Node/npm versions, syncs `.env.example` to `.env.local` if missing, initializes the Prisma database schema, seeds default clinical trial case study data, and verifies workspace health.

### Secondary Services & Environment Setup
- To configure optional Clerk authentication and author access allowlists interactively:
  ```bash
  npm run setup:clerk
  ```
- To check or auto-synchronize environment variable schema:
  ```bash
  npm run dx env
  npm run dx env -- --fix
  ```

---

## 3. Feature Scaffolding & Vertical Slices

To eliminate manual multi-file creation errors, route drift, and unindexed navigation items, all vertical slices (components, hooks, APIs, ADRs, case studies, arcade games) **must** be created using the Feature Scaffolding CLI.

### Interactive CLI Scaffolding Wizard
Executing the scaffolding command **without positional arguments** launches an interactive terminal wizard:
```bash
npm run scaffold
# or:
npx tsx scripts/dx.ts scaffold
```

The interactive terminal wizard guides you through three steps:

1. **Select Architecture Template Type** (lists all 7 supported architecture template types):
   - `1) component`  - Reusable UI component (`components/ui/<Name>.tsx` + companion test)
   - `2) hook`       - Custom React hook (`hooks/use<Name>.ts` + companion test)
   - `3) api`        - Zod-validated API route (`app/api/<name>/route.ts` + companion test)
   - `4) adr`        - Architectural Decision Record (`adr/00XX-<name>.md`)
   - `5) case-study` - Showcase Case Study page (`app/case-studies/<name>/page.tsx` + Command Palette registration + companion test)
   - `6) arcade`     - Arcade simulator & engine (`lib/<name>-engine.ts`, `components/<Name>.tsx`, `app/arcade/<name>/page.tsx` + unit tests + Command Palette registration)
   - `7) game`       - Interactive game module (arcade alias)

2. **Enter Feature / Asset Name**:
   - Input a descriptive name (e.g. `matrix-defender`, `analytics-card`).
   - The CLI performs input validation to ensure valid non-empty formatting.

3. **Preview Mode / Dry Run Option**:
   - Choose whether to run in preview mode (`--dry-run`).
   - In preview mode, the tool outputs all files and relative paths that would be created or updated without modifying disk state.

### Direct Non-Interactive Scaffolding
For automated CI pipelines, agent scripts, or power users who prefer direct CLI execution, pass explicit positional arguments:
```bash
# Non-interactive command syntax:
npm run scaffold <type> <name> [--dry-run]

# Examples:
npm run scaffold component GlassCard
npm run scaffold hook useTelemetryFilter
npm run scaffold api analytics-stream
npm run scaffold adr event-sourcing-pattern
npm run scaffold case-study quantum-compiler
npm run scaffold arcade cyber-vault
```
Direct positional execution bypasses interactive prompts smoothly, executing non-interactively while applying full input validation.

---

## 4. The 5-Point Discovery Matrix

Whenever a new first-class route, interactive mini-game, or case study page is introduced, it must be indexed across the **5-Point Discovery Matrix**:

1. **Command Palette (`components/CommandPalette.tsx`)**:
   - Registered under `staticNavs` with Tabler icon, title, subtitle, category, and target URL.
   - *Note:* The CLI scaffolder automatically registers `arcade` games and `case-study` pages into `CommandPalette.tsx` upon scaffolding!
2. **Navbar Navigation (`components/Navbar.tsx`)**:
   - Indexed under desktop dropdown menus (`SYSTEMS_ITEMS` / `ARCADE_ITEMS`) and mobile drawer.
3. **Footer Navigation (`components/Footer.tsx`)**:
   - Categorized under system/arcade links.
4. **Sitemap & SEO Metadata (`app/sitemap.ts` & `lib/seo-metadata.ts`)**:
   - Canonical path and change frequency added to `ROUTE_METADATA_CONFIGS`.
   - Path registered in `CANONICAL_ROUTES` in `lib/dx/page-bench.ts`.
5. **OpenGraph Social Preview (`app/<route>/opengraph-image.tsx`)**:
   - 1200x630 dynamic OpenGraph card generator matching design system (`lib/og-image.tsx`).

---

## 5. Architectural & Quality Invariants

When contributing code, ensure adherence to system invariants detailed in [`AGENTS.md`](./AGENTS.md):

- **No Secondary Navbars**: `app/layout.tsx` renders the sole global `<Navbar />`. Route pages must never render a second `<Navbar />`.
- **Root Header Clearance**: Route pages (`app/**/page.tsx`) must declare top padding clearance (`pt-28`) for the sticky header.
- **Hydration & Storage**: Use `useSyncExternalStore` or safe SSR checks for browser APIs (`typeof window !== "undefined"`).
- **Red-Green Remediation Protocol**: All defect fixes must include isolated reproduction unit tests in `__tests__/` and regression assertions in `__tests__/defect-remediation-regression.test.ts`.
- **WCAG AA Accessibility**: Zero Critical, Serious, or Moderate accessibility violations. Interactive components must support full keyboard navigation and focus trapping.
- **Documentation Synchronization**: Keep `openapi.json` and `docs/` in lockstep. Auto-remediate drift via `npm run doctor:fix`.

---

## 6. Git Conventions & Verification Workflow

### Branch Naming
All branches cut from `dev` or `main` must follow conventional prefixes:
- `feat/*` - New features or components
- `fix/*` - Bug fixes and defect remediations
- `docs/*` - Documentation additions
- `dx/*` - Developer experience and tooling improvements
- `refactor/*` - Code refactoring without behavior changes
- `perf/*` - Performance optimizations

Generate conforming branch names interactively:
```bash
npm run dx branch
```

### Conventional Commit Messages
Commit messages must adhere strictly to Conventional Commits:
`type(scope): subject` (e.g. `feat(scaffold): add interactive prompt wizard`).

Generate valid commit messages interactively:
```bash
npm run dx commit
```

### Verification & Health Verification
Before pushing changes or opening a Pull Request, run the full verification suite:
```bash
# 1. Run architectural health diagnostics
npm run doctor

# 2. Automatically fix remediable invariant issues (OpenAPI spec, docs drift)
npm run doctor:fix

# 3. Run complete verification gate (type-check, ESLint, docs drift check, benchmarks)
npm run verify

# 4. Execute unit & integration test suite
npm test
```

Thank you for contributing to Portfolio Hub!
