"use client";

import React from "react";
import { SubGoal } from "@/lib/quasi-perfect/types";
import { IconCheck, IconCircleDot, IconGitBranch } from "@tabler/icons-react";

interface MultiGoalTabsProps {
  subgoals: SubGoal[];
  activeGoalIndex: number;
  onSelectGoal: (index: number) => void;
}

export const MultiGoalTabs: React.FC<MultiGoalTabsProps> = ({
  subgoals,
  activeGoalIndex,
  onSelectGoal,
}) => {
  if (subgoals.length <= 1) return null;

  const completedCount = subgoals.filter((g) => g.isCompleted).length;

  return (
    <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3 font-mono">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
          <IconGitBranch className="w-4 h-4 text-purple-400" />
          <span>Active Proof Branches ({completedCount}/{subgoals.length} closed)</span>
        </div>
        <span className="text-[10px] text-zinc-400">
          Discharge all subgoals to complete theorem
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {subgoals.map((sg, idx) => {
          const isActive = idx === activeGoalIndex;
          const isDone = sg.isCompleted;

          return (
            <button
              key={sg.id}
              type="button"
              onClick={() => onSelectGoal(idx)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? "bg-purple-600 text-white shadow-[0_0_12px_rgba(168,85,247,0.5)] border border-purple-400"
                  : isDone
                  ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              {isDone ? (
                <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
              ) : isActive ? (
                <IconCircleDot className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-zinc-600 flex items-center justify-center text-[9px]">
                  {idx + 1}
                </span>
              )}
              <span>{sg.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
