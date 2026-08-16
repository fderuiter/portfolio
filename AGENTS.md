<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architectural & Testing Invariants

### 1. Test Environment & Path Resolution
- Never hardcode environment-specific root paths (such as `/app` or absolute local directories) in tests or scripts.
- Always resolve the workspace root dynamically with `process.cwd()` or `path.resolve(__dirname, '..')`.
- When testing browser storage APIs in JSDOM / Node 25+, ensure `globalThis.localStorage` is properly mocked and isolated.

### 2. Layout & Component Hierarchy
- `app/layout.tsx` renders the global `<Navbar />` and top-level providers (`AudioProvider`, `SearchProvider`).
- Route pages (e.g. `app/proof/page.tsx`, `app/simulator/page.tsx`, `app/schedule/page.tsx`) must never render a secondary `<Navbar />` component.
- Keep page top-padding (`pt-24` to `pt-32`) aligned with the fixed header height.

### 3. Route Indexing & Discovery
- Any new first-class route or interactive tool must be registered in `components/CommandPalette.tsx` under `staticNavs` with an appropriate Lucide icon and category.

### 4. Hydration & React Best Practices
- For client-only rendering or browser API reads, prefer `useSyncExternalStore` over `useEffect` + `useState` hydration flags.
- Keep hook dependency arrays exhaustive in performance-critical hooks (like `usePretextLayout`) while leveraging ref callbacks and canvas measurement memoization.
- Dynamic values that vary between server and client render (e.g. `toLocaleTimeString()`, timestamps, random IDs) must include `suppressHydrationWarning` on the host element or be rendered strictly after mounting.

### 5. Multi-Agent Artifact Hygiene
- Never commit intermediate agent tracking directories (`.agents/`), temporary planning logs, or ad-hoc adversarial scripts to project git history.

### 6. Developer Suite (DX) & Quality Invariants
- Run `npm run quality` (or `npm run verify`) to ensure type safety, zero ESLint warnings, docs synchronization, and all 9 architectural invariants pass.
- When adding new games, APIs, ADRs, case studies, or components, utilize `npm run scaffold <type> <name>` to guarantee standard vertical slices and automatic `CommandPalette.tsx` registration.
- Whenever public library or hook signatures change, regenerate TypeDoc markdown with `npm run compile-docs` and verify with `npm run check-docs-drift`.

### 7. Headless Canvas 2D Testing & Animation Lifecycle
- In JSDOM and unit tests for canvas-driven components (games, simulators, Pretext layouts), ensure Canvas 2D mock contexts provide all curve methods (`quadraticCurveTo`, `bezierCurveTo`, `arcTo`, `roundRect`, `measureText`) to prevent unhandled frame exceptions during async `requestAnimationFrame` ticks.
- Ensure active component timers and animation frames are unmounted/cancelled cleanly in `afterEach`.

### 8. JSDoc & TypeDoc Markdown Formatting
- In JSDoc comments on exported symbols, avoid numbered prefixes (e.g. `1. ...`) or raw unescaped JSX/HTML tags (e.g. `<Navbar />`), as TypeDoc converts these into markdown files subject to `markdownlint` rules `MD029` (ordered list style) and `MD033` (inline HTML).

### 9. Specification & API Documentation Synchronization
- All API routes in `app/api/**/route.ts` must have declarative Zod schemas in `lib/schemas.ts` and 100% endpoint coverage in `openapi.json`.
- `scripts/generate-openapi.ts` and `npm run compile-docs` must be synchronized; any schema changes or missing route documentation will trigger a drift failure in CI (`npm run check-docs-drift`) and DX verification (`npm run verify`).
- Run `npm run doctor:fix` to automatically regenerate and synchronize all API specifications and TypeDoc markdown files.

### 10. Continuous Accessibility (a11y) & WCAG 2.1 Conformance
- All public pages, interactive modals, drawers, and forms must maintain strict WCAG 2.1 Level AA compliance with zero Critical, Serious, or Moderate axe-core violations.
- Root layout (`app/layout.tsx`) must provide a visible-on-focus `<SkipToContent />` link targeting `<main id="main-content" tabIndex={-1}>`, alongside the global screen reader live announcer provider (`A11yProvider`).
- Interactive modal containers and mobile navigation drawers must enforce focus trapping (`useFocusTrap`) with Escape dismissal and focus restoration to the originating trigger.
- Canvas-driven experiences (games, 3D brain simulator, proof DAGs) must supply accessible fallback descriptions and keyboard-navigable controls.

### 11. Defect Remediation & Root-Cause Regression Invariant
- All bug fixes and defect remediations across core computational engines (`lib/proof-utils.ts`, `lib/garmin-engine.ts`, `lib/working-with-duck-engine.ts`, `lib/crf/ast-evaluator.ts`) must follow the strict Red-Green Remediation Protocol.
- Every patch must include an isolated reproduction test in `__tests__/` verifying pre-fix failure and post-fix success, backed by regression test coverage in `__tests__/defect-remediation-regression.test.ts`.
- Core calculation and state engines must enforce boundary defenses against division-by-zero, cyclic AST references, and out-of-bounds inputs with zero unhandled crash vectors.

### 12. Proactive Defect Interception & Synthetic Reliability
- Core deterministic logic and security sanitization modules must maintain property-based fuzz tests (`__tests__/property-fuzz.test.ts`) and pass Stryker mutation threshold gates (>=80% mutation score).
- Critical user journeys (Landing Pretext layout, Command Palette discovery, Proof DAG studio, Arcade canvas lifecycles, and API telemetry ingestion) must be verified via Playwright synthetic user probes (`__tests__/e2e/synthetic-probes.spec.ts`) and monitored continuously via scheduled crons (`.github/workflows/synthetic-probes.yml`).
- Automated Canary Analysis (`scripts/canary-analyzer.ts`) must guard deployments with hard SLA limits (5xx error rate <= 0.5%, p95 latency <= 800ms, Sentry exception spike ratio <= 2.0x) and automated rollback dispatch capabilities.

### 13. Layout Integrity, Defensive CSS & Stacking Context Isolation
- All route page wrappers must use `<PageLayout />` or declare `min-h-dvh` and `overflow-x-hidden` without introducing duplicate nested `<main>` landmarks.
- Dynamic containers must enforce flexible bounds (`min-h-*`, `h-auto`) over rigid fixed heights (`h-48`, `h-64`) when hosting text elements.
- Flex and grid children hosting text or truncation badges must declare `min-w-0` to neutralize CSS `min-width: auto` and prevent layout blowouts.
- Multi-layered composite sections must declare `isolation: isolate` (`.section-isolate`), with system-wide elevation strictly bounded between `-z-10` and `z-50` (zero arbitrary `z-[9999]`).
- Modular cards and widgets must utilize Container Queries (`@container`, `@sm:`, `@md:`) for internal layout adaptation rather than global viewport media queries.
- Layout resilience against +40% localized text expansion, unbroken URLs, and 200% font zoom must be verified via `__tests__/defensive-css-stress.test.tsx` and `lib/dx/doctor.ts`.
- Production layout verification must adhere to the Four-Layer Layout Validation Protocol:
  - **DevTools Stress Routine**: 320px squeeze (iPhone SE minimum), 200% zoom (WCAG 1.4.4 restacking), and 3x content fuzzing.
  - **Horizontal Overflow Detector**: Automated evaluation (`getBoundingClientRect().right > clientWidth`) across all DOM elements in Playwright (`__tests__/e2e/visual.spec.ts`).
  - **Multi-Viewport Visual Matrix**: Continuous regression coverage across Mobile (320px & 375px), Tablet (768px), and Desktop (1440px).
  - **Real-Device Verification**: Verification on real iOS Safari (`min-h-dvh` floating bar clearance) and Android ("Largest" font scaling).








