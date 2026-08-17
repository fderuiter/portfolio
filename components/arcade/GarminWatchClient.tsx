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
import { GameOnboardingWizard } from "@/components/arcade/GameOnboardingWizard";
import { GarminWatchConfig } from "@/lib/game-config-schemas";

export const GarminWatchClient: React.FC = () => {
  const [config, setConfig] = useState<GarminWatchConfig | null>(null);
  const [wizardOpen, setWizardOpen] = useState(true);

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
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center min-h-[400px]">
          {config ? (
            <GarminWatchSimulator config={config} />
          ) : (
            <div className="text-center space-y-4 max-w-md mx-auto py-8 font-mono">
              <IconDeviceWatch className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
              <h2 className="text-xl font-bold text-white">Pre-Game Onboarding Required</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                This simulator conforms to the Unified Game Configuration standard. Please initialize your session using the onboarding setup wizard.
              </p>
              <button
                onClick={() => setWizardOpen(true)}
                className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all uppercase"
              >
                Configure &amp; Launch Setup
              </button>
            </div>
          )}
        </div>

        <GameOnboardingWizard
          gameId="garmin-watch"
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onComplete={(newConfig) => {
            setConfig(newConfig as GarminWatchConfig);
            setWizardOpen(false);
          }}
        />

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
