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
- Route pages (e.g. `app/proof/page.tsx`, `app/transparency/page.tsx`) must never render a secondary `<Navbar />` component.
- Keep page top-padding (`pt-24` to `pt-32`) aligned with the fixed header height.

### 3. Route Indexing & Discovery
- Any new first-class route or interactive tool must be registered in `components/CommandPalette.tsx` under `staticNavs` with an appropriate Lucide icon and category.

### 4. Hydration & React Best Practices
- For client-only rendering or browser API reads, prefer `useSyncExternalStore` over `useEffect` + `useState` hydration flags.
- Keep hook dependency arrays exhaustive in performance-critical hooks (like `usePretextLayout`) while leveraging ref callbacks and canvas measurement memoization.

