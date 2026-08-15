"use client";

import { BackgroundBeamsWithCollision } from "@/components/Hero";
import { BentoGrid, Card, CardTitle, CardDescription } from "@/components/BentoGrid";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/Terminal";
import { TextReveal } from "@/components/TextReveal";
import { AnimatedGridPattern } from "@/components/AnimatedGridPattern";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";
import { LaserLoon } from "@/components/LaserLoon";
import { QuasiPerfectPuzzler } from "@/components/QuasiPerfectPuzzler";
import { ClinicalTrialChaos } from "@/components/ClinicalTrialChaos";

export default function UISandboxPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden pt-24">
      {/* 1. Hero */}
      <BackgroundBeamsWithCollision className="h-[40vh]">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-center relative z-20 font-mono tracking-tight">
            Creative Physics <br /> <span className="text-brand-cyan">& Game Arcade</span>
          </h1>
          <p className="text-xs text-neutral-400 font-mono mt-3 text-center max-w-md">
            Interactive physics, canvas rendering engines, and retro game simulators built with zero external dependencies.
          </p>
        </div>
      </BackgroundBeamsWithCollision>

      {/* 2. Formal methods game scaffold */}
      <section id="quasi-puzzler" className="py-16 px-4 flex flex-col justify-center items-center bg-zinc-950 border-t border-neutral-800">
        <div className="max-w-3xl w-full">
          <QuasiPerfectPuzzler />
        </div>
      </section>

      {/* 3. Featured Game: Laser Loon Physics Arcade */}
      <section id="laser-loon" className="py-16 px-4 flex flex-col justify-center items-center bg-neutral-950 border-t border-b border-neutral-800">
        <div className="max-w-3xl w-full text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold mb-3">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Featured Interactive Physics Showcase
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold font-mono text-neutral-100 tracking-tight">
            Laser Loon: Bug Hunter
          </h2>
          <p className="text-xs text-neutral-400 max-w-xl mx-auto mt-2 leading-relaxed">
            A playful, high-performance canvas physics experiment featuring the iconic Canadian Loon with cybernetic laser eyes. Aim and vaporize bugs, memory leaks, and runtime exceptions.
          </p>
        </div>

        <div className="w-full max-w-3xl">
          <LaserLoon />
        </div>
      </section>

      {/* 4. Garmin Watch Simulator Section */}
      <section id="garmin-watch" className="py-16 flex flex-col justify-center items-center bg-zinc-950 border-b border-neutral-800">
        <div className="max-w-md w-full text-center mb-4 px-4">
          <h2 className="text-2xl md:text-3xl font-bold font-mono text-brand-cyan tracking-tight">
            Garmin Connect IQ 32KB Memory Runner
          </h2>
          <p className="text-xs text-zinc-400 mt-2">
            Survive severe 32KB RAM constraints, manage garbage collection freezes, and wipe thermal condensation on a 280×280 circular display.
          </p>
        </div>
        <div className="max-w-md w-full px-4">
          <GarminWatchSimulator />
        </div>
      </section>

      {/* 5. Clinical game scaffold */}
      <section id="clinical-chaos" className="py-16 px-4 flex flex-col justify-center items-center bg-neutral-950 border-b border-neutral-800">
        <div className="max-w-3xl w-full">
          <ClinicalTrialChaos />
        </div>
      </section>

      {/* 6. Magic UI: Animated Grid Pattern */}
      <div className="relative h-[25vh] flex items-center justify-center overflow-hidden border-b border-neutral-800">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className="fill-white stroke-neutral-500"
        />
        <h2 className="text-2xl z-10 text-neutral-300 font-mono">Animated Grid Pattern</h2>
      </div>

      {/* 7. Magic UI: Terminal */}
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

      {/* 8. Magic UI: Text Reveal */}
      <div className="border-b border-neutral-800">
        <TextReveal>
          Gamifying the discovery of AI contexts and unlocking advanced systems architectures.
        </TextReveal>
      </div>

      {/* 9. Aceternity: Bento Grid with Glare Cards */}
      <div className="py-20 bg-neutral-950">
        <h2 className="text-3xl font-bold text-center mb-10 font-mono">Bento Grid with Glare Cards</h2>
        <BentoGrid className="max-w-4xl mx-auto px-4">
          <Card>
            <CardTitle>Project Alpha</CardTitle>
            <CardDescription>A high-performance system for complex calculations.</CardDescription>
          </Card>
          <Card className="md:col-span-2 md:row-span-2">
            <CardTitle className="text-2xl text-brand-cyan">Laser Loon & UI Physics</CardTitle>
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
