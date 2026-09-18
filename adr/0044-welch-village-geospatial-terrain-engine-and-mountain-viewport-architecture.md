# ADR 0044: Welch Village Geospatial Terrain Engine & Mountain Viewport Architecture

## Status

Accepted on 2026-09-18. Governs issue #835 (comprehensive realistic Welch Village trail map and mountain hub recreation) and extends ADR 0042 (Patrol Shift Scenario Engine & Studio Architecture).

## Context

Patrol Shift (`/patrol`) models the daily judgment, emergency care, and mountain management operations of National Ski Patrol at Welch Village (Welch, MN). While earlier milestones established basic stylized SVG sector illustrations, realistic patrol operations require accurate geospatial situational awareness:

1. **49+ Real Welch Village Trails & 10 Chairlifts**: Responding patrollers must understand trail difficulty, grooming state, vertical drop, lift tower numbers, and fall lines across all three Welch Village sectors (East Slopes, West Slopes, and The Back Bowl).
2. **Dual-Zone Topographic Scale**: Welch Village comprises two distinct topological environments: the south-facing East & West Slopes (Main Mountain) and the steep north-facing expert amphitheater of The Back Bowl. Fitting both into a single fixed SVG viewport creates visual crowding and poor mobile readability.
3. **Parametric Pathing & Splines**: Naive straight-line or simple quadratic SVG paths cannot accurately model true mountain contours, switchback catwalks, or realistic toboggan/skier trajectories.
4. **Interactive Situation Awareness**: Patrollers need interactive pan/zoom exploration, elevation profile sparklines, real-time minimap radar tracking, and dispatch beacon pings without losing access to shift dispatches or ambient operational tasks (M8).

## Decision

### 1. Unified Geospatial Data Domain (`lib/patrol/welch-data.ts`)

- **Domain Model**: Export typed datasets representing all 49+ authentic trails (`WELCH_TRAILS`), 10 mechanical chairlifts (`WELCH_LIFTS`), 9 points of interest (`WELCH_POIS`), the NSAA 10-point Responsibility Code (`RESPONSIBILITY_CODE`), and altitude calibration constants (`SUMMIT_ELEVATION_FT = 1060`, `BASE_ELEVATION_FT = 700`).
- **Encapsulation**: Lives in `lib/patrol/welch-data.ts` and re-exports through `lib/patrol/index.ts`, preserving ADR 0042 deep module encapsulation.

### 2. Dual-Zone Vector Coordinate Space

- **Discrete Dual Presets**: Partition the coordinate system into two tailored sector cameras within a unified coordinate system:
  - **East & West Slopes (`main`)**: `viewBox="0 0 2000 1300"`, centered on Main Chalet, East Chalet, Skilink, and the West Slopes.
  - **The Back Bowl (`back-bowl`)**: `viewBox="0 0 1200 900"`, centered on the expert coulees, Black Forest, Adam's Abyss, and the Belle Creek Quad lift line.
- **Auto-Zone Incident Pan**: When an active dispatch or emergency beacon occurs, the viewport automatically switches to the relevant zone and pans to the incident anchor coordinates with a pulsing radar ring.

### 3. Catmull-Rom to Cubic Bézier Spline Pipeline

- **Curvature Transformation**: Compute control points for trail path vectors using parametric Catmull-Rom splines converted to cubic Béziers:
  $$\mathbf{CP}_1 = \mathbf{P}_1 + \frac{\mathbf{P}_2 - \mathbf{P}_0}{6}, \quad \mathbf{CP}_2 = \mathbf{P}_2 - \frac{\mathbf{P}_3 - \mathbf{P}_1}{6}$$
- **Double-Pass Casing & Grooming Textures**: Render high-contrast casing (6px) beneath difficulty core colors (4px). Render groomed corduroy as solid paths and un-groomed mogul/glade runs as dashed vectors (`strokeDasharray="8 6"`).

### 4. Interactive Mountain Viewport & Inspector Architecture

- **Pan, Zoom & Minimap Radar**: Full matrix transformations (0.35x to 3.8x scale) with a 160×100px overview radar inset tracking the active viewport bounding box.
- **Elevation Sparkline**: Selecting any trail renders an SVG elevation cross-section calculating average gradient percentage:
  $$\text{AvgGrade} = \text{round}\left(\frac{\text{verticalDropFt}}{\text{lengthFt}} \times 100\right)\%$$
- **Parametric Skier Simulation**: Physics-driven descent simulation computing piecewise position and tangent angle $\theta = \operatorname{atan2}(\Delta Y, \Delta X)$, accompanied by dynamic snow spray particles and accessible `prefers-reduced-motion` fallbacks.
- **Aerial Chairlift Loop**: Kinetic evaluation of carriers moving along cable lines with tower crossarms, halting smoothly under reduced motion.

### 5. Shift Workflow & M8 Ambient Integration

- MountainMap preserves the top status bar, bottom operational actions ("Routine Hill Check", "Standby on Hill / Await Dispatch"), and floating M8 ambient event cards (`AmbientEventToast`).
- Dispatch incidents in `lib/patrol/scenarios/catalog.ts` and ambient events in `lib/patrol/ambient-events.ts` anchor to exact authentic Welch Village coordinates.

## Consequences

- Delivers a realistic, educational digital twin of Welch Village Ski Area.
- Maintains 100% WCAG 2.1 Level AA compliance, touch target heuristics (min 44px), and keyboard/screen reader parity.
- Validated with pure data tests (`__tests__/patrol-welch-data.test.ts`) and interactive UI tests (`__tests__/patrol-welch-map.test.tsx`).
