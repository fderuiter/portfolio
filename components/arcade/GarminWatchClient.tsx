"use client";

import React, { useState } from "react";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import Link from "next/link";
import {
  IconCpu,
  IconBolt,
  IconFlame,
  IconDeviceWatch,
  IconArrowLeft,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { GameSetupWizard } from "@/components/arcade/GameSetupWizard";

export const GarminWatchClient: React.FC = () => {
  const [isSetupActive, setIsSetupActive] = useState(true);

  return (
    <main className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
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
                { label: "Garmin 32KB Runner" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
              Embedded Systems / Monkey C Simulator
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-400">
              <IconDeviceWatch className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                Garmin Connect IQ <span className="text-amber-400">32KB Memory Runner</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Circular 280×280 smartwatch simulator. Navigate severe 32KB RAM memory constraints, manage garbage collection (GC) freezes, and wipe thermal condensation.
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="relative overflow-hidden min-h-[480px] flex items-center justify-center rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.1)] flex flex-col items-center">
          <AnimatePresence mode="wait">
            {isSetupActive ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="w-full flex justify-center"
              >
                <GameSetupWizard
                  onSkip={() => setIsSetupActive(false)}
                  onComplete={() => setIsSetupActive(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="game"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col items-center"
              >
                <GarminWatchSimulator />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Instructions & Controls Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
              <IconCpu className="w-4 h-4" />
              <span>32KB RAM Constraint &amp; Jettison</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Every obstacle passed allocates variables onto the memory heap. Press <strong>DOWN</strong> or tap the bezel button to jettison variables before hitting the 32KB ceiling.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-purple-400 font-bold mb-2">
              <IconBolt className="w-4 h-4" />
              <span>Garbage Collector [GC] Freeze</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Press <strong>BACK / GC</strong> to trigger the garbage collector. GC cleans all dead memory allocations but introduces an authentic 500ms execution freeze!
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <IconFlame className="w-4 h-4" />
              <span>Thermal Fogging &amp; Screen Wiping</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              High CPU usage causes condensation fog on the circular display. Drag your finger or cursor over the watch lens or press <strong>W</strong> to wipe the fog clear.
            </p>
          </div>
        </div>

        {/* Sequential Next / Previous Navigation */}
        <NextPrevNav
          prev={{
            title: "Quasi-Perfect Puzzler",
            href: "/arcade/quasi-puzzler",
            label: "Previous Game",
            tag: "Formal Verification",
          }}
          next={{
            title: "Clinical Trial Chaos",
            href: "/arcade/clinical-chaos",
            label: "Next Game",
            tag: "Compliance Arcade",
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
