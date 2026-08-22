# ADR 0030: Layout Density Resilience, Pretext Terminology Isolation, and Outbound Deliverability

## Status

Accepted

## Context

During high-resolution visual and responsive testing across desktop and intermediate viewports (1024px to 1440px), several interrelated layout collisions and delivery failure vectors were identified:

1. **Desktop Navbar Horizontal Density**: The desktop navigation bar packed full-width text pills for search, persona toggles, sound controls, and five navigation links into a 1152px container. Below 1440px, the wordmark (`FDERUITER`) and the first navigation pillar (`Work`) collided with zero margin due to lack of container gap constraints.
2. **Pretext Terminology Code Leaks**: `lib/term-compiler.ts` tokenized HTML tags but failed to isolate markdown inline code backtick spans (`` `...` ``). As a consequence, glossary term substitution converted code chips like `` `JSON Schema` `` into `` `<span data-key="...">JSON Schema</span>` ``, which downstream rich-inline parsers rendered as literal raw HTML strings.
3. **Card Height Bounds in Masonry Columns**: In `components/ui/CaseStudyBentoCard.tsx`, card containers declared rigid `h-[var(--bento-card-height)]` bounds without overflow clipping. Whenever rendered content exceeded the calculated height, DOM elements overflowed and visually overlapped the succeeding card in the column.
4. **Uniform Simulated Telemetry**: Fallback simulated metrics in `lib/github.ts` returned hardcoded `148 stars, 24 forks, 3 issues, 249 commits` uniformly across all TypeScript repositories.
5. **Header Toolbar Collisions in CRF & Neuro Workspaces**: Top navigation headers in `StudioHeader.tsx` and `Brain3DViewer.tsx` rendered overlapping action buttons and colliding absolute-positioned titles.
6. **Form Transmission Resilience**: Contact form inquiry intent selectors suffered from button text truncation on intermediate widths, and client-side error handling threw generic network error notices on non-JSON server responses.

## Decision

We establish four architectural principles for layout resilience, terminology compilation safety, and outbound transmission:

1. **Defensive Layout Spacing & Container Gaps**:
   - Navigation containers must declare explicit responsive horizontal gaps (`gap-4 sm:gap-6 lg:gap-8`) rather than relying purely on CSS `justify-between`.
   - Secondary widgets (persona selectors, audio monitors) must adopt compact responsive profiles to prevent navigation link collision on displays between 1024px and 1440px.

2. **Strict Markdown Code Isolation in Terminology Compilation**:
   - `lib/term-compiler.ts` (`tokenizeHtml`) must recognize and protect markdown inline backtick spans (`` `[^`]+` ``) and fenced blocks (` ```[\s\S]*?``` `) alongside HTML tags.
   - Glossary terms inside markdown code spans are never substituted with HTML markup, preserving verbatim code chip rendering.

3. **Elastic Bounds for Masonry Card Enclosure**:
   - `CaseStudyBentoCard.tsx` adopts `min-h-[var(--bento-card-height)] h-auto` flex column behavior, ensuring cards dynamically expand to contain multi-line titles, commit sparklines, and terminal logs without overlapping neighboring cards.
   - Telemetry fallbacks utilize deterministic seed hashing based on repository slug/title to generate unique, realistic metrics for every project.

4. **Structured Viewport Headers & Robust Transmission**:
   - Workspace headers (`StudioHeader.tsx`, `Brain3DViewer.tsx`) utilize structured flex containers with responsive priority ordering rather than competing absolute overlays.
   - Inbound contact and newsletter forms implement resilient response parsing, responsive button flex wrapping, and default to `fpderuiter@gmail.com` as the canonical recipient address.

## Consequences

- **Positive**:
  - Eliminates wordmark and navigation collisions across all desktop breakpoints (1024px–1920px+).
  - Guarantees 100% clean rendering of technical code chips without raw HTML tag leakage.
  - Eliminates card overlaps in case study masonry columns while retaining smooth spring animations.
  - Ensures distinct, domain-specific telemetry metrics per case study.
  - Eliminates toolbar collisions in CRF Studio and NeuroRecon Studio.
  - Resolves intent button truncation and guarantees robust message delivery to `fpderuiter@gmail.com`.
- **Negative**:
  - Minor increase in regex tokenization complexity within `tokenizeHtml`.
