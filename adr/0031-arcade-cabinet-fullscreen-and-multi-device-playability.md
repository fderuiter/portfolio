# 0031. Arcade Cabinet Fullscreen & Multi-Device Playability Standard

Date: 2026-08-22

## Status

Accepted

## Context

The portfolio provides seven interactive arcade games and simulation engines hosted inside the modular `PlayCabinet` shell (`components/arcade/PlayCabinet.tsx`). While desktop keyboards (`WASD`, arrow keys) and mouse navigation functioned in windowed mode, full-screen and mobile/tablet touch experiences required unified architectural standards governing:

1. **Cabinet Frame Control Placement**: Fullscreen toggling was previously scattered across game-specific internal headers, causing inconsistent placement and visual clutter.
2. **Top Marquee Frame Header in Fullscreen**: Full-height desktop bars consumed excessive vertical space on 568px–852px mobile and tablet viewports, squeezing the active game canvas.
3. **Modal Click Interception**: Mandatory pre-game setup modals blocked immediate gameplay when launching cabinets.
4. **Touch Controller Ergonomics**: Virtual gamepads, bezel clusters, and action strips required deterministic layout bounds with zero horizontal scroll interference.

## Decision

We establish four architectural standards governing all arcade cabinets:

### 1. Cabinet Frame Fullscreen & Floating Pill Header

- `PlayCabinet` mounts a dedicated **Fullscreen Button** (`components/arcade/FullscreenButton.tsx`) directly onto the top marquee frame bezel alongside the Title LED, Setup Wizard, and Power controls.
- When entering full-screen mode, the top frame bar collapses into an ultra-clean, floating glassmorphic pill docked at the top-right corner (`[Exit Fullscreen] [Setup] [Power]`), maximizing playable canvas area to **100% of vertical screen height**.
- Fullscreen mode supports **`F`** to toggle, **`Esc`** to exit, native Fullscreen API requests on supported devices, and fallback fixed-viewport scaling (`fixed inset-0 z-50 w-full h-[100dvh]`).

### 2. Instant Quick-Play with On-Demand Setup Wizard

- Launching a cabinet initiates immediate gameplay with saved/default CRT presets, bypassing mandatory modal setup dialogs.
- The 3-step setup wizard remains accessible on-demand via the 1-tap `Setup` trigger on the cabinet frame.

### 3. Aspect-Preserving Viewport Scaling

- In full-screen mode, the game canvas preserves its native coordinate system ($4:3$ for Retro Labyrinth, $16:9$ for Laser Loon, $1:1$ circular MIP for Garmin Watch) via aspect-budgeted flex containers, preventing physics distortion and raycast collision misalignments.

### 4. Dual-Mode Touch Controller Docking

- Virtual D-Pads, Twin-Stick crosshairs, and Bezel clusters enforce minimum **48×48px hit areas** (WCAG 2.1 AA) with `touch-action: none` to eliminate browser scrolling contention.
- In windowed mode, touch controls dock beneath the cabinet; in full-screen mode, controls adapt to the lower screen bounds.

## Consequences

- 100% playable, responsive, and accessible arcade experiences across Desktop Chrome, iPad Tablet Safari, iPhone 12 Mobile Safari, and Pixel 5 Mobile Chrome.
- Zero horizontal layout overflow (`scrollWidth <= innerWidth`) in both windowed and full-screen modes.
- Verified by automated Playwright multi-device test suites (`__tests__/e2e/fullscreen-cabinet-playability.spec.ts`).
