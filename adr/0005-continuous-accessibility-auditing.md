# 0005. Continuous Accessibility Auditing Framework (WCAG 2.1 AA)

Date: 2026-08-15

## Status

Accepted

## Context

As the portfolio scales with rich interactive applications (such as CRF Studio, Logical Proof Workspace, Neuroimaging Simulator, and 2D/3D Canvas Arcade Games), providing universal, barrier-free access is essential. Inaccessible interfaces create significant barriers for users relying on keyboard-only navigation, screen readers, switch access, or reduced-motion display preferences.

Without an automated, continuous verification framework, accessibility regressions can easily enter the codebase via unlabelled interactive controls, missing focus traps, broken landmarks, or unannounced asynchronous updates.

## Decision

We establish an automated, continuous accessibility auditing framework enforcing strict WCAG 2.1 Level AA compliance across 100% of user-facing production interfaces, structured across four layers:

### 1. Multi-Tiered Testing Guard & Strict Severity Policies

- **Static Invariant Engine (DX Doctor Invariant 10)**: Verifies presence of root bypass skip links (`<SkipToContent />`), semantic `<main id="main-content">` landmark, and screen reader live announcer provider (`A11yProvider`) on `npm run verify` and `npm run quality`.
- **Component Unit Suite (Vitest)**: Unit tests for focus traps (`useFocusTrap`), live announcers (`useAnnouncer`), and bypass components (`SkipToContent`).
- **Comprehensive E2E Browser Matrix (Playwright + @axe-core/playwright)**: Exhaustive scans of all 7 public routes, 6 arcade mini-games, dynamic modals, Command Palette, and mobile navigation drawers.
- **Strict Zero-Tolerance Threshold**: Any **Critical**, **Serious**, or **Moderate** axe violation triggers an immediate test failure and blocks build promotion. Minor/informational items are captured in structured JSON diagnostic reports.
- **Lighthouse CI Assertion**: Enforces 100% accessibility category score (`minScore: 1.0`) in `.lighthouserc.js`.

### 2. Standardized Focus Trapping & Navigation Landmarks

- **Root Skip Link**: `<SkipToContent />` mounted at root DOM level, visually revealed on keyboard focus, enabling direct jump to `#main-content`.
- **Keyboard Focus Traps**: Unified `useFocusTrap` hook for modal dialogs and slide-up drawers, trapping `Tab` / `Shift+Tab` within the container, handling `Escape` dismissal, and restoring focus to the originating trigger element.
- **Visible Focus Rings**: Standardized high-contrast `:focus-visible` styling across interactive buttons, inputs, and tab stops.

### 3. Screen Reader Live Announcements & SPI Redaction

- **Dynamic Live Region**: Centralized `useAnnouncer` / `A11yProvider` rendering `aria-live="polite"` and `aria-live="assertive"` regions for state updates, simulation steps, and validation feedback.
- **SPI Protection**: Automated filtering preventing sensitive personal information (such as SSNs) from being spoken by screen readers.

### 4. Canvas Accessible Alternatives

- **Non-Text Content Equivalence**: Interactive HTML5 / WebGL canvas applications (Arcade games, Proof DAGs, 3D Brain Viewer) supply accessible DOM mirrors, status badges, and keyboard-mapped alternative controls.

## Invariant Compliance

- **AGENTS.md Invariant 10 (Accessibility)**: Strict WCAG 2.1 Level AA compliance across all public interfaces with zero Critical, Serious, or Moderate violations.
- **AGENTS.md Invariant 6 (DX & Quality)**: Integrated into `npm run quality` and `npm run verify` via DX Doctor Invariant 10.

## Consequences

### Positive

- Universal, barrier-free access for assistive technology users.
- Automated prevention of accessibility regressions in CI and pre-commit hooks.
- Standardized, reusable hooks for focus management and live regions.
- Structured JSON and terminal reporting for rapid developer remediation.

### Negative / Trade-offs

- Interactive modal and drawer components must utilize `useFocusTrap` to pass automated focus boundary scans.
- Canvas-based games require structured alternative text or keyboard bypass controls.
