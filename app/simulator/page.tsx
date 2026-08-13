"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  IconArrowLeft,
  IconAward,
  IconCalendar,
  IconCheck,
  IconRefresh,
  IconSend,
  IconUser,
} from "@tabler/icons-react";

interface Option {
  text: string;
  description?: string;
  points: { tech: number; alignment: number };
  nextStep: string;
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: Option[];
}

const branchingQuestions: Record<string, Question> = {
  welcome: {
    id: "welcome",
    title: "1. Define Your Target Profile",
    subtitle: "What is your primary focus when hiring engineering leaders?",
    options: [
      {
        text: "Raw Systems & Performance Maverick",
        description: "Low-overhead execution, memory optimization, robust backend databases, and blazing-fast microservices.",
        points: { tech: 50, alignment: 40 },
        nextStep: "depth_tech",
      },
      {
        text: "Pixel-Perfect Frontend & UX Artisan",
        description: "Immersive user interaction, 60 FPS visual motion, flawless accessibility, and zero layout shift transitions.",
        points: { tech: 30, alignment: 50 },
        nextStep: "depth_product",
      },
    ],
  },
  depth_tech: {
    id: "depth_tech",
    title: "2. Technical Core Philosophy",
    subtitle: "How does your team ensure production systems remain resilient under high traffic?",
    options: [
      {
        text: "Absolute Typesafety & Strict Automated Isolation",
        description: "Zero toleration for memory leaks. Explicit database connection timeouts, fallback caching layers, and high-performance queues.",
        points: { tech: 50, alignment: 50 },
        nextStep: "final_eval",
      },
      {
        text: "Ultra-Rapid Execution & Incremental hot patching",
        description: "Prioritize shipping live values over compiler warnings. Handle failures gracefully but prioritize product-to-market speed.",
        points: { tech: 30, alignment: 30 },
        nextStep: "final_eval",
      },
    ],
  },
  depth_product: {
    id: "depth_product",
    title: "2. Aesthetic & Interactive Standard",
    subtitle: "What is the non-negotiable benchmark for your client-facing applications?",
    options: [
      {
        text: "Full Keyboard-Navigable Fluid Playgrounds",
        description: "Every action is reactive. Seamless state synchronization, responsive grids, and delightful micro-interactions.",
        points: { tech: 40, alignment: 50 },
        nextStep: "final_eval",
      },
      {
        text: "Functional Data Utility over Pure Visual Decoration",
        description: "Deliver robust clinical/scientific reports in high-density tables. Avoid redundant visual fluff or complex animations.",
        points: { tech: 25, alignment: 25 },
        nextStep: "final_eval",
      },
    ],
  },
};

const mockTimeSlots = [
  "Monday, Aug 17 at 10:00 AM PST",
  "Tuesday, Aug 18 at 2:00 PM PST",
  "Wednesday, Aug 19 at 4:30 PM PST",
];

export default function RecruiterSimulator() {
  const { recordEvent } = useTelemetry();
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [history, setHistory] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Option[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Modal Interactive States
  const [selectedSlot, setSelectedSlot] = useState("");
  const [recruiterEmail, setRecruiterEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // 1. Establish mount tracking and log page entry EXACTLY once per session
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    if (typeof window !== "undefined") {
      const hasTrackedSession = sessionStorage.getItem("has_tracked_simulator_view_this_session");
      if (!hasTrackedSession) {
        sessionStorage.setItem("has_tracked_simulator_view_this_session", "true");
        recordEvent("/simulator", "page_view");
      }
    }
  }, [recordEvent]);

  // 2. Handle selection & branching path routing
  const handleSelectOption = (option: Option) => {
    // Record selection telemetry click
    recordEvent("/simulator", "project_click");

    setAnswers((prev) => [...prev, option]);
    setHistory((prev) => [...prev, currentStep]);
    setCurrentStep(option.nextStep);
  };

  // 3. Handle backwards traversal
  const handleBack = () => {
    if (history.length === 0) return;
    const prevStep = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setAnswers((prev) => prev.slice(0, -1));
    setCurrentStep(prevStep);
  };

  // 4. Reset Simulator
  const handleReset = () => {
    setCurrentStep("welcome");
    setHistory([]);
    setAnswers([]);
    setSelectedSlot("");
    setRecruiterEmail("");
    setEmailError("");
    setBookingSuccess(false);
    setIsModalOpen(false);
  };

  // 5. Calculate Final Alignment Outcomes
  const getAlignmentProfile = () => {
    if (answers.length < 2) {
      return {
        score: 80,
        title: "Compatible Collaborator",
        summary: "Excellent fit! Ready to build enterprise applications.",
      };
    }

    const firstChoice = answers[0];
    const secondChoice = answers[1];

    if (firstChoice.nextStep === "depth_tech") {
      if (secondChoice.text.includes("Typesafety")) {
        return {
          score: 98,
          title: "Elite Systems Architect",
          summary: "Perfect match! Frederick specializes in robust, typesafe TypeScript environments, high-performance database connection pooling, and resilient transactional backends with zero layout shifts.",
        };
      } else {
        return {
          score: 85,
          title: "Pragmatic Systems Engineer",
          summary: "Highly aligned! Frederick bridges the gap between lightning-fast feature launches and robust database architectures with automated fallbacks.",
        };
      }
    } else {
      if (secondChoice.text.includes("Fluid Playgrounds")) {
        return {
          score: 100,
          title: "Pixel-Perfect Frontend Architect",
          summary: "Absolute dream alignment! Frederick blends deep aesthetic craft with strict engineering: 60 FPS Framer Motion transitions, responsive Tailwind patterns, and zero cumulative layout shifts.",
        };
      } else {
        return {
          score: 75,
          title: "Utilitarian Product Engineer",
          summary: "Strong compatibility! Frederick has deep expertise building streamlined, accessible console terminal utilities and high-density logic engines where data speed dominates decoration.",
        };
      }
    }
  };

  // 6. Handle Booking Submit
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!selectedSlot) {
      setEmailError("Please select a simulated calendar slot.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recruiterEmail)) {
      setEmailError("Please enter a valid business email address.");
      return;
    }

    setIsSubmittingBooking(true);

    // Simulate high-performance queue logging API delay
    setTimeout(() => {
      recordEvent("/simulator/booking", "project_click");
      setIsSubmittingBooking(false);
      setBookingSuccess(true);
    }, 600);
  };

  const profile = getAlignmentProfile();
  const currentQuestion = branchingQuestions[currentStep];

  return (
    <main className="min-h-screen bg-zinc-950 text-foreground pt-32 pb-24 px-6 md:px-12 lg:px-24 flex items-center justify-center relative overflow-hidden">
      {/* Background glowing effects - ensures beautiful visual depth */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-brand-cyan/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 rounded-full bg-brand-blue/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-2xl mx-auto flex flex-col relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan to-brand-blue tracking-tight mb-3">
            Recruiter Compatibility Wizard
          </h1>
          <p className="text-xs font-mono text-zinc-500 tracking-widest uppercase max-w-lg mx-auto leading-relaxed">
            Gamified candidate compatibility assessment engine. Evaluate cultural, system, and design orientation instantly.
          </p>
        </header>

        {/* Wizard Card Container */}
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
                    Compatibility Phase
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Step {history.length + 1}
                  </span>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-zinc-100 mb-2">
                  {currentQuestion.title}
                </h2>
                <p className="text-sm text-zinc-400 mb-8 font-sans">
                  {currentQuestion.subtitle}
                </p>

                {/* Option Buttons */}
                <div className="flex flex-col gap-4">
                  {currentQuestion.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(option)}
                      className="group flex flex-col items-start text-left p-5 bg-zinc-950/50 hover:bg-zinc-950 border border-zinc-800 hover:border-brand-cyan/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.06)] rounded-2xl transition-all duration-300 cursor-pointer w-full"
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

                {/* Footer Controls */}
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
              /* RESULTS / FINAL STEP SCREEN */
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                {/* Compatibility Score Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                  {/* Outer animated gradient border */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand-cyan to-brand-blue opacity-25 animate-pulse" />
                  <div className="absolute inset-2 bg-zinc-950 rounded-full" />
                  
                  {/* Gauge Ring */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="rgba(39, 39, 42, 0.4)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      stroke="url(#gradient)"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray="440"
                      initial={{ strokeDashoffset: 440 }}
                      animate={{ strokeDashoffset: 440 - (440 * profile.score) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Inner Score text */}
                  <div className="absolute flex flex-col items-center">
                    <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tighter">
                      {profile.score}%
                    </span>
                    <span className="text-[10px] font-mono uppercase text-brand-cyan font-bold tracking-widest mt-1">
                      MATCH
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 bg-brand-cyan/10 rounded-full border border-brand-cyan/20 text-brand-cyan text-xs font-mono font-bold mb-4">
                  <IconAward className="w-4 h-4 animate-bounce" /> Recommended Role Alignment
                </div>

                <h2 className="text-2xl font-extrabold text-white tracking-tight mb-3">
                  {profile.title}
                </h2>
                
                <p className="text-sm text-zinc-400 font-sans max-w-md leading-relaxed mb-8">
                  {profile.summary}
                </p>

                {/* Action CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-cyan to-brand-blue text-zinc-950 hover:text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer hover:scale-[1.02]"
                  >
                    <IconCalendar className="w-4 h-4" /> Schedule Interview
                  </button>
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200 font-mono font-bold text-xs uppercase tracking-wider rounded-xl transition-all duration-300 cursor-pointer"
                  >
                    <IconRefresh className="w-4 h-4" /> Run Again
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PORTAL RENDERED SCHEDULING MODAL OVERLAY */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                {/* Backdrop overlay blur effect */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                  className="absolute inset-0 bg-zinc-950/80 backdrop-blur-lg"
                />

                {/* Modal main content wrapper */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  transition={{ type: "spring", duration: 0.35 }}
                  className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 relative z-10 overflow-hidden shadow-2xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/10 rounded-full blur-2xl pointer-events-none" />
                  
                  {/* Close trigger button */}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-300 text-xs font-mono bg-zinc-950 px-2 py-1 border border-zinc-850 rounded-md cursor-pointer"
                  >
                    ESC
                  </button>

                  <AnimatePresence mode="wait">
                    {!bookingSuccess ? (
                      <motion.div
                        key="booking-form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <span className="p-2.5 bg-brand-cyan/10 rounded-xl text-brand-cyan border border-brand-cyan/20">
                            <IconCalendar className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="text-lg font-bold text-white tracking-tight">
                              Instant Calendar Booking
                            </h3>
                            <p className="text-xs text-zinc-500 font-mono">
                              PRE-APPROVED CALENDAR INVITATION
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-sans">
                          You have matched as an <span className="text-brand-cyan font-bold">{profile.title}</span>! Unlock immediate access to Frederick&apos;s upcoming collaboration windows.
                        </p>

                        <form onSubmit={handleConfirmBooking} className="space-y-5">
                          {/* Slot Selector */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              Select Available Time Window
                            </label>
                            <div className="flex flex-col gap-2">
                              {mockTimeSlots.map((slot) => (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`w-full text-left p-3.5 rounded-xl border font-mono text-xs transition-all duration-200 flex items-center justify-between cursor-pointer ${
                                    selectedSlot === slot
                                      ? "bg-brand-cyan/10 border-brand-cyan text-brand-cyan shadow-[0_0_15px_rgba(6,182,212,0.08)]"
                                      : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                                  }`}
                                >
                                  <span>{slot}</span>
                                  {selectedSlot === slot && (
                                    <IconCheck className="w-4 h-4 shrink-0 text-brand-cyan" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Email Input */}
                          <div className="space-y-2">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block">
                              Recruiter / Team Email
                            </label>
                            <div className="relative">
                              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-500">
                                <IconUser className="w-4 h-4" />
                              </span>
                              <input
                                type="email"
                                value={recruiterEmail}
                                onChange={(e) => setRecruiterEmail(e.target.value)}
                                placeholder="name@yourcompany.com"
                                className="w-full bg-zinc-950 border border-zinc-800 focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan rounded-xl py-2.5 pl-9 pr-4 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all font-sans"
                              />
                            </div>
                          </div>

                          {/* Error feedback */}
                          {emailError && (
                            <div className="text-xs text-red-400 font-mono flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                              {emailError}
                            </div>
                          )}

                          {/* Submit Trigger */}
                          <button
                            type="submit"
                            disabled={isSubmittingBooking}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-brand-cyan text-zinc-950 hover:text-white hover:bg-brand-cyan-glow hover:border-brand-cyan font-mono font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                          >
                            {isSubmittingBooking ? (
                              <>
                                <IconRefresh className="w-4 h-4 animate-spin" /> Committing Queue Event...
                              </>
                            ) : (
                              <>
                                <IconSend className="w-4 h-4" /> Schedule Calendar Invite
                              </>
                            )}
                          </button>
                        </form>
                      </motion.div>
                    ) : (
                      /* BOOKING SUCCESS STATE */
                      <motion.div
                        key="booking-success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-6"
                      >
                        <div className="w-16 h-16 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                          <IconCheck className="w-8 h-8" />
                        </div>
                        
                        <h3 className="text-xl font-extrabold text-white tracking-tight mb-2">
                          Meeting Successfully Booked!
                        </h3>
                        
                        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">
                          Pre-approved telemetry commit confirmed
                        </p>

                        <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl text-left text-xs font-mono space-y-2 mb-6">
                          <div className="text-zinc-500">
                            &gt; ID: <span className="text-zinc-300">{crypto.randomUUID().slice(0, 8)}</span>
                          </div>
                          <div className="text-zinc-500">
                            &gt; TARGET: <span className="text-brand-cyan">{recruiterEmail}</span>
                          </div>
                          <div className="text-zinc-500">
                            &gt; SLOT: <span className="text-brand-blue">{selectedSlot}</span>
                          </div>
                          <div className="text-zinc-500">
                            &gt; TELEMETRY: <span className="text-green-400">LOGGED (p95 &lt; 100ms)</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-6">
                          Frederick&apos;s AI Agent has buffered this confirmation. A calendar invitation is being transmitted to your email.
                        </p>

                        <button
                          onClick={() => setIsModalOpen(false)}
                          className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-xs uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                        >
                          Close Window
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </main>
  );
}
