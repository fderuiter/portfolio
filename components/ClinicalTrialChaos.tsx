"use client";

import { clinicalChaosScenarios } from "@/lib/clinical-trial-chaos";

export const ClinicalTrialChaos = () => {
  const scenario = clinicalChaosScenarios[0];

  return (
    <section aria-labelledby="clinical-chaos-heading" className="rounded-2xl border border-brand-blue/25 bg-zinc-950/80 p-5 shadow-[0_0_30px_-12px_rgba(59,130,246,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-brand-blue">Scaffold · Clinical data arcade</p>
          <h2 id="clinical-chaos-heading" className="mt-1 text-2xl font-bold text-zinc-100">Clinical Trial Chaos</h2>
        </div>
        <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-3 py-1 text-[10px] font-bold text-rose-300">AUDIT PRESSURE: 0%</span>
      </div>

      <div className="mt-5 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">SIMULATION — NO PHI · Subject {scenario.subjectLabel}</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {scenario.observations.map((observation) => (
            <div key={observation.field} className="rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              <p className="text-xs font-bold text-zinc-200">{observation.field}</p>
              <p className={observation.correction ? "mt-1 text-amber-300" : "mt-1 text-brand-cyan"}>{observation.value}</p>
              <p className="mt-1 text-xs text-zinc-500">Target: {observation.destination}{observation.correction ? ` · validation candidate: ${observation.correction}` : ""}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs leading-5 text-zinc-500">The next slice adds a keyboard-equivalent validation and mapping flow, a simulated signature dialog, seeded queues, and an explicit educational—not compliant—disclaimer.</p>
    </section>
  );
};
