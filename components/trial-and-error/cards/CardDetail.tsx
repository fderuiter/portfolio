import React from "react";
import type { TableCardView } from "@/lib/trial-and-error";
import {
  MiniOutput,
  POPULATION_LABEL,
  SUIT_TEXT,
} from "@/components/trial-and-error/cards/CardFace";
import { STAMP_LABELS } from "@/components/trial-and-error/cards/Stamp";

interface CardDetailProps {
  view: TableCardView;
  headingId: string;
}

/**
 * The enlarged, readable face of a card: its mini-output at full legibility.
 * Reading a face is free; it shows what the output prints, never the hidden
 * findings that Inspect reveals for CPU.
 */
export function CardDetail({ view, headingId }: CardDetailProps) {
  const { card } = view;
  const status = view.unverified
    ? "Unverified: not yet inspected"
    : view.inspected
      ? view.openRedlines > 0
        ? `${view.openRedlines} open redline${view.openRedlines === 1 ? "" : "s"}`
        : "Inspected"
      : "No reviewable cells in this slice";
  return (
    <div className="p-4">
      <p className="text-[10px] uppercase tracking-wider text-zinc-400">
        {card.cardType === "SUBJECT_TOKEN"
          ? "Subject token"
          : card.cardType.toLowerCase()}{" "}
        ·{" "}
        <span className={SUIT_TEXT[card.population]}>
          {POPULATION_LABEL[card.population]} population
        </span>
      </p>
      <h3 id={headingId} className="mt-1 text-base font-bold break-words">
        {card.number} · {card.title}
      </h3>
      <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-xs tabular-nums">
        <dt className="text-zinc-400">Chips</dt>
        <dd className="text-[color:var(--te-chips)]">{card.chips}</dd>
        <dt className="text-zinc-400">+Mult</dt>
        <dd className="text-[color:var(--te-plus-mult)]">{card.mult}</dd>
        <dt className="text-zinc-400">Review</dt>
        <dd className="break-words">{status}</dd>
        {view.stamps.length > 0 && (
          <>
            <dt className="text-zinc-400">Stamps</dt>
            <dd>{view.stamps.map((s) => STAMP_LABELS[s]).join(", ")}</dd>
          </>
        )}
      </dl>
      <div
        className="mt-3 overflow-x-auto border border-zinc-800 bg-[color:var(--te-surface-1)] p-2"
        data-testid="card-detail-face"
      >
        <MiniOutput
          face={view.face}
          size="detail"
          caption={`${card.number}: ${card.title}`}
        />
      </div>
    </div>
  );
}
