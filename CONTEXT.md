# Portfolio Domain Context & Glossary

## Logical Proof Workspace

### Deductive Inference Rules
Formal inference rules used to derive logical steps from valid premises:
- **Modus Ponens (MP)**: Given $P$ and $P \to Q$, derives $Q$.
- **Modus Tollens (MT)**: Given $P \to Q$ and $\neg Q$, derives $\neg P$.
- **Hypothetical Syllogism (HS)**: Given $P \to Q$ and $Q \to R$, derives $P \to R$.
- **Disjunctive Syllogism (DS)**: Given $P \lor Q$ and $\neg P$, derives $Q$ (or given $P \lor Q$ and $\neg Q$, derives $P$).
- **Clausal Resolution (Res)**: Given $(A \lor B)$ and $(\neg A \lor C)$, cancels complementary literals to derive the resolvent $(B \lor C)$.
- **Conjunction Introduction / Elimination ($\land$-Intro / $\land$-Elim)**: From $P$ and $Q$ derive $P \land Q$; from $P \land Q$ derive $P$ or $Q$.
- **De Morgan's Laws**: $\neg(P \land Q) \iff (\neg P \lor \neg Q)$ and $\neg(P \lor Q) \iff (\neg P \land \neg Q)$.
- **Reductio Ad Absurdum / Contradiction (RAA)**: Assuming $P$ leading to $\bot$ (contradiction) derives $\neg P$.

### Proof Graph Elements
- **Premise Node**: An axiomatic starting hypothesis or given system invariant.
- **Rule Operator / Inference Application**: A deductive step linking premise inputs to a derived conclusion via a formal inference rule.
- **Derived Lemma Node**: A valid proposition proven from preceding premises/lemmas.
- **Target Invariant / Goal Node**: The target theorem or system invariant to be formally discharged (Q.E.D.).

### Verification & Diagnosis
- **Deduction Ledger**: A chronological, step-by-step mathematical proof table documenting step number, formula, applied rule, input premise lines, verification state, and software engineering meaning.
- **Fallacy Engine**: AST-level diagnostic checker that detects invalid deductions (e.g., Affirming the Consequent, Denying the Antecedent, Incompatible Literals, Circular Dependencies) and generates counterexample truth tables.
- **Soundness Checker**: Formal verification evaluator ensuring the proof DAG is acyclic, well-typed, and all inferences are mathematically sound.

### Curriculum Tiers & Domains
- **Foundations of Deductive Logic**: Direct & indirect inferences (Modus Ponens, Modus Tollens, De Morgan's, Disjunctive Syllogism) mapped to compiler & CI/CD invariants.
- **Distributed Systems Consensus**: High-assurance invariants (Raft Leader Election, Two-Phase Commit Atomicity, Quorum Overlap, Split-Brain Prevention).
- **Concurrency & Memory Safety**: Deadlock freedom via clausal resolution refutation, lock-free wait graph cycle elimination, bounded buffer memory safety.
- **Custom Invariant Studio**: User-authored propositions and premises sandbox with live syntax parsing, proof builder, automated SAT/tableau solver verification, and multi-format exports.

## CRF Studio (Clinical Form & Protocol Designer)

### Clinical Data Architecture & CDISC Standards
- **CDASH (Clinical Data Acquisition Standards Harmonization)**: CDISC standard establishing basic rules for clinical data acquisition and standard variable names (e.g. `DM`, `VS`, `AE`, `CM`, `LB`).
- **NCI Thesaurus Controlled Terminology**: Standardized biomedical concepts and C-codes (e.g. C66742 for Sex, C49487 for Severity, C66768 for Causality) mapped directly to codelists.
- **CDISC Conformance & Regulatory Validation Engine**: Automated regulatory rule engine validating dataset variable names (length <= 8 characters), core CDASH requirements (HR/O/R), NCI Thesaurus CT codelist codes, and ISO 8601 date formats adhering to FDA and PMDA Technical Conformance Guides with 1-click automated remediation.
- **CDISC ODM-XML v1.3.2**: International vendor-neutral XML format representing clinical metadata (`MetaDataVersion`, `StudyEventDef`, `FormDef`, `ItemGroupDef`, `ItemDef`, `CodeList`).
- **HL7 FHIR Structured Data Capture (SDC)**: FHIR R4/R5 Questionnaire resources for EHR-to-EDC clinical data interoperability.

### AST Logic & Calculation Engine
- **Safe Recursive Descent AST**: Zero-eval mathematical formula evaluator supporting arithmetic operators, functions (`round`, `sqrt`, `abs`, `max`, `min`), and clinical derivations (BMI, Mosteller BSA, eGFR, RECIST 1.1 SLD % change, QTc).
- **Dynamic Edit Checks**: Cross-field conditional triggers for showing/hiding questions, dynamic mandatory flags, boundary checking, and discrepancy query firing.
- **Logic Dependency DAG (Rule Graph)**: Directed Acyclic Graph modeling cascading edit check trigger fields, rule operators, action targets, and circular dependency detection.

### 21 CFR Part 11 Electronic Data Capture (EDC) Simulation
- **Multi-Role Simulation**: Role-based access control modeling Site Coordinator (data entry), Principal Investigator (e-signature & review), CRA Monitor (SDV & discrepancy management), and Data Manager.
- **Subject Status Matrix**: Medidata Rave / Veeva Vault CDMS style 2D matrix visualizing multi-subject longitudinal visit progression and form completeness (Complete, Incomplete, Locked, Open Query, SDV Verified).
- **Source Data Verification (SDV)**: CRA clinical monitoring activity verifying that electronic data captured in the EDC accurately reflects raw subject medical records / source charts.
- **Reason for Change Prompt**: Mandatory justification audit prompts when modifying existing clinical data points.
- **Immutable Chronological Audit Log**: Timestamped record tracking previous value, new value, user identity, role, and justification.
- **Electronic Signatures**: Cryptographic simulated SHA-256 digital signatures attesting investigator review and data lock.

## Mobile Touch & Responsive Architecture

### Multi-Modal Mobile Stack
- **Mobile Stack View**: A segmented view navigation paradigm for complex desktop studio tools (CRF Studio, Proof Canvas, Neuro Simulator) that decomposes multi-column desktop layouts into discrete, focused views (e.g. Canvas, Inspector, Ledger, Terminal) accessible via bottom tab bars on screens < 768px.
- **Slide-Up Action Sheet (Bottom Sheet)**: A mobile modal drawer pattern used for widget palettes, command inputs, and tool selectors that slides up from the bottom of the viewport with backdrop blur and swipe-to-dismiss capabilities.
- **Horizontal Overflow Invariant**: The structural requirement that all rendered pages, canvas elements, tables, and overlays must satisfy `element.scrollWidth <= element.clientWidth` to prevent unintended horizontal scrolling or layout tearing on mobile viewports (320px to 480px).

### Virtual Gamepad & Canvas Ergonomics
- **Virtual D-Pad**: An on-screen, high-contrast touch controller component with minimum 48x48px directional buttons supporting rapid touch/mouse down-up events, haptic/audio feedback, and pointer capture for responsive action in arcade games.
- **Canvas Touch Action Isolation**: The explicit setting of `touch-action: none` or `touch-action: pan-y` on interactive HTML5 / WebGL canvas elements during active gameplay to prevent touch gestures from triggering browser pull-to-refresh or unwanted page scrolling.
- **Safe Area Inset Adaptation**: Dynamic spacing integration using CSS `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)` to protect fixed navigation bars, floating buttons, and game controllers from iPhone notches, Dynamic Islands, and mobile home indicator bars.

## Accessibility Architecture & WCAG 2.1 Compliance

### Continuous Auditing & Enforcement
- **Multi-Tiered Accessibility Guard**: An automated testing hierarchy comprising static invariant analysis (`lib/dx/doctor.ts`), unit component testing (Vitest), comprehensive end-to-end axe-core browser evaluation (`@axe-core/playwright`), and Lighthouse CI score assertion (100% threshold).
- **WCAG 2.1 Level AA Conformance Invariant**: The structural requirement that all public routes, interactive modals, drawers, and form controls pass axe-core scans with zero critical, serious, or moderate violations.
- **Internal Developer Tool Boundary**: Clear demarcation excluding CLI developer tasks (`scripts/dx.ts`), database seed scripts, and headless build pipelines from end-user accessibility audits while maintaining strict audit coverage across 100% of user-facing production interfaces.

### Navigation & Focus Management
- **Skip Navigation Link**: An accessible, high-contrast bypass mechanism at the root DOM level (`<SkipToContent />`) enabling keyboard and screen reader users to skip global navigation and jump directly to `<main id="main-content">`.
- **Modal Focus Trap**: An event-controlled keyboard boundary (`useFocusTrap`) that restricts `Tab` / `Shift+Tab` cycling strictly within active dialogs, bottom sheets, or command palettes until dismissed via `Escape` or interactive trigger, automatically restoring focus to the originating element.
- **Dynamic Live Region (Live Announcer)**: An off-screen `aria-live="polite"` / `role="status"` notification hub (`useAnnouncer`) providing timely audio cues for asynchronous state mutations, mathematical proof discharges, telemetry streams, and form validation alerts.
- **Canvas Accessible Alternative**: Contextual screen-reader accessible DOM descriptors, tabular mirrors, and high-contrast status overlays providing equivalent functional information for 2D/3D WebGL and HTML5 canvas experiences.

## Graphics & Context Loss Resilience

### GPU Context Management
- **WebGL Context Loss Handler**: An isolated browser event management protocol intercepting `webglcontextlost` (calling `preventDefault()` to enable automatic recovery) and pausing active animation frame loops to guard GPU state.
- **WebGL Context Restoration Lifecycle**: An automated re-instantiation pipeline triggered upon `webglcontextrestored` that re-binds GPU vertex buffers, shader programs, and materials while preserving exact user session state (camera rotation, surface modes, crosshairs, active tools).
- **Canvas 2D Context Resilience**: Event-driven restoration managing HTML5 2D canvas `contextlost` / `contextrestored` events to preserve simulation states and rendering pipelines across mobile tab suspension and GPU power state switches.

## Command Palette Discovery & Intuitive Navigation

### Master-Detail Search Architecture
- **Command Palette Preview Pane**: A high-density master-detail split-pane preview surface in `CommandPalette.tsx` presenting real-time technical context (tech stack badges, live route status, architectural highlights, capability bullet points) for focused search outcomes.
- **Contextual Preview Metadata**: Structured metadata attached to indexable static navigation routes and case studies—including route category, status badges, tech stack pills, capability highlights, and destination URLs—enabling zero-latency contextual discovery prior to page routing.
- **Progressive ARIA Preview Association**: Accessible WAI-ARIA Combobox 1.2 integration linking active search options to preview descriptors via `aria-describedby`, ensuring screen reader users receive rich contextual metadata without disrupting keyboard traversal speed.
- **Studio Hash State Persistence**: A bidirectional URL hash synchronization mechanism (`window.location.hash`) that preserves and restores active studio sub-modes, inspected entities, and viewport configurations across browser navigation, page reloads, and shared hyperlinks without server roundtrips.
## Documentation Synchronization & Architectural Invariants

### Governance & Drift Management
- **Full-Spectrum Documentation Governance**: The unified taxonomy and policy governing formal OpenAPI contracts (`openapi.json`), compiled TypeDoc markdown references (`docs/`), Architectural Decision Records (`adr/`), and System Architecture blueprints (`ARCHITECTURE.md`), while strictly isolating transient agent traces and scratch notes.
- **Specification Drift**: A desynchronization state where codebase mutations (such as modified route signatures, altered Zod validation schemas, or renamed exported hooks) diverge from committed documentation files or OpenAPI schemas.
- **Transient Scratchpad Boundary**: Strict repository isolation demarcating temporary planning logs, intermediate agent scratchpads, and adversarial testing directories (`.agents/`, `scratch/`, `tmp/`) from tracked repository documentation and markdown linting pipelines.
- **Lockstep Synchronization Gate**: An automated enforcement mechanism across pre-commit hooks, DX invariant suites, and CI pipelines that asserts zero drift across all public endpoints and exported TypeScript interfaces.
- **Zero-Drift Invariant Gate**: A strict verification rule where CI and pre-commit hooks abort with exit code 1 if any uncommitted documentation mutations, untracked generated markdown files, or undocumented API routes exist.
- **One-Command Auto-Remediation (`npm run doctor:fix`)**: A single idempotent task runner command that synchronizes OpenAPI specifications, compiles TypeDoc markdown, and resolves fixable architectural discrepancies across the codebase.
- **Declarative Schema Registry (`lib/schemas.ts`)**: The central repository of runtime Zod validation schemas establishing typed request payloads, query parameters, and response structures for all system endpoints.
- **Dynamic Route Discovery**: Automated filesystem scanning traversing `app/api/**/route.ts` to discover all active HTTP route handlers and assert 100% coverage in the centralized OpenAPI specification.
- **Vertical Slice Scaffolding (`scripts/dx.ts scaffold`)**: Automated code generation that simultaneously creates route handlers, companion Zod contracts, Vitest unit test suites, and registers entries in `CommandPalette.tsx` and `scripts/generate-openapi.ts` to prevent initial drift.
- **Architectural Decision Record (ADR) Registry**: Sequentially indexed markdown documents in `adr/` capturing immutable, high-context architectural rationale, trade-offs, and invariants.
- **Dual Spec Consumption Model**: Co-location of standard machine-readable schema artifacts (`openapi.json` for CI/linting/tooling) alongside human-readable GitHub-native markdown docs (`docs/`, `adr/`, `ARCHITECTURE.md`) to support both automated validation tooling and frictionless human onboarding.

## Defect Remediation & Quality Engineering

### Multi-Layer Defect Detection
- **Multi-Layer Defect Scanner**: A unified verification pipeline combining compile-time static AST analysis, runtime telemetry error monitors, and edge-case property/fuzz test harnesses.
- **Automated Invariant Gate**: A strict pre-commit and CI verification gate that halts builds upon detecting structural anti-patterns, memory leak vectors, unhandled Promise rejections, or API contract violations.
- **Proactive Defect Eradication**: The continuous process of eliminating latent root-cause defects in codebase modules before release, supported by automated regression validation.

### Legacy Triage & Defect Classification
- **Risk & Impact Matrix**: A four-tier defect classification hierarchy (P0: System Crash/Data Loss, P1: Calculation/AST Logic Invariant Failure, P2: Visual/A11y Regression, P3: Cosmetic/Minor) used to prioritize remediation effort.
- **Legacy Module Audit**: Systematic inspection and verification of foundational state and calculation engines to identify and isolate unhandled edge cases, floating-point drift, circular reference traps, or unhandled null states.

### Root-Cause Remediation & Regression Verification
- **Red-Green Remediation Protocol**: The mandatory practice of authoring a failing reproduction test isolating a bug's precise root cause prior to applying architectural fixes, proving the patch's efficacy when the test turns green.
- **Verified Regression Patch**: A comprehensive code modification that eliminates the root structural defect rather than masking symptoms, paired with automated regression tests committed in lockstep.
- **Defect Invariant Gate**: An automated rule in the DX doctor suite ensuring all core modules satisfy mathematical invariants, boundary conditions, error sanitization, and state determinism.

## Layout Integrity & Text-Clipping Invariants

### Container Sizing & Flexbox Boundary Defenses
- **Flexible Container Bounds (`min-h-*` over fixed `h-*`)**: The architectural requirement to utilize minimum height constraints (`min-h-*`, `h-auto`) rather than rigid fixed heights (`h-48`, `h-64`) on content containers, ensuring containers dynamically expand as localized text wraps on narrow viewports.
- **Flexbox/Grid Intrinsic Width Neutralization (`min-w-0` / `min-h-0`)**: The mandatory application of `min-w-0` (or `min-h-0` in vertical flex layouts) on flex and grid children containing text elements, overriding CSS `min-width: auto` to permit proper word wrapping and truncation without layout expansion.
- **Differentiated Word Wrapping**: The structural pattern applying `break-words` (`overflow-wrap: break-word`) to editorial prose and headings, `break-all` / `overflow-wrap: anywhere` to unbroken identifiers/URLs, and horizontal scroll boundaries to complex mathematical AST ledgers.

### Stacking Contexts & Semantic Layer Scale
- **Section Stacking Isolation (`isolate`)**: The explicit application of CSS `isolation: isolate` on composite and layered multi-element sections, scoping internal `z-index` hierarchies and preventing z-index escalation bugs across sibling page components.
- **Standardized Layer Scale**: A bounded system-wide elevation hierarchy (background: `-z-10`, content: `relative z-10`, sticky navigation: `z-40`, modals and search palettes: `z-50`) replacing unmanaged arbitrary z-index values (`z-[9999]`).
- **Dynamic Viewport Height Adaptation (`dvh`)**: The responsive viewport scaling standard utilizing `min-h-dvh` across page wrappers and modal layouts to account for mobile browser dynamic UI expansion (address bars, bottom sheets).

### Defensive CSS & Component Independence
- **Container Query Encapsulation (`@container`)**: The practice of wrapping modular cards and widgets in CSS container contexts (`@container`) so internal layout shifts, font sizing, and flex directions react directly to parent container width rather than global viewport dimensions (`@media`).
- **Dynamic Content Stress Invariant**: The requirement that all text containers and card wrappers maintain visual integrity when populated with edge-case data: localized translations (+40% character expansion), long unbroken URLs/identifiers (100+ characters without spaces), and 200% simulated browser zoom.
- **Design Token Governance**: The architectural enforcement preventing arbitrary inline magic numbers (e.g. ad-hoc `h-[...px]`, `text-[...px]`, `z-[9999]`) in favor of centralized design manifest tokens and responsive clamp scales.

### Production Layout Validation Protocol
- **The 320px Squeeze Invariant**: The mobile boundary stress test validating that all rendered components, interactive studios, and cards operate without text truncation, layout distortion, or horizontal page scrolling on 320px-wide viewports (iPhone SE class).
- **Horizontal Overflow Detector (`right > clientWidth`)**: The automated DOM inspection probe evaluating `element.getBoundingClientRect().right > document.documentElement.clientWidth` across all rendered DOM nodes to catch invisible horizontal layout leaks.
- **WCAG 1.4.4 200% Zoom Restacking**: The accessibility requirement asserting that when browser zoom increases to 200% at desktop viewport widths, all elements dynamically re-stack and expand vertically with zero horizontal clipping or content collision.
- **Real-Device Dynamic Viewport Adaptation**: Verification on real iOS Safari and Android devices confirming proper `min-h-dvh` expansion beneath floating browser bars and accommodation of system-level "Largest" font accessibility preferences.

## Developer Experience (DX) & Tooling Integrity

### Environment & Secret Governance
- **Typed Environment Schema (`lib/env.ts`)**: Declarative Zod validation rules establishing runtime safety and contract isolation between server-side secrets and client-safe public variables (`NEXT_PUBLIC_`).
- **Environment Drift Sentinel**: Automated synchronization mechanism asserting 100% parity between active runtime schema keys and `.env.example` templates without exposing sensitive credentials.
- **One-Command Environment Auto-Sync (`npm run dx env -- --fix` / `npm run doctor:fix`)**: Idempotent task that reconciles environment configuration templates with declared TypeScript schemas.

### Git Hygiene & Conventional Commits
- **Conventional Commits Invariant**: Strict format enforcement (`<type>(<scope>): <subject>`) validating commit message semantics, length limits (<=100 chars), and imperative phrasing across standard types (`feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`, `dx`).
- **Husky Commit Guard (`.husky/commit-msg`)**: Pre-commit hook interceptor preventing malformed or unclassified git commits from entering repository history.
- **Interactive Commit Wizard (`npm run dx commit`)**: Guided command-line interface generating compliant Conventional Commits with scope validation and breaking change indicators.
- **Branch Naming Standard**: Team-wide git branch naming convention requiring categorical prefixes (`feat/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `perf/*`, `dx/*`, `test/*`, `main`).

### Static Analysis & Performance Budgets
- **Dead Code & Unused Export Scanner (`lib/dx/dead-code.ts`)**: Fast static AST analysis engine traversing project source files to discover orphaned symbols, unreferenced types, and dead modules.
- **Bundle Chunk Budget Guard (`lib/dx/bundle-guard.ts`)**: Post-build asset analyzer evaluating production gzip and raw byte footprints against hard performance budgets (initial shared <= 350 kB, single chunk <= 200 kB).
- **Workspace IDE Standard (`.vscode/`, `.editorconfig`)**: Centralized editor profiles establishing consistent formatting, TypeScript SDK resolution, Tailwind IntelliSense rules, and one-click debugger profiles across all developer environments.

## Synthetic Reliability, Telemetry & Watch Emulation

### Headless Synthetic Journey Probing
- **Headless Synthetic User Probes**: Continuous real-browser Playwright test probes (`__tests__/e2e/synthetic-probes.spec.ts`) validating 5 critical end-to-end user journeys across a 4-browser matrix (Desktop Chrome, Tablet Safari, Mobile Safari, Mobile Chrome): Pretext text layout rendering, Spotlight Command Palette traversal and fuzzy search routing, Proof Assistant DAG theorem verification and export, Arcade Canvas 2D engine lifecycle, and Telemetry API ingestion with schema rejection guards.
- **Multi-Device Discovery Matrix**: Cross-platform testing matrix verifying touch interaction, keyboard boundaries, modal focus trapping, and responsive viewport sizing across mobile (375x667, 393x851), tablet (810x1080), and desktop (1280x720) viewports.

### Production Canary Analysis & Health Governance
- **Automated Canary Analysis (ACA)**: Production deployment verification engine (`scripts/canary-analyzer.ts`) evaluating live request telemetry and error budgets against statistical baseline thresholds (5xx error rate <= 0.5%, p95 latency <= 800ms, Sentry exception spike ratio <= 2.0x) to automate canary promotion or trigger rollback workflows.
- **Telemetry Event Ingestion Guard**: Validated REST API endpoint (`/api/telemetry`) enforcing strict Zod schema parsing, origin sanitization, rate-limiting, and error-boundary isolation on client performance and user interaction metrics.

### Garmin Watch Hardware & Thermal Emulation
- **Garmin Thermal & CPU Telemetry Engine**: Deterministic physical simulation engine (`lib/garmin-engine.ts`, `components/arcade/GarminWatch.tsx`) modeling Connect IQ runtime CPU workloads, heat generation curves, passive wrist thermal dissipation, battery discharge profiles, and ANT+ heart rate sensor telemetry under active workload stress.
- **Monkey C Bytecode Emulation Scaffold**: Canvas-driven graphical rendering pipeline emulating high-contrast MIP (Memory-in-Pixel) transflective smartwatch displays, hardware bezel buttons, and Connect IQ OS lifecycle states with zero native C dependencies.## Scientific & Engineering Editorial Design System

### Visual Identity & Interactive Telemetry
- **Hero Engineering Console**: An interactive, multi-modal hero telemetry component allowing visitors to interactively test and verify domain invariants (AST Premise Discharging in Formal Logic, CDISC 21 CFR Part 11 Conformance Auditing, and Garmin 32KB Memory Heap Allocation) with contextual handoff links to full interactive studio workspaces.
- **Scientific & Engineering Editorial Design System**: A high-assurance visual and interaction design architecture emphasizing Swiss grid precision, deep architectural graphite surfaces (`#0d0e11`, `#13151a`), crisp hairline structural borders (`rgba(255, 255, 255, 0.08)` / `border-zinc-800`), and semantic status indicators (Precision Amber `#f59e0b`, Emerald `#10b981`, Steel `#94a3b8`) eliminating generic AI tropes (falling collision particles, diffuse neon glows).
- **Systems Dossier & Spec Index**: A numbered engineering project showcase (`SYS-01`, `SYS-02`, `SYS-03`, `SYS-04`) surfacing explicit architectural constraints, test coverage badges, language specs, and direct pathways to deep-dive case studies.

## Resilient Hybrid Fallback Data Architecture

### Serverless Prerender Resilience & Data Sourcing
- **Resilient Hybrid Fallback**: The unified data retrieval strategy implemented in `CaseStudyService` that queries the remote PostgreSQL/Neon database first, seamlessly unions or falls back to static compilation data (`FALLBACK_CASE_STUDIES`) upon missing records or connection errors, and returns `notFound()` for invalid entities rather than failing static builds.
- **Database-Priority Sourcing**: Sourcing protocol where live database records take precedence for matching entity slugs, while any newly introduced or unseeded static case studies in the codebase are automatically appended to the collection.
- **5-Point Discovery Matrix**: The unified multi-surface synchronization invariant linking every first-class case study and interactive tool across Command Palette (`CommandPalette.tsx`), Desktop/Mobile Navigation (`Navbar.tsx`), Footer (`Footer.tsx`), SEO/Sitemap registries (`sitemap.ts`, `seo-metadata.ts`), and Real-Browser Benchmark configs (`page-bench.ts`).

