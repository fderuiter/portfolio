"use client";

import React from "react";
import Link from "next/link";
import { LaserLoon } from "@/components/LaserLoon";
import {
  IconArrowLeft,
  IconCrosshair,
  IconSnowflake,
  IconFlame,
} from "@tabler/icons-react";

export default function LaserLoonPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-4">
          <Link
            href="/arcade"
            className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-brand-cyan transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to Arcade Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Physics Arcade / Canvas Shooter
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-brand-cyan">
              <IconCrosshair className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                Laser Loon: <span className="text-brand-cyan">Cryo Bug Hunter</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Control a cybernetic Canadian Loon. Aim lasers and launch ice blocks to vaporize runtime errors and frozen bugs.
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)]">
          <LaserLoon />
        </div>

        {/* Instructions & Controls Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-brand-cyan font-bold mb-2">
              <IconCrosshair className="w-4 h-4" />
              <span>Aiming &amp; Shooting</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Move cursor over canvas to aim the Loon&apos;s laser reticle. Click or hold to fire weapon pulses. In Sandbox mode, drag the Loon to reposition.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold mb-2">
              <IconSnowflake className="w-4 h-4" />
              <span>Ice Cannon Physics</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Equip Ice Cannon to launch spinning ice projectiles. Colliding with bugs freezes them; subsequent laser hits shatter them for 2× combo points.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <IconFlame className="w-4 h-4" />
              <span>Combos &amp; Multipliers</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Chain rapid eliminations within 2.2 seconds to ramp combo multipliers up to 4×. High scores are automatically persisted locally.
            </p>
          </div>
        </div>

        {/* Arcade Switcher Footer */}
        <div className="mt-12 pt-6 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <span className="text-zinc-500">More Arcade Simulators:</span>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/arcade/quasi-puzzler"
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-purple-300 hover:border-purple-500/40 transition"
            >
              Quasi-Perfect Puzzler →
            </Link>
            <Link
              href="/arcade/garmin-watch"
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-amber-300 hover:border-amber-500/40 transition"
            >
              Garmin Watch Simulator →
            </Link>
            <Link
              href="/arcade/clinical-chaos"
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-emerald-300 hover:border-emerald-500/40 transition"
            >
              Clinical Trial Chaos →
            </Link>
            <Link
              href="/arcade/retro-labyrinth"
              className="px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:text-rose-300 hover:border-rose-500/40 transition"
            >
              Retro Labyrinth →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
