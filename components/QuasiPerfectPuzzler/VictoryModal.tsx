"use client";

import React from "react";
import { motion } from "framer-motion";
import { LevelScore } from "@/lib/quasi-perfect/types";

interface VictoryModalProps {
  score: LevelScore;
  totalLevels: number;
  currentLevelIndex: number;
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  totalLevels,
  currentLevelIndex,
  onNextLevel,
  onRestartLevel,
}) => {
  const isLastLevel = currentLevelIndex >= totalLevels - 1;
  const isSorry = score.usedSorry;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 rounded-2xl"
    >
      <div className="max-w-md w-full rounded-2xl border border-zinc-700 bg-zinc-950 p-6 text-center shadow-2xl font-mono">
        {/* Title Badge */}
        {isSorry ? (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold mb-3">
            ⚠️ MATHEMATICAL MORALITY VIOLATION
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold mb-3">
            ✔ FORMAL VERIFICATION VERIFIED
          </div>
        )}

        <h3 className="text-2xl font-extrabold text-white tracking-tight">
          {isSorry ? "PROVED VIA SORRY" : "Q.E.D. · Theorem Verified"}
        </h3>

        <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
          {isSorry
            ? "You bypassed the rigorous proof assistant using the forbidden 'sorry' escape hatch. The theorem is accepted, but your mathematical integrity has been penalized."
            : "The AST was completely reduced to a closed truth state without exhausting simulated Lean Server RAM."}
        </p>

        {/* Stars Display */}
        <div className="my-5 flex justify-center items-center gap-3">
          {[1, 2, 3].map((starIdx) => (
            <span
              key={starIdx}
              className={`text-3xl ${
                !isSorry && starIdx <= score.stars
                  ? "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                  : "text-zinc-700"
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Score & Memory Breakdown */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-xs mb-6">
          <div className="flex flex-col">
            <span className="text-zinc-500">Remaining RAM</span>
            <span className="font-bold text-brand-cyan text-sm">
              {score.remainingRam.toFixed(1)} GB
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-zinc-500">Mathematical Morality</span>
            <span
              className={`font-bold text-sm ${
                isSorry ? "text-rose-400" : "text-emerald-400"
              }`}
            >
              {score.morality > 0 ? `+${score.morality}` : score.morality}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onRestartLevel}
            className="flex-1 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-200 hover:bg-zinc-800 hover:border-zinc-500 transition-colors"
          >
            {isSorry ? "Try Honest Proof" : "Replay Level"}
          </button>

          {!isLastLevel && (
            <button
              type="button"
              onClick={onNextLevel}
              className="flex-1 rounded-xl bg-brand-cyan px-4 py-2.5 text-xs font-bold text-black hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(6,182,212,0.4)]"
            >
              Next Level →
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
