**fderuiter-portfolio**

***

# Portfolio Hub

![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?logo=nodedotjs&logoColor=white)
![npm](https://img.shields.io/badge/npm-%3E%3D10.0.0-CB3837?logo=npm&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16.3.4-000000?logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-v5-3178C6?logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-v7-2D3748?logo=prisma&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)

> **Repository Topics:** `document-classification` · `machine-learning-offline` · `clinical-trials` · `sqlcipher` · `hipaa-compliant` · `desktop-application`

A bleeding-edge interactive portfolio designed to unify disparate Python, Rust, and TypeScript repositories into a single, cohesive experience.

---

## Project Goals

The core objective of this project is to create an interactive showcase that dynamically pulls real codebase statistics and updates from GitHub, while presenting rich editorial narratives and architectural breakdowns. It serves as a unified hub for all professional software engineering work.

## Tech Stack & Features

- **Framework:** Next.js 16 (App Router + Turbopack), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (CSS-first configuration — no `tailwind.config.js`)
- **Visual Ecosystem:** Aceternity UI, Magic UI, Framer Motion
- **CMS:** Prisma ORM with Neon Serverless PostgreSQL
- **Layout Engine:** `@chenglou/pretext` — 15KB zero-dependency pure JS/TS library for high-performance DOM-free text measurement
- **Rich Text:** `@chenglou/pretext/rich-inline` — Inline Markdown tokenizer rendering **bold**, _italic_, and `code` chips with pixel-perfect canvas-measured heights
- **Masonry Layout:** Parent-level zero-whitespace masonry Bento Grid using a greedy LPT column scheduler with ResizeObserver-driven sub-millisecond recalculations
- **Performance:** DOM-free layout calculations maintaining 60FPS during complex animations

## Featured Case Studies

### InBody QR Data Decoder & Analyzer

- **Stack:** Python 3.8+, Poetry, Flask, BeautifulSoup4, jsQR, Pillow, Pytest
- **Domain:** Reverse Engineering, Biomedical Data, Monorepo Architecture, Data Parsing
- **GitHub Topics:** `reverse-engineering`, `inbody`, `qr-decoder`, `biometrics`, `data-extraction`, `monorepo`, `python`
- **Description:** Reverse-engineers the fixed-width binary serialization protocol of InBody BIA hardware query strings (`IBData`). Features an automated Differential Mutation Oracle ("Delta Testing Engine") that isolates contiguous byte slices and programmatically derives field boundaries without official schemas.

## Visual & System Architecture

The portfolio utilizes a "Design Engineering" approach, combining lightweight libraries like Aceternity UI and Magic UI with Framer Motion. For complete architectural documentation—including the App Router route tree (`app/work/laser-loon/page.tsx`) and UI component hierarchy (`components/ui/CaseStudyBentoCard.tsx`)—refer to [**`ARCHITECTURE.md`**](_media/ARCHITECTURE.md). The Sortify Python backend core utilities (`app/core/crypto.py`, `app/core/resilient_file_ops.py`, `app/core/analyzer_strategies.py`) belong to the separate Sortify repository, not this one, and are documented in [**`docs/CASE_STUDY.md`**](_media/CASE_STUDY.md).

## Deployment & Synthetic Monitoring

Operational workflows for production releases—including Automated Canary Analysis (ACA) commands, service-level agreement (SLA) threshold gates, automated rollback webhooks, and step-by-step synthetic probe failure triage runbooks—are detailed in [**`DEPLOYMENT.md`**](_media/DEPLOYMENT.md).

## Project Roadmap

Work is tracked as eight epic maps on the [Portfolio Hub: Release Readiness](https://github.com/users/fderuiter/projects/18) board. Each epic owns a slice of the product and links its own child issues; live progress is the sub-issue completion shown on the epic itself, so this table records scope rather than a percentage that would drift.

| Epic                                                                          | Scope                                                                     | Priority |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------- |
| [#632](https://github.com/fderuiter/portfolio/issues/632) Release delivery    | Neon, Vercel, Resend, Clerk, migrations, previews, and the delivery gate  | P0       |
| [#643](https://github.com/fderuiter/portfolio/issues/643) Dependency exposure | Evidence-backed remediation of every open dependency advisory             | P0       |
| [#633](https://github.com/fderuiter/portfolio/issues/633) Verification trust  | Local, agent, browser, and release verification that can be believed      | P1       |
| [#634](https://github.com/fderuiter/portfolio/issues/634) Experience & a11y   | The public visitor journey and WCAG 2.1 AA polish                         | P2       |
| [#536](https://github.com/fderuiter/portfolio/issues/536) CRF Designer        | Next-generation clinical case report form designer architecture           | P3       |
| [#549](https://github.com/fderuiter/portfolio/issues/549) Arcade engine       | Headless arcade lifecycle, viewport matrix, and HTML HUD overlay standard | P3       |
| [#330](https://github.com/fderuiter/portfolio/issues/330) Portfolio assistant | A grounded, cost-bounded, observable assistant                            | P3       |
| [#327](https://github.com/fderuiter/portfolio/issues/327) Asset management    | Authenticated upload and lifecycle management for portfolio media         | P3       |

Architectural decisions are recorded in [`adr/`](https://github.com/fderuiter/portfolio/tree/dev/adr); the invariants these epics are held to are listed in [`AGENTS.md`](https://github.com/fderuiter/portfolio/blob/dev/AGENTS.md).

## Prerequisites

To work on this repository, you will need:

- **Node.js**: >=22.0.0 (per the `engines` field in `package.json`); CI and the scheduled workflows run Node 24
- **npm**: >=10.0.0 (sole supported package manager; bun, yarn, and pnpm are unsupported)

## Setup Instructions

Automated Interactive Setup:
You can run the interactive setup command to configure your environment, check dependencies, push database schema, and seed initial data:

```bash
npm run setup
```

Or follow manual setup steps:

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**
   Copy `.env.example` to `.env.local` and set your `DATABASE_URL` (Neon Postgres connection string) and optionally `GITHUB_TOKEN` to avoid API rate limits.

   Verify your environment variable configuration:

   ```bash
   npm run env:check
   ```

   This command validates all required server and client environment key declarations against `lib/env.ts`, warning of any missing or invalid keys to confirm setup is complete.

   To configure Clerk authentication and author access allowlists interactively:

   ```bash
   npm run setup:clerk
   ```

3. **Initialize Database & Prisma Client**
   `npm install` already generates the Prisma client automatically via a `postinstall` hook, so `npx tsc --noEmit` and other direct type-checks work right after install with no extra step. Push the schema to your database:

   ```bash
   npx prisma db push
   ```

   (Re-running `npx prisma generate` here is harmless if the schema changed since install.)

4. **Seed Database**
   Populate the database with clinical trials and schema engine case studies (with inline Markdown formatting):

   ```bash
   npx prisma db seed
   ```

5. **Verify Local Health & Architectural Invariants**
   Immediately after environment setup and database initialization, run the local health diagnostic command to confirm local environment readiness and invariant health before writing code:

   ```bash
   # Run local architectural invariant diagnostic checks
   npm run doctor

   # Or execute the complete invariant verification suite
   npm run verify
   ```

6. **Start the Development Server**
   Launch Next.js 16 with Turbopack and concurrent TypeScript watcher:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### API Documentation & Drift Verification Workflow

When introducing or modifying public interfaces (`lib/`, `hooks/`, `types/`) or HTTP API routes (`app/api/`), contributors must ensure documentation and specifications remain synchronized to prevent pre-commit blocks and CI build failures:

1. **Compile API Documentation**
   After changing public functions, hooks, or types, manually recompile the TypeDoc reference documentation:

   ```bash
   npm run compile-docs
   ```

2. **Verify Local Documentation Drift**
   Execute the local documentation drift check before committing changes:

   ```bash
   npm run check-docs-drift
   ```

3. **Resolve Drift & Stage Documentation**
   If documentation drift is detected, run `npm run compile-docs` (or `npm run doctor:fix` to auto-remediate) and stage updated markdown files in `docs/` alongside code changes before committing:
   ```bash
   git add docs/ openapi.json
   ```

## Local Verification & Continuous Integration (CI) Mapping

To prevent pull request build failures and maintain zero-drift quality standards, local verification commands map directly to automated continuous integration quality gates executed in GitHub Actions workflows (`.github/workflows/ci.yml` and `.github/workflows/synthetic-probes.yml`).

Before submitting a pull request, run the relevant local quality commands or execute the full pre-submission quality gate:

```bash
# Complete pre-submission CI quality gate
npm run quality
```

### CI Quality Gate Mapping

| Local Quality Command                | Continuous Integration Job / Step                              | Verification Scope & Purpose                                                                                                                                                       |
| ------------------------------------ | -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run doctor`                     | `rigor-pipeline` / Diagnostic Check                            | Diagnostic audit of 23 architectural and testing invariants (routes, layout, WCAG a11y, hydration)                                                                                 |
| `npm run doctor:fix`                 | Local Auto-remediation                                         | Auto-remediates fixable architectural invariants and updates OpenAPI & TypeDoc contracts                                                                                           |
| `npm run env:check`                  | `rigor-pipeline` / Environment Guard                           | Validates `.env.local` schema definitions against `lib/env.ts` and `.env.example`                                                                                                  |
| `npm run check`                      | `rigor-pipeline` / `Type Check & Lint`                         | Static TypeScript type checking (`tsc --noEmit`) and ESLint code hygiene                                                                                                           |
| `npm run lint:docs`                  | `rigor-pipeline` / `Lint Documentation`                        | Markdown formatting and structure linting via `markdownlint-cli`                                                                                                                   |
| `npm run check-docs-drift`           | `rigor-pipeline` / `Check Documentation Drift`                 | Verifies lockstep synchronization for TypeDoc API docs, OpenAPI schemas, and onboarding guides                                                                                     |
| `npm run release:gate`               | `rigor-pipeline` / `Execute Pipeline Release Gate`             | Pre-deployment release gate validating security audits and migration integrity                                                                                                     |
| `npm run check:migrations:drift`     | `rigor-pipeline` / `Check Schema Drift`                        | Verifies Prisma database schema against active migrations and checks for drift                                                                                                     |
| `npm test` / `npm run test:ci`       | `rigor-pipeline` / `Run Logic Tests (Vitest)`                  | Comprehensive unit, logic, and state engine test execution with coverage tracking                                                                                                  |
| `npm run test:mutation`              | `rigor-pipeline` / `Run Shift-Left Property Fuzz Testing Gate` | Fast-check property-based fuzz testing and generative invariant verification                                                                                                       |
| `npx playwright test`                | `rigor-pipeline` / `Run Visual & Drift Detection`              | Sub-pixel visual regression testing and Playwright-Axe WCAG accessibility scans                                                                                                    |
| `npm run analyze:bundle -- --strict` | `rigor-pipeline` / `Verify Bundle Performance Budgets`         | Enforces JavaScript chunk size limits and initial shared bundle gzip budgets                                                                                                       |
| `npm run bench:pages -- --assert`    | `rigor-pipeline` / `Run Real-Browser Sub-Route Web Vitals`     | Fresh, clean, owned production-server Core Web Vitals assertion (LCP <= 2500ms, TTFB <= 800ms, CLS <= 0.1); writes ignored `.benchmark-results/benchmark-results.v1.json` evidence |
| `npm run audit:security`             | `security-gate` / `Execute Security Audit Gate`                | Dependency security vulnerability auditing and policy compliance                                                                                                                   |
| `npm run probe:synthetic`            | `synthetic-probes.yml` / `Headless Synthetic Probe Matrix`     | Playwright synthetic user probes verifying critical user journeys and API telemetry                                                                                                |
| `npm run quality`                    | CI Pipeline Composite Pre-Flight Gate                          | Runs `check`, `lint:docs`, `check-docs-drift`, `bench:pages -- --assert`, and `verify` in sequence                                                                                 |

## Asset Generation & Design System Commands

The repository provides standardized CLI commands for generating multi-resolution brand assets and compiling design system tokens:

### Brand Icon Generation

- **Command:** `npm run build:icons` (or `npm run generate:icons` / `npx tsx scripts/dx.ts build:icons`)
- **Input Source Location:** Vector SVG artwork at `public/favicon.svg` (or `app/icon.svg`).
- **Generated Output Asset Targets:**
  - `app/icon.svg` & `public/favicon.svg`: Vector SVG favicons
  - `app/favicon.ico` & `public/favicon.ico`: Multi-resolution Windows ICO container enclosing 16x16, 32x32, and 48x48 PNG buffers
  - `public/apple-touch-icon.png`: 180x180 high-DPI iOS touch icon
  - `public/icon-192.png` & `public/icon-512.png`: Standard PWA web app manifest icons

### Design System Token Compilation

- **Command:** `npm run build:theme` (or `npm run generate:theme` / `npx tsx scripts/dx.ts build:theme`)
- **Input Source Location:** CSS custom properties declared in `app/globals.css` (within the `:root` selector block).
- **Generated Output Asset Target:** `lib/design-manifest.ts` (strongly-typed runtime TypeScript constants exported as `designManifest`).

## Database changes

Schema changes must include a checked-in Prisma migration. See
[DATABASE_MIGRATIONS.md](_media/DATABASE_MIGRATIONS.md) for the development workflow,
production rollout order, and the one-time production baseline procedure.

## Contributing Guidelines

For full details on developer onboarding, architectural invariants, conventional commits, and interactive CLI feature scaffolding (`npm run scaffold`), please refer to the [**`CONTRIBUTING.md`**](_media/CONTRIBUTING.md) guide.
