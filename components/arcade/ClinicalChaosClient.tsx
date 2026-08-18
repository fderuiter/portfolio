"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import Link from "next/link";
import {
  IconShieldCheck,
  IconFileText,
  IconAlertTriangle,
  IconArrowLeft,
} from "@tabler/icons-react";

const ClinicalTrialChaosLoader = () =>
  import("@/components/ClinicalTrialChaos").then((mod) => mod.ClinicalTrialChaos);

const DynamicClinicalTrialChaos = dynamic(ClinicalTrialChaosLoader, {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center p-8 min-h-[380px] font-mono text-xs text-zinc-500 animate-pulse">
      <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4" />
      <span>ALIGNING CDISC SDTM COMPLIANCE ENGINE...</span>
    </div>
  ),
});

export const ClinicalChaosClient: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6 border-b border-zinc-800/80 pb-4 flex-wrap">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
            <Link
              href="/arcade"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <IconArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Arcade Hub</span>
            </Link>
            <span className="text-zinc-700 hidden sm:inline">|</span>
            <Breadcrumbs
              items={[
                { label: "Arcade Hub", href: "/arcade" },
                { label: "Clinical Trial Chaos" },
              ]}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              CDISC SDTM / 21 CFR Part 11 Arcade
            </span>
          </div>
        </div>

        {/* Title Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <IconShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-mono text-white tracking-tight">
                Clinical Trial Chaos: <span className="text-emerald-400">CDISC Compliance</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1">
                Fast-paced compliance arcade. Map clinical variables across SDTM domains (DM, VS, AE, LB), sign electronic submissions, and survive FDA auditor scrutiny.
              </p>
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/90 p-4 sm:p-6 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
          <PlayCabinet
            title="Clinical Trial Chaos: CDISC Compliance"
            subtitle="21 CFR Part 11 Compliance & Domain Mapper"
            accentColor="emerald"
            icon={<IconShieldCheck className="w-8 h-8 text-emerald-400" />}
            instructions="Ingest CDISC SDTM/ADaM clinical observations, execute 21 CFR Part 11 electronic signatures with intent verification, and resolve site audit queries under inspection time pressure."
            controls={[
              { key: "Click", action: "Fix Obs / Map SDTM" },
              { key: "Space", action: "Power-up" },
              { key: "Sign", action: "FDA Submission" },
            ]}
            importComponent={ClinicalTrialChaosLoader}
          >
            <DynamicClinicalTrialChaos />
          </PlayCabinet>
        </div>

        {/* Instructions & Controls Reference */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs text-zinc-400">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
              <IconFileText className="w-4 h-4" />
              <span>Standardize CDISC Data</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Click invalid observations on active subject packets to convert non-standard units (e.g. lbs to kg) and format timestamps to ISO-8601 standard.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-brand-cyan font-bold mb-2">
              <IconShieldCheck className="w-4 h-4" />
              <span>21 CFR Electronic Signatures</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Route packets to stations (1: DM, 2: VS, 3: AE, 4: LB) and authenticate electronic signatures with meaningful submission intent before the conveyor expires.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold mb-2">
              <IconAlertTriangle className="w-4 h-4" />
              <span>FDA Auditor &amp; Form 483</span>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Expired records or fraudulent non-compliant submissions raise auditor suspicion. If suspicion reaches 100%, an FDA Form 483 warning is issued and the trial is terminated!
            </p>
          </div>
        </div>

        {/* Sequential Next / Previous Navigation */}
        <NextPrevNav
          prev={{
            title: "Garmin 32KB Memory Runner",
            href: "/arcade/garmin-watch",
            label: "Previous Game",
            tag: "Embedded Simulator",
          }}
          next={{
            title: "Retro Labyrinth",
            href: "/arcade/retro-labyrinth",
            label: "Next Game",
            tag: "Graveyard Roguelike",
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
