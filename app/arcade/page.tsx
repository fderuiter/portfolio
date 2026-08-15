"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  IconCrosshair,
  IconBrain,
  IconCpu,
  IconShieldCheck,
  IconDeviceGamepad2,
  IconArrowRight,
  IconTrophy,
  IconSparkles,
  IconPlayerPlay,
  IconBone,
} from "@tabler/icons-react";

interface ArcadeGameCard {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  genre: string;
  description: string;
  mechanics: string[];
  techStack: string[];
  icon: React.ReactNode;
  accentColor: string;
  borderHover: string;
  badgeBg: string;
  storageKey?: string;
  route: string;
}

const subscribeStorage = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};

const getScore = (key?: string) => () => {
  if (!key || typeof window === "undefined") return "0";
  try {
    return localStorage.getItem(key) || "0";
  } catch {
    return "0";
  }
};

const getServerScore = () => "0";

const GAMES: ArcadeGameCard[] = [
  {
    id: "working-with-duck",
    slug: "working-with-duck",
    title: "Working With Duck",
    subtitle: "Pet Simulation & Multitasking Arcade",
    genre: "Pet Simulation",
    description:
      "Balance writing code against managing your autonomous Golden Retriever puppy, Duck. Toss toys to save portfolio hazards, scrub belly rubs during the flop, sprint in the Dog Park, and tuck Duck in for nap time.",
    mechanics: ["Autonomous Dog AI", "Tug-of-War Multipliers", "Dog Park Whistle Recall", "Polaroid Scrapbook"],
    techStack: ["HTML5 Canvas 2D", "Web Audio Synthesizer", "Deterministic State Machine"],
    icon: <IconBone className="w-6 h-6 text-amber-400" />,
    accentColor: "from-amber-500/20 via-amber-500/5 to-transparent",
    borderHover: "hover:border-amber-400/50",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    storageKey: "working_with_duck_high_score",
    route: "/arcade/working-with-duck",
  },
  {
    id: "laser-loon",
    slug: "laser-loon",
    title: "Laser Loon: Cryo Bug Hunter",
    subtitle: "Physics Arcade / Canvas Laser Shooter",
    genre: "Physics Arcade",
    description:
      "Control an iconic Canadian Loon equipped with cybernetic laser eyes. Blast runtime exceptions, frozen bugs, and memory leaks with real-time raycasting and ice cannon physics.",
    mechanics: ["Raycast Collision", "Cryo Freezing", "Combo Multipliers", "Screen Shake FX"],
    techStack: ["HTML5 Canvas", "Web Audio API", "Deterministic Vector Physics"],
    icon: <IconCrosshair className="w-6 h-6 text-brand-cyan" />,
    accentColor: "from-cyan-500/20 via-cyan-500/5 to-transparent",
    borderHover: "hover:border-cyan-400/50",
    badgeBg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    storageKey: "laser_loon_high_score",
    route: "/arcade/laser-loon",
  },
  {
    id: "quasi-puzzler",
    slug: "quasi-puzzler",
    title: "Quasi-Perfect Puzzler",
    subtitle: "Formal Verification Logic Puzzle Arcade",
    genre: "Formal Verification",
    description:
      "Lean-style interactive proof tactics arcade. Construct inductive AST proofs, discharge hypotheses, and manage severe proof-engine RAM limits without conceding to sorry.",
    mechanics: ["AST Expression Tree", "Proof Tactics (intro, rw, simp)", "RAM Exhaustion OOM", "Morality Scoring"],
    techStack: ["TypeScript AST", "Interactive Drag & Drop", "Lean 4 Engine Sim"],
    icon: <IconBrain className="w-6 h-6 text-purple-400" />,
    accentColor: "from-purple-500/20 via-purple-500/5 to-transparent",
    borderHover: "hover:border-purple-400/50",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    storageKey: "quasi_perfect_puzzler_progress_v1",
    route: "/arcade/quasi-puzzler",
  },
  {
    id: "garmin-watch",
    slug: "garmin-watch",
    title: "Garmin Connect IQ 32KB Memory Runner",
    subtitle: "Embedded Systems Engineering Simulator",
    genre: "Embedded Systems",
    description:
      "Circular 280×280 smartwatch simulator where you navigate severe 32KB RAM constraints, manage garbage collection (GC) freezes, and wipe thermal condensation in real time.",
    mechanics: ["Circular LCD 280×280", "32KB Monkey C RAM Limit", "500ms GC Freeze", "Overheat Fog Wiping"],
    techStack: ["HTML5 Canvas", "Piezo Audio Synthesis", "Embedded State Engine"],
    icon: <IconCpu className="w-6 h-6 text-amber-400" />,
    accentColor: "from-amber-500/20 via-amber-500/5 to-transparent",
    borderHover: "hover:border-amber-400/50",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    storageKey: "garmin_simulator_high_score",
    route: "/arcade/garmin-watch",
  },
  {
    id: "clinical-chaos",
    slug: "clinical-chaos",
    title: "Clinical Trial Chaos: CDISC Compliance",
    subtitle: "21 CFR Part 11 Compliance & Time Management Arcade",
    genre: "Compliance Arcade",
    description:
      "Map CDISC SDTM/ADaM clinical observations, execute 21 CFR Part 11 electronic signatures with intent verification, and resolve queries before the FDA inspection clock expires.",
    mechanics: ["CDISC SDTM Domains (DM, VS, AE, LB)", "21 CFR § 11 Signatures", "FDA Auditor Patrol AI", "Protocol Amendments"],
    techStack: ["FDA Compliance Sim", "Conveyor Belt Physics", "Web Audio Alarms"],
    icon: <IconShieldCheck className="w-6 h-6 text-emerald-400" />,
    accentColor: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    borderHover: "hover:border-emerald-400/50",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    storageKey: "clinical_chaos_highscore",
    route: "/arcade/clinical-chaos",
  },
  {
    id: "retro-labyrinth",
    slug: "retro-labyrinth",
    title: "Retro Labyrinth: Graveyard Roguelike",
    subtitle: "Dungeon Crawler & Developer Roguelike",
    genre: "Dungeon Roguelike",
    description:
      "Explore abandoned repositories in a retro CRT dungeon crawler. Traverse Traveling Salesperson dynamic shifting walls, wield developer weapons (npm install, git push -f), and defeat the 3D FaceForge boss.",
    mechanics: ["TSP Dynamic Mazes", "FOV Fog-of-War", "Developer Weapons Inventory", "3D Wireframe Boss"],
    techStack: ["CRT Canvas Filter", "Procedural Dungeon Gen", "Matrix 3D Math"],
    icon: <IconDeviceGamepad2 className="w-6 h-6 text-rose-400" />,
    accentColor: "from-rose-500/20 via-rose-500/5 to-transparent",
    borderHover: "hover:border-rose-400/50",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    storageKey: "retro_labyrinth_highscore",
    route: "/arcade/retro-labyrinth",
  },
];

function GameCard({ game, index }: { game: ArcadeGameCard; index: number }) {
  const rawScore = useSyncExternalStore(
    subscribeStorage,
    getScore(game.storageKey),
    getServerScore
  );
  
  let formattedScore = rawScore;
  if (game.id === "quasi-puzzler" && rawScore !== "0") {
    try {
      const parsed = JSON.parse(rawScore);
      const count = Object.keys(parsed?.completedLevels || {}).length;
      formattedScore = `${count} / 5 Proofs`;
    } catch {
      formattedScore = "Progress Saved";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`group relative flex flex-col justify-between rounded-3xl border border-zinc-800/80 bg-zinc-900/40 p-6 md:p-8 backdrop-blur-xl transition-all duration-300 ${game.borderHover} hover:shadow-[0_0_30px_rgba(0,0,0,0.8)]`}
    >
      {/* Ambient background glow on card */}
      <div
        className={`absolute inset-0 rounded-3xl bg-gradient-to-b ${game.accentColor} opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none`}
      />

      <div className="relative z-10">
        {/* Top Badges & Icon */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/80 shadow-inner">
              {game.icon}
            </div>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border ${game.badgeBg}`}>
                {game.genre}
              </span>
            </div>
          </div>

          {formattedScore && formattedScore !== "0" && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-300 text-xs font-mono">
              <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">{formattedScore}</span>
            </div>
          )}
        </div>

        {/* Title & Description */}
        <h2 className="text-xl md:text-2xl font-bold font-mono tracking-tight text-white group-hover:text-brand-cyan transition-colors">
          {game.title}
        </h2>
        <p className="mt-1 text-xs font-mono text-zinc-400 font-medium">{game.subtitle}</p>

        <p className="mt-4 text-xs md:text-sm text-zinc-300 leading-relaxed font-sans">
          {game.description}
        </p>

        {/* Mechanics Chips */}
        <div className="mt-5">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block mb-2">
            Core Mechanics
          </span>
          <div className="flex flex-wrap gap-1.5">
            {game.mechanics.map((m) => (
              <span
                key={m}
                className="px-2 py-0.5 rounded-md bg-zinc-950/70 border border-zinc-800 text-[11px] font-mono text-zinc-400"
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Tech Stack Chips */}
        <div className="mt-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold block mb-2">
            Architecture
          </span>
          <div className="flex flex-wrap gap-1.5">
            {game.techStack.map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md bg-brand-cyan/5 border border-brand-cyan/20 text-[11px] font-mono text-brand-cyan/90"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <div className="relative z-10 mt-8 pt-4 border-t border-zinc-800/60 flex items-center justify-between">
        <span className="text-xs font-mono text-zinc-500">Zero External Libs · 60 FPS</span>
        <Link
          href={game.route}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-cyan text-black font-mono text-xs font-bold transition-all duration-200 hover:bg-white hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
        >
          <IconPlayerPlay className="w-3.5 h-3.5 fill-current" />
          <span>Launch Game</span>
          <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function ArcadePage() {
  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      {/* Top Ambient Glows */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[160px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-brand-blue/5 blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-4">
            <IconSparkles className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
            Interactive Systems &amp; Physics Arcade
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-mono tracking-tight text-white">
            Engineering <span className="text-brand-cyan">Arcade Hub</span>
          </h1>
          <p className="mt-4 text-sm md:text-base text-zinc-400 font-sans leading-relaxed">
            A suite of high-performance physics engines, formal verification logic puzzles,
            embedded memory simulators, and compliance arcades built with zero external gaming frameworks.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              🎮 <strong>6 Playable Games</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              🔊 <strong>Web Audio Synthesizer</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              ⚡ <strong>Deterministic Canvas Loops</strong>
            </span>
            <span className="px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
              🛡️ <strong>Zero External Game Engines</strong>
            </span>
          </div>
        </div>

        {/* Games Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GAMES.map((game, index) => (
            <GameCard key={game.id} game={game} index={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
