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


