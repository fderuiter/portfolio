"use client";

import { BackgroundBeamsWithCollision } from "@/components/Hero";
import { BentoGrid, Card, CardTitle, CardDescription } from "@/components/BentoGrid";
import { Terminal, AnimatedSpan, TypingAnimation } from "@/components/Terminal";
import { TextReveal } from "@/components/TextReveal";
import { AnimatedGridPattern } from "@/components/AnimatedGridPattern";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";

export default function UISandboxPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* 1. Hero */}
      <BackgroundBeamsWithCollision className="h-[50vh]">
        <h1 className="text-4xl md:text-6xl font-bold text-center relative z-20">
          Aceternity <br /> <span className="text-blue-500">Beams Collision</span>
        </h1>
      </BackgroundBeamsWithCollision>

      {/* 2. Magic UI: Animated Grid Pattern */}
      <div className="relative h-[30vh] flex items-center justify-center overflow-hidden border-t border-b border-neutral-800">
        <AnimatedGridPattern
          numSquares={30}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={1}
          className="fill-white stroke-neutral-500"
        />
        <h2 className="text-2xl z-10 text-neutral-300">Animated Grid Pattern</h2>
      </div>

      {/* 2.5. Garmin Watch Simulator Section */}
      <div className="py-16 flex flex-col justify-center items-center bg-zinc-950 border-b border-neutral-800">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 font-mono text-brand-cyan tracking-tight">
          Garmin Watch Game Simulator
        </h2>
        <p className="text-xs text-zinc-400 max-w-md text-center mb-6 px-4">
          Operate keys (UP, DOWN, LIGHT) locally. Keyboard boundaries ensure parent window does not scroll, and spotlight search modal (Cmd+K) ignores keystrokes inside the watch container.
        </p>
        <div className="max-w-md w-full px-4">
          <GarminWatchSimulator />
        </div>
      </div>

      {/* 3. Magic UI: Terminal */}
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

      {/* 4. Magic UI: Text Reveal */}
      <div className="border-b border-neutral-800">
        <TextReveal>
          Gamifying the discovery of AI contexts and unlocking advanced systems architectures.
        </TextReveal>
      </div>

      {/* 5. Aceternity: Bento Grid with Glare Cards */}
      <div className="py-20 bg-neutral-950">
        <h2 className="text-3xl font-bold text-center mb-10">Bento Grid with Glare Cards</h2>
        <BentoGrid className="max-w-4xl mx-auto px-4">
          <Card>
            <CardTitle>Project Alpha</CardTitle>
            <CardDescription>A high-performance system for complex calculations.</CardDescription>
          </Card>
          <Card className="md:col-span-2 md:row-span-2">
            <CardTitle className="text-2xl text-brand-cyan">Laser Loon</CardTitle>
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
