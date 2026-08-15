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
  arcade: {
    title: "Engineering Arcade Hub & Systems Simulators",
    description: "Playable canvas physics engines, formal verification logic puzzles, embedded Monkey C simulators, and CDISC compliance arcades built with zero external gaming frameworks.",
    path: "/arcade",
    keywords: ["Arcade Games", "Canvas Physics", "Next.js Games", "Formal Verification", "Monkey C", "CDISC", "TypeScript"],
  },
  laserLoon: {
    title: "Laser Loon: Cryo Bug Hunter | Physics Arcade",
    description: "Control a cybernetic Canadian Loon. Aim laser beams and launch cryo ice blocks with 2D Newtonian physics to vaporize runtime exceptions and bugs.",
    path: "/arcade/laser-loon",
    keywords: ["Laser Loon", "Canvas Shooter", "Physics Engine", "TypeScript Game", "Raycasting", "Particle System"],
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
  transparency: {
    title: "Platform Transparency Hub | Real-Time Telemetry",
    description: "Verifiable operational metrics, live security telemetry, rate-limiting audit logs, and build reliability statistics.",
    path: "/transparency",
    keywords: ["Transparency", "Telemetry", "Audit Logs", "Security Telemetry", "System Health", "Observability"],
  },
  schedule: {
    title: "Schedule 1:1 Systems Consultation | Frederick de Ruiter",
    description: "Book a direct 1:1 technical sync or systems architecture consultation on Google Calendar with Principal Systems Engineer Frederick de Ruiter.",
    path: "/schedule",
    keywords: ["Schedule Consultation", "1:1 Technical Sync", "Systems Engineering", "Google Calendar", "Frederick de Ruiter"],
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
