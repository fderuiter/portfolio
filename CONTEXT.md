# Portfolio Domain Context & Glossary

## Delivery Coordination & Issue Governance

- **Governing Map**: A non-executable epic or specification that defines a workstream's boundaries, outcomes, and child tickets. A governing map is not part of the agent work frontier and remains open until its child outcomes are complete.
- **Executable Leaf**: A context-window-sized ticket that delivers one independently verifiable outcome and may be claimed by an agent when all of its hard blockers are closed.
- **Hard Blocker**: An unfinished ticket whose outcome is genuinely required before useful work can begin on another ticket. Hard blockers are represented with native issue dependencies; preferred order alone is not a blocker.
- **Coordination Relationship**: A non-blocking overlap between tickets that share an integration surface, validation environment, or product journey. Coordination relationships describe merge order and handoff expectations without removing tickets from the parallel frontier.
- **Agent Frontier**: The set of unassigned executable leaves with no open hard blockers and no requirement for human-only authority.
- **Human Gate**: A ticket requiring human authorization, protected credentials, destructive cloud action, production promotion, or subjective real-device validation. Human gates are prepared with reproducible evidence before being handed to a person.
- **Completion Evidence**: The commit, pull request, automated results, deployment observation, or human sign-off demonstrating that every acceptance criterion of a ticket is satisfied.

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
- **Universal CRF Specification (`.crf.json` / `.crf.yaml`)**: The canonical, human-readable, and machine-verifiable clinical protocol schema defined via strict Zod validation that acts as the single source of truth across Web Studio and CLI tooling with 100% lossless bidirectional compilation to CDISC ODM-XML 1.3.2, HL7 FHIR SDC, SAS, R, and Docx/PDF.
- **Unified Clinical Protocol Business Logic Engine (`StudyProtocolEngine`)**: A pure, framework-agnostic functional service and command reducer encapsulating all clinical protocol mutations, AST dependency reconciliation, Schedule of Activities (SoA) synchronization, CDISC CDASH 2.2 invariants, and multi-standard exports across both Web Studio and CLI environments.
- **Context-Aware Tri-Pane Workspace**: A fluid 3-column clinical IDE layout composing the Study Spine & Library (Left), WYSIWYG Canvas or Bi-Directional Grid (Center), and Dynamic Context-Aware Inspector (Right), eliminating tab-switching during form and rule design.
- **Study Spine**: A unified left-hand study navigation tree representing the longitudinal trial timeline (Screening ➔ Baseline ➔ Treatment Cycles ➔ Follow-up) paired with a drag-and-drop Global Library of standardized clinical forms and smart blocks.
- **Clinical Smart Blocks**: Compound, pre-validated collections of CDASH/SDTM variables (e.g. `/vitals`, `/recist`, `/conmeds`, `/lab-panel`) that drop onto the canvas with standard variable names, unit definitions, NCI Thesaurus CT mappings, and pre-wired AST edit checks.
- **In-Canvas Slash Commands**: A keyboard-first Notion-like block inserter invoked via `/` in canvas blanks, enabling rapid drop-in of clinical widgets, smart blocks, and sections without taking hands off the keyboard.
- **Natural Language Logic (NLL)**: A plain-English, visual sentence-based conditional logic builder (`[IF] [Field] [Operator] [Value] ➔ [ACTION] [Target]`) that lowers into safe AST execution rules without manual pseudo-code syntax.
- **Visual Logic Wires**: An interactive canvas wiring mode (Figma-style node connection) allowing clinical designers to visually drag connection bezier wires from option triggers to dependent sections and fields.
- **Bi-Directional Grid View (Spreadsheet Mode)**: A high-density, dual-mode tabular view of form and variable metadata (OIDs, labels, data types, unit lists, core tiers) enabling bulk biostatistical editing with instant two-way synchronization to the visual canvas.
- **In-Builder Split-Screen Live Simulator**: A zero-friction split-screen EDC preview pane docked alongside the active WYSIWYG builder, providing live reactive evaluation of AST formulas and validation rules against mock subject data in real time.
- **Dependency Web Sentinel**: A proactive dependency graph analyzer that intercepts field and variable deletions or renames, calculating blast radius across edit checks, calculations, SoA matrices, and cross-visit rules with 1-click safe refactoring.
- **Time-Machine Visual Diffs**: An interactive protocol version slider that computes and visually highlights structural additions (green), deletions (strikethrough red), and field modifications (amber) for 21 CFR Part 11 amendment governance.
- **In-Studio Clinical Omnibar (Cmd+K)**: A contextual command launcher over the canvas providing instant access to master dictionary lookups (MedDRA/WHODrug), domain scaffolding, rule synthesis, and navigation without modal context-switching.
- **Document-Driven Clinical CLI & TUI Guided Wizard (`crf` / `scripts/crf.ts`)**: A zero-dependency developer and clinical data management CLI tool providing an interactive step-by-step TUI authoring wizard (`crf wizard` / `crf init`) alongside atomic scriptable subcommands (`validate`, `add form`, `add field`, `export`, `diff`, `info`) adhering to ANSI document rendering, machine-readable JSON flags, and dry-run safety rails.
- **Interactive Clinical Study Authoring Wizard (`WorkflowWizardModal.tsx` & `crf wizard`)**: A 5-stage interactive guided authoring system spanning protocol profile configuration, CDASH domain selection, Schedule of Activities visit matrix planning, AST calculation/edit check enablement, and regulatory conformance auditing with 1-click studio deployment and dual-mode CLI/UI parity.
- **In-Studio Interactive Terminal Drawer (`StudioTerminal.tsx`)**: An embedded terminal console inside the Web Studio enabling real-time bidirectional state synchronization where terminal CLI invocations update the visual canvas dynamically and visual elements offer 1-click CLI command reproduction.
- **2-Tier Resilient Studio Header**: An architectural header structure separating study-level branding and utility controls (Tier 1) from 6-mode segmented navigation and workspace visibility toggles (Tier 2), preventing text and control collisions across all viewport widths.
- **Executive Form Health Dashboard**: An interactive telemetry summary in the Inspector presenting CDASH conformance score, total variable counts, SDV readiness, and domain settings when no individual field is selected.
- **Progressive Micro-Toolbar**: A contextual, floating action bar on clinical canvas cards that selectively surfaces column width steppers, inline label editors, and deletion controls only during active hover or focus states.

## Mobile Touch & Responsive Architecture

### Multi-Modal Mobile Stack

- **Mobile Stack View**: A segmented view navigation paradigm for complex desktop studio tools (CRF Studio, Proof Canvas, Neuro Simulator) that decomposes multi-column desktop layouts into discrete, focused views (e.g. Canvas, Inspector, Ledger, Terminal) accessible via bottom tab bars on screens < 768px.
- **Canvas-Priority Auto-Dock**: A responsive workspace layout protocol on tablet and compact screens (`768px` to `1199px`) that collapses sidebar panels into floating overlay drawers to preserve 100% width for the multi-column clinical canvas.
- **Slide-Up Action Sheet (Bottom Sheet)**: A mobile modal drawer pattern used for widget palettes, command inputs, and tool selectors that slides up from the bottom of the viewport with backdrop blur and swipe-to-dismiss capabilities.
- **Horizontal Overflow Invariant**: The structural requirement that all rendered pages, canvas elements, tables, and overlays must satisfy `element.scrollWidth <= element.clientWidth` to prevent unintended horizontal scrolling or layout tearing on mobile viewports (320px to 480px).

### Virtual Gamepad & Canvas Ergonomics

- **Viewport-Budgeted Game Shell (Single-Screen Viewport Fit)**: An arcade cabinet container layout standard that dynamically clamps game canvas heights to available vertical viewport space (`100dvh` minus safe-area insets, HUD bar, and touch controls dock) on mobile and tablet screens, ensuring that the canvas, game HUD, and interactive touch controls fit completely within a single screen fold with zero page scrolling required during active gameplay.
- **Archetype-Based Control Docks**: A structured taxonomy of four standardized responsive touch control layouts (`DpadActionDock`, `TwinStickAimDock`, `BezelClusterDock`, `ActionStripDock`) providing accessible 48×48px minimum touch targets, pointer capture, active tactile animations (`scale-[0.96]`), and Web Audio synthesis for different arcade game genres.
- **Virtual D-Pad**: An on-screen, high-contrast touch controller component with minimum 48x48px directional buttons supporting rapid touch/mouse down-up events, haptic/audio feedback, and pointer capture for responsive action in arcade games.
- **Canvas Touch Action Isolation**: The explicit setting of `touch-action: none` or `touch-action: pan-y` on interactive HTML5 / WebGL canvas elements during active gameplay to prevent touch gestures from triggering browser pull-to-refresh or unwanted page scrolling.
- **Safe Area Inset Adaptation**: Dynamic spacing integration using CSS `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)` to protect fixed navigation bars, floating buttons, and game controllers from iPhone notches, Dynamic Islands, and mobile home indicator bars.
- **Arcade Safe Zone & Bleed Matrix**: Matrix transformation scaling a core logical game coordinate space with dynamic high-DPI Retina DPR awareness and aspect-ratio bleed rendering.
- **Headless Arcade Engine Lifecycle**: Pure TypeScript framework-agnostic game engine architecture (`init`, `update(dt)`, `render(ctx)`, `destroy`) decoupled from React lifecycles.
- **HTML/DOM HUD Overlay Pattern**: UI design standard placing static game UI, health bars, inventory, and action docks in absolute-positioned responsive HTML/CSS overlays while restricting Canvas rendering to in-world diegetic elements.
- **Unified Arcade Input Manager**: Input abstraction layer normalizing pointer events, keyboard keys, and virtual touch docks into a uniform coordinate and action vector.
- **Deterministic Object Pool**: Zero-allocation memory management mechanism pre-allocating reusable entity instances (projectiles, particles, damage text) to eliminate garbage collection stutters.

## Accessibility Architecture & WCAG 2.1 Compliance

### Continuous Auditing & Enforcement

- **Multi-Tiered Accessibility Guard**: An automated testing hierarchy comprising static invariant analysis (`lib/dx/doctor.ts`), unit component testing (Vitest), and comprehensive end-to-end axe-core browser evaluation (`@axe-core/playwright`).
- **WCAG 2.1 Level AA Conformance Invariant**: The structural requirement that all public routes, interactive modals, drawers, and form controls pass axe-core scans with zero critical, serious, or moderate violations.
- **Internal Developer Tool Boundary**: Clear demarcation excluding CLI developer tasks (`scripts/dx.ts`), database seed scripts, and headless build pipelines from end-user accessibility audits while maintaining strict audit coverage across 100% of user-facing production interfaces.

### Navigation & Focus Management

- **Skip Navigation Link**: An accessible, high-contrast bypass mechanism at the root DOM level (`<SkipToContent />`) enabling keyboard and screen reader users to skip global navigation and jump directly to `<main id="main-content">`.
- **Modal Focus Trap**: An event-controlled keyboard boundary (`useFocusTrap`) that restricts `Tab` / `Shift+Tab` cycling strictly within active dialogs, bottom sheets, or command palettes until dismissed via `Escape` or interactive trigger, automatically restoring focus to the originating element.
- **Dynamic Live Region (Live Announcer)**: An off-screen `aria-live="polite"` / `role="status"` notification hub (`useAnnouncer`) providing timely audio cues for asynchronous state mutations, mathematical proof discharges, telemetry streams, and form validation alerts.
- **Canvas Accessible Alternative**: Contextual screen-reader accessible DOM descriptors, tabular mirrors, and high-contrast status overlays providing equivalent functional information for 2D/3D WebGL and HTML5 canvas experiences.
- **Arcade 3-Pillar Accessibility Protocol**: The unified accessibility standard for interactive arcade games combining 1. Live screen reader state mirrors (`aria-live="polite"`), 2. High-contrast focus rings with keyboard trap safety, and 3. Complete 1:1 keyboard-to-touch input parity.

## Graphics & Context Loss Resilience

### GPU Context Management

- **Responsive Canvas Lifecycle Engine**: A centralized canvas management protocol providing dynamic device pixel ratio (DPR) clamping ($\le 2.0$ on desktop/tablet, $\le 1.0$ on mobile/CRT), zero-division-by-zero touch coordinate normalization, debounced resize handling, and automatic 2D/WebGL context loss recovery.
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
- **Diátaxis 4-Quadrant Documentation Architecture**: A user-centric documentation standard structuring technical documentation into four mutually exclusive categories: Tutorials (`docs/tutorials/` for onboarding learning journeys), How-To Guides (`docs/how-to/` for task-focused workflows), Reference (`docs/reference/` for machine-compiled TypeDoc and API contracts), and Explanation (`docs/explanation/` for deep architectural concepts and design rationales).

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
- **Tablet-Adaptive Layout Invariant**: The structural layout rule ensuring mid-sized viewports (640px to 1023px) receive dedicated layout composition (e.g. 2-column bento grids, vertical hero console docking with balanced margins, slide-out tablet drawer navigation) preventing the cramped layouts caused by prematurely applying desktop-wide rules to tablet viewports.
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
- **Git Guardrail Interceptor (`scripts/git-guardrail.sh`)**: An agent-agnostic shell guard intercepting and blocking destructive git operations (`git push --force`, `git push origin main`, `git reset --hard`, `git clean -f/-fd`, `git branch -D`, `git checkout .`, `git restore .`) across autonomous agent tool invocations and CLI environments, supporting intentional bypass via `ALLOW_DANGEROUS_GIT=1`.
- **Native Git Pre-Push Protection (`.husky/pre-push`)**: An invariant git hook intercepting outgoing push references to block direct pushes targeting `main` from local developer environments, ensuring all changes merge through pull requests.
- **Early Fail-Fast Boundary Enforcement**: The pre-commit pipeline execution policy in `.husky/pre-commit` positioning deep-module boundary linting (`npm run lint:boundaries`) immediately after TypeScript compilation (`typecheck`) and before test execution, failing within ~1.5s on architectural leaks.
- **Husky Commit Guard (`.husky/commit-msg`)**: Pre-commit hook interceptor preventing malformed or unclassified git commits from entering repository history.
- **Interactive Commit Wizard (`npm run dx commit`)**: Guided command-line interface generating compliant Conventional Commits with scope validation and breaking change indicators.
- **Branch Naming Standard**: Team-wide git branch naming convention requiring categorical prefixes (`feat/*`, `fix/*`, `chore/*`, `refactor/*`, `docs/*`, `perf/*`, `dx/*`, `test/*`, `main`).
- **Dual-Tracker Issue Slicing Pattern**: The engineering issue workflow combining local tracer-bullet ticket files (`.scratch/issues/*.md`) for isolated context-bounded autonomous implementation with bi-directional GitHub CLI integration (`npm run dx issues:sync`), preserving dependency edges, automated triage labels, and verification checklists.

### Static Analysis & Performance Budgets

- **Dead Code & Unused Export Scanner (`lib/dx/dead-code.ts`)**: Fast static AST analysis engine traversing project source files to discover orphaned symbols, unreferenced types, and dead modules.
- **Bundle Chunk Budget Guard (`lib/dx/bundle-guard.ts`)**: Post-build asset analyzer evaluating production gzip and raw byte footprints against hard performance budgets (initial shared <= 350 kB, single chunk <= 200 kB).
- **Workspace IDE Standard (`.vscode/`, `.editorconfig`)**: Centralized editor profiles establishing consistent formatting, TypeScript SDK resolution, Tailwind IntelliSense rules, and one-click debugger profiles across all developer environments.

### Agent-First CLI Ergonomics & Machine-Readable DX

- **Agent-First CLI Standard (Agent DX CLI Scale)**: The architectural standard evaluating CLI surfaces across 7 agent-readiness axes (Machine-Readable Output, Raw Payload Input, Schema Introspection, Context Window Discipline, Input Hardening, Safety Rails, and Agent Knowledge Packaging) ensuring zero parsing friction for autonomous AI agents.
- **Uniform Actionable JSON Envelope (`--json`)**: The standardized programmatic output envelope (`{ success, command, timestamp, durationMs, data, remediations }`) emitted across all DX CLI commands enabling deterministic JSON ingestion without regex heuristics.
- **Autonomous Non-Interactive CLI Bypass**: The design pattern guaranteeing all interactive CLI wizards (`commit`, `scaffold`, `branch`, `setup`) accept comprehensive command-line flags (`--type`, `--name`, `--yes`, `--dry-run`) to execute headlessly in automated environments.
- **Single-Command Actionable Remediation CTA**: Deterministic copy-pasteable shell commands (`npm run doctor:fix`, `npm run dx env -- --fix`) embedded in both ANSI visual output and structured JSON remediation arrays whenever an architectural or environmental invariant fails.
- **Runtime CLI Schema Introspection (`dx describe` / `--help --json`)**: Self-describing command discovery protocol exposing complete command specifications, option types, default values, mutability indicators, and payload schemas as JSON at runtime.

## Synthetic Reliability, Telemetry & Watch Emulation

### Headless Synthetic Journey Probing

- **Headless Synthetic User Probes**: Continuous real-browser Playwright test probes (`__tests__/e2e/synthetic-probes.spec.ts`) validating 5 critical end-to-end user journeys across a 4-browser matrix (Desktop Chrome, Tablet Safari, Mobile Safari, Mobile Chrome): Pretext text layout rendering, Spotlight Command Palette traversal and fuzzy search routing, Proof Assistant DAG theorem verification and export, Arcade Canvas 2D engine lifecycle, and Telemetry API ingestion with schema rejection guards.
- **Multi-Device Discovery Matrix**: Cross-platform testing matrix verifying touch interaction, keyboard boundaries, modal focus trapping, and responsive viewport sizing across mobile (375x667, 393x851), tablet (810x1080), and desktop (1280x720) viewports.

### Production Canary Analysis & Health Governance

- **Automated Canary Analysis (ACA)**: Production deployment verification engine (`scripts/canary-analyzer.ts`) evaluating live request telemetry and error budgets against statistical baseline thresholds (5xx error rate <= 0.5%, p95 latency <= 800ms, Sentry exception spike ratio <= 2.0x) to automate canary promotion or trigger rollback workflows.
- **Telemetry Event Ingestion Guard**: Validated REST API endpoint (`/api/telemetry`) enforcing strict Zod schema parsing, origin sanitization, rate-limiting, and error-boundary isolation on client performance and user interaction metrics.

### Garmin Watch Hardware & Thermal Emulation

- **Garmin Thermal & CPU Telemetry Engine**: Deterministic physical simulation engine (`lib/garmin-engine.ts`, `components/arcade/GarminWatch.tsx`) modeling Connect IQ runtime CPU workloads, heat generation curves, passive wrist thermal dissipation, battery discharge profiles, and ANT+ heart rate sensor telemetry under active workload stress.
- **Monkey C Bytecode Emulation Scaffold**: Canvas-driven graphical rendering pipeline emulating high-contrast MIP (Memory-in-Pixel) transflective smartwatch displays, hardware bezel buttons, and Connect IQ OS lifecycle states with zero native C dependencies.

## Scientific & Engineering Editorial Design System

### Visual Identity & Interactive Telemetry

- **Hero Engineering Console**: An interactive, multi-modal hero telemetry component allowing visitors to interactively test and verify domain invariants (AST Premise Discharging in Formal Logic, CDISC 21 CFR Part 11 Conformance Auditing, and Garmin 32KB Memory Heap Allocation) with contextual handoff links to full interactive studio workspaces.
- **Scientific & Engineering Editorial Design System**: A high-assurance visual and interaction design architecture emphasizing Swiss grid precision, deep architectural graphite surfaces (`#0d0e11`, `#13151a`), crisp hairline structural borders (`rgba(255, 255, 255, 0.08)` / `border-zinc-800`), and semantic status indicators (Precision Amber `#f59e0b`, Emerald `#10b981`, Steel `#94a3b8`) eliminating generic AI tropes (falling collision particles, diffuse neon glows).
- **Dual-Layer Editorial Persona**: An editorial and narrative framework blending warm, self-deprecating storytelling with dry, battle-tested engineering and clinical operations wit as the baseline voice, while using interactive toggles ("Recruiter vs. Reality") and micro-copy to expose unvarnished, hilarious technical reality.
- **The "Make Things Better" Ethos**: The personal philosophy and track record defining Frederick's journey: finding practical solutions to real human problems and leaving every environment better than he found it—from securing free menstrual products in campus bathrooms and serving as university liaison for the Minnesota Vikings Training Camp, to 3D printing MRI brain models at Mayo Clinic, sparking the cultural Laser Loon phenomenon, and engineering intuitive, bulletproof software.
- **System-Agnostic Problem Solver**: The core positioning and ethos defining Frederick not by rigid software titles or academic jargon, but as a pragmatic, relentless troubleshooter who dives into any system—campus initiatives, hospital EHRs, Linux pipelines, smartwatches, or modern web apps—to find fixes, help people out, and make things work smoothly.
- **Plain-Language Clarity Invariant**: The requirement that the primary narrative, headlines, hero copy, and project introductions must pass the "Family & Friends" test—explaining who Frederick is, what was built, why it matters, and why it's cool in clear, relatable, engaging human terms with zero alienating buzzwords before offering optional deep-dive technical telemetry.
- **Systems Dossier & Spec Index**: A numbered engineering project showcase (`SYS-01`, `SYS-02`, `SYS-03`, `SYS-04`) surfacing explicit architectural constraints, test coverage badges, language specs, and direct pathways to deep-dive case studies.

## Resilient Hybrid Fallback Data Architecture

### Serverless Prerender Resilience & Data Sourcing

- **Resilient Hybrid Fallback**: The unified data retrieval strategy implemented in `CaseStudyService` that queries the remote PostgreSQL/Neon database first, seamlessly unions or falls back to static compilation data (`FALLBACK_CASE_STUDIES`) upon missing records or connection errors, and returns `notFound()` for invalid entities rather than failing static builds.
- **Database-Priority Sourcing**: Sourcing protocol where live database records take precedence for matching entity slugs, while any newly introduced or unseeded static case studies in the codebase are automatically appended to the collection.
- **5-Point Discovery Matrix**: The unified multi-surface synchronization invariant linking every first-class case study and interactive tool across Command Palette (`CommandPalette.tsx`), Desktop/Mobile Navigation (`Navbar.tsx`), Footer (`Footer.tsx`), SEO/Sitemap registries (`sitemap.ts`, `seo-metadata.ts`), and Real-Browser Benchmark configs (`page-bench.ts`).
- **Deterministic SSG Telemetry Fallback**: The resilient build-time data acquisition strategy in `lib/github.ts` that gracefully absorbs GitHub API 404/403 rate-limit states during static page prerendering, returning mathematical simulated commit and language telemetry without emitting false-alarm stderr noise.

## Identity, Authentication & Admin Governance

### Edge Authentication & Access Control

- **Next.js 16 Edge Proxy**: The network-edge request interception handler (`proxy.ts`) in Next.js 16 executing before route rendering to attach standard HTTP security headers, rate limit incoming API requests, and generate anonymous Web Crypto SHA-256 connection fingerprint tokens.
- **Admin & Author Portal**: A dedicated protected workspace (`/admin`, `/api/admin`) providing administrative tools for drafting case studies, modifying editorial content, and inspecting raw analytics telemetry without exposing write capabilities to public visitors.
- **Clerk Edge Middleware Chaining**: The edge pipeline composing `@clerk/nextjs` `clerkMiddleware` with standard HTTP security headers (`applySecurityHeaders`) and privacy-preserving client connection hashing (`generateClientConnectionHash`), enforcing route protection via `createRouteMatcher` while allowing public route bypass.
- **Environment-Gated Admin Authorization**: Server-side access control validating authenticated Clerk identities (`userId`, `emailAddress`) against typed environment variable allowlists (`ADMIN_USER_IDS`, `ADMIN_EMAILS`) declared in `lib/env.ts`.
- **In-Route Access Denied Console**: An in-route 403 authorization boundary surface on `/admin` that gracefully displays an authenticated visitor's Clerk UID, primary email address, and 1-click copyable environment configuration instructions alongside account-switching actions, preventing unhandled server exception crashes and false-alarm Sentry error reports.

## Case Study Domain & Editorial Architecture

### Content Structure & Bidirectional Discovery

- **High-Assurance Systems Case Study Standard**: The canonical 5-section technical structure governing all portfolio case studies: 1. Executive Summary & Problem Solved, 2. Deep Dive Architecture & Design Patterns, 3. System Design & Runtime Data Flow (Mermaid), 4. Key Technical Challenges & Production Code Snippets, and 5. Trade-Offs, Edge Cases & Lessons Learned.
- **Bidirectional Project Seam**: The linkage contract ensuring every case study explicitly pairs its external source repository (`github_url`) or primary artifact (e.g. Kaggle notebook) with relevant internal interactive tools or live simulators (`interactive_url`) and vice versa.
- **Multi-Action Hero Bar**: A prominent action header on case study pages rendering primary source links (GitHub repository, Kaggle notebook, PyPI/npm package), live/simulated repository telemetry, and internal interactive studio launcher shortcuts.
- **Platform-Agnostic Source Linking**: A flexible source linkage model gracefully supporting projects where the primary artifact is an external platform (e.g. Kaggle notebook or package registry) rather than a traditional GitHub repository, adapting badges and telemetry without build-time or runtime exceptions.
- **Interactive CLI Developer Sandbox**: The client-side terminal interface (`commands_json`, `playback_json`, `SandboxTerminal`) rendering realistic command outputs and step-by-step playback workflows directly inside case study pages.
- **FluentUI Case Study Easter Egg**: A scoped Office Fluent Design System visual override active on `/case-studies/crf-xl` evoking classic Microsoft Excel taskpane aesthetics without compromising global dark-mode layout integrity.
- **Tracer-Bullet Case Study Rollout**: The phased verification protocol establishing generalized UI contracts and multi-source telemetry first before sequentially integrating, testing, and closing individual case study issues.

## Search Engine Optimization & Discovery Architecture

### Search Strategy & Intent Hierarchy

- **Omni-Channel Tiered Search Funnel**: A three-tier organic discovery architecture that captures broad top-of-funnel traffic via viral cultural asset hubs (Laser Loon vector distribution) and interactive browser utilities (CRF Studio, Proof Workspace, NeuroRecon), seamlessly channeling high-intent visitors toward high-assurance systems case studies, technical dossiers, and direct 1:1 consultation scheduling (`/schedule`).
- **Target Search Intent Hierarchy**: The structured segmentation of search queries into three distinct intent classes: 1. High-Intent Systems & Recruiter Discovery (clinical software architecture, formal verification, embedded systems), 2. Open Creative Commons Asset Distribution (Laser Loon vector downloads, Minnesota state flag submission F277), and 3. Public Web Utility Tooling (online CDASH/ODM-XML validators, deductive logic solvers, FreeSurfer mesh repair).

### Structured Data & Entity Graph Architecture

- **Unified Schema.org `@graph` Engine**: A centralized structured data generator (`lib/seo.ts`) linking all page-level entities (`Person`, `WebSite`, `WebPage`, `BreadcrumbList`, `SoftwareApplication`, `TechArticle`, `VisualArtwork`) into a single interconnected JSON-LD `@graph` with deterministic `@id` URI nodes (`#person`, `#website`).
- **Specialized Schema Dispatcher**: A tier-aware schema generator routing page types to optimal Schema.org definitions (e.g. `VisualArtwork` & `MediaObject` with Creative Commons licensing for graphic design assets like Laser Loon, `WebApplication` for browser-based interactive studios, and `SoftwareSourceCode` / `TechArticle` for deep-dive systems case studies).

### Visual & Media Discovery

- **Tiered Dynamic Social Preview Generator**: The Satori-based OpenGraph and Twitter card rendering pipeline (`lib/og-image.tsx`) providing tier-specific visual presets (`CLINICAL_SYSTEMS`, `FORMAL_VERIFICATION`, `VECTOR_ARTWORK`, `EMBEDDED_SIMULATOR`) with live GitHub telemetry badges and 1200x630 dimension compliance.
- **Google Image Sitemap Extension**: XML image metadata integration in `app/sitemap.ts` attaching image locations, captions, titles, and Creative Commons licensing tags directly to canonical route entries for Google Image Search crawling.

### Semantic Metadata & Search Copy Standards

- **Front-Loaded SERP Optimization Standard**: The metadata authoring rule in `lib/seo-metadata.ts` restricting page titles to 50–60 characters with high-intent primary capability keywords front-loaded before brand suffixes, pairing 145–155 character action-oriented descriptions with active CTR verbs (_Explore_, _Download_, _Simulate_, _Verify_).
- **Long-Tail Semantic Tagging**: The practice of replacing generic single-word tags (`"React"`, `"TypeScript"`) with specialized multi-word domain search phrases (`"CDISC ODM-XML validator"`, `"Laser Loon vector download"`, `"Lean formal proof simulator"`).

### Crawl Governance & Sitemap Invariants

- **Dynamic Sitemap Registry**: The automated route compilation architecture in `app/sitemap.ts` dynamically aggregating routes from `ROUTE_METADATA_CONFIGS` in `lib/seo-metadata.ts` and dynamic database records in `CaseStudyService` to guarantee 100% route indexing coverage with zero manual drift.
- **Robots Crawl Boundary Invariant**: The robots governance policy in `app/robots.ts` ensuring private routes (`/admin`, `/api/`, `/_next/`) remain strictly excluded from search crawler indexing while publishing canonical sitemap endpoints.

## Transactional Communication & Outbound Notification Architecture

### Inbound & Outbound Messaging

- **Inbound Visitor Inquiry**: A direct message submitted through the portfolio contact surface containing visitor contact coordinates, intent category (e.g. general, collaboration, consulting), subject, and message content.
- **Admin Feedback Alert**: An automated notification dispatched to site administrators upon new case study feedback submissions, telemetry anomalies, or critical system events.
- **Transactional Email Dispatcher**: The unified outbound communication engine responsible for validating payloads, enforcing anti-abuse rate limits, orchestrating message delivery via Resend, and providing environment-isolated mock fallbacks.
- **Architectural Email Template**: High-contrast, responsive HTML email markup adhering to Swiss typography and portfolio design tokens (`#0d0e11`, Precision Amber `#f59e0b`, hairline micro-borders) with DOM-purified content.
- **Frictionless Bot Barrier**: Multi-layered anti-abuse defense combining invisible honeypot traps, timestamp duration gates, anonymous connection-hash rate limiting, and content tone moderation without third-party CAPTCHA scripts.
- **Systems Dispatch Newsletter**: A lightweight subscription mechanism delivering periodic technical retrospectives on formal verification, AST compilers, CDISC clinical data systems, and browser physics, managed through `lib/services/email-service.ts` (`subscribeNewsletter`) and `/api/newsletter`.
- **Zero-Exfiltration Channel Isolation**: The architectural standard requiring that direct personal email addresses (`fpderuiter@gmail.com`) and unauthenticated `mailto:` links are completely scrubbed from public DOM nodes, footer components, and JSON-LD structured schemas (`lib/seo.ts`), directing all inbound communications exclusively through authenticated, rate-limited, and honeypot-protected endpoints (`/contact`, `<ContactForm />`, and `/api/contact`).
- **Resend Inbound Webhook & Bounce Processing Engine**: The deliverability ingestion pipeline (`/api/webhooks/resend`) utilizing cryptographic signature verification (Svix) to process deliverability lifecycle events (`email.sent`, `email.delivered`, `email.bounced`, `email.complained`), maintaining suppression lists and recording telemetry.
- **Resilient Transactional Outbound Retry Queue**: A decoupled retry queue mechanism safeguarding transactional dispatches (visitor inquiries, newsletter welcomes, admin alerts) against upstream provider rate limits (429) and transient API faults with exponential backoff and persistent state fallback.

## Design System & Layout Architecture

### High-Assurance UI/UX & Responsive Primitives

- **High-Assurance Architectural Design System**: The unified frontend styling and layout architecture combining warm architectural graphite (`#0d0e11`, `#13151a`), amber/cyan accents, hairline micro-borders (`rgba(255,255,255,0.08)`), CSS Container Queries (`@container`), fluid typography, and tactile micro-interactions (`active:scale-[0.98]`).
- **Defensive Container Query Layout**: The responsive strategy utilizing CSS `@container`, `@sm:`, `@md:` and `min-w-0` on dynamic modular cards and interactive tools to isolate internal component layout adaptations from global viewport media queries and prevent layout blowouts.
- **Tactile Interaction Standard**: Micro-interaction feedback across all interactive cards, modals, and buttons combining calibrated spring physics (`--motion-spring-snappy`), active tactile scaling (`active:scale-[0.98]`), high-contrast focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500/50`), and `reduced-motion` accessibility fallbacks.
- **High-Assurance Modular Bento**: A responsive layout pattern using CSS Container Queries (`@container`), adaptive typography, and structured hierarchy to present complex technical case studies, live telemetry, and interactive sandbox tools side-by-side without layout blowouts.
- **Bidirectional Studio Seam**: Direct deep-linking navigation between written technical case studies and their live interactive workspace counterparts (e.g. `/case-studies/crf-xl` ↔ `/crf`, `/case-studies/formal-verification` ↔ `/proof`).
- **Proof Workspace Modular Architecture**: The decoupled decomposition of the formal verification DAG studio into distinct single-responsibility sub-modules (`ProofHeader`, `ProofCanvas`, `ProofInspector`, `ProofLedger`, `ProofExportModal`, `InteractiveTruthTable`) sharing typed hook state.
- **Segmented Mobile Studio Paradigm**: The responsive interaction model decomposing multi-pane desktop studios (CRF Studio, Proof Workspace) into focused single-pane views switched via a native segmented bottom bar on viewports `< 768px`.
- **Dynamic 100dvh Fullscreen Stage**: An isolated, touch-safe, zero-overflow full-viewport presentation mode (`fixed inset-0 z-50 w-full h-[100dvh] bg-black select-none touch-none overflow-hidden`) that uses CSS aspect containment to fit canvas games, HUDs, and touch triggers within dynamic mobile browser viewports with zero layout shift or vertical scrolling.
- **Game-Aware Touch Ergonomics**: Selective touch control mounting where directional arcade games render compact D-pads and action buttons, while drag/puzzle/tap games suppress overlays in favor of direct canvas gesture manipulation.

## Type-Safe Contracts & Test Fixture Hygiene

### Spec & Handler Architecture

- **Spec & Handler Pattern**: Architectural pattern separating an operation's capability contract (`spec.ts` defining input schema, error taxonomy enum, result type, and interface) from its execution logic (`handler.ts` containing side effects, orchestration, and zero-throw error mappings).
- **Dual-Seam Architecture**: High-performance engine integration pattern keeping core 60 FPS physics and AST mathematical evaluators synchronous and fast, while wrapping boundary state mutations and external commands in typed Spec & Handler contracts.
- **ServiceResult Envelope**: Standardized discriminated union envelope (`{ success: true, data: T } | { success: false, error: ServiceError<E> }`) returning typed values instead of throwing unhandled exceptions.
- **Exhaustive Error Code Enums**: Domain-specific Zod string enums defining all possible failure modes for an operation, guaranteeing comprehensive error branch handling without generic catch-all strings.

### Test Fixture Hygiene & Shoehorn

- **Shoehorn Test Fixture Hygiene**: The testing standard replacing unsafe type assertions (`as unknown as TargetType` or `as TargetType`) in test suites with `@total-typescript/shoehorn`'s `fromPartial()` (for partial data DTOs) and `fromAny()` (for intentionally invalid test payloads), ensuring test fixtures do not mask underlying schema regressions.
- **Contract Test / Logic Test Separation**: The practice of splitting test coverage into contract tests (`spec.test.ts` testing schema parsing and edge-case rejections) and handler logic tests (`handler.test.ts` asserting business logic and error mapping).
