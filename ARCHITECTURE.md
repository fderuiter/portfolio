# Architecture

This document tracks the core, bleeding-edge technical decisions established during Phase 1 of the Portfolio Hub project.

## Next.js 16 & Turbopack

This application is built on **Next.js 16** using the **App Router** paradigm to leverage React Server Components for maximum performance and efficient data fetching.

We explicitly utilize **Turbopack** as the default bundler (`next dev --turbo`). Turbopack is now stable in Next.js 16, and provides significantly faster production builds and 5-10x faster Fast Refresh times during development compared to legacy Webpack configurations.

## Tailwind CSS v4 Configuration

This project implements the newest styling engine: **Tailwind CSS v4**.

Tailwind CSS v4 introduces a radical, **CSS-first configuration model**. As such:
- There is **no** `tailwind.config.js` or `tailwind.config.ts` file in this repository.
- All Tailwind utilities are loaded via the `@import "tailwindcss";` directive located at the top of `app/globals.css`.
- Any custom design tokens, colors, and typography (such as the Inter font) are managed natively via the new `@theme` and `@theme inline` CSS rules directly in `app/globals.css`.

## Visual & Component Strategy

### "Copy-and-Paste" Component Model
For our visual micro-interactions and macro-layouts, we utilize a "copy-and-paste" component model sourced from [Aceternity UI](https://ui.aceternity.com/) and [Magic UI](https://magicui.design/). Rather than relying on heavy, monolithic npm packages, this approach allows us to own the source code for complex Framer Motion physics and Tailwind styling directly within our repository.

### Shared Utilities
The visual ecosystem relies on a shared `cn()` utility function located in `lib/utils.ts`. This function merges `clsx` and `tailwind-merge` to safely construct dynamic class strings and properly resolve conflicts within our Tailwind CSS v4 setup.

### Layout Engine Integration
Crucially, our visual components must interface with our advanced layout physics. Components like the Aceternity Bento Grid are intentionally configured to accept explicit `style={{ height:... }}` props. This architectural decision allows the cards to seamlessly shrink-wrap to the mathematically calculated heights provided by the pretext engine, bypassing standard CSS flexbox stretching and DOM layout thrashing.

## Core Layout Engine: `@chenglou/pretext`

To achieve fluid, 60FPS animations and circumvent performance bottlenecks inherent in modern web browsers, this project utilizes a custom React hook `usePretextLayout` powered by the `@chenglou/pretext` library.

### The Layout Thrashing Problem
Historically, using standard DOM measurements like `getBoundingClientRect` or `offsetHeight` forces the browser to synchronously recalculate the entire page geometry (a reflow). This layout thrashing can incur severe 30+ millisecond penalties. We utilize `pretext` to completely side-step this expensive operation for text-dense components by executing multiline text measurement entirely in userland JavaScript/TypeScript.

### The Two-Phase Architecture
Our `usePretextLayout` hook strictly enforces a two-phase layout mechanism to eliminate DOM reflows:

- **Phase 1 (Initialization):** The `prepare(text, font)` function is invoked once to normalize whitespace, apply segmentation rules, and measure individual word widths using the native Canvas engine. These results are cached efficiently in memory.
- **Phase 2 (Execution):** The `layout(prepared, maxWidth, lineHeight)` function represents the hot path. We hook this execution to a `ResizeObserver`. Whenever the container resizes, this function executes pure arithmetic over the cached widths, recalculating the layout in under a millisecond without ever touching the DOM or allocating new memory.

### Tailwind v4 Font Synchronization
To guarantee that the Canvas measurements perfectly align with the UI, we dynamically synchronize the Canvas API with our CSS-first Tailwind configuration. During Phase 1, the hook extracts the exact resolved font family string from the DOM root via:
`window.getComputedStyle(document.documentElement).getPropertyValue('--font-inter')`
This dynamically resolved string is passed directly into Pretext, ensuring mathematically perfect parity between the layout engine and Tailwind CSS v4 styling.

### SSR Safety Protocol

Because the native Canvas `measureText` API is strictly a browser-only feature, our layout engine implements a rigid Server-Side Rendering (SSR) safety boundary:
1. The Next.js `"use client"` directive is applied to `usePretextLayout.ts` to prevent server-side execution.
2. During the initial Next.js SSR pass, the hook bypasses measurement and defaults to an `isReady: false` state with a fallback height.
3. Only after the component has safely mounted on the client (via `useLayoutEffect`), the component invokes the Canvas logic and updates the state to `isReady: true`. This prevents hydration mismatches and server crashes.

## Resilient GitHub Integration & Caching Layer (`lib/github.ts`)

To ensure rapid initial page loading and prevent hitting GitHub's strict rate limits (60 requests/hour for unauthenticated clients), we decoupled data collection into a dedicated, hardened API abstraction layer.

### Hybrid Caching Topology
1. **Server Contexts (Next.js App Router):** Calls to `getGitHubStats` utilize Next.js `unstable_cache` with a `revalidate` window of 3600 seconds (1 hour) tagged under `"github"`.
2. **Standalone / CLI Contexts (Seeding Pipeline & Builds):** When executed outside the active Next.js runtime environment (which lacks the full incremental cache layer), `unstable_cache` throws an `Invariant: incrementalCache missing` exception. The API client catches this error gracefully and automatically falls back to raw HTTP requests via `fetchRawGitHubStats`.

### Telemetry Hardening & Dev Diagnostics
- **Authenticated Fallback:** Inspects `process.env.GITHUB_TOKEN` to append authorized headers.
- **Fail-Safe Warnings:** Produces non-blocking terminal warnings in `development` environments if no token is detected, preparing developers for potential unauthenticated rate limiting.
- **Payload Sanitization:** Safely parses dynamic fields, maps commit strings (parsing only the first line of headers), handles index safety bounds, and formats language distribution bytes into precise, rounded percentages.

## Interactive CLI Terminal Sandbox Engine (`components/SandboxTerminal.tsx`)

For the Python SDK detail views, we built a fully functional interactive terminal CLI sandbox simulation. It is engineered with premium aesthetics and state-of-the-art interactive micro-interactions:

### 1. Pure React State Purity Compliance
Next.js 16/React 19 strict compiler pipelines enforce pure rendering rules. Traditional token generation (e.g. `Math.random()`) inside rendering functions results in hydration warnings. The Sandbox Terminal implements a pure static sequential ID counter (`idCounter` and `generateLogId()`) outside the component body, ensuring perfect render determinism.

### 2. Full Console Ergonomics
- **Curated Shortcuts:** Clickable quick-command badges instantly execute primary trials operations.
- **Command History Buffer:** Keeps an active array of typed queries, fully navigable using `ArrowUp` and `ArrowDown` keys.
- **Tab Auto-Completion:** Leverages custom key listeners (`e.preventDefault()`) to capture `Tab` triggers, matching inputs to registered SDK operations instantly.
- **Regex JSON Syntactic Highlighting:** Splits JSON outputs by line and matches tokens using strict regular expressions to style keys (`purple-400`), string values (`emerald-400`), booleans (`amber-500`), nulls (`red-400`), and numeric variables (`blue-400`) uniquely.

## Scroll-Driven Tracing Beam Physics (`components/ui/TracingBeam.tsx`)

To guide readers down deep-dive technical narratives, we engineered a custom Tracing Beam margin rail:
- **Scroll Hook Synchronization:** Hooks into Framer Motion `useScroll` tracking container viewport offsets (`scrollYProgress`).
- **Spring Smoothing:** Applies Framer Motion `useSpring` physics (stiffness `80`, damping `22`) to smooth scroll jitters and deliver a high-premium, elegant trailing line.
- **Pulsating Focus Head:** Positioned at the dynamic terminus of the visual line, utilizing localized CSS `@keyframes ping` animations to draw user focus.
- **Desktop Margin Shift:** Seamlessly shifts content container margins (`md:pl-8 lg:pl-12`) on larger viewports to accommodate the vertical rail without layout shifts.

## Serverless PostgreSQL & Connection Adapter Architecture (`lib/db.ts`)

To support serverless operational profiles, we transitioned the database core from a local SQLite setup to Neon serverless PostgreSQL.

### 1. WebSocket Pooling
Because serverless functions terminate database connections rapidly, standard TCP socket wrappers cause overhead. We configured Neon to use the native `ws` (WebSockets) package inside Node.js environments (`neonConfig.webSocketConstructor = ws`), enabling extremely low-latency pooling.

### 2. Dynamic Prisma Client Pooling
To prevent connection leaks across Next.js Hot Module Replacement (HMR) refreshes during development, the client caches the active connection inside a global object (`globalThis.prisma`). It instantiates a fresh connection pool only when the global instance is undefined.

