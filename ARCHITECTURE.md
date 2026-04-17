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
