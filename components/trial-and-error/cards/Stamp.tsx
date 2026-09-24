import React from "react";
import type { CardStamp } from "@/lib/trial-and-error";

const STAMP_TEXT: Record<CardStamp, string> = {
  REDLINE: "REDLINE",
  QC_PASS: "QC ✓",
  STALE: "STALE",
  SEALED: "SEALED",
  BLINDED: "BLINDED",
};

const STAMP_STYLE: Record<CardStamp, string> = {
  REDLINE: "border-[color:var(--te-redline)] text-[color:var(--te-redline)]",
  QC_PASS:
    "border-[color:var(--te-validated)] text-[color:var(--te-validated)]",
  STALE: "border-rose-400 text-rose-300",
  SEALED: "border-slate-300 text-slate-300",
  BLINDED: "border-zinc-300 text-zinc-300",
};

/** Spoken form of each stamp, for card labels. */
export const STAMP_LABELS: Record<CardStamp, string> = {
  REDLINE: "redline stamp",
  QC_PASS: "QC passed stamp",
  STALE: "stale stamp",
  SEALED: "sealed stamp",
  BLINDED: "blinded stamp",
};

/**
 * The card face's stamp slot. Later tickets add stamp kinds to the domain's
 * `CardStamp` and they render here without new layout.
 */
export function StampSlot({ stamps }: { stamps: CardStamp[] }) {
  if (stamps.length === 0) return null;
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-1"
      data-testid="stamp-slot"
    >
      {stamps.map((stamp) => (
        <span
          key={stamp}
          data-stamp={stamp}
          className={`-rotate-12 border-2 bg-black/70 px-1.5 text-[11px] font-bold uppercase tracking-widest ${STAMP_STYLE[stamp]}`}
        >
          {STAMP_TEXT[stamp]}
        </span>
      ))}
    </span>
  );
}
