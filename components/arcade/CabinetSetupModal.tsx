"use client";

import React, { useRef } from "react";
import {
  IconAdjustmentsHorizontal,
  IconVolume,
  IconVolumeOff,
  IconSparkles,
  IconFlame,
  IconShieldCheck,
  IconPlayerPlay,
  IconX,
  IconMusic,
} from "@tabler/icons-react";
import { useCabinet, CabinetDifficulty } from "@/components/providers/CabinetContext";
import { useAudio } from "@/components/providers/AudioProvider";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface CabinetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmAndLaunch: () => void;
  gameTitle?: string;
  accentColor?: "amber" | "red" | "purple" | "emerald" | "rose";
}

const DIFFICULTY_OPTIONS: {
  id: CabinetDifficulty;
  label: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
  freq: number;
}[] = [
  {
    id: "casual",
    label: "Casual Mode",
    badge: "Relaxed",
    description: "Relaxed mechanics, forgiving timers, ideal for casual exploration.",
    icon: <IconShieldCheck className="w-5 h-5 text-emerald-400" />,
    freq: 440.0, // A4
  },
  {
    id: "standard",
    label: "Standard Arcade",
    badge: "Balanced",
    description: "Authentic arcade tuning with standard difficulty progression.",
    icon: <IconSparkles className="w-5 h-5 text-amber-400" />,
    freq: 587.33, // D5
  },
  {
    id: "hardcore",
    label: "Hardcore Elite",
    badge: "Punishing",
    description: "High-speed chaos, tight collision windows, max score multipliers.",
    icon: <IconFlame className="w-5 h-5 text-rose-400" />,
    freq: 880.0, // A5
  },
];

export const CabinetSetupModal: React.FC<CabinetSetupModalProps> = ({
  isOpen,
  onClose,
  onConfirmAndLaunch,
  gameTitle = "Arcade Cabinet",
  accentColor = "amber",
}) => {
  const { difficulty, setDifficulty, audio, setAudio } = useCabinet();
  const { playNote, setVolume, setMuted } = useAudio();
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);

  const modalRef = useFocusTrap<HTMLDivElement>(isOpen, {
    initialFocusRef: confirmButtonRef,
    onEscape: onClose,
  });

  if (!isOpen) return null;

  const colorThemes = {
    amber: {
      border: "border-amber-500/40",
      glow: "shadow-[0_0_25px_rgba(245,158,11,0.2)]",
      title: "text-amber-400",
      accentBg: "bg-amber-500/10",
      btnBg: "bg-amber-500 hover:bg-amber-400 text-black border-amber-700",
      btnShadow: "shadow-amber-500/30",
    },
    red: {
      border: "border-red-500/40",
      glow: "shadow-[0_0_25px_rgba(239,68,68,0.2)]",
      title: "text-red-400",
      accentBg: "bg-red-500/10",
      btnBg: "bg-red-500 hover:bg-red-400 text-black border-red-700",
      btnShadow: "shadow-red-500/30",
    },
    purple: {
      border: "border-purple-500/40",
      glow: "shadow-[0_0_25px_rgba(168,85,247,0.2)]",
      title: "text-purple-400",
      accentBg: "bg-purple-500/10",
      btnBg: "bg-purple-500 hover:bg-purple-400 text-black border-purple-700",
      btnShadow: "shadow-purple-500/30",
    },
    emerald: {
      border: "border-emerald-500/40",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.2)]",
      title: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      btnBg: "bg-emerald-500 hover:bg-emerald-400 text-black border-emerald-700",
      btnShadow: "shadow-emerald-500/30",
    },
    rose: {
      border: "border-rose-500/40",
      glow: "shadow-[0_0_25px_rgba(244,63,94,0.2)]",
      title: "text-rose-400",
      accentBg: "bg-rose-500/10",
      btnBg: "bg-rose-500 hover:bg-rose-400 text-black border-rose-700",
      btnShadow: "shadow-rose-500/30",
    },
  }[accentColor];

  const handleDifficultySelect = (opt: CabinetDifficulty, freq: number) => {
    setDifficulty(opt);
    if (!audio.muted && audio.sfxEnabled) {
      playNote(freq, 0.12);
    }
  };

  const handleMuteToggle = () => {
    const nextMuted = !audio.muted;
    setAudio({ muted: nextMuted });
    setMuted(nextMuted);
    if (!nextMuted && audio.sfxEnabled) {
      playNote(523.25, 0.1);
    }
  };

  const handleSfxToggle = () => {
    const nextSfx = !audio.sfxEnabled;
    setAudio({ sfxEnabled: nextSfx });
    if (nextSfx && !audio.muted) {
      playNote(659.25, 0.1);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setAudio({ volume: newVol });
    setVolume(newVol);
    if (!audio.muted && audio.sfxEnabled) {
      playNote(260 + newVol * 400, 0.08);
    }
  };

  const handleConfirm = () => {
    if (!audio.muted && audio.sfxEnabled) {
      // Play ascending confirmation arpeggio
      playNote(523.25, 0.08);
      setTimeout(() => playNote(659.25, 0.08), 60);
      setTimeout(() => playNote(783.99, 0.12), 120);
    }
    onConfirmAndLaunch();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cabinet-wizard-title"
      aria-describedby="cabinet-wizard-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div
        ref={modalRef}
        className={`w-full max-w-lg bg-zinc-950 border ${colorThemes.border} ${colorThemes.glow} rounded-2xl p-6 sm:p-8 font-mono text-white relative overflow-hidden shadow-2xl`}
      >
        {/* Background Retro Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400">
              <IconAdjustmentsHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h2 id="cabinet-wizard-title" className={`text-lg sm:text-xl font-bold uppercase tracking-wider ${colorThemes.title}`}>
                Pre-Game Calibration
              </h2>
              <p id="cabinet-wizard-desc" className="text-[11px] text-zinc-400">
                Setup cabinet presets for <span className="text-zinc-200 font-semibold">{gameTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close setup wizard"
            className="p-1.5 text-zinc-400 hover:text-white bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
          >
            <IconX className="w-4 h-4" />
          </button>
        </div>

        {/* Wizard Form Sections */}
        <div className="space-y-6 my-6 relative z-10">
          {/* Difficulty Preset Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <span>1. Difficulty Calibration</span>
              <span className="text-[10px] text-zinc-500 font-normal">Saves to local storage</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DIFFICULTY_OPTIONS.map((opt) => {
                const isSelected = difficulty === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleDifficultySelect(opt.id, opt.freq)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? `${colorThemes.border} ${colorThemes.accentBg} bg-zinc-900/90 shadow-md`
                        : "border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-900 hover:border-zinc-700 text-zinc-400"
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
                      {opt.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-zinc-300"}`}>
                          {opt.label}
                        </span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider border ${
                            isSelected
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-zinc-800 text-zinc-500 border-zinc-700"
                          }`}
                        >
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio Option Configuration */}
          <div className="space-y-3 pt-4 border-t border-zinc-800/80">
            <div className="flex justify-between items-center text-xs font-bold text-zinc-300 uppercase tracking-wider">
              <span>2. Audio Preferences</span>
              <span className="text-[10px] text-zinc-500 font-normal">Global audio sync</span>
            </div>

            {/* Audio Toggles Row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Mute Toggle */}
              <button
                type="button"
                onClick={handleMuteToggle}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold ${
                  audio.muted
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-300"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-300 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  {audio.muted ? <IconVolumeOff className="w-4 h-4 text-rose-400" /> : <IconVolume className="w-4 h-4 text-emerald-400" />}
                  <span>{audio.muted ? "Audio Muted" : "Audio Active"}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${audio.muted ? "bg-rose-500" : "bg-emerald-500"}`} />
              </button>

              {/* SFX Toggle */}
              <button
                type="button"
                onClick={handleSfxToggle}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-bold ${
                  audio.sfxEnabled
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <IconMusic className="w-4 h-4 text-amber-400" />
                  <span>{audio.sfxEnabled ? "SFX On" : "SFX Muted"}</span>
                </div>
                <span className={`w-2 h-2 rounded-full ${audio.sfxEnabled ? "bg-emerald-500" : "bg-zinc-600"}`} />
              </button>
            </div>

            {/* Volume Selector slider/buttons */}
            <div className="p-3 bg-zinc-900/40 border border-zinc-800/80 rounded-xl space-y-2">
              <div className="flex justify-between items-center text-[11px] text-zinc-400">
                <span>Output Volume</span>
                <span className="font-bold text-white">{Math.round(audio.volume * 100)}%</span>
              </div>

              <div className="flex items-center gap-1.5">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((v) => {
                  const isActive = Math.abs(audio.volume - v) < 0.05;
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => handleVolumeChange(v)}
                      className={`flex-1 py-1.5 rounded-md text-[10px] font-bold transition-all border ${
                        isActive
                          ? "bg-amber-500 text-black border-amber-400 shadow-sm"
                          : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
                      }`}
                    >
                      {Math.round(v * 100)}%
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/80 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl border border-zinc-800 transition-colors uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            onClick={handleConfirm}
            className={`px-6 py-2.5 ${colorThemes.btnBg} text-xs font-extrabold rounded-xl border-b-2 transition-all flex items-center gap-2 uppercase tracking-wider shadow-lg ${colorThemes.btnShadow} active:translate-y-0.5`}
          >
            <IconPlayerPlay className="w-4 h-4 fill-black text-black" />
            <span>Confirm &amp; Launch Cabinet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
