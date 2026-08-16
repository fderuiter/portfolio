<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Architectural & Testing Invariants

### 1. Test Environment & Path Resolution
- Never hardcode environment-specific root paths (such as `/app` or absolute local directories) in tests or scripts.
- Always resolve the workspace root dynamically with `process.cwd()` or `path.resolve(__dirname, '..')`.
- When testing browser storage APIs in JSDOM / Node 25+, ensure `globalThis.localStorage` is properly mocked and isolated with a standard `MockStorage` implementation.
- Production hooks and store subscribers must defensively check `typeof window.localStorage?.getItem === "function"` and `typeof window.localStorage?.setItem === "function"` before accessing storage methods to avoid unhandled exceptions in standalone test harnesses.
- Test suites must maintain strict import and variable hygiene: remove unused module imports and prefer immutable `const` declarations over `let` unless variable reassignment is required.

### 2. Layout & Component Hierarchy
- `app/layout.tsx` renders the global `<Navbar />` and top-level providers (`AudioProvider`, `SearchProvider`).
- Route pages (e.g. `app/proof/page.tsx`, `app/simulator/page.tsx`, `app/schedule/page.tsx`, `app/stack/page.tsx`) must never render a secondary `<Navbar />` component.
- Route entrypoint files (`app/**/page.tsx`) must directly declare root header clearance padding (`pt-24` to `pt-32` or `min-h-screen`/`min-h-dvh` or `<PageLayout />`) to satisfy static DX Doctor invariant audits.

### 3. Route Indexing & Discovery
- Any new first-class route or interactive tool must be synchronized across the 4-Point Discovery Matrix:
  - `components/CommandPalette.tsx` under `staticNavs` with Tabler/Lucide icon, status badge, tech stack tags, and preview highlights.
  - `components/Navbar.tsx` under the appropriate desktop dropdown (`SYSTEMS_ITEMS` / `ARCADE_ITEMS`) and mobile slide-out drawer.
  - `components/Footer.tsx` under the corresponding navigation category and status link.
  - `app/sitemap.ts` and `lib/seo-metadata.ts` under `ROUTE_METADATA_CONFIGS` with canonical path and change frequency.

### 4. Hydration & React Best Practices
- For client-only rendering or browser API reads, prefer `useSyncExternalStore` over `useEffect` + `useState` hydration flags.
- Keep hook dependency arrays exhaustive across all hooks and memoized callbacks (`useCallback`, `useMemo`) to satisfy React 19 compiler optimization rules (`react-hooks/preserve-manual-memoization`).
- Declare all helper functions and event handlers prior to any `useEffect` blocks that invoke them to prevent temporal-dead-zone immutability errors.
- When synchronizing URL hash or query parameters into component state on mount, use direct derivation where possible or annotate necessary synchronous `setState` calls with `// eslint-disable-next-line react-hooks/set-state-in-effect`.
- Dynamic values that vary between server and client render (e.g. `toLocaleTimeString()`, timestamps, random IDs) must include `suppressHydrationWarning` on the host element or be rendered strictly after mounting.

### 5. Multi-Agent Integration & Invariant Synthesis
- When merging concurrent feature branches or autonomous agent PRs, always apply **Additive Synthesis** on merge conflicts: never drop features, combine context providers in topological hierarchy (e.g. `PersonaProvider` -> `TerminologyProvider` -> `SearchProvider`), preserve rich text tokens and tooltips, and provide safe fallback defaults for standalone component testing.
- Never commit intermediate agent tracking directories (`.agents/`), temporary planning logs, or ad-hoc adversarial scripts to project git history.

### 6. Developer Suite (DX) & Quality Invariants
- Run `npm run quality` (or `npm run verify`) to ensure type safety, zero ESLint warnings, docs synchronization, and all 9 architectural invariants pass.
- When adding new games, APIs, ADRs, case studies, or components, utilize `npm run scaffold <type> <name>` to guarantee standard vertical slices and automatic `CommandPalette.tsx` registration.
- Whenever public library or hook signatures change, regenerate TypeDoc markdown with `npm run compile-docs` and verify with `npm run check-docs-drift`.

### 7. Headless Canvas 2D & DOM Observer Testing Lifecycle
- In JSDOM and unit tests for canvas-driven components (games, simulators, Pretext text layout engines), ensure Canvas 2D mock contexts provide `font`, `measureText: (text) => ({ width: text.length * 8 })`, and all curve methods (`quadraticCurveTo`, `bezierCurveTo`, `arcTo`, `roundRect`) to prevent unhandled measurement exceptions during Pretext layout runs and async `requestAnimationFrame` ticks.
- When rendering components or hooks utilizing `ResizeObserver` or `IntersectionObserver` in JSDOM (such as `useResizeObserver` or `PretextCard`), ensure `global.ResizeObserver` / `global.IntersectionObserver` is mocked in `beforeAll` or test setup.
- When mocking external classes or loader constructors invoked with the `new` keyword (e.g. `new OBJLoader()`, `new GLTFLoader()`, `new AudioContext()`), always provide a regular constructor function (`function (this: any) { this.load = mockLoad; }`) or ES6 class implementation in `mockImplementation` rather than an arrow function to prevent runtime `TypeError: ... is not a constructor` exceptions.
- Ensure active component timers and animation frames are unmounted/cancelled cleanly in `afterEach`.
- In unit tests verifying error boundaries, navigation fallbacks, or recovery layouts (`__tests__/unified-recovery.test.tsx`), mock heavy dynamic canvas/WebGL game components (`RetroLabyrinth`, `Brain3DViewer`) with lightweight stubs rather than executing full simulation loops in JSDOM to prevent memory leaks and unhandled worker exceptions.
- Vitest test suites must configure explicit worker heap limits (`execArgv: ['--max-old-space-size=4096']` in `vitest.config.ts`), and pre-commit staging must utilize `vitest related --run --passWithNoTests` to bound test execution scope.

### 8. JSDoc & TypeDoc Markdown Formatting
- In JSDoc comments on exported symbols, avoid numbered prefixes (e.g. `1. ...`) or raw unescaped JSX/HTML tags (e.g. `<Navbar />`), as TypeDoc converts these into markdown files subject to `markdownlint` rules `MD029` (ordered list style) and `MD033` (inline HTML).
- When re-exporting hooks or public API functions from facade files (e.g. `hooks/useAnnouncer.tsx`), ensure all referenced parameter and context interfaces (e.g. `AnnouncerContextType`) are also re-exported to maintain 100% TypeDoc extraction parity with zero compilation warnings.

### 9. Specification & API Documentation Synchronization
- **Full-Spectrum Scope**: All public API endpoints (`app/api/**/route.ts`), TypeScript library/hook exports (`lib/`, `hooks/`, `types/`), architectural decision records (`adr/`), and system architecture guides (`ARCHITECTURE.md`) are governed by automated lockstep synchronization.
- **Declarative Contracts & 100% Coverage**: All HTTP routes must declare runtime Zod validation schemas in `lib/schemas.ts`. `scripts/generate-openapi.ts` dynamically traverses `app/api/**/route.ts` to assert 100% route coverage in `openapi.json` with zero missing endpoints.
- **Zero-Drift Invariant Gate**: CI (`.github/workflows/ci.yml`) and pre-commit (`.husky/pre-commit`) execute `npm run check-docs-drift` and `npm run verify` to fail fast (exit code 1) on any uncommitted documentation mutations, untracked generated markdown files, or undocumented API routes.
- **One-Command Auto-Remediation**: Run `npm run doctor:fix` (`npx tsx scripts/dx.ts doctor --fix`) to automatically regenerate `openapi.json`, recompile TypeDoc markdown in `docs/`, and resolve fixable architectural invariants.
- **Transient Isolation Boundary**: Intermediate agent scratchpads, raw terminal dumps, and temporary logs (`.agents/`, `scratch/`, `tmp/`) must remain strictly isolated from git tracking and markdown linting pipelines (`npm run lint:docs`).
- **Dual Spec Exposure**: Co-locate machine-readable `openapi.json` at root for automated tooling/CI with human-readable markdown in `docs/` and `adr/` for GitHub-native developer navigation.


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
- When authoring DOM assertions on components where multiple child elements share defensive utility classes (e.g. `.break-words` on both title and description), use `querySelectorAll` with indexed access or dedicated test IDs rather than ambiguous single `querySelector` lookups.
- Production layout verification must adhere to the Four-Layer Layout Validation Protocol:
  - **DevTools Stress Routine**: 320px squeeze (iPhone SE minimum), 200% zoom (WCAG 1.4.4 restacking), and 3x content fuzzing.
  - **Horizontal Overflow Detector**: Automated evaluation (`getBoundingClientRect().right > clientWidth`) across all DOM elements in Playwright (`__tests__/e2e/visual.spec.ts`).
  - **Multi-Viewport Visual Matrix**: Continuous regression coverage across Mobile (320px & 375px), Tablet (768px), and Desktop (1440px).
  - **Real-Device Verification**: Verification on real iOS Safari (`min-h-dvh` floating bar clearance) and Android ("Largest" font scaling).

### 14. Continuous Real-Browser Page Benchmarking & Web Vitals Profiling
- Any new first-class route, case study, or interactive mini-game must be registered in `CANONICAL_ROUTES` in `lib/dx/page-bench.ts`.
- Real-browser navigation timing and Core Web Vitals (TTFB, FCP, LCP, CLS) must be benchmarked against production builds via `npm run bench:pages` or `npx tsx scripts/benchmark-pages.ts`.
- In CI and pre-release gates, performance budgets can be enforced via `--assert` / `--budget` flags, ensuring fleet median LCP <= 2500ms, TTFB <= 800ms, and CLS <= 0.1.

### 15. Developer Experience (DX), Git Hygiene & Tooling Integrity
- Runtime environment variables must be declared in `lib/env.ts` and synchronized with `.env.example` via `npm run dx env` and `npm run doctor:fix`.
- All commit messages must strictly adhere to the Conventional Commits specification (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `dx`), verified by `.husky/commit-msg` (`scripts/validate-commit-msg.ts`) and supported by `npm run dx commit`.
- Git branches must follow naming conventions (`feat/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `perf/*`, `dx/*`, `main`).
- Dead code and orphaned exports must be inspected via `npm run dx dead-code` and monitored in `lib/dx/doctor.ts`.
- Production bundle chunks and initial shared footprints must comply with performance budgets via `npm run dx analyze` and `lib/dx/bundle-guard.ts`.
- VS Code workspace configurations (`.vscode/`) and `.editorconfig` must remain valid and intact.

### 16. Mobile Runtime Performance & Animation Invariants
- **Background Animation Throttling**: Background SVG and particle canvas animations (e.g. `AnimatedGridPattern`, collision beams) must use hardware-accelerated CSS keyframes on mobile viewports (`< 768px`) or be clamped to static composited loops. They must never trigger continuous React `setState` updates or loop `onAnimationComplete` callbacks in mobile render trees.
- **GPU Blur & Compositing Bounds**: Heavy gaussian blur layers (`blur-[100px]` or greater) and overlapping multi-layer `backdrop-blur` filters must be suppressed or substituted with lightweight CSS radial gradients (`hidden sm:block` or responsive classes) on mobile devices to prevent GPU rasterization stalls during scrolling.
- **ResizeObserver Dimension Isolation**: Dynamic text layout engines and Pretext observers must isolate width measurements (`Math.floor(contentRect.width)`) from height fluctuations to prevent mobile browser URL bar / address-bar collapse during scrolling from triggering unnecessary canvas text layout recalculations.
- **Touch & Synthesizer Isolation**: Synthesized Web Audio effects tied to mouse cursor movement (such as hover frequencies) must defensively check `window.matchMedia('(hover: none)').matches` to avoid unwanted audio thread contention during mobile touch-scrolling. Interactive touch buttons and cards must supply instant tactile scaling (`active:scale-[0.98]`).



