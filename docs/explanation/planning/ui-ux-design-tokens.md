# Portfolio Design System Tokens & Editorial Palette

This document defines the formal token contract for the portfolio's architectural editorial system, established in slice `[UI/UX 01]` (Ticket #574).

## 1. Surface & Canvas Tokens

The foundation uses a warm architectural graphite hierarchy that avoids harsh pitch-black backgrounds while maintaining strong contrast:

| Token Name | Value | CSS Variable | Description |
| --- | --- | --- | --- |
| Base Canvas | `#0d0e11` | `--background`, `--brand-dark` | Root viewport surface across all standard pages. |
| Surface 1 (Cards) | `rgba(20, 22, 28, 0.75)` | `--surface-1` | Primary container surface for cards and consoles with blur. |
| Surface 2 (Elevated) | `rgba(28, 31, 39, 0.55)` | `--surface-2` | Secondary container surface for nested panels and modules. |
| Alternating Section | `#101217` | N/A | Subtly distinct graphite fill for alternating homepage sections (`#about`). |
| Solid Card Fill | `#13151a` | N/A | High-assurance solid container fill for telemetry and interactive consoles. |

## 2. Hairline Structural Borders

Structural borders provide crisp technical division without bulky outlines:

| Token Name | Value | Usage |
| --- | --- | --- |
| Structural Hairline | `rgba(255, 255, 255, 0.08)` / `border-white/10` | Section dividers, card boundaries, table cell separators. |
| Active Border | `rgba(245, 158, 11, 0.4)` / `border-amber-500/40` | Hover states, active tabs, highlighted cards. |
| Verified Border | `rgba(16, 185, 129, 0.4)` / `border-emerald-500/40` | Verified proof state, active health checks. |
| Telemetry Border | `rgba(6, 182, 212, 0.4)` / `border-cyan-500/40` | Runtime metrics, GC controls, memory budgets. |

## 3. Typographic Scale & Hierarchy

Typography is divided strictly between human-readable editorial body text and technical monospace metadata:

| Role | Font Family | Size / Line Height | Contrast on `#0d0e11` | Usage |
| --- | --- | --- | --- | --- |
| Hero Title | `var(--font-inter)` | Fluid (32px mobile to 54px desktop) / 1.15 | 15.8:1 (`#f4f4f6`) | Main headline, zero-CLS Pretext layout. |
| Section Headings | `var(--font-inter)` | 24px–36px (`text-2xl` to `text-4xl`) / 1.25 | 15.8:1 (`#ffffff`) | Major section milestones. |
| Body Text | `var(--font-inter)` | 14px–16px (`text-sm` to `text-base`) / 1.75 | 11.5:1 (`#d4d4d8` / `text-zinc-300`) | Narrative descriptions, section subtitles. |
| Technical Monospace | `var(--font-geist-mono)` | 11px–13px (`text-[11px]` to `text-xs`) / 1.4 | 5.3:1 (`#a1a1aa` / `text-zinc-400`) | Console metrics, section indicators, code tags. |
| Accent Monospace | `var(--font-geist-mono)` | 10px–12px (`text-[10px]` to `text-xs`) / 1.4 | 12.2:1 (`#fcd34d` / `text-amber-300`) | Status badges, category pills, telemetry labels. |

## 4. Radii Scale

Border radii follow a disciplined step curve:

| Token Name | Dimension | Usage |
| --- | --- | --- |
| `rounded-lg` | `8px` (`0.5rem`) | Sub-controls, console tabs, chips, input fields. |
| `rounded-xl` | `12px` (`0.75rem`) | Action buttons, metric tiles, inner panels. |
| `rounded-2xl` | `16px` (`1rem`) | Section cards, engineering consoles, contact links. |
| `rounded-full` | `9999px` | Badges, pills, status indicator dots. |

## 5. Focus & Interactive Control States

All interactive controls enforce WCAG 2.1 Level AA visible focus indicators and minimum touch targets:

- **Focus Ring**: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0e11]`
- **Minimum Touch Target**: Minimum `44x44 CSS px` (and `48px` for primary CTA buttons) on mobile viewports.
- **Active Scaling**: `active:scale-[0.98]` tactile press feedback on touch and mouse clicks.

## 6. Semantic Status Colors

Colors convey precise state semantics without relying solely on color hue for information:

| Semantic State | Color Code | Tailwind Class | Meaning |
| --- | --- | --- | --- |
| Primary Accent / Warning | `#f59e0b` / `#fbbf24` | `amber-400`, `amber-300` | Primary action buttons, active proof invariants, attention cues. |
| Success / Verified | `#10b981` / `#34d399` | `emerald-500`, `emerald-400` | Verified sound AST rules, valid clinical schemas, active telemetry. |
| Telemetry / Runtime | `#06b6d4` / `#67e8f9` | `cyan-500`, `cyan-300` | Simulated hardware memory, GC triggers, embedded runtimes. |
| Error / Out of Bounds | `#f87171` | `red-400` | Validation errors, budget exceedances, missing constraints. |
| Steel / Neutral | `#94a3b8` | `slate-400`, `zinc-400` | Inactive steps, passive specs, timestamp metadata. |

## 7. Spacing & Layout Rhythm Tokens

The page vertical rhythm maintains fixed-header clearance and predictable anchor targeting:

- **Navbar Clearance**: `pt-32` (`8rem` = 128px) on mobile, `sm:pt-36` (`9rem` = 144px), `lg:pt-44` (`11rem` = 176px) on desktop (guarantees clearance over 80px navbar).
- **Section Padding**: Standardized to `py-16 sm:py-20 md:py-24`.
- **Anchor Scroll Margin**: `scroll-margin-top: calc(var(--navbar-height) + 2rem)` (112px), ensuring section headings land in visible view below the navbar.
- **Card Grids**: `gap-4 sm:gap-6 lg:gap-8` container flow.
