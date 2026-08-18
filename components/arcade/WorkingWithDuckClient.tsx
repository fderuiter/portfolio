"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import Link from "next/link";
import {
  IconBone,
  IconTrees,
  IconAlertTriangle,
  IconArrowLeft,
} from "@tabler/icons-react";

const WorkingWithDuckLoader = () =>
  import("@/components/WorkingWithDuck").then((mod) => mod.WorkingWithDuck);

const DynamicWorkingWithDuck = dynamic(WorkingWithDuckLoader, {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 min-h-[380px] font-mono text-xs text-zinc-500 animate-pulse">
      <div className="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mb-4" />
      <span>RETRIEVING DUCK STATE MACHINE...</span>
    </div>
  ),
});

export const WorkingWithDuckClient: React.FC = () => {
  return (
    <div className="w-full min-h-dvh bg-black text-white pt-4 pb-20 px-3 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              href="/arcade"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-amber-400 transition-colors"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arcade Hub</span>
            </Link>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <Breadcrumbs
              items={[
                { label: "Arcade Hub", href: "/arcade" },
                { label: "Working With Duck" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Pet Simulation / Multitasking Arcade
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <IconBone className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                Working With <span className="text-amber-400">Duck</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Balance shipping code deadlines against managing Duck — an autonomous, fluffy white golden retriever puppy.
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(251,191,36,0.08)]">
          <PlayCabinet
            gameId="working-with-duck"
            aspectRatio="16/9"
            title="Working With Duck"
            subtitle="Autonomous State Machine & Multitasking Simulation"
            accentColor="amber"
            icon={<IconBone className="w-8 h-8 text-amber-400" />}
            instructions="Balance code development against managing an autonomous Golden Retriever puppy, Duck. Features toy toss trajectories, real-time belly rub scrubbing, recall mechanics, and persistent scrapbook state."
            controls={[
              { key: "1-3", action: "Toss Toys" },
              { key: "4", action: "Trade Treats" },
              { key: "Space", action: "Steer Duck" },
            ]}
            importComponent={WorkingWithDuckLoader}
          >
            <DynamicWorkingWithDuck />
          </PlayCabinet>
        </div>

        {/* Instructions & Controls Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <IconBone className="w-4 h-4" />
              <span>Toys &amp; Ball Trades</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Press <strong>1-3</strong> to toss toys and redirect Duck away from portfolio hazards. Press <strong>4</strong> to trade treats when Duck does &ldquo;No Take, Only Throw!&rdquo;
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <IconAlertTriangle className="w-4 h-4" />
              <span>Potty Countdown &amp; Rubs</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              When the Bladder flashes, click &amp; drag Duck to the <strong>Back Door</strong> within 3.5s. When Duck flops on his back, scrub your cursor for belly rubs!
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <IconTrees className="w-4 h-4" />
              <span>Dog Park &amp; Multipliers</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Click <strong>Go to Dog Park</strong> to flick-throw the ball. Tap <strong>Spacebar</strong> to steer Duck around mud puddles and earn the 20-second Tired Puppy calm buff.
            </p>
          </div>
        </div>

        {/* Sequential Next / Previous Navigation */}
        <NextPrevNav
          prev={{
            title: "Retro Labyrinth",
            href: "/arcade/retro-labyrinth",
            label: "Previous Game",
            tag: "Graveyard Roguelike",
          }}
          next={{
            title: "Laser Loon: Quest for the State Flag",
            href: "/arcade/laser-loon",
            label: "Next Game",
            tag: "Civic Arcade Campaign",
          }}
          backToHub={{
            title: "All Arcade Games",
            href: "/arcade",
          }}
        />
      </div>
    </div>
  );
};
