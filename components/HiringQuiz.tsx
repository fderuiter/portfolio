"use client";

import React, { useState, useEffect } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";

interface Option {
  text: string;
  nextStep: string;
  score: number;
  role: string;
  description: string;
}

interface Question {
  title: string;
  subtitle: string;
  options: Option[];
}

const QUESTIONS: Record<string, Question> = {
  welcome: {
    title: "1. Target Profile Focus",
    subtitle: "What is your primary engineering priority?",
    options: [
      {
        text: "Systems & Performance",
        description: "Low-overhead execution, memory safety, Postgres pooling.",
        nextStep: "depth_tech",
        score: 98,
        role: "Elite Systems Architect",
      },
      {
        text: "Pixel-Perfect Frontend & UX",
        description: "60 FPS fluid motion, zero layout shift, accessibility.",
        nextStep: "depth_product",
        score: 100,
        role: "Pixel-Perfect UX Architect",
      },
    ],
  },
  depth_tech: {
    title: "2. Technical Philosophy",
    subtitle: "How does your team ensure production system resilience?",
    options: [
      {
        text: "Strict Typesafety & Isolation",
        description: "Zero toleration for memory leaks or raw dynamic fields.",
        nextStep: "result",
        score: 98,
        role: "Elite Systems Architect",
      },
      {
        text: "Rapid Feature Launches",
        description: "Prioritize user value first, then optimize compilation.",
        nextStep: "result",
        score: 85,
        role: "Pragmatic Systems Engineer",
      },
    ],
  },
  depth_product: {
    title: "2. Visual Benchmark",
    subtitle: "What is the non-negotiable standard for client web applications?",
    options: [
      {
        text: "Fluid Navigable Playgrounds",
        description: "Keyboard navigable, reactive state, delightful animations.",
        nextStep: "result",
        score: 100,
        role: "Pixel-Perfect UX Architect",
      },
      {
        text: "Functional Data Utilities",
        description: "High-density charts and speed; prioritize utility.",
        nextStep: "result",
        score: 75,
        role: "Utilitarian Product Engineer",
      },
    ],
  },
};

export default function HiringQuiz() {
  const { recordEvent } = useTelemetry();
  const [currentStep, setCurrentStep] = useState<string>("welcome");
  const [history, setHistory] = useState<string[]>([]);
  const [selectedOptions, setSelectedOptions] = useState<Option[]>([]);
  const [transitionState, setTransitionState] = useState<"in" | "out">("in");

  // Track telemetry event upon first interaction
  useEffect(() => {
    recordEvent("/hiring-quiz", "project_click");
  }, [recordEvent]);

  const handleSelectOption = (option: Option) => {
    setTransitionState("out");
    setTimeout(() => {
      setSelectedOptions((prev) => [...prev, option]);
      setHistory((prev) => [...prev, currentStep]);
      setCurrentStep(option.nextStep);
      setTransitionState("in");
      recordEvent(`/hiring-quiz/${option.nextStep}`, "project_click");
    }, 150);
  };

  const handleBack = () => {
    if (history.length === 0) return;
    setTransitionState("out");
    setTimeout(() => {
      const prevStep = history[history.length - 1];
      setHistory((prev) => prev.slice(0, -1));
      setSelectedOptions((prev) => prev.slice(0, -1));
      setCurrentStep(prevStep);
      setTransitionState("in");
    }, 150);
  };

  const handleReset = () => {
    setTransitionState("out");
    setTimeout(() => {
      setCurrentStep("welcome");
      setHistory([]);
      setSelectedOptions([]);
      setTransitionState("in");
    }, 150);
  };

  const getResultProfile = () => {
    if (selectedOptions.length === 0) {
      return { score: 90, role: "Engineering Partner", desc: "Highly compatible with all modern architectures." };
    }
    const finalSelection = selectedOptions[selectedOptions.length - 1];
    return {
      score: finalSelection.score,
      role: finalSelection.role,
      desc: finalSelection.description,
    };
  };

  const result = getResultProfile();
  const question = QUESTIONS[currentStep];

  return (
    <div className="flex flex-col h-[280px] justify-between relative overflow-hidden select-none">
      {/* Quiz transition container using lightweight CSS transitions */}
      <div
        className={`flex-1 flex flex-col justify-between transition-all duration-150 transform ${
          transitionState === "in"
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-2"
        }`}
      >
        {question ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              {/* Header Info */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-[9px] font-mono uppercase tracking-widest text-brand-cyan bg-brand-cyan/10 px-2 py-0.5 rounded border border-brand-cyan/20">
                  Step {history.length + 1} of 2
                </span>
                <span className="text-[10px] font-mono text-zinc-400">
                  SIMULATOR LIVE
                </span>
              </div>

              <h3 className="text-sm font-bold text-zinc-100 mb-0.5">
                {question.title}
              </h3>
              <p className="text-[11px] text-zinc-400 mb-3">
                {question.subtitle}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {question.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(option)}
                    className="w-full text-left p-2 bg-zinc-950/40 hover:bg-zinc-950/80 border border-zinc-900 hover:border-brand-cyan/30 rounded-xl transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="w-3.5 h-3.5 rounded-full border border-zinc-700 group-hover:border-brand-cyan flex items-center justify-center shrink-0 bg-zinc-900 transition-colors">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan opacity-0 group-hover:opacity-100 transition-opacity" />
                      </span>
                      <span className="font-semibold text-zinc-200 group-hover:text-white text-xs transition-colors">
                        {option.text}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 group-hover:text-zinc-200 pl-5 leading-tight transition-colors">
                      {option.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center pt-2 border-t border-zinc-900/40">
              <button
                onClick={handleBack}
                disabled={history.length === 0}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 disabled:opacity-0 transition-opacity cursor-pointer"
              >
                &larr; Back
              </button>
              <button
                onClick={handleReset}
                className="text-[10px] font-mono text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
              >
                Restart
              </button>
            </div>
          </div>
        ) : (
          /* RESULT SCREEN */
          <div className="flex flex-col h-full justify-between items-center text-center py-1">
            <div className="flex flex-col items-center">
              {/* Score circle badge */}
              <div className="relative w-14 h-14 flex items-center justify-center mb-2 bg-zinc-950 rounded-full border border-zinc-800 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="flex flex-col items-center">
                  <span className="text-sm font-extrabold text-white">
                    {result.score}%
                  </span>
                  <span className="text-[7px] font-mono uppercase text-brand-cyan font-bold tracking-widest leading-none">
                    MATCH
                  </span>
                </div>
              </div>

              <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-0.5">
                Outcome Calculated
              </h3>
              <h4 className="text-sm font-extrabold text-white tracking-tight mb-1">
                {result.role}
              </h4>
              <p className="text-[11px] text-zinc-400 font-sans max-w-[220px] leading-relaxed mb-3">
                {result.role === "Elite Systems Architect" || result.role === "Pixel-Perfect UX Architect"
                  ? `Perfect match! Frederick has deep expertise in ${result.desc.toLowerCase()}`
                  : `Strong compatibility! Frederick fits this profile exceptionally well.`}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex gap-2 w-full pt-2 border-t border-zinc-900/40">
              <button
                onClick={handleReset}
                className="flex-1 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 font-mono text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Run Again
              </button>
              <a
                href="/simulator"
                className="flex-1 py-1.5 bg-gradient-to-r from-brand-cyan to-brand-blue text-zinc-950 hover:text-white font-mono text-[9px] uppercase tracking-wider rounded-lg transition-all hover:shadow-[0_0_10px_rgba(6,182,212,0.15)] text-center font-bold flex items-center justify-center cursor-pointer"
              >
                Full Simulator
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
