"use client";

import React from "react";
import { createPortal } from "react-dom";
import type { Scenario } from "@/lib/trial-and-error";
import { useFocusTrap } from "@/hooks/useFocusTrap";

interface BossIntroProps {
  /** The Boss Blind being entered. */
  scenario: Scenario;
  onDismiss: () => void;
}

/**
 * The boss intro card (T&E-09): entering a staged Boss Blind names the boss,
 * its debuff, the quota and each stage before the first card is played.
 * Enter, Escape or the button dismisses it, and focus returns to the table.
 */
export function BossIntro({ scenario, onDismiss }: BossIntroProps) {
  const ref = useFocusTrap<HTMLDivElement>(true, { onEscape: onDismiss });
  return createPortal(
    <div
      data-te-cabinet=""
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="boss-intro-heading"
        aria-describedby="boss-intro-debuff"
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto border border-rose-400/60 bg-[color:var(--te-surface-0)] p-4 font-mono text-[color:var(--te-text)]"
        data-testid="boss-intro"
      >
        <p className="text-[10px] uppercase tracking-wider text-rose-300">
          Boss Blind
        </p>
        <h2
          id="boss-intro-heading"
          className="text-sm font-bold uppercase tracking-wider break-words"
        >
          {scenario.title}
        </h2>
        {scenario.boss && (
          <p
            id="boss-intro-debuff"
            className="mt-2 border border-rose-400/60 p-2 text-xs text-rose-200 break-words"
          >
            <span className="block font-bold uppercase tracking-wider">
              Boss: {scenario.boss.name}
            </span>
            {scenario.boss.description}
          </p>
        )}
        <p className="mt-2 text-xs text-zinc-300 tabular-nums">
          Quota {scenario.blind.quota} · {scenario.table.startingCpu} CPU
        </p>
        {scenario.encounter && (
          <ol className="mt-2 space-y-1 text-xs text-zinc-300 tabular-nums">
            {scenario.encounter.stages.map((stage) => (
              <li key={stage.name} className="break-words">
                {stage.name}: {stage.session.toLowerCase()} session, quota{" "}
                {stage.quota}
              </li>
            ))}
          </ol>
        )}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-4 min-h-[48px] w-full border border-rose-400 bg-rose-500/10 px-4 py-3 text-xs font-bold uppercase tracking-wider text-rose-300 touch-manipulation hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 active:scale-[0.98]"
          data-testid="boss-intro-start"
        >
          Take the seat [Enter]
        </button>
      </div>
    </div>,
    document.fullscreenElement ?? document.body
  );
}
