"use client";

import React from "react";
import { RetroLabyrinth } from "@/components/RetroLabyrinth";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import Link from "next/link";
import {
  IconDeviceGamepad2,
  IconCpu,
  IconRoute,
  IconShieldLock,
  IconArrowLeft,
} from "@tabler/icons-react";

export const RetroLabyrinthClient: React.FC = () => {
  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              href="/arcade"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-rose-400 transition-colors"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arcade Hub</span>
            </Link>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <Breadcrumbs
              items={[
                { label: "Arcade Hub", href: "/arcade" },
                { label: "Retro Labyrinth" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-rose-500/10 text-rose-300 border border-rose-500/30">
              Dungeon Roguelike / CRT Engine
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400">
              <IconDeviceGamepad2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                Retro Labyrinth: <span className="text-rose-400">Graveyard Roguelike</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Dungeon crawler exploring abandoned codebases. Navigate TSP dynamic shifting walls, wield developer weapons (npm install, git push -f), and defeat the 3D FaceForge boss.
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(244,63,94,0.1)] flex flex-col items-center">
          <RetroLabyrinth isMounted={true} />
        </div>

        {/* Instructions & Controls Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <IconRoute className="w-4 h-4" />
              <span>TSP Shifting Walls</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              In Room 1, maze walls calculate and recalculate the Traveling Salesperson tour as you move. Time your steps through purple barrier shifts to reach landmarks.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <IconCpu className="w-4 h-4" />
              <span>Developer Weapons</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Press <strong>1</strong> for npm install (AoE node_modules bomb), <strong>2</strong> for git push --force (clears all nearby bugs), or <strong>3</strong> for Stack Overflow (wildcard effects).
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
              <IconShieldLock className="w-4 h-4" />
              <span>3D Wireframe Boss</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              FaceForge in Room 3 projects real-time rotating 3D wireframe polyhedra. Evade projecting face-normals and utilize EMP bursts to stun rogue drones.
            </p>
          </div>
        </div>

        {/* Sequential Next / Previous Navigation */}
        <NextPrevNav
          prev={{
            title: "Clinical Trial Chaos",
            href: "/arcade/clinical-chaos",
            label: "Previous Game",
            tag: "Compliance Arcade",
          }}
          next={{
            title: "Working With Duck",
            href: "/arcade/working-with-duck",
            label: "Next Game",
            tag: "Pet Simulation Arcade",
          }}
          backToHub={{
            title: "All Arcade Games",
            href: "/arcade",
          }}
        />
      </div>
    </main>
  );
};
