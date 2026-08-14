"use client";

import { puzzlerLevels, puzzlerTactics } from "@/lib/quasi-perfect-puzzler";

export const QuasiPerfectPuzzler = () => {
  const level = puzzlerLevels[0];

  return (
    <section
      aria-labelledby="quasi-puzzler-heading"
      className="rounded-2xl border border-brand-cyan/25 bg-zinc-950/80 p-5 font-mono shadow-[0_0_30px_-12px_rgba(6,182,212,0.35)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-cyan">Scaffold · Formal methods arcade</p>
          <h2 id="quasi-puzzler-heading" className="mt-1 text-2xl font-bold text-zinc-100">Quasi-Perfect Puzzler</h2>
        </div>
        <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[10px] font-bold text-amber-300">SIMULATED RAM: 0.0 / 16 GB</span>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-[10px] uppercase tracking-wider text-zinc-500">{level.title}</p>
        <p className="mt-2 text-lg text-brand-cyan">{level.goal}</p>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{level.prompt}</p>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {level.tactics.map((tacticId) => {
          const tactic = puzzlerTactics[tacticId];
          return (
            <div key={tactic.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
              <p className={tactic.id === "sorry" ? "text-sm font-bold text-rose-300" : "text-sm font-bold text-zinc-200"}>{tactic.label}</p>
              <p className="mt-1 text-xs text-zinc-500">{tactic.memoryCostGb} GB · {tactic.description}</p>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">The interactive tactic reducer, keyboard controls, and worker-backed failure simulation are planned next. This is a deterministic UI and domain-model scaffold, not a Lean runtime.</p>
    </section>
  );
};
