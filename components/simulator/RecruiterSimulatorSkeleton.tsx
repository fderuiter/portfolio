import React from "react";

export function RecruiterSimulatorSkeleton() {
  return (
    <div
      role="region"
      aria-label="Incident simulator workspace skeleton"
      className="w-full max-w-2xl mx-auto min-h-[500px] bg-zinc-900/40 border border-zinc-800/80 rounded-3xl p-6 sm:p-10 animate-pulse flex flex-col gap-6"
    >
      <div className="h-4 w-32 bg-zinc-800 rounded-md" />
      <div className="h-8 w-3/4 bg-zinc-800 rounded-lg" />
      <div className="h-4 w-5/6 bg-zinc-800/60 rounded-md" />
      <div className="flex flex-col gap-4 mt-6">
        <div className="h-20 w-full bg-zinc-900/80 border border-zinc-800/50 rounded-2xl" />
        <div className="h-20 w-full bg-zinc-900/80 border border-zinc-800/50 rounded-2xl" />
      </div>
    </div>
  );
}
