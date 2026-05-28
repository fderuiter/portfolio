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

Crucially, our visual components must interface with our advanced layout physics. Rather than relying on rigid row configurations in a standard CSS Grid, our **Zero-Whitespace Masonry Bento Grid (Issue #24)** completely decouples the grid's visual assembly from standard browser flow:
1. **Parent-Level Sizing calculations:** The parent component `CaseStudyShowcase` intercepts layout container updates using a single `ResizeObserver`.
2. **Dynamic Breakpoints:** Based on container bounds, it determines the active column count (3 columns on desktop, 2 on tablet, 1 on mobile) and computes the exact pixel column width.
3. **Pretext Height Predictions:** It loops over all active case study descriptions, querying Pretext for their exact text heights given the active width (subtracting card padding), and aggregates them with dynamic sub-component paddings to determine precise card heights.
4. **Greedy Column Scheduler:** Using an optimization schedule (greedy LPT-inspired scheduler), it routes each card into the vertical column that currently has the shortest accumulated height. 
5. **Zero-Reflow Assembly:** Columns are rendered as separate, self-contained flexbox columns (`flex flex-col gap-4`), ensuring mathematically perfect vertical layouts with absolutely zero vertical gaps, and allowing Framer Motion's `layout` mechanics to handle column-swapping transitions smoothly at 60FPS.

## Core Layout Engine: `@chenglou/pretext`

To achieve fluid, 60FPS animations and circumvent performance bottlenecks inherent in modern web browsers, this project utilizes custom React hooks powered by the `@chenglou/pretext` library.

### The Layout Thrashing Problem
Historically, using standard DOM measurements like `getBoundingClientRect` or `offsetHeight` forces the browser to synchronously recalculate the entire page geometry (a reflow). This layout thrashing can incur severe 30+ millisecond penalties. We utilize `pretext` to completely side-step this expensive operation for text-dense components by executing multiline text measurement entirely in userland JavaScript/TypeScript.

### The Two-Phase Architecture
Our layout hooks strictly enforce a two-phase layout mechanism to eliminate DOM reflows:
- **Phase 1 (Initialization):** The preparation function (`prepare` for raw text, `prepareRichInline` for styled segments) is invoked once to normalize whitespace, apply segmentation rules, and measure individual word widths using the native Canvas engine. These results are cached efficiently in memory.
- **Phase 2 (Execution):** The layout calculations represent the hot path. We hook this execution to a `ResizeObserver`. Whenever the container resizes, the hooks run pure arithmetic over the cached widths, recalculating the layout in under a millisecond without ever touching the DOM or allocating new memory.

### Rich Text & Monospace Code Chips (Issue #45)
To support dynamic typography in case study descriptions, we pioneeringly integrated the `@chenglou/pretext/rich-inline` sub-package:
1. **Markdown Tokenization:** The `parseMarkdownToRichItems` utility splits descriptions on formatting boundaries, capturing bold (`**`), italic (`*`), and code tags (`` ` ``).
2. **Inline Code Padding Calculations:** Inline code chunks are designated as atomic nodes (`break: 'never'`) and mapped to a monospace font. We allocate a deterministic `extraWidth: 12` horizontal padding variable to guarantee that the canvas engine precisely measures the width of our visually styled cyan code badges.
3. **Fragment Materialization:** Once lines are computed, the custom `PretextRichText` component maps each fragment back to its original source element by its `itemIndex` ref, rendering beautifully styled React elements (such as neon-tinted border chips and high-contrast bold texts) with mathematically perfect heights.

### Tailwind v4 Font Synchronization
To guarantee that the Canvas measurements perfectly align with the UI, we dynamically synchronize the Canvas API with our CSS-first Tailwind configuration. During Phase 1, the hooks extract the exact resolved font family string from the DOM root via:
`window.getComputedStyle(document.documentElement).getPropertyValue('--font-inter')`
This dynamically resolved string is passed directly into Pretext, ensuring mathematically perfect parity between the layout engine and Tailwind CSS v4 styling.

### SSR Safety Protocol

Because the native Canvas `measureText` API is strictly a browser-only feature, our layout engine implements a rigid Server-Side Rendering (SSR) safety boundary:
1. The Next.js `"use client"` directive is applied to `usePretextLayout.tsx` to prevent server-side execution.
2. During the initial Next.js SSR pass, the hooks bypass measurement and default to an `isReady: false` state with standard fallback heights.
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

## Safe Rich-Text Rendering Pipeline (Issue #35)

To prevent Stored Cross-Site Scripting (XSS) attacks when rendering complex HTML strings stored in the database's `architectural_narrative` field, we implement a secure HTML sanitization strategy (Option A):
- **isomorphic-dompurify:** We selected `isomorphic-dompurify` because it seamlessly resolves to standard `dompurify` in browser environments and transparently handles JSDOM simulation in Server-Side Rendering (SSR) / React Server Components (RSC).
- **Strict Security Allowlist:** Sanitization is handled by the dedicated `<RichNarrative className="..." html="..." />` component, which forces an audited allowlist:
  - Allowed Tags: `h2`, `h3`, `h4`, `p`, `code`, `pre`, `strong`, `em`, `a`, `ul`, `ol`, `li`
  - Allowed Attributes: `href`, `target`, `rel`, `class`
- **Hydration & Parsing Safety:** Strips malicious nodes (such as `<script>`, `<iframe/>`, or event triggers like `<img onerror="...">`) server-side to guarantee that browser parser states hydrations are safe and match server outputs identically.

## SEO, Open Graph & Crawling Optimization (Issue #36)

To optimize discovering technical showcase materials for recruiters and crawler bots, we integrate Next.js 16 native metadata features:
- **Canonical Alternates:** Automatically generates unique dynamic `<link rel="canonical">` elements on per-page view states using Next.js Metadata API.
- **Dynamic Case Study Serialization:** Implements custom `generateMetadata()` on `/case-studies/[slug]` routes to dynamically extract and construct SEO/Open Graph descriptions, article tags, and published timelines directly from Prisma database schemas.
- **Sitemap & Robots Automation:**
  - `app/sitemap.ts` programmatically compiles `/`, `/ui-sandbox`, and Neon DB published case study slugs into a standards-compliant XML sitemap.
  - `app/robots.ts` restricts crawlers from access logs and internal compilation maps while routing standard bots directly to our primary indexing endpoints.

## Staggered Bento Skills & Scroll-Driven Career Timeline (Issue #37)

To deliver a premium, high-fidelity landing page showcase, we integrated dynamic telemetry metrics with fluid scroll animations:
- **Option B (In-Page Anchor Composition):** We chose Option B to maintain full compatibility with the existing navbar intersection observer and scroll-spy structure. This avoids separate page transitions, ensuring 60FPS seamless scroll navigations across `#case-studies`, `#about`, and `#contact`.
- **Dynamic Telemetry Language Aggregator:** In `app/page.tsx`, we dynamically combine individual repository languages fetched from the serverless Neon database/GitHub cache pipeline. Normalizing these values server-side generates a telemetry skills chip array without incurring rendering overhead.
- **Bento Skills Matrix:** Implements `<SkillsGrid />` using CSS Flex layout containing customized initials SVG badges and dynamic glowing progress meters mapped to current language metrics.
- **Scroll-Triggered Career Timeline:** We developed `<Timeline />` as a client-side component using Framer Motion. Timeline cards fade in and slide up using custom spring physics (`stiffness: 60, duration: 0.8`), aligned on a vertical gradient rail.
- **Accessible Contact Anchors:** Contact buttons are wrapped in semantic `<a>` tags featuring accessible descriptions (`aria-label`) and robust keyboard outline targets to guarantee a WCAG 2.1 AA compliant composition.

## Dynamic Open Graph Image & JSON-LD Structured Data (Issue #28)

To support rich social card visual motifs and compliant structural metadata representations for AI/search parsers, we implement dynamic image calculations and strict schema bindings:
- **Dynamic ImageResponse Routes:** Rather than statically exporting templates, we place `opengraph-image.tsx` inside `/case-studies/[slug]/`. It leverages the Next.js `ImageResponse` canvas compilation API running on a standard NodeJS runtime to guarantee pooled, safe connection fetches from serverless Neon PostgreSQL instances.
- **Visual Motif Design:** Programmatically compiles dynamic titles, primary languages, and category tag chips on a deep charcoal card featuring glowing radial ambient overlays in brand-cyan (`rgba(6, 182, 212, 0.08)`) and high-tech blue (`rgba(59, 130, 246, 0.05)`).
- **JSON-LD Schema Utility Layer (`lib/seo.ts`):** Establishes type-safe constructors for Schema.org formats:
  - **getPersonSchema:** Serializes professional developer profiles loaded site-wide in `app/layout.tsx`.
  - **getSoftwareSourceCodeSchema:** Serializes dynamic case study items in `app/case-studies/[slug]/page.tsx`, directly incorporating cached stars and forks telemetry fetched from the GitHub client.
- **XSS Sanitization Compliance:** Prevents stored script vectors from escaping structured data by programmatically replacing `<` bracket tags with unicode escapes (`\u003c`) inside the JSON-LD serialization pipeline.


