"use client";

import Link from "next/link";
import { BackgroundBeamsWithCollision } from "@/components/Hero";
import { BentoGrid, Card, CardTitle, CardDescription } from "@/components/BentoGrid";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/Terminal";
import { TextReveal } from "@/components/TextReveal";
import { AnimatedGridPattern } from "@/components/AnimatedGridPattern";
import {
  IconArrowRight,
  IconCrosshair,
  IconBrain,
  IconCpu,
  IconShieldCheck,
  IconDeviceGamepad2,
} from "@tabler/icons-react";

export default function UISandboxPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pt-24">
      {/* 1. Hero */}
      <BackgroundBeamsWithCollision className="h-[40vh]">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center relative z-20 font-mono tracking-tight">
            Creative Physics <br /> <span className="text-brand-cyan">&amp; Component Sandbox</span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-3 text-center max-w-md">
            Interactive physics, canvas rendering experiments, and modern UI components.
          </p>

          <Link
            href="/arcade"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-cyan text-black font-mono text-xs font-extrabold hover:bg-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <span>Visit Full Arcade Hub</span>
            <IconArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </BackgroundBeamsWithCollision>

      {/* 2. Direct Game Links Grid */}
      <section className="py-12 px-4 max-w-5xl mx-auto border-t border-neutral-800">
        <h2 className="text-xl font-bold font-mono text-white mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></span>
          Dedicated Arcade Game Pages
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
          <Link
            href="/arcade/laser-loon"
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-cyan-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2 text-cyan-400 font-bold">
              <IconCrosshair className="w-4 h-4" />
              <span>Laser Loon</span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-3">
              Physics canvas shooter with loon laser eyes and ice projectile mechanics.
            </p>
            <span className="text-brand-cyan text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Play Game →
            </span>
          </Link>

          <Link
            href="/arcade/quasi-puzzler"
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-purple-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2 text-purple-400 font-bold">
              <IconBrain className="w-4 h-4" />
              <span>Quasi-Perfect Puzzler</span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-3">
              Lean 4 inductive proof tactics arcade with language server RAM limits.
            </p>
            <span className="text-purple-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Play Game →
            </span>
          </Link>

          <Link
            href="/arcade/garmin-watch"
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2 text-amber-400 font-bold">
              <IconCpu className="w-4 h-4" />
              <span>Garmin Watch 32KB</span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-3">
              Circular 280×280 smartwatch simulator with 32KB RAM &amp; GC freezes.
            </p>
            <span className="text-amber-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Play Game →
            </span>
          </Link>

          <Link
            href="/arcade/clinical-chaos"
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-emerald-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2 text-emerald-400 font-bold">
              <IconShieldCheck className="w-4 h-4" />
              <span>Clinical Trial Chaos</span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-3">
              CDISC SDTM mapping &amp; 21 CFR Part 11 electronic signature compliance arcade.
            </p>
            <span className="text-emerald-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Play Game →
            </span>
          </Link>

          <Link
            href="/arcade/retro-labyrinth"
            className="p-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:border-rose-500/50 transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center gap-2.5 mb-2 text-rose-400 font-bold">
              <IconDeviceGamepad2 className="w-4 h-4" />
              <span>Retro Labyrinth</span>
            </div>
            <p className="text-zinc-400 text-[11px] mb-3">
              Graveyard roguelike with TSP moving walls, developer weapons, and 3D boss.
            </p>
            <span className="text-rose-400 text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Play Game →
            </span>
          </Link>
        </div>
      </section>

      {/* 3. Magic UI: Animated Grid Pattern */}
      <div className="relative h-[25vh] flex items-center justify-center overflow-hidden border-t border-b border-neutral-800">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className="fill-white stroke-neutral-500"
        />
        <h2 className="text-2xl z-10 text-neutral-300 font-mono">Animated Grid Pattern</h2>
      </div>

      {/* 4. Magic UI: Terminal */}
      <div className="py-20 flex justify-center items-center bg-neutral-900 border-b border-neutral-800">
        <Terminal>
          <TypingAnimation>&gt; pnpm dlx shadcn@latest init</TypingAnimation>
          <AnimatedSpan className="text-green-500">
            ✔ Preflight checks.
          </AnimatedSpan>
          <AnimatedSpan className="text-green-500">
            ✔ Verifying framework. Found Next.js.
          </AnimatedSpan>
          <TypingAnimation className="text-blue-500">
            Success! Project initialization completed.
          </TypingAnimation>
        </Terminal>
      </div>

      {/* 5. Magic UI: Text Reveal */}
      <div className="border-b border-neutral-800">
        <TextReveal>
          Gamifying the discovery of AI contexts and unlocking advanced systems architectures.
        </TextReveal>
      </div>

      {/* 6. Bento Grid with Glare Cards */}
      <div className="py-20 bg-neutral-950">
        <h2 className="text-3xl font-bold text-center mb-10 font-mono">Bento Grid with Glare Cards</h2>
        <BentoGrid className="max-w-4xl mx-auto px-4">
          <Card>
            <CardTitle>Project Alpha</CardTitle>
            <CardDescription>A high-performance system for complex calculations.</CardDescription>
          </Card>
          <Card className="md:col-span-2 md:row-span-2">
            <CardTitle className="text-2xl text-brand-cyan">Laser Loon &amp; UI Physics</CardTitle>
            <CardDescription className="text-sm mt-4">
              A viral, interactive physics experiment featuring a chaotic loon equipped with laser eyes. Designed to explore user engagement through unexpected, playful animations rather than standard UI forms. Proves that engineering doesn&apos;t always have to be so serious!
            </CardDescription>
          </Card>
          <Card>
            <CardTitle>QRCraftly</CardTitle>
            <CardDescription>Advanced code generation and context modeling for modern AI.</CardDescription>
          </Card>
        </BentoGrid>
      </div>
    </div>
  );
}
