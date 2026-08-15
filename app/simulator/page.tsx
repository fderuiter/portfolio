import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAudio } from "@/components/providers/AudioProvider";
import {
  IconArrowLeft,
  IconAward,
  IconCalendar,
  IconRefresh,
  IconCopy,
} from "@tabler/icons-react";
import { FieldManualButton } from "@/components/FieldManualButton";

interface Option {
  text: string;
  description?: string;
  points: { tech: number; alignment: number; ui: number; resilience: number };
  nextStep: string;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  options: Option[];
}

const branchingQuestions: Record<string, Question> = {
  welcome: {
    id: "welcome",
    title: "1. Define Your Target Profile",
    subtitle: "What is your primary focus when hiring engineering leaders?",
    badge: "Stage 1 · Profile Selection",
    options: [
      {
        text: "Raw Systems & Performance Maverick",
        description: "Low-overhead execution, memory optimization, robust backend databases, and blazing-fast microservices.",
        points: { tech: 50, alignment: 40, ui: 20, resilience: 45 },
        nextStep: "incident_triage",
      },
      {
        text: "Pixel-Perfect Frontend & UX Artisan",
        description: "Immersive user interaction, 60 FPS visual motion, flawless accessibility, and zero layout shift transitions.",
        points: { tech: 30, alignment: 50, ui: 50, resilience: 30 },
        nextStep: "incident_triage",
      },
    ],
  },
  incident_triage: {
    id: "incident_triage",
    title: "2. Live Incident Commander: Production Latency Spike",
    subtitle: "A critical payment webhook experiences a 500ms p99 latency spike and 2% connection pool timeouts under high load. What is your immediate mitigation strategy?",
    badge: "Stage 2 · Live Outage Triage",
    options: [
      {
        text: "Engage Distributed Circuit Breaker & Fallback Queue",
        description: "Gracefully buffer non-critical requests to secondary Redis queue, shed downstream load, and alert database pool orchestrators.",
        points: { tech: 45, alignment: 50, ui: 35, resilience: 50 },
        nextStep: "code_review",
      },
      {
        text: "Scale Neon Read-Replicas & Increase Pool Timeouts",
        description: "Increase serverless connection concurrency and dynamically redirect read queries away from the primary transactional instance.",
        points: { tech: 40, alignment: 40, ui: 25, resilience: 40 },
        nextStep: "code_review",
      },
    ],
  },
  code_review: {
    id: "code_review",
    title: "3. Code Review Speed Challenge",
    subtitle: "Reviewing a high-throughput async processing pipeline: which architectural safeguard takes absolute priority?",
    badge: "Stage 3 · Systems Review",
    options: [
      {
        text: "Enforce Exhaustive Idempotency Keys & Deduplication Window",
        description: "Guarantee that webhook retransmissions and network blips never cause double-writes or race conditions in Postgres.",
        points: { tech: 50, alignment: 50, ui: 30, resilience: 50 },
        nextStep: "final_eval",
      },
      {
        text: "Implement Client-Side Optimistic Updates with Rollback",
        description: "Deliver instant sub-10ms UI feedback while verifying transaction settlement asynchronously via server-sent events.",
        points: { tech: 35, alignment: 45, ui: 50, resilience: 35 },
        nextStep: "final_eval",
      },
    ],
  },
};

export default function RecruiterSimulator() {
  const { recordEvent } = useTelemetry();
  const { playNote, playSuccess } = useAudio();
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [copied, setCopied] = useState(false);

  // 1. Establish mount tracking
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasTrackedSession = sessionStorage.getItem("has_tracked_simulator_view_this_session");
      if (!hasTrackedSession) {
        sessionStorage.setItem("has_tracked_simulator_view_this_session", "true");
        recordEvent("/simulator", "page_view");
      }
    }
  }, [recordEvent]);

  // 2. Handle selection
  const handleSelectOption = (option: Option) => {
    recordEvent("/simulator", "project_click");
    playNote(659.25, 0.05);

    setAnswers((prev) => [...prev, option]);
    setHistory((prev) => [...prev, currentStep]);
    setCurrentStep(option.nextStep);

    if (option.nextStep === "final_eval") {
      playSuccess();
    }
  };

  // 3. Handle back
  const handleBack = () => {
    if (history.length === 0) return;
    playNote(440, 0.04);
    const prevStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setAnswers((prev) => prev.slice(0, -1));
    setCurrentStep(prevStep);
  };

  // 4. Reset Simulator
  const handleReset = () => {
    playNote(523.25, 0.04);
    setCurrentStep("welcome");
    setHistory([]);
    setAnswers([]);
  };

  // 5. Calculate Final Alignment Outcomes
  const getAlignmentProfile = useCallback(() => {
    if (answers.length < 2) {
      return {
        score: 88,
        title: "Principal Systems Architect",
        summary: "High-integrity architecture leader with deep mastery across resilient serverless Postgres backends, strict typesafety, and microsecond frontend responsiveness.",
        badge: "ARCHITECT ARCHETYPE: ZERO-DOWNTIME SAGE",
        stats: { systems: 95, ui: 90, resilience: 98, velocity: 92 },
      };
    }

    const firstChoice = answers[0];
    const isTech = firstChoice.text.includes("Maverick");

    if (isTech) {
      return {
        score: 98,
        title: "Elite Systems & Distributed Architect",
        summary: "Outstanding compatibility! Frederick brings enterprise expertise in serverless Postgres pooling, robust circuit breakers, strict automated testing, and sub-100ms API endpoints.",
        badge: "ARCHITECT ARCHETYPE: HIGH-THROUGHPUT TITAN",
        stats: { systems: 99, ui: 88, resilience: 98, velocity: 94 },
      };
    } else {
      return {
        score: 100,
        title: "Pixel-Perfect Frontend & Design Engineer",
        summary: "Dream alignment! Frederick seamlessly unites 60 FPS motion design, rigorous accessibility standards, and responsive micro-interactions with rock-solid full-stack infrastructure.",
        badge: "ARCHITECT ARCHETYPE: INTERACTIVE CRAFTSMAN",
        stats: { systems: 92, ui: 100, resilience: 94, velocity: 96 },
      };
    }
  }, [answers]);

  // Copy diagnostic card
  const handleCopyCard = useCallback(() => {
    const p = getAlignmentProfile();
    const text = `Candidate Alignment Report: Frederick (System Architect & Engineer)\nMatch Score: ${p.score}%\nArchetype: ${p.title}\nSystems: ${p.stats.systems}% | UI/UX: ${p.stats.ui}% | Resilience: ${p.stats.resilience}%`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    playNote(880, 0.05);
    setTimeout(() => setCopied(false), 2000);
  }, [getAlignmentProfile, playNote]);

  const profile = getAlignmentProfile();
  const currentQuestion = branchingQuestions[currentStep];

  return (
    <main className="min-h-screen bg-zinc-950 text-foreground pt-32 pb-24 px-6 md:px-12 lg:px-24 flex items-center justify-center relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto flex flex-col relative z-10">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3 flex-wrap">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse" />
              Interactive Engineering Leadership Simulator
            </div>
            <FieldManualButton manualId="simulator" label="Field Manual" />
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-neutral-100 to-brand-blue tracking-tight mb-2">
            Engineering Alignment Arcade
          </h1>
          <p className="text-xs font-mono text-zinc-400 tracking-wider uppercase max-w-lg mx-auto leading-relaxed">
            Gamified candidate compatibility assessment engine. Evaluate cultural, system, and design orientation instantly.
          </p>
        </header>

        {/* Card Container */}
        <div className="bg-zinc-900/40 border border-zinc-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl relative">
          <AnimatePresence mode="wait">
            {currentQuestion ? (
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col h-full"
              >
                {/* Step indicator */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-bold bg-brand-cyan/15 px-3 py-1 rounded-full border border-brand-cyan/35">
                    {currentQuestion.badge || "Compatibility Phase"}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Step {history.length + 1} of 3
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-xs md:text-sm text-zinc-400 mb-6 font-sans leading-relaxed">
                  {currentQuestion.subtitle}
                </p>

                {/* Option Buttons */}
                <div className="flex flex-col gap-3.5">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className="group flex flex-col items-start text-left p-4 md:p-5 bg-zinc-950/60 hover:bg-zinc-950 border border-zinc-800 hover:border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)] rounded-2xl transition-all duration-200 cursor-pointer w-full"
                    >
                      <div className="flex items-center gap-3 mb-1.5 w-full">
                        <span className="w-5 h-5 rounded-full border border-zinc-700 group-hover:border-brand-cyan flex items-center justify-center shrink-0 transition-colors bg-zinc-900">
                          <span className="w-2.5 h-2.5 rounded-full bg-brand-cyan opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100" />
                        </span>
                        <span className="font-semibold text-zinc-200 group-hover:text-white text-sm md:text-base transition-colors">
                          {option.text}
                        </span>
                      </div>
                      {option.description && (
                        <p className="text-xs text-zinc-500 pl-8 leading-relaxed group-hover:text-zinc-400 transition-colors">
                          {option.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                {/* Footer Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-zinc-800/40">
                  <button
                    onClick={handleBack}
                    disabled={history.length === 0}
                    className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-500 hover:text-zinc-300 disabled:opacity-0 transition-all cursor-pointer"
                  >
                    <IconArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 text-xs font-mono text-zinc-600 hover:text-zinc-400 transition-colors cursor-pointer"
                  >
                    <IconRefresh className="w-3.5 h-3.5" /> Restart
                  </button>
                </div>
              </motion.div>
            ) : (
              /* RESULTS SCREEN */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                {/* Compatibility Score Circle */}
                <div className="relative w-36 h-36 flex items-center justify-center mb-4">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-blue opacity-25 animate-pulse" />
                  <div className="absolute inset-2 bg-zinc-950 rounded-full" />

                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="rgba(39, 39, 42, 0.4)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="72"
                      cy="72"
                      r="60"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="377"
                      initial={{ strokeDashoffset: 377 }}
                      animate={{ strokeDashoffset: 377 - (377 * profile.score) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-white tracking-tighter">
                      {profile.score}%
                    </span>
                    <span className="text-[9px] font-mono uppercase text-brand-cyan font-bold tracking-widest">
                      MATCH
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 rounded-full border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold mb-2">
                  <IconAward className="w-4 h-4" /> {profile.badge}
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">
                  {profile.title}
                </h2>

                <p className="text-xs md:text-sm text-zinc-400 font-sans max-w-md leading-relaxed mb-6">
                  {profile.summary}
                </p>

                {/* Radar Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full mb-6 font-mono text-left">
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <span className="text-[9px] text-zinc-500 block uppercase">Systems Rigor</span>
                    <span className="text-sm font-bold text-brand-cyan">{profile.stats.systems}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <span className="text-[9px] text-zinc-500 block uppercase">UI/UX Craft</span>
                    <span className="text-sm font-bold text-emerald-400">{profile.stats.ui}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <span className="text-[9px] text-zinc-500 block uppercase">Resilience</span>
                    <span className="text-sm font-bold text-sky-400">{profile.stats.resilience}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-850">
                    <span className="text-[9px] text-zinc-500 block uppercase">Ship Speed</span>
                    <span className="text-sm font-bold text-amber-400">{profile.stats.velocity}%</span>
                  </div>
                </div>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                  <Link
                    href="/schedule"
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-cyan to-brand-blue text-zinc-950 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all cursor-pointer hover:scale-[1.02]"
                  >
                    <IconCalendar className="w-4 h-4" /> Schedule on Google Calendar
                  </Link>
                  <button
                    onClick={handleCopyCard}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <IconCopy className="w-4 h-4" /> {copied ? "Copied!" : "Copy Report"}
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    <IconRefresh className="w-4 h-4" /> Run Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  );
}
