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
    title: "CRF Studio: Next-Gen Clinical Form & Protocol Designer",
    description: "Zero-latency clinical trial form designer and EDC simulator with 12-column responsive layout, AST-powered edit checks, CDISC CDASH 2.2 / ODM-XML v1.3.2 compliance, and live publication aCRF overlays.",
    path: "/crf",
    keywords: ["CRF Studio", "Clinical Trial Designer", "CDISC CDASH", "ODM-XML", "EDC Simulator", "AST Edit Checks", "aCRF Overlays"],
  },
  arcade: {
    title: "Engineering Arcade Hub & Systems Simulators",
    description: "Playable canvas physics engines, formal verification logic puzzles, embedded Monkey C simulators, and CDISC compliance arcades built with zero external gaming frameworks.",
    path: "/arcade",
    keywords: ["Arcade Games", "Canvas Physics", "Next.js Games", "Formal Verification", "Monkey C", "CDISC", "TypeScript"],
  },
  laserLoon: {
    title: "Laser Loon: Quest for the State Flag | Physics Arcade & Campaign",
    description: "Pilot submission F277 Laser Loon on the Road to the Capitol. Aim crimson eye-lasers and cryo ice blocks to battle rival flags and bureaucratic red tape in this retro canvas shooter.",
    path: "/arcade/laser-loon",
    keywords: ["Laser Loon", "Minnesota State Flag", "F277", "Canvas Shooter", "Physics Engine", "TypeScript Game", "Raycasting", "Particle System"],
  },
  quasiPuzzler: {
    title: "Quasi-Perfect Puzzler: Formal Verification Arcade",
    description: "Apply Lean-inspired deductive proof tactics, solve AST expression trees, and avoid simulated kernel RAM exhaustion under real-time constraints.",
    path: "/arcade/quasi-puzzler",
    keywords: ["Formal Verification", "Lean Proofs", "AST Puzzles", "Deductive Logic", "Type Theory", "Canvas Game"],
  },
  garminWatch: {
    title: "Garmin Connect IQ 32KB Memory Runner | Embedded Simulator",
    description: "Survive strict 32KB RAM allocations, avoid garbage collection latency freezes, and prevent thermal overheating in this Monkey C smartwatch engineering simulator.",
    path: "/arcade/garmin-watch",
    keywords: ["Garmin Connect IQ", "Monkey C", "32KB RAM", "Embedded Systems", "Memory Profiling", "Retro Simulator"],
  },
  clinicalChaos: {
    title: "Clinical Trial Chaos: CDISC Compliance Arcade",
    description: "Fast-paced CDISC ODM/SDTM mapping and 21 CFR Part 11 electronic signature compliance arcade under relentless FDA audit scrutiny.",
    path: "/arcade/clinical-chaos",
    keywords: ["CDISC", "SDTM", "21 CFR Part 11", "Clinical Trials", "GxP Compliance", "FDA Audit Simulator"],
  },
  retroLabyrinth: {
    title: "Retro Labyrinth: Graveyard Roguelike",
    description: "Procedurally generated dungeon crawler through deprecated legacy codebases. Battle technical debt bosses, avoid memory leaks, and navigate dynamic TSP walls.",
    path: "/arcade/retro-labyrinth",
    keywords: ["Roguelike", "Procedural Generation", "Dungeon Crawler", "TSP Algorithm", "Wireframe 3D", "Canvas 2D"],
  },
  workingWithDuck: {
    title: "Working With Duck: Pet Simulation Arcade",
    description: "Multitasking developer simulation — balance critical production pull requests against Duck the puppy's zoomies, potty breaks, and belly rub demands.",
    path: "/arcade/working-with-duck",
    keywords: ["Pet Simulation", "Developer Humor", "Multitasking Arcade", "Puppy Management", "Canvas Animation"],
  },
  proof: {
    title: "Logical Proof Workspace | Interactive Formal Verification",
    description: "Interactive deductive logic workspace with live graph visualization, dual-mode CLI terminal, proof branch verification, and theorem validation.",
    path: "/proof",
    keywords: ["Formal Methods", "Theorem Proving", "Deductive Logic", "Graph Visualization", "CLI Terminal", "Logic Simulator"],
  },
  simulator: {
    title: "Engineering Alignment & Incident Simulator",
    description: "Interactive incident commander decision tree — navigate high-stress production outages, architectural dilemmas, and verify technical candidate compatibility.",
    path: "/simulator",
    keywords: ["Incident Commander", "Production Outage", "System Architecture", "Decision Tree", "Engineering Leadership"],
  },
  schedule: {
    title: "Schedule 1:1 Systems Consultation | Frederick de Ruiter",
    description: "Book a direct 1:1 technical sync or systems architecture consultation on Google Calendar with Principal Systems Engineer Frederick de Ruiter.",
    path: "/schedule",
    keywords: ["Schedule Consultation", "1:1 Technical Sync", "Systems Engineering", "Google Calendar", "Frederick de Ruiter"],
  },
  neuro: {
    title: "NeuroRecon: FreeSurfer Pipeline Simulator & QA Studio",
    description: "Interactive neuroimaging CAD workspace — repair 3D cortical surfaces, place intensity control points, resolve topological Euler defects, and slice 2D MRI orthoviews.",
    path: "/neuro",
    keywords: ["FreeSurfer", "Neuroimaging", "3D Brain Mesh", "MRI Slices", "Euler Characteristic", "Cortical Surface", "Post Processing", "Neuroinformatics"],
  },
  stack: {
    title: "Under the Hood: Architecture & Stack Overview | Frederick de Ruiter",
    description: "Interactive architecture colophon, layout physics benchmark (@chenglou/pretext), procedural Web Audio synthesizer, and 12 engineering quality invariants.",
    path: "/stack",
    keywords: ["Architecture", "Tech Stack", "Next.js 16", "React 19", "Turbopack", "Pretext", "Web Audio API", "Prisma 7", "Neon Database", "Invariants"],
  },
  memeVault: {
    title: "Secret Meme Vault & Developer Soundboard | Frederick de Ruiter",
    description: "Unlockable developer & MedTech secret room featuring synthesized Web Audio sound effects, Easter egg achievement trophies, and interactive engineering meme cards.",
    path: "/arcade/meme-vault",
    keywords: ["Developer Memes", "Easter Eggs", "Soundboard", "Web Audio API", "CDISC Humor", "Duck Mascot", "Retro Arcade"],
  },
  offline: {
    title: "Offline Fallback View | Frederick de Ruiter",
    description: "Dedicated offline application shell fallback view providing connection recovery actions and access to precached core tools.",
    path: "/offline",
    keywords: ["Offline", "PWA", "Service Worker", "Precached Shell", "Frederick de Ruiter"],
  },
  oxidizeMath: {
    title: "OxidizeMath Case Study | Technical Breakdown & Architecture",
    description: "Deep dive technical breakdown of OxidizeMath — a unified, memory-safe, verified numerical computation framework in Rust across scientific computing domains.",
    path: "/case-studies/oxidizemath",
    keywords: ["Rust", "Scientific Computing", "Simulation", "PDE Solver", "Formal Verification", "egui", "WebAssembly"],
    ogType: "article",
  },
  sonosNetworkController: {
    title: "Sonos Network Controller Case Study | Technical Breakdown & Architecture",
    description: "Deep dive technical breakdown of Sonos Network Controller — a lightweight, non-blocking async UPnP/SOAP control plane and REST API for Sonos speakers.",
    path: "/case-studies/sonos-network-controller",
    keywords: ["Python", "FastAPI", "UPnP", "Sonos", "HTMX", "AsyncIO", "Reverse Engineering", "IoT", "SOAP"],
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
