import { FieldManualData } from "@/types/game-manual";

export const GAME_MANUALS: Record<string, FieldManualData> = {
  proof: {
    id: "proof",
    title: "Logical Proof Canvas",
    subtitle: "Formal Verification & Modus Ponens Interactive Solver",
    genre: "Formal Verification",
    badge: "Formal Logic",
    route: "/proof",
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    objective:
      "Establish Conclusion R (Node E: Reliability is guaranteed) by wiring valid antecedent and conditional premise nodes through the deductive inference rule Modus Ponens.",
    quickSummary:
      "Connect premises to intermediate conclusions. When both P and P → Q are linked to Q, Q becomes proven. Then link Q and Q → R to establish conclusion R.",
    controls: [
      {
        action: "Select & Connect Node",
        description: "Click any source node (e.g. Node C), then click the target node (e.g. Node E) to establish a deductive dependency edge.",
        key: "Click",
      },
      {
        action: "Guided Tactic Step",
        description: "Click 'Apply Next Tactic' in the Guided Proof Assistant to automatically evaluate and apply the next valid deduction step.",
        key: "1-Click Tactic",
      },
      {
        action: "CLI Split Console",
        description: "Open the terminal and run commands such as `connect C E`, `disconnect C E`, `list`, or `simulate normal`.",
        key: "Ctrl + \\",
      },
      {
        action: "Disconnect Edge",
        description: "Click on an existing drawn edge or click the Disconnect button in the inspector to sever a premise connection.",
        key: "Click Edge",
      },
    ],
    rules: [
      {
        title: "Modus Ponens Inference Rule",
        detail:
          "Formally stated: If P is true, and P → Q is true, then Q must be true (P ∧ (P → Q) ⊢ Q). Both antecedent (P) and conditional (P → Q) edges must reach the target node before it activates.",
        badge: "Deductive Rule",
      },
      {
        title: "Deduction Chain Step 1",
        detail:
          "Node A (Premise P) and Node B (Premise P → Q) are wired into Intermediate Node C (Conclusion Q). Because both premises are active, Node C is verified.",
        badge: "Step 1: Proven",
      },
      {
        title: "Deduction Chain Step 2 (Your Goal)",
        detail:
          "Wire Intermediate Node C (Q) and Premise Node D (Q → R) into Conclusion Node E (R). Once both are connected, Theorem R discharges with mathematical certainty (Q.E.D.).",
        badge: "Step 2: Target",
      },
      {
        title: "Background Tactic Watchdog",
        detail:
          "Simulations run inside dedicated Web Workers off the main thread. A 5-second watchdog timer terminates divergent tactics to prevent UI thread lockup.",
        badge: "Worker Safety",
      },
    ],
    proTips: [
      "Look at the node status rings: emerald green indicates a proven node, while zinc gray indicates unproven premises.",
      "The Guided Proof Assistant on the left highlights the immediate next deduction step needed to complete the proof.",
      "You can toggle between direct visual clicking and the keyboard CLI console at any time without losing proof state.",
    ],
    lore: {
      title: "Why Formal Verification Matters in Modern Software",
      story:
        "Traditional testing (unit, integration, end-to-end) only tests sample inputs. Formal verification uses mathematical logic to prove that software satisfies specifications across all possible execution states. From NASA flight software and cryptographic microkernels (seL4) to blockchain smart contracts and compiler verification (CompCert), formal logic guarantees the complete absence of whole classes of bugs.",
      realWorldTech: ["Lean 4", "Coq / Rocq", "Z3 SMT Solver", "Curry-Howard Isomorphism", "seL4 Microkernel"],
    },
  },

  "working-with-duck": {
    id: "working-with-duck",
    title: "Working With Duck",
    subtitle: "Pet Simulation & Multitasking Arcade",
    genre: "Pet Simulation",
    badge: "Pet AI Arcade",
    route: "/arcade/working-with-duck",
    storageKey: "working_with_duck_high_score",
    accentColor: "from-amber-500/20 via-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    objective:
      "Balance writing production code against managing your autonomous Golden Retriever puppy, Duck. Keep Duck happy, healthy, and hazard-free while maximizing commit output.",
    quickSummary:
      "Toss toys to divert Duck from power cables, scrub belly rubs during the flop, recall Duck in the Dog Park with the whistle, and tuck Duck in for nap time.",
    controls: [
      {
        action: "Toss Squeaky Toy",
        description: "Click anywhere on the office floor to throw a squeaky toy, diverting Duck away from dangerous cords and water bowls.",
        key: "Click Canvas",
      },
      {
        action: "Belly Rub Scrub",
        description: "When Duck flops onto his back with paws up, rapidly scrub over his belly with the mouse cursor to build happiness and score multipliers.",
        key: "Drag Cursor",
      },
      {
        action: "Whistle Recall (Dog Park)",
        description: "In the Dog Park sprint mini-game, blow the ultrasonic whistle to recall Duck before his stamina runs out.",
        key: "Spacebar / Whistle",
      },
      {
        action: "Nap Time Tuck-In",
        description: "When Duck's energy drops into the red zone, guide him to the orthopedic dog bed and click to tuck him in for recovery.",
        key: "Bed Click",
      },
    ],
    rules: [
      {
        title: "Autonomous Puppy State Machine",
        detail:
          "Duck transitions autonomously between 6 behavioral states: Idle, Wander, Hazard-Chew, Belly-Flop, Park-Sprint, and Deep Sleep. Anticipate his transitions to prevent desk chaos.",
        badge: "Deterministic AI",
      },
      {
        title: "Hazard Interception",
        detail:
          "If Duck chews the laptop charger or knocks over coffee, your active code build fails and score multiplier resets to 1x. Toss a toy immediately to redirect him.",
        badge: "Hazard Penalty",
      },
      {
        title: "Belly Rub Multiplier",
        detail:
          "Scrubbing belly rubs during the flop window awards a 3x multiplier to all code commits pushed within the next 15 seconds.",
        badge: "3x Multiplier",
      },
      {
        title: "Polaroid Scrapbook",
        detail:
          "Capturing key milestone moments (first zoomies, 100% belly happiness, park recall) permanently unlocks high-resolution polaroids in your scrapbook.",
        badge: "Collectibles",
      },
    ],
    proTips: [
      "Keep a toy ready on the left side of the room to pull Duck away from the server rack.",
      "Don't let Duck nap too close to the keyboard or he will type accidental git force pushes.",
      "Dog Park sprints yield maximum score bonuses when recalled at the peak stamina window (between 70% and 85%).",
    ],
    lore: {
      title: "Autonomous Behavior Trees in Canvas 2D",
      story:
        "Building lifelike virtual pets requires combining finite state machines with weighted steering behaviors (Craig Reynolds' Boids algorithms). Duck's wandering pathing computes avoidance vectors around furniture while evaluating hunger, joy, and fatigue curves rendered in 60 FPS Canvas 2D with procedural particle fur shaders.",
      realWorldTech: ["Craig Reynolds Steering", "Finite State Machines", "Web Audio API Synths", "Canvas 2D Physics"],
    },
  },

  "laser-loon": {
    id: "laser-loon",
    title: "Laser Loon: Cryo Bug Hunter",
    subtitle: "Physics Arcade / Canvas Laser Shooter",
    genre: "Physics Arcade",
    badge: "Vector Physics",
    route: "/arcade/laser-loon",
    storageKey: "laser_loon_high_score",
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    objective:
      "Pilot the iconic cybernetic Canadian Loon to blast waves of runtime exceptions, memory leaks, and frozen syntax bugs using raycast laser eyes and cryo cannons.",
    quickSummary:
      "Aim with the cursor, click to fire twin laser beams, and trigger the Cryo Shockwave to freeze swarm clusters before blasting them for shatter combos.",
    controls: [
      {
        action: "Aim & Fire Cyber Lasers",
        description: "Move mouse cursor to aim laser crosshairs; left-click to fire high-energy cyan beam bursts.",
        key: "Left Click",
      },
      {
        action: "Cryo Freeze Shockwave",
        description: "Trigger an expansive freezing pulse that encases all on-screen bugs in ice, halting their descent for 4 seconds.",
        key: "Right Click / Space",
      },
      {
        action: "Loon Lateral Thrusters",
        description: "Glide the Loon horizontally along the frozen lake surface to dodge falling exception debris.",
        key: "A / D or ← / →",
      },
    ],
    rules: [
      {
        title: "Raycast Hit Detection",
        detail:
          "Laser beams project raycast vectors with continuous collision detection against polygon bug hitboxes, preventing tunneling at high velocities.",
        badge: "Raycast Physics",
      },
      {
        title: "Cryo Shatter Multiplier",
        detail:
          "Blasting bugs while they are frozen in ice deals 4x damage and triggers shard shrapnel that cascades into neighboring bugs.",
        badge: "4x Shatter Combo",
      },
      {
        title: "Memory Leak Bosses",
        detail:
          "Memory leak bugs grow larger over time as they consume heap space. Destroy them before they reach the lake surface and cause a Stack Overflow.",
        badge: "Boss Threat",
      },
    ],
    proTips: [
      "Save your Cryo Shockwave for dense waves to maximize cascading shatter combo multipliers.",
      "Lead your shots slightly ahead of fast NullPointerException bugs.",
      "Look for flashing golden Garbage Collector power-ups to instantly clear 50% of the screen.",
    ],
    lore: {
      title: "Real-Time Raycasting & Deterministic Vector Physics",
      story:
        "The Common Loon (*Gavia immer*) is renowned across Canadian lakes for its haunting calls and sharp red eyes. Laser Loon supercharges this natural predator with cybernetic raycast optics and synthesized piezo audio, translating classic arcade space shooter mechanics into a tribute to runtime exception hunting.",
      realWorldTech: ["Continuous Collision Detection", "Web Audio FM Synthesis", "Vector Kinematics", "Particle Emitters"],
    },
  },

  "quasi-puzzler": {
    id: "quasi-puzzler",
    title: "Quasi-Perfect Puzzler",
    subtitle: "Formal Verification Logic Puzzle Arcade",
    genre: "Formal Verification",
    badge: "Lean 4 Simulator",
    route: "/arcade/quasi-puzzler",
    storageKey: "quasi_perfect_puzzler_progress_v1",
    accentColor: "from-purple-500/20 via-purple-500/5 to-transparent",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    objective:
      "Construct inductive AST proofs and discharge mathematical hypotheses within tight proof-engine RAM limits without conceding to the forbidden `sorry` axiom.",
    quickSummary:
      "Select proof tactics (intro, rw, simp, exact, cases) to transform expression trees. Simplify goals before RAM fills up to achieve S-Tier verification rank.",
    controls: [
      {
        action: "Apply Proof Tactic",
        description: "Click or drag tactic buttons (`intro`, `rw`, `simp`, `exact`, `apply`, `cases`) to apply inference steps to the active goal.",
        key: "Click Tactic",
      },
      {
        action: "Inspect AST Node",
        description: "Click any node in the inductive expression tree to inspect its type signature, hypotheses, and sub-goals.",
        key: "Click Node",
      },
      {
        action: "The 'Sorry' Escape Valve",
        description: "Admit defeat on the current branch using `sorry`. This keeps the engine running but permanently ruins your Morality Score.",
        key: "Sorry Button",
      },
    ],
    rules: [
      {
        title: "Expression Tree Transformation",
        detail:
          "Every mathematical theorem is modeled as an Abstract Syntax Tree (AST). Tactics transform the root goal into simpler sub-goals until reaching known axioms.",
        badge: "AST Engine",
      },
      {
        title: "Proof-Engine RAM Limit",
        detail:
          "Complex tactic expansions consume proof engine memory. If RAM usage hits 100%, an Out-Of-Memory (OOM) kernel crash resets the current level.",
        badge: "RAM Constraint",
      },
      {
        title: "Zero-Sorry Morality Rating",
        detail:
          "Using `sorry` bypasses a difficult sub-goal without proving it, assigning a severe penalty to your final verification integrity score.",
        badge: "Integrity Score",
      },
    ],
    proTips: [
      "Use `simp` early to prune trivial identity branches and drastically reduce engine RAM usage.",
      "`intro h` unpacks implication antecedents into your local hypothesis pool.",
      "Pair `cases` with structural induction when facing compound algebraic disjunctions.",
    ],
    lore: {
      title: "The Curry-Howard Isomorphism & Lean 4",
      story:
        "The Curry-Howard correspondence establishes that computer programs and mathematical proofs are the exact same mathematical objects: propositions are types, and proofs are programs. Interactive theorem provers like Lean 4, developed at Microsoft Research and Carnegie Mellon, enable mathematicians and engineers to formally verify complex mathematics (such as Peter Scholze's Liquid Tensor Experiment) and verify production microcode.",
      realWorldTech: ["Lean 4", "Dependent Type Theory", "Homotopy Type Theory", "Calculus of Constructions"],
    },
  },

  "garmin-watch": {
    id: "garmin-watch",
    title: "Garmin Connect IQ 32KB Memory Runner",
    subtitle: "Embedded Systems Engineering Simulator",
    genre: "Embedded Systems",
    badge: "Monkey C 32KB",
    route: "/arcade/garmin-watch",
    storageKey: "garmin_simulator_high_score",
    accentColor: "from-amber-500/20 via-amber-500/5 to-transparent",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    objective:
      "Keep your custom Connect IQ watch face executing inside an unforgiving 32KB RAM limit on a circular 280×280 MIP display while managing GC freezes and thermal condensation.",
    quickSummary:
      "Use physical bezel buttons to cycle sensor widgets, swipe across the watch crystal to wipe fog, and trigger manual GC before running out of memory.",
    controls: [
      {
        action: "Bezel Buttons",
        description: "Click the physical watch bezel buttons: UP, DOWN, SELECT, and BACK to navigate watch apps and menus.",
        key: "Bezel Clicks",
      },
      {
        action: "Wipe Thermal Fog",
        description: "Click and drag your cursor across the circular glass face to wipe away condensation built up from high heart-rate intervals.",
        key: "Drag Across Screen",
      },
      {
        action: "Sensor Rate Toggle",
        description: "Switch GPS, Optical HR, and Accelerometer polling frequencies to balance telemetry fidelity against battery drain.",
        key: "Sensor Toggles",
      },
      {
        action: "Force Garbage Collection",
        description: "Execute manual memory compaction to reclaim abandoned object references before hitting the 32KB heap ceiling.",
        key: "GC Button",
      },
    ],
    rules: [
      {
        title: "32KB Monkey C Heap Ceiling",
        detail:
          "Connect IQ watch face apps run in an isolated virtual machine with a strict 32KB memory ceiling. Exceeding 32,768 bytes triggers an immediate Out-Of-Memory system halt.",
        badge: "32KB Limit",
      },
      {
        title: "500ms GC Stop-The-World Freeze",
        detail:
          "Running garbage collection freezes UI rendering and sensor capture for 500ms. Time your GC cycles during low-velocity running intervals.",
        badge: "GC Pause",
      },
      {
        title: "Thermal Condensation Fog",
        detail:
          "During high HR workouts, perspiration condensation obscures the MIP display. Failure to wipe fog prevents reading cadence and heart rate alerts.",
        badge: "Fog Hazard",
      },
    ],
    proTips: [
      "Avoid allocating transient objects inside the `onUpdate(dc)` 1Hz rendering loop to prevent garbage build-up.",
      "Wipe screen fog early before it occludes the battery life percentage indicator.",
      "Drop GPS polling from 1Hz to 0.1Hz when battery drops below 15%.",
    ],
    lore: {
      title: "Engineering for Wearable Hardware Constraints",
      story:
        "Smartwatches like the Garmin Forerunner and Fenix utilize ultra-low-power Memory-in-Pixel (MIP) displays and ultra-constrained microcontrollers capable of running for 14+ days on a single charge. Developing for Garmin's Monkey C language demands relentless memory optimization—reusing object pools, avoiding dynamic closures, and managing strict byte-aligned bitmaps.",
      realWorldTech: ["Garmin Connect IQ", "Monkey C VM", "MIP Display Tech", "Object Pooling", "ARM Cortex-M"],
    },
  },

  "clinical-chaos": {
    id: "clinical-chaos",
    title: "Clinical Trial Chaos: CDISC Compliance",
    subtitle: "21 CFR Part 11 Compliance & Time Management Arcade",
    genre: "Compliance Arcade",
    badge: "21 CFR Part 11",
    route: "/arcade/clinical-chaos",
    storageKey: "clinical_chaos_highscore",
    accentColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    objective:
      "Map patient observation records to standardized CDISC SDTM domains, verify investigator signatures under FDA 21 CFR Part 11, and resolve audits before the inspection timer expires.",
    quickSummary:
      "Sort incoming patient records into DM, VS, AE, and LB bins. Sign locked records with intent verification, and resolve queries before the FDA inspector arrives.",
    controls: [
      {
        action: "Sort CDISC Domain Record",
        description: "Drag or click clinical cards to assign them to Demographics (DM), Vital Signs (VS), Adverse Events (AE), or Lab (LB) domains.",
        key: "Drag / Click Domain",
      },
      {
        action: "21 CFR § 11 Electronic Signature",
        description: "Click 'Sign & Lock' to execute a legally binding electronic signature with cryptographic audit timestamp and intent verification.",
        key: "Sign & Lock",
      },
      {
        action: "Resolve Auditor Query",
        description: "When an FDA inspection finding flashes amber/red, click the query badge immediately to review source data and submit a corrective response.",
        key: "Resolve Query",
      },
    ],
    rules: [
      {
        title: "CDISC SDTM Standardization",
        detail:
          "Observations must be strictly partitioned: DM (Subject demographics & age), VS (Blood pressure & heart rate), AE (Adverse events & severity), LB (Lab blood panels).",
        badge: "SDTM Domains",
      },
      {
        title: "21 CFR Part 11 Electronic Signatures",
        detail:
          "FDA regulations mandate non-repudiable signatures with authenticated signer identity, exact UTC timestamp, and explicit statement of intent (e.g. 'Approval of CRF').",
        badge: "FDA § 11",
      },
      {
        title: "Auditor Inspection Timer",
        detail:
          "Regulatory auditors inspect the trial site at scheduled intervals. Unresolved protocol deviations result in Form 483 inspection observations and heavy score penalties.",
        badge: "FDA Audit",
      },
    ],
    proTips: [
      "Prioritize Adverse Events (AE) immediately—unreported SAEs trigger automatic regulatory warning letters.",
      "Double-check subject ID matching across DM and VS domains to avoid unlinked subject discrepancies.",
      "Lock and sign clean batches in advance so you have bandwidth to handle surprise protocol amendments.",
    ],
    lore: {
      title: "Biotech Data Governance & Regulatory Lifecycles",
      story:
        "Bringing a novel therapeutic drug or medical device from Phase I trials through FDA/EMA approval requires processing millions of patient data points under strict federal regulations. CDISC standards (SDTM and ADaM) ensure universal interoperability, while FDA 21 CFR Part 11 guarantees that electronic records have the identical legal standing and auditability as traditional paper records.",
      realWorldTech: ["CDISC SDTM / ADaM", "FDA 21 CFR Part 11", "Electronic Data Capture (EDC)", "GxP Validation"],
    },
  },

  "retro-labyrinth": {
    id: "retro-labyrinth",
    title: "Retro Labyrinth: Graveyard Roguelike",
    subtitle: "Dungeon Crawler & Developer Roguelike",
    genre: "Dungeon Roguelike",
    badge: "CRT Roguelike",
    route: "/arcade/retro-labyrinth",
    storageKey: "retro_labyrinth_high_score",
    accentColor: "from-rose-500/20 via-rose-500/5 to-transparent",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    objective:
      "Explore forgotten legacy codebases in a retro CRT terminal dungeon crawler. Traverse Traveling Salesperson dynamic shifting mazes, wield developer weapons, and defeat the 3D FaceForge boss.",
    quickSummary:
      "Navigate procedural mazes with WASD/Arrows. Switch developer weapons (npm install, git push -f, kill -9, hotfix) to vanquish rogue processes and reach the boss elevator.",
    controls: [
      {
        action: "Move Developer Avatar",
        description: "Navigate through the procedural maze corridors and step onto discovery nodes.",
        key: "WASD / Arrow Keys",
      },
      {
        action: "Switch Developer Weapons",
        description: "Equip weapons: [1] npm install (Area AoE), [2] git push -f (Burst), [3] kill -9 (High Single Target), [4] hotfix (Heal).",
        key: "1, 2, 3, 4 Keys",
      },
      {
        action: "Attack / Execute Command",
        description: "Cast your currently selected developer command in the facing direction to destroy rogue bugs and zombie processes.",
        key: "Spacebar / Click",
      },
      {
        action: "Toggle CRT Scanlines",
        description: "Toggle retro CRT phosphor curvature, bloom, and scanline shader post-processing filters.",
        key: "C Key",
      },
    ],
    rules: [
      {
        title: "Dynamic Traveling Salesperson Mazes",
        detail:
          "Corridor layouts mutate procedurally based on graph traversal heuristics. Shifting walls block previously visited paths, requiring dynamic route recalculation.",
        badge: "TSP Mazes",
      },
      {
        title: "Developer Weapon Cooldowns",
        detail:
          "`kill -9` instantly obliterates major demons but incurs a 6-second cooldown. `npm install` cleanses swarms of minor dependencies across a wide radius.",
        badge: "Combat Cooldowns",
      },
      {
        title: "3D FaceForge Wireframe Boss",
        detail:
          "The dungeon climax pits you against the 3D Matrix Boss. Dodge rotating vector lasers and strike the core when its wireframe shields destabilize.",
        badge: "3D Boss Fight",
      },
    ],
    proTips: [
      "Keep `hotfix` ready for floor transitions where lingering memory leak pools can drain health.",
      "Collect Architecture Decision Record (ADR) scrolls to permanently reveal unexplored floor sections.",
      "Circle-strafe around the 3D FaceForge boss during its vector laser charging sequence.",
    ],
    lore: {
      title: "Procedural Dungeons & Legacy Code Archaeology",
      story:
        "Every engineer has explored legacy codebases that feel like ancient, crumbling dungeons filled with deprecated dependencies, undocumented endpoints, and zombie cron jobs. Retro Labyrinth turns code maintenance into a playable dungeon crawler using cellular automata dungeon generation, raycasted field-of-view, and custom WebGL CRT shaders.",
      realWorldTech: ["Cellular Automata", "Bresenham FOV Raycasting", "CRT Shader Bloom", "Matrix Transformations"],
    },
  },

  simulator: {
    id: "simulator",
    title: "Engineering Leadership Simulator",
    subtitle: "Executive Decision Tree & Incident Commander",
    genre: "Leadership Sim",
    badge: "Decision Tree",
    route: "/simulator",
    accentColor: "from-blue-500/20 via-blue-500/5 to-transparent",
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    objective:
      "Navigate high-stakes technical leadership, production incident triage, and organizational scaling dilemmas to balance Technical Depth, Alignment, UI Craft, and Resilience.",
    quickSummary:
      "Evaluate realistic engineering scenarios, choose strategic trade-offs, and generate a verified Leadership Archetype profile summarizing your management philosophy.",
    controls: [
      {
        action: "Select Strategic Option",
        description: "Click option cards to choose your leadership decision for the active stage. Each option carries distinct 4-axis trade-offs.",
        key: "Click Option Card",
      },
      {
        action: "Review Dimension Impact",
        description: "Hover over option descriptions to preview the systemic consequences on Tech Depth, Team Alignment, UI Polish, and Resilience.",
        key: "Hover Impact",
      },
      {
        action: "Copy Leadership Assessment",
        description: "At the conclusion of the simulation, generate and copy a Markdown/JSON report of your leadership archetype and decision log.",
        key: "Export Button",
      },
      {
        action: "Restart Simulation",
        description: "Reset the decision tree to explore alternative incident mitigation pathways and divergent architectural strategies.",
        key: "Reset Button",
      },
    ],
    rules: [
      {
        title: "4-Dimensional Evaluation Matrix",
        detail:
          "Decisions adjust 4 core competencies: Technical Architecture, Organizational Alignment, User Experience Polish, and Operational Resilience.",
        badge: "Score Matrix",
      },
      {
        title: "Live Incident Commander Triage",
        detail:
          "Stage 2 places you in the middle of a live production outage. Balancing short-term mitigation (circuit breakers, read-replicas) against root-cause durability determines your outcome.",
        badge: "Outage Triage",
      },
      {
        title: "Leadership Archetype Synthesis",
        detail:
          "Your aggregate path maps to distinguished engineering leadership archetypes: from 'Pragmatic Systems Architect' to 'Product Velocity Champion'.",
        badge: "Archetype Profile",
      },
    ],
    proTips: [
      "There are no purely 'correct' choices—every decision involves deliberate trade-offs between speed, durability, and operational overhead.",
      "High resilience choices protect against catastrophic cascading outages during subsequent stages.",
      "Review the stage badge indicators to understand the operational context of each challenge.",
    ],
    lore: {
      title: "Staff+ and Engineering Management Decision Frameworks",
      story:
        "Great engineering leaders don't just write clean code; they manage risk, mentor teams through high-severity outages, and make architectural decisions that compound positively over years. This interactive simulation models real-world Staff+ engineering trade-offs—from Expand-and-Contract schema migrations to blameless post-mortem cultures.",
      realWorldTech: ["Expand-and-Contract Migrations", "SRE SLO/SLA Frameworks", "Blameless Post-Mortems", "Circuit Breakers"],
    },
  },
};
