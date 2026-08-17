"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAudio } from "@/components/providers/AudioProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import {
  IconPlayerSkipForward,
  IconChevronLeft,
  IconChevronRight,
  IconCheck,
  IconFlame,
  IconDeviceGamepad2,
  IconVolume,
} from "@tabler/icons-react";

interface GameSetupWizardProps {
  onSkip: () => void;
  onComplete: (config: {
    difficulty: string;
    theme: string;
    audioEnabled: boolean;
  }) => void;
}

interface Choice {
  value: string;
  label: string;
  desc: string;
}

interface Stage {
  id: number;
  title: string;
  description: string;
  optionsKey: "difficulty" | "theme" | "audioEnabled";
  choices: Choice[];
}

export const GameSetupWizard: React.FC<GameSetupWizardProps> = ({
  onSkip,
  onComplete,
}) => {
  const { playHover, playSubmit, playSuccess } = useAudio();
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  // Default configuration state
  const [config, setConfig] = useState({
    difficulty: "specialist",
    theme: "crt",
    audioEnabled: true,
  });

  const stages: Stage[] = [
    {
      id: 1,
      title: "Tactical Difficulty",
      description: "Set the intensity level of the simulation mechanics.",
      optionsKey: "difficulty",
      choices: [
        {
          value: "recruit",
          label: "Recruit (Easy)",
          desc: "Reduced hazard frequency. Enhanced safety margins.",
        },
        {
          value: "specialist",
          label: "Specialist (Normal)",
          desc: "Standard balance. Ideal for recruiters and specialists.",
        },
        {
          value: "hardcore",
          label: "Hardcore (Expert)",
          desc: "Maximum speed. Tightest verification margins and hazards.",
        },
      ],
    },
    {
      id: 2,
      title: "Visual Theme & Scanlines",
      description: "Toggle visual style and terminal emulation modes.",
      optionsKey: "theme",
      choices: [
        {
          value: "crt",
          label: "Retro CRT Mode",
          desc: "Phosphor glow, subtle curvature, and scanline overlays.",
        },
        {
          value: "lcd",
          label: "Modern LCD Mode",
          desc: "Clean vector geometry, high-fidelity crisp rendering.",
        },
        {
          value: "amber",
          label: "Vintage Amber",
          desc: "Classic monochrome amber console aesthetic.",
        },
      ],
    },
    {
      id: 3,
      title: "Audio Feedback Cues",
      description: "Enable synthesised 8-bit sound fx and feedback loops.",
      optionsKey: "audioEnabled",
      choices: [
        {
          value: "true",
          label: "Audio Enabled (On)",
          desc: "Interactive acoustic tones, telemetry alerts, and soundscapes.",
        },
        {
          value: "false",
          label: "Silent Protocol (Off)",
          desc: "Deactive all acoustic tones and play in total silence.",
        },
      ],
    },
  ];

  const currentStage = stages[currentStageIndex];

  // Set up focus trap and Escape-key listener to skip setup
  const containerRef = useFocusTrap<HTMLDivElement>(true, {
    onEscape: () => {
      playSuccess();
      onSkip();
    },
  });

  const handleNext = () => {
    playSubmit();
    if (currentStageIndex < stages.length - 1) {
      setCurrentStageIndex((prev) => prev + 1);
    } else {
      playSuccess();
      onComplete(config);
    }
  };

  const handleBack = () => {
    playSubmit();
    if (currentStageIndex > 0) {
      setCurrentStageIndex((prev) => prev - 1);
    }
  };

  const selectOption = (key: "difficulty" | "theme" | "audioEnabled", value: string) => {
    playSubmit();
    if (key === "audioEnabled") {
      setConfig((prev) => ({ ...prev, [key]: value === "true" }));
    } else {
      setConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  const handleSkip = () => {
    playSuccess();
    onSkip();
  };

  return (
    <motion.div
      ref={containerRef}
      tabIndex={-1}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.25 }}
      className="w-full h-full flex flex-col bg-zinc-950/95 border border-zinc-800/80 rounded-2xl p-6 relative overflow-hidden focus:outline-none select-none max-w-2xl mx-auto font-mono"
    >
      {/* Decorative neon corner grid lines */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-brand-cyan/20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-brand-cyan/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-brand-cyan/20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-brand-cyan/20 pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 mb-6 z-10">
        <div>
          <span className="text-xs uppercase tracking-wider text-zinc-500 font-bold block">
            System Configurator
          </span>
          <span className="text-[10px] text-brand-cyan/70 font-bold">
            [ STAGE {currentStage.id} OF {stages.length} ]
          </span>
        </div>

        {/* Prominent "Skip Setup" Button */}
        <button
          onClick={handleSkip}
          onMouseEnter={() => playHover()}
          className="group flex items-center gap-1.5 px-3 py-1.5 rounded bg-zinc-900 border border-zinc-700/80 hover:border-brand-cyan hover:bg-brand-cyan/5 text-xs text-zinc-300 hover:text-brand-cyan font-bold uppercase transition-all shadow-md focus:ring-2 focus:ring-brand-cyan/50 focus:outline-none cursor-pointer"
          title="Bypass setup and start with standard default settings (Esc)"
        >
          <span>Skip Setup</span>
          <IconPlayerSkipForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline-block ml-1 px-1 py-0.5 rounded text-[9px] bg-zinc-800 border border-zinc-700 text-zinc-400 group-hover:border-brand-cyan/40">
            ESC
          </span>
        </button>
      </div>

      {/* Progress Bar Indicators */}
      <div className="w-full flex gap-2 mb-6 z-10">
        {stages.map((stage, idx) => {
          const isActive = idx === currentStageIndex;
          const isCompleted = idx < currentStageIndex;
          return (
            <div
              key={stage.id}
              className="flex-1 h-1.5 rounded-full overflow-hidden bg-zinc-900 border border-zinc-800/50"
            >
              <div
                className={`h-full transition-all duration-300 ${
                  isActive
                    ? "bg-brand-cyan shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                    : isCompleted
                    ? "bg-emerald-500"
                    : "bg-transparent"
                }`}
                style={{ width: isActive || isCompleted ? "100%" : "0%" }}
              />
            </div>
          );
        })}
      </div>

      {/* Main Content Area - Slide / Fade transitions */}
      <div className="flex-1 flex flex-col justify-center min-h-[180px] z-10">
        <h2 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
          {currentStage.id === 1 && <IconFlame className="w-4 h-4 text-amber-500 animate-pulse" />}
          {currentStage.id === 2 && <IconDeviceGamepad2 className="w-4 h-4 text-brand-cyan" />}
          {currentStage.id === 3 && <IconVolume className="w-4 h-4 text-purple-400" />}
          <span>{currentStage.title}</span>
        </h2>
        <p className="text-xs text-zinc-400 mb-4">{currentStage.description}</p>

        {/* Stage Options */}
        <div className="grid grid-cols-1 gap-2.5">
          {currentStage.choices.map((choice) => {
            const isSelected =
              currentStage.optionsKey === "audioEnabled"
                ? (config.audioEnabled ? "true" : "false") === choice.value
                : config[currentStage.optionsKey] === choice.value;

            return (
              <button
                key={choice.value}
                onClick={() => selectOption(currentStage.optionsKey, choice.value)}
                onMouseEnter={() => playHover()}
                className={`w-full text-left px-4 py-3 rounded-lg border text-xs transition-all relative overflow-hidden group focus:ring-2 focus:ring-brand-cyan/50 focus:outline-none cursor-pointer ${
                  isSelected
                    ? "border-brand-cyan bg-brand-cyan/5 text-brand-cyan font-bold"
                    : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-800/40 text-zinc-300"
                }`}
              >
                {/* Visual glow on selected option */}
                {isSelected && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan" />
                )}
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="block font-bold">{choice.label}</span>
                    <span className={`block text-[11px] mt-0.5 ${isSelected ? "text-brand-cyan/80" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                      {choice.desc}
                    </span>
                  </div>
                  {isSelected && <IconCheck className="w-4 h-4 text-brand-cyan shrink-0" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Sequential Controls */}
      <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-6 z-10">
        <button
          onClick={handleBack}
          onMouseEnter={() => playHover()}
          disabled={currentStageIndex === 0}
          className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold uppercase transition-colors rounded border border-transparent focus:ring-2 focus:ring-zinc-700 focus:outline-none cursor-pointer ${
            currentStageIndex === 0
              ? "text-zinc-600 cursor-not-allowed opacity-50"
              : "text-zinc-400 hover:text-white hover:border-zinc-800 hover:bg-zinc-900/50"
          }`}
        >
          <IconChevronLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={handleNext}
          onMouseEnter={() => playHover()}
          className="flex items-center gap-1 px-4 py-1.5 text-xs font-bold uppercase transition-all rounded bg-brand-cyan text-black hover:bg-brand-cyan-light shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] focus:ring-2 focus:ring-brand-cyan/50 focus:outline-none cursor-pointer"
        >
          <span>{currentStageIndex === stages.length - 1 ? "Launch Game" : "Next"}</span>
          <IconChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
