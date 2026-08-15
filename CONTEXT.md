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
