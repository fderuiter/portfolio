import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/seo";

export interface RouteMetaConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: "website" | "article";
  inLanguage?: string;
  locale?: string;
  isAccessibleForFree?: boolean;
}

export const ROUTE_METADATA_CONFIGS: Record<string, RouteMetaConfig> = {
  crf: {
    title: "CRF Studio: Clinical Form Designer",
    description:
      "Build clinical research forms, add validation rules, and try them with sample data. Explore a browser-based study designer by Fred de Ruiter.",
    path: "/crf",
    keywords: [
      "CRF Studio",
      "Clinical Trial Designer",
      "CDISC CDASH Validator",
      "ODM-XML Editor",
      "EDC Simulator",
      "AST Edit Checks",
      "aCRF Overlays",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  arcade: {
    title: "Arcade & Browser Games | Fred de Ruiter",
    description:
      "Try browser games by Fred de Ruiter: a laser loon, a demanding puppy, logic puzzles, and a smartwatch with very little memory to spare.",
    path: "/arcade",
    keywords: [
      "Engineering Arcade",
      "Canvas Physics Games",
      "Next.js 16 Games",
      "Formal Verification Puzzles",
      "Monkey C Simulator",
      "CDISC Arcade",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  laserLoon: {
    title: "Laser Loon: Quest for the State Flag",
    description:
      "Fly F277 Laser Loon toward the Minnesota State Capitol, battle rival flags, and blast through red tape in this browser arcade game.",
    path: "/arcade/laser-loon",
    keywords: [
      "Laser Loon Game",
      "Minnesota State Flag F277",
      "Canvas Arcade Shooter",
      "Physics Raycasting Engine",
      "TypeScript Game",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  quasiPuzzler: {
    title: "Quasi-Perfect Puzzler: Formal Verification",
    description:
      "Apply deductive proof tactics to a tree in this Lean-inspired puzzle game. Complete the proof before your simulated memory runs out.",
    path: "/arcade/quasi-puzzler",
    keywords: [
      "Formal Verification Game",
      "Lean Proof Tactics",
      "AST Logic Puzzles",
      "Deductive Type Theory",
      "Canvas Game Engine",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  garminWatch: {
    title: "Monkey C Mayhem: Garmin Schvitz App",
    description:
      "Dodge obstacles, clear memory, and wipe the fog from a simulated smartwatch. Play Monkey C Mayhem with a stubbornly small 32KB budget.",
    path: "/arcade/garmin-watch",
    keywords: [
      "Monkey C Mayhem",
      "Garmin Schvitz App",
      "Garmin Connect IQ Simulator",
      "Monkey C Memory Profiling",
      "32KB Embedded RAM",
      "Smartwatch Engine",
      "Retro MIP Simulator",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  clinicalChaos: {
    title: "Clinical Trial Chaos | Fred de Ruiter",
    description:
      "Sort clinical data, fix entries, and sign submissions against the clock. Play a clinical research arcade game with an impatient auditor.",
    path: "/arcade/clinical-chaos",
    keywords: [
      "CDISC Compliance Game",
      "SDTM Clinical Mapping",
      "21 CFR Part 11 Simulator",
      "FDA Regulatory Audit",
      "Clinical Informatics Arcade",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  retroLabyrinth: {
    title: "Retro Labyrinth | Fred de Ruiter",
    description:
      "Explore an abandoned codebase as a shifting dungeon. Fight bugs, navigate moving walls, and face a wireframe boss in this browser game.",
    path: "/arcade/retro-labyrinth",
    keywords: [
      "Legacy Code Roguelike",
      "Procedural Dungeon Generation",
      "TSP Maze Algorithm",
      "Wireframe 3D Canvas",
      "Retro Arcade Crawler",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  workingWithDuck: {
    title: "Working With Duck | Fred de Ruiter",
    description:
      "You have a deadline. Duck the puppy has a ball. Keep the project and the puppy happy with toys, treats, and park breaks in this browser game.",
    path: "/arcade/working-with-duck",
    keywords: [
      "Developer Pet Simulator",
      "Multitasking Coding Game",
      "Puppy Management Arcade",
      "Canvas Physics Animation",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  proof: {
    title: "Logical Proof Workspace | Fred de Ruiter",
    description:
      "Build a proof one step at a time. Connect premises, try inference rules, and inspect where an argument goes wrong in this logic workspace.",
    path: "/proof",
    keywords: [
      "Formal Verification Workspace",
      "Deductive Logic Prover",
      "Mathematical Proof DAG",
      "Interactive Logic Assistant",
      "CLI Proof Terminal",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  simulator: {
    title: "Incident & Engineering Decision Simulator",
    description:
      "Work through a few engineering decisions, from interface priorities to an outage. Explore what your choices emphasize and compare the results.",
    path: "/simulator",
    keywords: [
      "Incident Commander Simulator",
      "Production Outage Triage",
      "System Architecture Decision Tree",
      "Engineering Leadership Alignment",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  schedule: {
    title: "Book a Chat With Fred | Fred de Ruiter",
    description:
      "Find a time to talk about a project, ask a question, or introduce yourself. Book a 30-minute Google Meet chat with Fred de Ruiter.",
    path: "/schedule",
    keywords: [
      "Schedule Systems Consultation",
      "1:1 Technical Architecture Sync",
      "Engineering Advisory",
      "Frederick de Ruiter Calendar",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  contact: {
    title: "Contact Fred | Frederick de Ruiter",
    description:
      "Have a project, a role, or a question in mind? Send Fred de Ruiter a note about what you’re working on, or find a time to talk it through.",
    path: "/contact",
    keywords: [
      "Contact Frederick de Ruiter",
      "Direct Inquiries",
      "Engineering Consultation",
      "Clinical Data Systems",
      "Systems Architecture Collaboration",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  neuro: {
    title: "NeuroRecon Studio | Fred de Ruiter",
    description:
      "Explore brain surfaces and MRI slices, place control points, and work through simulated reconstruction problems in NeuroRecon Studio.",
    path: "/neuro",
    keywords: [
      "FreeSurfer Cortical Mesh Repair",
      "Neuroimaging CAD Studio",
      "3D Brain Mesh Orthoviews",
      "Euler Characteristic Topology",
      "MRI Slice Inspector",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  stack: {
    title: "Under the Hood | Frederick de Ruiter",
    description:
      "See how this site works: text layout, browser audio, the application stack, and the checks I use while building it. Demos and source included.",
    path: "/stack",
    keywords: [
      "Next.js 16 Systems Architecture",
      "Pretext Layout Physics",
      "Web Audio API Synthesis",
      "Engineering Quality Invariants",
      "React 19 Server Stack",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  memeVault: {
    title: "Meme Vault & Soundboard | Fred de Ruiter",
    description:
      "Make some noise with a browser soundboard, discover hidden trophies, and enjoy a few jokes about code, clinical data, and the working day.",
    path: "/arcade/meme-vault",
    keywords: [
      "Developer Meme Vault",
      "Web Audio Soundboard",
      "MedTech Easter Eggs",
      "Achievement Trophy Sandbox",
      "Interactive Retro Arcade",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  offline: {
    title: "You’re Offline | Frederick de Ruiter",
    description:
      "This page is not available offline. Check your connection, retry the page, or explore tools and pages already saved in your browser.",
    path: "/offline",
    keywords: [
      "Progressive Web App Shell",
      "Offline Developer Fallback",
      "Service Worker Cache",
      "Resilient Web Recovery",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  caseStudies: {
    title: "Project Writeups | Frederick de Ruiter",
    description:
      "Read about the problems, implementation choices, and lessons behind Fred de Ruiter’s clinical data tools, web apps, and side projects.",
    path: "/case-studies",
    keywords: [
      "Engineering Case Studies",
      "Clinical Data Systems",
      "CDISC Standards",
      "Systems Architecture",
      "Full-Stack Software Engineering",
    ],
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  oxidizeMath: {
    title: "OxidizeMath: Scientific Computing in Rust",
    description:
      "Explore scientific computing in Rust with numerical solvers, compile-time checks, and interactive simulations. Read the OxidizeMath writeup.",
    path: "/case-studies/oxidizemath",
    keywords: [
      "Rust Scientific Computing",
      "Verified Numerical Solvers",
      "PDE Simulation Framework",
      "WebAssembly egui Studio",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  laserLoonCaseStudy: {
    title: "Laser Loon: Artwork & Downloads",
    description:
      "Meet Laser Loon, my Minnesota flag submission, and download the artwork in print and web formats. The eye lasers are included in the download.",
    path: "/work/laser-loon",
    keywords: [
      "Laser Loon Vector Download",
      "Minnesota State Flag F277",
      "Open Source Vector Master Files",
      "Creative Commons Asset Hub",
      "Graphic Design Case Study",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  sonosNetworkController: {
    title: "Sonos Network Controller: Keep the Music Local",
    description:
      "Control Sonos speakers on your own network with a Python API and a small web interface. Read about the protocols and implementation choices.",
    path: "/case-studies/sonos-network-controller",
    keywords: [
      "Sonos Local Control Plane",
      "Python FastAPI UPnP",
      "IoT Network Reverse Engineering",
      "AsyncIO Smart Speaker API",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  clintrials: {
    title: "clintrials: Try Trial Designs in Your Browser",
    description:
      "Compare adaptive clinical trial designs in a browser workspace. See how Pyodide workers run statistical models without a separate Python setup.",
    path: "/case-studies/clintrials",
    keywords: [
      "Adaptive Clinical Trial Design",
      "Pyodide WebAssembly Biostats",
      "CRM Simulation Algorithm",
      "In Silico Trial Modeling",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  equiposeRandomization: {
    title: "Equipose: Reproducible Clinical Trial Randomization",
    description:
      "Explore reproducible clinical trial randomization in the browser, with generated Python, R, SAS, and Stata code for inspecting the allocation.",
    path: "/case-studies/equipose-randomization",
    keywords: [
      "Clinical Trial Randomization Engine",
      "Deterministic Mersenne Twister",
      "Multi-Language Transpiler",
      "CDISC ADaM Compliance",
      "Angular",
      "Web Workers",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  lambdaWave: {
    title: "Lambda-Wave: Tracking Respiratory Motion With Radar",
    description:
      "Explore a respiratory motion tracking project using FMCW radar, Haskell signal processing, and C++ sample transport. Read the design notes.",
    path: "/case-studies/lambda-wave",
    keywords: [
      "SGRT FMCW Radar System",
      "Haskell DSP Pipeline",
      "IEC 62304 Medical Device Software",
      "Real-Time Respiratory Tracking",
      "Biomedical Radar",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  duckDeploy: {
    title: "DuckDeploy: From Configuration Forms to Deployment Files",
    description:
      "Turn JSON Schema into configuration forms, then compile the values into deployment manifests. See how DuckDeploy uses TypeScript and workers.",
    path: "/case-studies/duckdeploy",
    keywords: [
      "JSON Schema UI Compiler",
      "Polymorphic State Machine",
      "Web Worker Form Synthesis",
      "TypeScript Dynamic UI",
      "Dynamic Form State",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  cardiacRiskModeling: {
    title: "Cardiac Risk Modeling: Predictions You Can Inspect",
    description:
      "Read a cardiac risk modeling project using Python, XGBoost, and SHAP. Explore data leakage, cross-validation, calibration, and model explanations.",
    path: "/case-studies/cardiac-risk-modeling",
    keywords: [
      "Clinical Tabular ML Pipeline",
      "Adversarial Validation",
      "Stratified Cross-Validation",
      "LightGBM Risk Calibration",
      "Healthcare Analytics",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  fourGlory: {
    title: "4Glory: Does Fred Know Ball?",
    description:
      "Does Fred know ball? Compare basketball opinions with Python and XGBoost predictions on NBA data, using walk-forward validation and SHAP.",
    path: "/case-studies/4glory",
    keywords: [
      "Real-Time Sports Analytics",
      "Expected Points Added EPA",
      "Monte Carlo Game Simulation",
      "High-Throughput Data Pipeline",
      "Basketball Outcome Prediction",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  crfXl: {
    title: "CRF.xl: From Spreadsheet to Clinical Forms",
    description:
      "Turn Excel protocol grids into clinical form definitions and ODM-XML exports. Read how CRF.xl handles rules, dependencies, and background work.",
    path: "/case-studies/crf-xl",
    keywords: [
      "Spreadsheet to CDISC Compiler",
      "CDASH Protocol Workbook Parser",
      "ODM-XML Export Engine",
      "AST Derivation Logic",
      "Clinical Forms",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  promptOps: {
    title: "PromptOps: Test Prompts Like Other Code",
    description:
      "Version prompts, validate response shapes, and run regression evaluations in CI. Read how PromptOps makes changes easier to inspect and compare.",
    path: "/case-studies/promptops",
    keywords: [
      "LLM Prompt Orchestration",
      "Deterministic Evaluation Gates",
      "Prompt Semantic Versioning",
      "AI Pipeline Drift Detection",
      "Prompt Engineering",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
  designingForMyBrother: {
    title: "Designing for My Brother: Cognitive Typography",
    description:
      "A personal case study on cognitive typography: replacing generic fonts with Lexend, Atkinson Hyperlegible, and OpenDyslexic with zero-CLS Pretext reflow.",
    path: "/case-studies/designing-for-my-brother",
    keywords: [
      "Dyslexia Typography",
      "OpenDyslexic",
      "Atkinson Hyperlegible",
      "Lexend",
      "Cognitive Accessibility",
      "Pretext Text Reflow",
      "Zero CLS",
      "WCAG 2.1 AA",
      "ADR 0040",
    ],
    ogType: "article",
    inLanguage: "en-US",
    locale: "en-US",
    isAccessibleForFree: true,
  },
};

/**
 * Helper to construct standardized Next.js Metadata for any route configuration.
 */
export function buildRouteMetadata(config: RouteMetaConfig): Metadata {
  const url = `${SITE_BASE_URL}${config.path}`;
  const ogImageUrl = `${SITE_BASE_URL}${config.path.startsWith("/") ? config.path : "/" + config.path}/opengraph-image`;
  const fullTitle = config.title.includes("Frederick de Ruiter")
    ? config.title
    : `${config.title} | Frederick de Ruiter`;

  const lang = config.inLanguage || config.locale || "en-US";
  const ogLocale = lang.replace("-", "_");

  return {
    title: config.title,
    description: config.description,
    keywords: config.keywords,
    alternates: {
      canonical: config.path,
    },
    openGraph: {
      type: config.ogType || "website",
      url,
      title: fullTitle,
      description: config.description,
      siteName: "Frederick de Ruiter Portfolio",
      locale: ogLocale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: config.description,
      creator: "@laser_loon",
      images: [ogImageUrl],
    },
    other: {
      inLanguage: lang,
      isAccessibleForFree: String(config.isAccessibleForFree ?? true),
    },
  };
}
