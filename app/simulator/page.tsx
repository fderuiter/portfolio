"use client";

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
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { NextPrevNav } from "@/components/ui/NextPrevNav";
import { PageLayout } from "@/components/PageLayout";

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

  useEffect(() => {
    recordEvent("simulator", "page_view");
  }, [recordEvent]);

  const handleSelectOption = useCallback(
    (option: Option) => {
      playNote(440 + answers.length * 110, 0.1);
      setAnswers((prev) => [...prev, option]);
      setHistory((prev) => [...prev, currentStep]);
      setCurrentStep(option.nextStep);

      recordEvent("simulator", "project_click");
      if (option.nextStep === "final_eval") {
        playSuccess();
      }
    },
    [answers.length, currentStep, playNote, playSuccess, recordEvent]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    const previousStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setAnswers((prev) => prev.slice(0, -1));
    setCurrentStep(previousStep);
  }, [history]);

  const handleReset = useCallback(() => {
    setHistory([]);
    setAnswers([]);
    setCurrentStep("welcome");
  }, []);

  const calculateProfile = useCallback(() => {
    const total = answers.reduce(
      (acc, curr) => ({
        tech: acc.tech + curr.points.tech,
        alignment: acc.alignment + curr.points.alignment,
        ui: acc.ui + curr.points.ui,
        resilience: acc.resilience + curr.points.resilience,
      }),
      { tech: 0, alignment: 0, ui: 0, resilience: 0 }
    );

    const matchScore = Math.min(99, Math.round((total.tech + total.alignment + total.resilience) / 3));

    if (total.tech > total.ui) {
      return {
        title: "Principal Systems Engineer & Distributed Architect",
        badge: "Deep Systems Match",
        summary: "You value relentless reliability, zero-overhead execution, low-latency data pipelines, and rock-solid architectural invariants.",
        score: matchScore,
        stats: { systems: 98, ui: 88, resilience: 99, velocity: 94 },
      };
    } else {
      return {
        title: "Lead Design Technologist & UX Systems Architect",
        badge: "Product & Motion Match",
        summary: "You value exquisite user experience, tactile physical simulations, 60 FPS motion fidelity, and obsessive attention to typographic detail.",
        score: matchScore,
        stats: { systems: 90, ui: 99, resilience: 92, velocity: 96 },
      };
    }
  }, [answers]);

  const profile = currentStep === "final_eval" ? calculateProfile() : null;

  const handleCopyCard = useCallback(() => {
    if (!profile) return;
    const reportText = `🏆 Engineering Alignment Assessment\nResult: ${profile.title} (${profile.score}% Match)\nSummary: ${profile.summary}\nSchedule a sync: https://fderuiter-portfolio.vercel.app/schedule`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [profile]);

  return (
    <PageLayout
      variant="standard"
      className="bg-zinc-950 text-foreground relative overflow-hidden flex flex-col items-center justify-start"
    >
      {/* Dynamic Background Atmospheric Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-brand-cyan/5 blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-blue/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="w-full max-w-2xl mx-auto relative z-10 flex flex-col items-center">
        {/* Navigation Breadcrumb */}
        <div className="w-full flex items-center justify-between gap-4 mb-6 border-b border-zinc-900 pb-4 flex-wrap">
          <Breadcrumbs
            items={[
              { label: "Systems", href: "/#case-studies" },
              { label: "Incident Simulator" },
            ]}
          />
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Candidate Alignment &amp; Triage Simulator
            </span>
          </div>
        </div>

        {/* Top Header */}
        <div className="flex items-center justify-between w-full mb-8">
          {history.length > 0 && currentStep !== "final_eval" ? (
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <IconArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <FieldManualButton manualId="simulator" label="Simulator Manual" />
        </div>

        {/* Main Content Card Container */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {currentStep !== "final_eval" && branchingQuestions[currentStep] && (
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col"
              >
                {/* Stage Badge */}
                <div className="inline-flex items-center gap-2 text-xs font-mono text-brand-cyan tracking-widest uppercase font-bold mb-3">
                  <span className="w-2 h-2 rounded-full bg-brand-cyan animate-ping" />
                  {branchingQuestions[currentStep].badge}
                </div>

                {/* Question Title */}
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mb-2">
                  {branchingQuestions[currentStep].title}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed mb-8">
                  {branchingQuestions[currentStep].subtitle}
                </p>

                {/* Question Options */}
                <div className="flex flex-col gap-4">
                  {branchingQuestions[currentStep].options.map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(opt)}
                      className="group flex flex-col text-left p-5 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 hover:border-brand-cyan/50 hover:bg-zinc-900/50 hover:shadow-[0_0_30px_rgba(6,182,212,0.1)] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="text-sm sm:text-base font-bold text-neutral-200 group-hover:text-brand-cyan transition-colors">
                          {opt.text}
                        </span>
                        <span className="text-xs font-mono text-zinc-600 group-hover:text-brand-cyan transition-colors ml-2">
                          &rarr;
                        </span>
                      </div>
                      {opt.description && (
                        <p className="text-xs text-zinc-400 font-sans leading-relaxed mt-1">
                          {opt.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === "final_eval" && profile && (
              <motion.div
                key="final"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.7)] flex flex-col items-center text-center"
              >
                {/* Circular Match Gauge */}
                <div className="relative flex items-center justify-center mb-6">
                  <svg className="w-36 h-36 transform -rotate-90">
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
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">Systems Rigor</span>
                    <span className="text-sm font-bold text-brand-cyan">{profile.stats.systems}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">UI/UX Craft</span>
                    <span className="text-sm font-bold text-emerald-400">{profile.stats.ui}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-[9px] text-zinc-500 block uppercase">Resilience</span>
                    <span className="text-sm font-bold text-sky-400">{profile.stats.resilience}%</span>
                  </div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
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

        {/* Sequential Next / Prev Flow */}
        <NextPrevNav
          prev={{
            title: "Logical Proof Workspace",
            href: "/proof",
            label: "Formal Methods",
            tag: "Deductive Logic Engine",
          }}
          next={{
            title: "Schedule 1:1 Consultation",
            href: "/schedule",
            label: "Get In Touch",
            tag: "Google Calendar Booking",
          }}
          backToHub={{
            title: "Return to Portfolio",
            href: "/",
          }}
        />
      </div>
    </PageLayout>
  );
}
