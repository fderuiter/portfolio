import type { Metadata } from "next";
import { SITE_BASE_URL } from "@/lib/seo";

export interface RouteMetaConfig {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogType?: "website" | "article";
}

export const ROUTE_METADATA_CONFIGS: Record<string, RouteMetaConfig> = {
  crf: {
    title: "CRF Studio: Clinical Form & Protocol Designer",
    description: "Design clinical trial CRFs and simulate EDC workflows with responsive 12-column layouts, AST edit checks, and CDISC CDASH / ODM-XML compliance.",
    path: "/crf",
    keywords: ["CRF Studio", "Clinical Trial Designer", "CDISC CDASH Validator", "ODM-XML Editor", "EDC Simulator", "AST Edit Checks", "aCRF Overlays"],
  },
  arcade: {
    title: "Engineering Arcade Hub & Systems Simulators",
    description: "Explore playable canvas physics engines, formal logic proof puzzles, embedded Monkey C simulators, and CDISC compliance arcades built with zero game engines.",
    path: "/arcade",
    keywords: ["Engineering Arcade", "Canvas Physics Games", "Next.js 16 Games", "Formal Verification Puzzles", "Monkey C Simulator", "CDISC Arcade"],
  },
  laserLoon: {
    title: "Laser Loon: Quest for the State Flag | Arcade",
    description: "Pilot MN Flag submission F277 Laser Loon on the Road to the Capitol. Aim eye-lasers and cryo ice blocks to battle red tape in this retro canvas shooter.",
    path: "/arcade/laser-loon",
    keywords: ["Laser Loon Game", "Minnesota State Flag F277", "Canvas Arcade Shooter", "Physics Raycasting Engine", "TypeScript Game"],
  },
  quasiPuzzler: {
    title: "Quasi-Perfect Puzzler: Formal Verification Arcade",
    description: "Solve Lean-inspired deductive proof tactics and AST puzzles under real-time constraints while preventing simulated kernel memory exhaustion.",
    path: "/arcade/quasi-puzzler",
    keywords: ["Formal Verification Game", "Lean Proof Tactics", "AST Logic Puzzles", "Deductive Type Theory", "Canvas Game Engine"],
  },
  garminWatch: {
    title: "Garmin Connect IQ 32KB Memory Runner | Simulator",
    description: "Survive strict 32KB RAM allocations, avoid GC latency freezes, and prevent thermal overheating in this Monkey C smartwatch engineering simulator.",
    path: "/arcade/garmin-watch",
    keywords: ["Garmin Connect IQ Simulator", "Monkey C Memory Profiling", "32KB Embedded RAM", "Smartwatch Engine", "Retro MIP Simulator"],
  },
  clinicalChaos: {
    title: "Clinical Trial Chaos: CDISC Compliance Arcade",
    description: "Master fast-paced CDISC ODM/SDTM mapping and 21 CFR Part 11 electronic signature compliance under relentless simulated FDA regulatory audit scrutiny.",
    path: "/arcade/clinical-chaos",
    keywords: ["CDISC Compliance Game", "SDTM Clinical Mapping", "21 CFR Part 11 Simulator", "FDA Regulatory Audit", "Clinical Informatics Arcade"],
  },
  retroLabyrinth: {
    title: "Retro Labyrinth: Legacy Codebase Roguelike",
    description: "Explore procedurally generated dungeon mazes across deprecated legacy codebases. Battle technical debt bosses and navigate dynamic TSP wireframe walls.",
    path: "/arcade/retro-labyrinth",
    keywords: ["Legacy Code Roguelike", "Procedural Dungeon Generation", "TSP Maze Algorithm", "Wireframe 3D Canvas", "Retro Arcade Crawler"],
  },
  workingWithDuck: {
    title: "Working With Duck: Developer Pet Simulation Arcade",
    description: "Balance critical production pull requests against Duck the puppy's zoomies, potty breaks, and belly rub demands in this multitasking developer simulator.",
    path: "/arcade/working-with-duck",
    keywords: ["Developer Pet Simulator", "Multitasking Coding Game", "Puppy Management Arcade", "Canvas Physics Animation"],
  },
  proof: {
    title: "Logical Proof Workspace | Formal Verification",
    description: "Construct and verify deductive logic proofs with live graph visualization, dual-mode CLI terminal, proof branch verification, and formal theorem validation.",
    path: "/proof",
    keywords: ["Formal Verification Workspace", "Deductive Logic Prover", "Mathematical Proof DAG", "Interactive Logic Assistant", "CLI Proof Terminal"],
  },
  simulator: {
    title: "Engineering Alignment & Incident Simulator",
    description: "Navigate high-stress production outages, architectural dilemmas, and candidate compatibility decisions in this interactive incident commander decision tree.",
    path: "/simulator",
    keywords: ["Incident Commander Simulator", "Production Outage Triage", "System Architecture Decision Tree", "Engineering Leadership Alignment"],
  },
  schedule: {
    title: "Schedule 1:1 Systems Sync | Frederick de Ruiter",
    description: "Schedule a direct 1:1 technical sync or systems architecture consultation on Google Calendar with Principal Systems Engineer Frederick de Ruiter.",
    path: "/schedule",
    keywords: ["Schedule Systems Consultation", "1:1 Technical Architecture Sync", "Engineering Advisory", "Frederick de Ruiter Calendar"],
  },
  contact: {
    title: "Contact & Direct Inquiries | Frederick de Ruiter",
    description: "Access direct communication channels for systems engineering inquiries, consulting opportunities, and clinical data architecture collaboration.",
    path: "/contact",
    keywords: ["Contact Frederick de Ruiter", "Direct Inquiries", "Engineering Consultation", "Clinical Data Systems", "Systems Architecture Collaboration"],
  },
  neuro: {
    title: "NeuroRecon: FreeSurfer QA & Cortical Mesh Studio",
    description: "Inspect 3D cortical surfaces, place intensity control points, resolve topological Euler defects, and slice 2D MRI orthoviews in this neuro CAD studio.",
    path: "/neuro",
    keywords: ["FreeSurfer Cortical Mesh Repair", "Neuroimaging CAD Studio", "3D Brain Mesh Orthoviews", "Euler Characteristic Topology", "MRI Slice Inspector"],
  },
  stack: {
    title: "Architecture, Physics & Tech Stack | Frederick de Ruiter",
    description: "Explore the systems architecture colophon, Pretext layout physics engine benchmark, Web Audio synthesizer, and 12 engineering quality invariants.",
    path: "/stack",
    keywords: ["Next.js 16 Systems Architecture", "Pretext Layout Physics", "Web Audio API Synthesis", "Engineering Quality Invariants", "React 19 Server Stack"],
  },
  memeVault: {
    title: "Secret Meme Vault & Developer Soundboard",
    description: "Unlock developer and MedTech Easter eggs featuring synthesized Web Audio sound effects, secret achievement trophies, and interactive engineering cards.",
    path: "/arcade/meme-vault",
    keywords: ["Developer Meme Vault", "Web Audio Soundboard", "MedTech Easter Eggs", "Achievement Trophy Sandbox", "Interactive Retro Arcade"],
  },
  offline: {
    title: "Offline Recovery & Resilient Shell | Frederick de Ruiter",
    description: "Access precached application shells and core developer tools with offline connection recovery actions in this resilient Progressive Web App.",
    path: "/offline",
    keywords: ["Progressive Web App Shell", "Offline Developer Fallback", "Service Worker Cache", "Resilient Web Recovery"],
  },
  oxidizeMath: {
    title: "OxidizeMath: Verified Numerical Computing in Rust",
    description: "Explore OxidizeMath — a unified, memory-safe, verified numerical computation framework in Rust across scientific PDE and simulation domains.",
    path: "/case-studies/oxidizemath",
    keywords: ["Rust Scientific Computing", "Verified Numerical Solvers", "PDE Simulation Framework", "WebAssembly egui Studio"],
    ogType: "article",
  },
  laserLoonCaseStudy: {
    title: "Laser Loon Vector Asset Hub (SVG, AI) | Case Study",
    description: "Download source .ai, .eps, .pdf, .svg, and .png master vector files for the Laser Loon (MN Flag F277) with Creative Commons open distribution.",
    path: "/work/laser-loon",
    keywords: ["Laser Loon Vector Download", "Minnesota State Flag F277", "Open Source Vector Master Files", "Creative Commons Asset Hub", "Graphic Design Case Study"],
    ogType: "article",
  },
  sonosNetworkController: {
    title: "Sonos Controller: Local UPnP IoT Engine | Case Study",
    description: "Explore Sonos Network Controller — a lightweight, local-network control plane and REST API for Sonos speakers bypassing cloud intermediaries.",
    path: "/case-studies/sonos-network-controller",
    keywords: ["Sonos Local Control Plane", "Python FastAPI UPnP", "IoT Network Reverse Engineering", "AsyncIO Smart Speaker API"],
    ogType: "article",
  },
  clintrials: {
    title: "clintrials: Adaptive Trial Biostats WASM | Case Study",
    description: "Explore clintrials — an adaptive clinical trial design and biostatistical simulation engine powered by Pyodide WebAssembly workers.",
    path: "/case-studies/clintrials",
    keywords: ["Adaptive Clinical Trial Design", "Pyodide WebAssembly Biostats", "CRM Simulation Algorithm", "In Silico Trial Modeling"],
    ogType: "article",
  },
  equiposeRandomization: {
    title: "Equipose Randomization: Clinical Trial | Case Study",
    description: "Explore Equipose — a client-side clinical trial randomization engine with deterministic Mersenne Twister transpilation across R, Python, and SAS.",
    path: "/case-studies/equipose-randomization",
    keywords: ["Clinical Trial Randomization Engine", "Deterministic Mersenne Twister", "Multi-Language Transpiler", "CDISC ADaM Compliance", "Angular", "Web Workers"],
    ogType: "article",
  },
  lambdaWave: {
    title: "Lambda-Wave: Real-Time SGRT FMCW Radar | Case Study",
    description: "Explore Lambda-Wave — a safety-critical FMCW radar pipeline for SGRT respiratory motion tracking built with Haskell, C++, and IEC 62304 Class C.",
    path: "/case-studies/lambda-wave",
    keywords: ["SGRT FMCW Radar System", "Haskell DSP Pipeline", "IEC 62304 Medical Device Software", "Real-Time Respiratory Tracking", "Biomedical Radar"],
    ogType: "article",
  },
  duckDeploy: {
    title: "DuckDeploy: Schema UI Synthesis Compiler | Case Study",
    description: "Explore DuckDeploy — a schema-driven dynamic UI synthesis engine compiling JSON Schema manifests into polymorphic form state via Web Workers.",
    path: "/case-studies/duckdeploy",
    keywords: ["JSON Schema UI Compiler", "Polymorphic State Machine", "Web Worker Form Synthesis", "TypeScript Dynamic UI", "Dynamic Form State"],
    ogType: "article",
  },
  cardiacRiskModeling: {
    title: "Cardiac Risk Modeling: Clinical ML | Case Study",
    description: "Explore a clinical tabular ML pipeline with adversarial validation, leak-free Stratified OOF cross-validation, and calibrated risk scoring.",
    path: "/case-studies/cardiac-risk-modeling",
    keywords: ["Clinical Tabular ML Pipeline", "Adversarial Validation", "Stratified Cross-Validation", "LightGBM Risk Calibration", "Healthcare Analytics"],
    ogType: "article",
  },
  fourGlory: {
    title: "4Glory: Real-Time Sports Analytics & EPA | Case Study",
    description: "Explore 4Glory — a real-time sports prediction and evaluation engine computing play-by-play Expected Points Added and Monte Carlo simulations.",
    path: "/case-studies/4glory",
    keywords: ["Real-Time Sports Analytics", "Expected Points Added EPA", "Monte Carlo Game Simulation", "High-Throughput Data Pipeline", "Basketball Outcome Prediction"],
    ogType: "article",
  },
  crfXl: {
    title: "CRF.xl: Spreadsheet to CDISC CRF Compiler | Case Study",
    description: "Explore CRF.xl — a spreadsheet compiler converting clinical protocol workbooks into CDISC CDASH CRFs and ODM-XML exports with AST derivations.",
    path: "/case-studies/crf-xl",
    keywords: ["Spreadsheet to CDISC Compiler", "CDASH Protocol Workbook Parser", "ODM-XML Export Engine", "AST Derivation Logic", "Clinical Forms"],
    ogType: "article",
  },
  promptOps: {
    title: "PromptOps: LLM Prompt Orchestration & Evals | Case Study",
    description: "Explore PromptOps — an LLM prompt orchestration framework featuring deterministic evaluation gates, semantic versioning, and drift detection.",
    path: "/case-studies/promptops",
    keywords: ["LLM Prompt Orchestration", "Deterministic Evaluation Gates", "Prompt Semantic Versioning", "AI Pipeline Drift Detection", "Prompt Engineering"],
    ogType: "article",
  },
};

/**
 * Helper to construct standardized Next.js Metadata for any route configuration.
 */
export function buildRouteMetadata(config: RouteMetaConfig): Metadata {
  const url = `${SITE_BASE_URL}${config.path}`;

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
      title: `${config.title} | Frederick de Ruiter`,
      description: config.description,
      siteName: "Frederick de Ruiter Portfolio",
    },
    twitter: {
      card: "summary_large_image",
      title: `${config.title} | Frederick de Ruiter`,
      description: config.description,
      creator: "@laser_loon",
    },
  };
}
