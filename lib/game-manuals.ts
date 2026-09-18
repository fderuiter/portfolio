import { FieldManualData } from "@/types/game-manual";

export const GAME_MANUALS: Record<string, FieldManualData> = {
  proof: {
    id: "proof",
    title: "Logical Proof Canvas",
    subtitle: "Formal Verification & Multi-Theorem Propositional Logic Suite",
    genre: "Formal Verification",
    badge: "Formal Logic Suite",
    route: "/proof",
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    objective:
      "Construct deterministic deductive proofs across 5 classic propositional theorems (Modus Ponens, Modus Tollens, Hypothetical Syllogism, Disjunctive Syllogism, Resolution) to discharge target engineering conclusions with mathematical certainty.",
    quickSummary:
      "Select a theorem scenario, wire valid premise nodes on the interactive canvas or CLI, inspect live step-by-step mathematical deduction ledgers, diagnose fallacies with truth-table counterexamples, and export verified proofs to Lean 4, LaTeX, Markdown, or Mermaid.",
    controls: [
      {
        action: "Select & Connect Node",
        description:
          "Click any source node (e.g. Node C), then click the target node (e.g. Node E) to establish a deductive dependency edge.",
        key: "Click Node",
      },
      {
        action: "Drag Node Position",
        description:
          "Click and drag any node across the canvas to customize visual layout; click 'Reset Layout' to return to canonical graph coordinates.",
        key: "Drag Node",
      },
      {
        action: "Switch Theorem Scenario",
        description:
          "Select from 5 engineering proof scenarios (Modus Ponens, Modus Tollens, Hypothetical Syllogism, Disjunctive Syllogism, Resolution) using the top toolbar tabs or CLI.",
        key: "Toolbar / CLI",
      },
      {
        action: "Guided Tactic Step",
        description:
          "Click 'Apply Next Tactic' in the Guided Proof Assistant to automatically evaluate and apply the next valid deduction step.",
        key: "1-Click Tactic",
      },
      {
        action: "CLI Split Console",
        description:
          "Open the terminal and run commands such as `theorem mt`, `connect C E`, `inspect C`, `ledger`, `export lean`, `simulate normal`, or `clear`.",
        key: "Ctrl + \\",
      },
      {
        action: "Export Verified Proof",
        description:
          "Click 'Export Proof' to copy production-ready Lean 4 formal code, LaTeX deduction trees, Markdown audit tables, or Mermaid diagrams.",
        key: "Export Button",
      },
    ],
    rules: [
      {
        title: "Modus Ponens & Modus Tollens",
        detail:
          "Modus Ponens derives Q from (P ∧ (P → Q)). Modus Tollens derives ¬P from ((P → Q) ∧ ¬Q). Both antecedent/consequent pairs must reach the target node before it discharges.",
        badge: "Deductive Rules",
      },
      {
        title: "Syllogisms & Clausal Resolution",
        detail:
          "Hypothetical Syllogism chains (P → Q) ∧ (Q → R) into P → R. Disjunctive Syllogism eliminates (P ∨ Q) ∧ ¬P into Q. Resolution refutes complementary literals (P ∨ Q) ∧ (¬P ∨ R) into Q ∨ R.",
        badge: "Advanced Rules",
      },
      {
        title: "Fallacy Engine & Counterexamples",
        detail:
          "Attempting invalid inferences (such as Affirming the Consequent or Denying the Antecedent) triggers real-time truth-table counterexamples demonstrating rows where premises are TRUE but conclusion is FALSE.",
        badge: "Fallacy Detection",
      },
      {
        title: "Background Tactic Watchdog",
        detail:
          "Simulations run inside dedicated Web Workers off the main thread. A 5-second watchdog timer terminates divergent tactics to prevent UI thread lockup.",
        badge: "Worker Safety",
      },
    ],
    proTips: [
      "Use the 'Logic Inspector' tab to review the plain-English meaning and hypothesis requirements of any node.",
      "Switch to the 'Deduction Ledger' tab to view the live mathematical proof derivation table.",
      "The Guided Proof Assistant on the left highlights the immediate next deduction step needed to complete the proof.",
      "You can toggle between direct visual canvas interaction and the keyboard CLI console at any time without losing proof state.",
    ],
    lore: {
      title: "Why Formal Verification Matters in Modern Software",
      story:
        "Traditional testing (unit, integration, end-to-end) only tests sample inputs. Formal verification uses mathematical logic to prove that software satisfies specifications across all possible execution states. From NASA flight software and cryptographic microkernels (seL4) to blockchain smart contracts and compiler verification (CompCert), formal logic guarantees the complete absence of whole classes of bugs.",
      realWorldTech: [
        "Lean 4",
        "Coq / Rocq",
        "Z3 SMT Solver",
        "Curry-Howard Isomorphism",
        "seL4 Microkernel",
      ],
    },
  },

  patrol: {
    id: "patrol",
    title: "Patrol Shift",
    subtitle: "Midwest Ski Patrol Judgment Simulation",
    genre: "Judgment Simulation",
    badge: "Simulation",
    route: "/patrol",
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    objective:
      "Work a full patrol shift at a Welch Village-inspired hill: hold the mountain between calls, take dispatches, run the scene, sled the patient down, hand off, and read your debrief. Educational simulation only — it does not teach or certify clinical care.",
    quickSummary:
      "Start your shift, patrol the map between dispatches, assess and treat on scene, run the toboggan down the fall line, hand off to EMS, then review a debrief scored across five dimensions.",
    controls: [
      {
        action: "Start a Shift",
        description:
          "Begin at the intro, move through the morning briefing, and arrive on the mountain map. Reset at any time from the header to start a fresh shift.",
        key: "Begin Shift Briefing",
      },
      {
        action: "Patrol the Mountain Map",
        description:
          "Between calls you hold the hill. Trigger ambient operations — a closed rope, debris on a trail, a guest asking directions — and resolve them, or await the next dispatch.",
        key: "Click Map Actions",
      },
      {
        action: "Respond to Dispatch",
        description:
          "Radio traffic arrives as text on CH 1. Acknowledge the call to travel to the scene; the scenario's location, patient, and bystanders are revealed as you gather information.",
        key: "Acknowledge",
      },
      {
        action: "Run the Scene (OEC)",
        description:
          "Assess scene safety first, then gather observations, check vitals, and execute care actions. Order matters — the debrief engine reads what you did and when.",
        key: "Click Actions",
      },
      {
        action: "Talk to People on Scene",
        description:
          "Choose dialogue responses to delegate to your partner, calm a patient, manage bystanders, or request resources over the radio. There is rarely one correct line.",
        key: "Click Choices",
      },
      {
        action: "Steer the Toboggan (OET)",
        description:
          "Hold left or right to steer across the fall line. Steering is continuous — the sled keeps turning while the key is held.",
        key: "A / D or ← / →",
      },
      {
        action: "Brake and Control Speed",
        description:
          "Hold to scrub speed on the pitch. Chain brake toggles on and off for sustained control on ice; tail rope belay toggles your partner's braking behind the sled.",
        key: "S / ↓ • Space or B • T",
      },
      {
        action: "Pause the Descent",
        description:
          "Freeze the toboggan simulation without losing your run state.",
        key: "P",
      },
      {
        action: "Touch & Step-Through Controls",
        description:
          "On touch devices a control dock provides the same steering, brake, chain-brake, and tail-rope inputs. Step-Through Mode replaces the real-time descent with a discrete, keyboard-and-screen-reader-navigable alternative path.",
        key: "Touch Dock / Step-Through Mode",
      },
      {
        action: "Hand Off & Debrief",
        description:
          "Give a structured handoff to incoming EMS, then read a debrief with specific observations derived from your actual event log, plus a shift summary when you close out.",
        key: "Complete Handoff",
      },
    ],
    rules: [
      {
        title: "Not Medical Training",
        detail:
          "Patrol Shift is an educational simulation about operational judgment. It does not provide clinical protocols, medical guidance, or any form of OEC/OET certification. Never use it as a care reference.",
        badge: "Disclaimer",
      },
      {
        title: "Scene Safety Comes First",
        detail:
          "Assessing scene safety before you touch the patient is scored. The debrief engine checks whether a scene-safety action was logged before your first patient-care action.",
        badge: "Scene",
      },
      {
        title: "Five Debrief Dimensions",
        detail:
          "Every incident is read across Scene Management, Patient Care, Communication, Transportation, and Operational Judgment — each with a meter and specific written observations, not a bare score.",
        badge: "Debrief",
      },
      {
        title: "Smooth Beats Fast",
        detail:
          "Transport is judged on patient comfort, not elapsed time. Abrupt corrections and hard braking on the descent cost you more than a slower, controlled run.",
        badge: "OET",
      },
      {
        title: "Unofficial Tribute",
        detail:
          "An independent, non-commercial tribute to Midwest ski patrolling. Not affiliated with, endorsed by, or sponsored by Welch Village Ski and Snowboard Area.",
        badge: "Notice",
      },
    ],
    proTips: [
      "Assess scene safety before anything else — the debrief engine explicitly checks the ordering.",
      "Delegate. Sending your partner for equipment while you stay with the patient reads as strong scene management.",
      "Reassess vitals after an intervention; a single check early gives the debrief nothing to compare against.",
      "On the descent, small sustained corrections beat large late ones — the comfort metric punishes abrupt input.",
      "Engage the chain brake before the pitch steepens, not after you are already accelerating.",
      "Ambient events between calls are scored too: patrolling is responsibility for a place, not just waiting for injuries.",
      "Audio is muted by default and every radio call is text-first, so nothing is lost with sound off.",
    ],
    lore: {
      title: "Midwest Patrol & Systems Architecture",
      story:
        "Midwest patrolling is its own discipline: 360 feet of vertical, hard-packed man-made snow, short fast laps, and a volunteer culture where the same person sweeps the hill, runs the sled, and talks to the guest's family. This simulation models that judgment — deciding, communicating, and sequencing under mild pressure — through a headless finite state machine, data-authored scenarios, and a declarative rule engine that derives feedback from your event history rather than a scoreboard.",
      realWorldTech: [
        "Finite State Machines",
        "Deep Modules",
        "Declarative Rule Engines",
        "Outdoor Emergency Care (OEC)",
        "Outdoor Emergency Transportation (OET)",
      ],
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
      "Toss toys to divert Duck from power cables, command training tricks (Q-W-E-R), push active coding commits (Space), scrub belly rubs during the flop, jump agility hurdles in the Dog Park, and wash in the Bathtub when muddy.",
    controls: [
      {
        action: "Active Code Burst",
        description:
          "Press Spacebar while at your desk to rapidly push code commits and squash bugs with Good Boy multiplier bonuses.",
        key: "Spacebar / Desk Click",
      },
      {
        action: "Training Tricks",
        description:
          "Press Q (Sit), W (High Five/Paw), E (Drop It), or R (Spin) for immediate obedience, focus recovery, and Good Boy score multipliers.",
        key: "Q, W, E, R",
      },
      {
        action: "Toss Toys & Treats",
        description:
          "Press 1 (Tennis Ball), 2 (Kong Chew), 3 (Squeaky Toy), or 4 (Treat) to divert Duck away from server cables and trade stolen items.",
        key: "1, 2, 3, 4 Hotkeys",
      },
      {
        action: "Bathtub Wash & Rinse",
        description:
          "When Duck gets muddy at the Dog Park, drag him to the Bathtub station, scrub lather with your mouse, and shower rinse for a sparkling clean coat.",
        key: "Bathtub Click / Drag",
      },
      {
        action: "Agility Jump & Whistle",
        description:
          "In the Dog Park, tap Spacebar to leap over agility hurdles and recall Duck with the ultrasonic whistle.",
        key: "Spacebar / Whistle",
      },
    ],
    rules: [
      {
        title: "Autonomous Puppy State Machine",
        detail:
          "Duck transitions autonomously between behavioral states: Idle, Hazard-Chew, Belly-Flop, Potty-Sniff, Trick-Performance, and Nap Time. Anticipate his transitions to prevent desk chaos.",
        badge: "Deterministic AI",
      },
      {
        title: "Hazard Interception",
        detail:
          "If Duck chews the API cluster wire or Part 11 audit script, multiplier resets and penalty points apply. Call 'Drop It!' (E) or drop a Kong (2) immediately.",
        badge: "Hazard Penalty",
      },
      {
        title: "5-Sprint Campaign & Accessories",
        detail:
          "Progress across 5 story-driven sprints to unlock wearable cosmetics: Adidas Bucket Hat, Tech CEO Bowtie, Adventure Bandana, and Yellow Mud Boots.",
        badge: "Wardrobe Unlocks",
      },
      {
        title: "Polaroid Scrapbook",
        detail:
          "Capturing key milestone moments unlocks 10 high-resolution real photos and vector artwork in your persistent scrapbook.",
        badge: "Collectibles",
      },
    ],
    proTips: [
      "Use 'Drop It!' (E) as soon as Duck targets a hazard to save items without switching toys.",
      "Wear Yellow Mud Boots to provide complete mud puddle immunity at the Dog Park.",
      "Equip the Tech CEO Bowtie for an extra 0.2x speed boost during active sprint crunch periods.",
    ],
    lore: {
      title: "Autonomous Behavior Trees in Canvas 2D",
      story:
        "Building lifelike virtual pets requires combining finite state machines with weighted steering behaviors (Craig Reynolds' Boids algorithms). Duck's wandering pathing computes avoidance vectors around furniture while evaluating hunger, joy, and fatigue curves rendered in 60 FPS Canvas 2D with procedural particle fur shaders.",
      realWorldTech: [
        "Craig Reynolds Steering",
        "Finite State Machines",
        "Web Audio API Synths",
        "Canvas 2D Physics",
      ],
    },
  },

  "laser-loon": {
    id: "laser-loon",
    title: "Laser Loon: Quest for the State Flag",
    subtitle: "Civic Arcade / Physics Raycast Shooter & Campaign",
    genre: "Civic Arcade Shooter",
    badge: "F277 Flag Lore",
    route: "/arcade/laser-loon",
    storageKey: "laser_loon_high_score",
    accentColor: "from-cyan-500/20 via-red-500/10 to-transparent",
    badgeBg: "bg-red-500/10 text-red-400 border-red-500/30",
    objective:
      "Pilot the iconic F277 Laser Loon through four campaign acts from Lake Minnetonka to the State Capitol dome, battling rival flag finalists, bureaucratic red tape, and Minnesota folklore hazards.",
    quickSummary:
      "Aim with the cursor or touch controls, fire ruby eye-lasers and cryogenic ice mortars, collect Hotdish power-ups, and unleash the Haunting Loon Tremolo ultimate shockwave to claim victory!",
    controls: [
      {
        action: "Aim & Fire Laser Arsenal",
        description:
          "Aim crosshair with cursor or touch; left-click or drag to fire active laser beam (Ruby Laser, Cyan Pulse, Aurora Wave, or Cryo Mortar).",
        key: "Left Click / Drag",
      },
      {
        action: "The Haunting Loon Tremolo (Ultimate)",
        description:
          "When the energy meter hits 100%, trigger a screen-wide synthesized cryogenic loon screech that freezes and shatters all obstacles!",
        key: "Spacebar / Ultimate Button",
      },
      {
        action: "Cycle Laser Modes",
        description:
          "Switch between Ruby Eye Laser (1), Cyan Pulse (2), Aurora Borealis Wave (3), and Glacial Cryo-Mortar (4).",
        key: "Keys 1 - 4 / Weapon Bar",
      },
      {
        action: "Loon Movement & Gliding",
        description:
          "Glide Laser Loon smoothly along the lake surface or committee floor to collect power-ups and dodge boss projectiles.",
        key: "W/A/S/D or Arrow Keys",
      },
    ],
    rules: [
      {
        title: "Iconic F277 Crimson Optics",
        detail:
          "Laser beams project raycast vectors with continuous collision detection against rival flag submissions and bureaucratic red tape.",
        badge: "Raycast Physics",
      },
      {
        title: "Glacial Cryo-Shatter Combos",
        detail:
          "Mortar ice blocks bounce off lake boundaries, encasing targets in ice. Shattering frozen targets awards 2x points and cascades shrapnel.",
        badge: "2x Shatter Combo",
      },
      {
        title: "Historic Campaign Acts & Bosses",
        detail:
          "Advance through Lake Minnetonka (Mega Mosquito), State Fair (Butter Colossus), Redesign Commission (Starflake Finalist), and the Capitol Rotunda (Grand Veto Gavel).",
        badge: "4-Act Campaign",
      },
    ],
    proTips: [
      "Save your Haunting Loon Tremolo ultimate for boss encounters to shatter their revolving defense shields.",
      "Grab floating Tater Tot Hotdish pickups for instant zero-cooldown laser overcharge frenzy.",
      "Bouncing Cryo Mortar ice blocks off the canvas floor and ceiling creates hazardous pinball walls for rival flags.",
    ],
    lore: {
      title: "The Grassroots Legend of Submission F277",
      story:
        "In late 2023, the Minnesota State Emblems Redesign Commission invited citizen submissions. Fred deRuiter submitted 'F277: Laser Loon'—a majestic common loon blasting twin crimson lasers across azure waters. The design became a worldwide viral sensation, featured in The New York Times, The Washington Post, and NPR. Fred released F277 into the public domain (CC0), launching a grassroots civic campaign that raised over $13,500 for the Saint Paul Public Library Foundation.",
      realWorldTech: [
        "Raycast Collision Vectors",
        "Web Audio Dual-Oscillator Synthesis",
        "Multi-Phase Boss AI",
        "Deterministic State Progression",
      ],
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
      "Construct formal AST proofs, discharge multi-goal branch cases, and synthesize valid Lean 4 code within language server RAM limits without conceding to the forbidden `sorry` axiom.",
    quickSummary:
      "Apply formal proof tactics (intro, apply, exact, cases, rw, ring, norm_num, simp, omega) across a 3-chapter curriculum to discharge mathematical theorems and preserve verification morality.",
    controls: [
      {
        action: "Apply Proof Tactic",
        description:
          "Click or drag tactic cards (`intro`, `apply`, `exact`, `cases`, `rw`, `ring`, `norm_num`, `simp`, `omega`, `linarith`) onto AST nodes to transform goals.",
        key: "Click / Drag Tactic",
      },
      {
        action: "Branch & Multi-Goal Navigation",
        description:
          "Tactics like `cases` split goals into multiple subgoals. Use the branch tabs to switch between active goals until all are discharged.",
        key: "Subgoal Tabs",
      },
      {
        action: "Progressive Hint Coach",
        description:
          "Toggle progressive 3-tier hints for conceptual strategy, target subtree highlights, and recommended tactics.",
        key: "Hints Button (H)",
      },
      {
        action: "Lean 4 IDE Inspector",
        description:
          "Inspect live generated Lean 4 code in real time (`theorem ... := by ...`) and copy directly to Lean Web Editor.",
        key: "Lean IDE (C)",
      },
      {
        action: "The 'Sorry' Escape Valve",
        description:
          "Admit defeat on the current branch using `sorry`. This keeps the engine running but permanently incurs a -100 Morality Penalty.",
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
        title: "Multi-Goal Case Splits",
        detail:
          "Disjunctions (P ∨ Q) split into independent cases with their own hypotheses. Both branches must be discharged to achieve Q.E.D.",
        badge: "Multi-Goal",
      },
      {
        title: "Zero-Sorry Morality Rating",
        detail:
          "Using `sorry` bypasses a difficult sub-goal without proving it, assigning a severe penalty to your final verification integrity score.",
        badge: "Integrity Score",
      },
    ],
    proTips: [
      "Use `ring` to automatically prove algebraic polynomial equivalences like (a+b)² = a² + 2ab + b².",
      "`intro h` unpacks implication antecedents into your local hypothesis pool.",
      "`cases h_or` splits a disjunction into two sub-goals (h_left and h_right).",
      "`norm_num` rapidly evaluates concrete numerical arithmetic and comparisons.",
      "Targeted `rw [h]` uses far less RAM (2 GB) than full confluent search `simp` (6 GB).",
    ],
    lore: {
      title: "The Curry-Howard Isomorphism & Lean 4",
      story:
        "The Curry-Howard correspondence establishes that computer programs and mathematical proofs are the exact same mathematical objects: propositions are types, and proofs are programs. Interactive theorem provers like Lean 4, developed at Microsoft Research and Carnegie Mellon, enable mathematicians and engineers to formally verify complex mathematics (such as Peter Scholze's Liquid Tensor Experiment) and verify production microcode.",
      realWorldTech: [
        "Lean 4",
        "Dependent Type Theory",
        "Homotopy Type Theory",
        "Calculus of Constructions",
      ],
    },
  },

  "garmin-watch": {
    id: "garmin-watch",
    title: "Monkey C Mayhem: Garmin Schvitz App",
    subtitle: "Embedded Systems & Garmin Schvitz App Simulator",
    genre: "Embedded Systems",
    badge: "Monkey C Mayhem",
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
        description:
          "Click the physical watch bezel buttons: UP, DOWN, SELECT, and BACK to navigate watch apps and menus.",
        key: "Bezel Clicks",
      },
      {
        action: "Wipe Thermal Fog",
        description:
          "Click and drag your cursor across the circular glass face to wipe away condensation built up from high heart-rate intervals.",
        key: "Drag Across Screen",
      },
      {
        action: "Sensor Rate Toggle",
        description:
          "Switch GPS, Optical HR, and Accelerometer polling frequencies to balance telemetry fidelity against battery drain.",
        key: "Sensor Toggles",
      },
      {
        action: "Force Garbage Collection",
        description:
          "Execute manual memory compaction to reclaim abandoned object references before hitting the 32KB heap ceiling.",
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
      realWorldTech: [
        "Garmin Connect IQ",
        "Monkey C VM",
        "MIP Display Tech",
        "Object Pooling",
        "ARM Cortex-M",
      ],
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
      "Standardize clinical observations across 8 CDISC SDTM domains (DM, VS, AE, LB, CM, EX, DS, MH), solve multi-choice Controlled Terminology puzzles, deploy combo-charged regulatory lifelines, sign 21 CFR Part 11 electronic records, and achieve a clean FDA BIMO inspection rating.",
    quickSummary:
      "Solve Controlled Terminology discrepancies via multi-choice puzzles, route validated dossier packets to tiered EDC stations with hotkeys [1-6], deploy power-ups [Q, W, E, R], and export authentic CDISC ODM XML / SDTM CSV datasets.",
    controls: [
      {
        action: "Validate Clinical Observation",
        description:
          "Click any unverified observation card to open the Multi-Choice Validation Drawer and select the compliant CDISC standard, MedDRA Preferred Term, or ISO-8601 date.",
        key: "Click Observation / Multi-Choice",
      },
      {
        action: "Route to EDC Domain Desk",
        description:
          "Submit validated dossiers to active EDC stations: [1] Demographics (DM), [2] Vital Signs (VS), [3] Adverse Events (AE), [4] Laboratory (LB), [5] Concomitant Meds (CM), [6] Drug Exposure (EX).",
        key: "Keys [1-6] or Click Station",
      },
      {
        action: "Deploy Regulatory Lifelines",
        description:
          "Deploy combo-charged power-ups: [Q] FDA Coffee Break (freeze auditor), [W] CDISC Auto-Clean (clean active dossier), [E] Site Query Extension (+12s), [R] Fast-Track 21 CFR Pass (instant sign).",
        key: "Keys [Q, W, E, R]",
      },
      {
        action: "21 CFR Electronic Signature Lock",
        description:
          "Verify legal signature intent and authenticate with password to permanently lock records and cooldown auditor suspicion.",
        key: "Enter / Confirm Signature",
      },
      {
        action: "Cycle Active Queue & Switch View",
        description:
          "Press [Tab] to cycle between conveyor parcels. Toggle between Conveyor Floor, Live SDTM Studio, and Audit Trail Log tabs to export XML/CSV datasets.",
        key: "Tab / Tab Switcher",
      },
    ],
    rules: [
      {
        title: "Tiered CDISC SDTM Domains",
        detail:
          "Phase I activates core safety & lab domains (DM, VS, AE, LB). Phase II unlocks Concomitant Medications (CM) and Drug Exposure (EX). Phase III unlocks Disposition (DS) and Medical History (MH).",
        badge: "8 SDTM Domains",
      },
      {
        title: "Controlled Terminology & MedDRA Coding",
        detail:
          "Selecting incorrect CT codes or unstandardized units incurs auditor suspicion penalties. Correct answers award bonus points and recharge power-up lifelines.",
        badge: "CDISC CT & MedDRA",
      },
      {
        title: "21 CFR § 11.50 Manifestation of Signatures",
        detail:
          "Electronic records require unambiguous intent ('Intent to Submit', 'Urgent Safety Expedited', etc.). Submitting unverified raw data triggers immediate audit rejection.",
        badge: "21 CFR Part 11",
      },
      {
        title: "FDA Bioresearch Monitoring (BIMO) Scoring",
        detail:
          "At the end of each shift or upon trial termination, receive a formal BIMO inspection report with NAI (Approved), VAI (Voluntary Action), or OAI (Form 483 Issued) determination.",
        badge: "BIMO Inspection",
      },
    ],
    proTips: [
      "Keep an eye on Serious Adverse Events (⚡ SAE)—they have shorter timers and grant +300 bonus points upon compliant signature.",
      "Charge your 'FDA Coffee Break' lifeline by maintaining clean submission streaks; deploy it when auditor suspicion climbs above 70%.",
      "Switch to the Live SDTM Studio tab during shifts to inspect generated observation rows and export authentic CDISC ODM 1.3 XML.",
      "Toggle the procedural 8-bit synth BGM to hear dynamic tempo scaling as auditor scrutiny intensifies.",
    ],
    lore: {
      title: "Biotech Data Governance & Regulatory Lifecycles",
      story:
        "Bringing a novel therapeutic drug or medical device from Phase I trials through FDA/EMA approval requires processing millions of patient data points under strict federal regulations. CDISC standards (SDTM, ADaM, and ODM) ensure universal semantic interoperability, while FDA 21 CFR Part 11 guarantees that electronic records have the identical legal standing and auditability as traditional paper records.",
      realWorldTech: [
        "CDISC SDTM / ADaM / ODM",
        "FDA 21 CFR Part 11",
        "Electronic Data Capture (EDC)",
        "MedDRA / WHO-Drug",
        "GxP Validation",
      ],
    },
  },

  "retro-labyrinth": {
    id: "retro-labyrinth",
    title: "Retro Labyrinth: Graveyard Roguelike",
    subtitle: "Cyberpunk Red Team Breach & Mainframe Roguelike",
    genre: "Dungeon Roguelike",
    badge: "Cyberpunk Roguelike",
    route: "/arcade/retro-labyrinth",
    storageKey: "retro_labyrinth_high_score",
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    badgeBg: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    objective:
      "Infiltrate fortified corporate mainframe subnets as an autonomous Red Team Netrunner. Manage Cyberdeck RAM, weaponize zero-days and offensive exploits, bypass EDR sentinels, solve tactile Hex Matrix buffer puzzles, and defeat the 3D Wireframe Sovereign Boss.",
    quickSummary:
      "Navigate procedural subnets with WASD/Arrows. Deploy cyber tools ([1] Nmap / npm install, [2] Buffer Overflow / git push -f, [3] 0-Day / Stack Overflow, [4] MitM Spoof, [5] Ransomware, [SPACE] EMP) to exploit daemon CVEs and extract encrypted payloads.",
    controls: [
      {
        action: "Move Netrunner Avatar",
        description:
          "Navigate through procedural subnet corridors and step onto discovery nodes.",
        key: "WASD / Arrow Keys",
      },
      {
        action: "Deploy Cyber Exploits",
        description:
          "Execute exploits: [1] Nmap / npm i (Recon / AoE), [2] Buffer Overflow (Burst / Crit), [3] Zero-Day (Piercer / Snippet), [4] MitM Spoof (Confuse), [5] Ransomware (Freeze & Bounty).",
        key: "1, 2, 3, 4, 5 Keys",
      },
      {
        action: "EMP Kernel Surge",
        description:
          "Discharge an electromagnetic surge to stun all security drones and camera sentinels in the sector.",
        key: "Spacebar / Touch Action A",
      },
      {
        action: "Toggle CRT Phosphor Scanlines",
        description:
          "Toggle retro CRT phosphor curvature, bloom, and scanline shader post-processing filters.",
        key: "C Key",
      },
    ],
    rules: [
      {
        title: "Cyberdeck RAM & CVE Vulnerability Synergies",
        detail:
          "Exploits draw from your Cyberdeck RAM capacity. Port scanning exposes enemy CVE vulnerabilities (Buffer Overflow, Weak SSH, Default Creds) to trigger 2.5x critical damage and chain reactions.",
        badge: "CVE Combos",
      },
      {
        title: "Hex Matrix Buffer Bypass Terminals",
        detail:
          "Locked data vaults and security airgaps feature tactile Hex Buffer minigames. Align alternating row/column byte sequences or deploy Hardware Jumper Bypass Chips to harvest Crypto bounties.",
        badge: "Hex Hacking",
      },
      {
        title: "3D Wireframe Sovereign Boss Fights",
        detail:
          "The mainframe climax pits you against the 3D Vector Kernel Warden. Dodge rotating projectile volleys and strike the core as defense shields rotate across phases.",
        badge: "3D Boss Fight",
      },
    ],
    proTips: [
      "Use Nmap [1] on room entry to reveal hidden traps and tag hostile daemons with CVE vulnerability marks.",
      "Save Hardware Bypass Chips for Tier 3 & 4 encrypted vaults where time limits are tight.",
      "Visit the Darknet Market to purchase DDR5 RAM overclocks and Airgap 0-Day payloads using harvested Crypto.",
    ],
    lore: {
      title: "Red Team Infiltration & Legacy Code Archaeology",
      story:
        "Every engineer has explored legacy codebases that feel like ancient, crumbling dungeons filled with deprecated dependencies, undocumented endpoints, and zombie cron jobs. Retro Labyrinth turns code maintenance and cybersecurity into a playable roguelike using cellular automata dungeon generation, raycasted field-of-view, Web Audio 8-bit sound synthesis, and real-time 3D vector wireframe rendering.",
      realWorldTech: [
        "Cellular Automata",
        "Bresenham FOV Raycasting",
        "CVE Vulnerability Models",
        "Hex Buffer Matrix",
        "Web Audio API",
        "3D Wireframe Projection",
      ],
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
        description:
          "Click option cards to choose your leadership decision for the active stage. Each option carries distinct 4-axis trade-offs.",
        key: "Click Option Card",
      },
      {
        action: "Review Dimension Impact",
        description:
          "Hover over option descriptions to preview the systemic consequences on Tech Depth, Team Alignment, UI Polish, and Resilience.",
        key: "Hover Impact",
      },
      {
        action: "Copy Leadership Assessment",
        description:
          "At the conclusion of the simulation, generate and copy a Markdown/JSON report of your leadership archetype and decision log.",
        key: "Export Button",
      },
      {
        action: "Restart Simulation",
        description:
          "Reset the decision tree to explore alternative incident mitigation pathways and divergent architectural strategies.",
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
      realWorldTech: [
        "Expand-and-Contract Migrations",
        "SRE SLO/SLA Frameworks",
        "Blameless Post-Mortems",
        "Circuit Breakers",
      ],
    },
  },
};
