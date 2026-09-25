import React from "react";
import type { TableCardView } from "@/lib/trial-and-error";
import {
  MiniOutput,
  POPULATION_LABEL,
  SUIT_TEXT,
} from "@/components/trial-and-error/cards/CardFace";
import { STAMP_LABELS } from "@/components/trial-and-error/cards/Stamp";
import { AtRiskStrip } from "@/components/trial-and-error/cards/AtRiskStrip";

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
  const status = view.blank
    ? `Empty shell: allocate ${view.compatiblePopulations.map((p) => POPULATION_LABEL[p]).join(" or ")} data to compile it`
    : view.unverified
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
        {view.blank ? (
          <span>blank shell</span>
        ) : (
          <span className={SUIT_TEXT[card.population]}>
            {POPULATION_LABEL[card.population]} population
          </span>
        )}
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
        <dt className="text-zinc-400">Snapshot</dt>
        <dd className="break-words" data-testid="snapshot-chip">
          {view.blank ? (
            "Not compiled yet"
          ) : (
            <>
              {view.provenance.id} · v{view.provenance.version}
              {view.stale && (
                <span className="text-rose-300">
                  {" "}
                  · stale: recompile required
                </span>
              )}
            </>
          )}
        </dd>
        {view.footnoteSlots > 0 && (
          <>
            <dt className="text-zinc-400">Footnotes</dt>
            <dd>
              {view.seals.length} of {view.footnoteSlots} slot
              {view.footnoteSlots === 1 ? "" : "s"} used
            </dd>
          </>
        )}
        {view.figure && (
          <>
            <dt className="text-zinc-400">Depends on</dt>
            <dd>{view.figure.parent}</dd>
            <dt className="text-zinc-400">×Mult</dt>
            <dd data-testid="figure-detail-xmult">
              {view.figure.active
                ? `×${view.figure.xMult} active`
                : `×${view.figure.xMult} off: ${view.figure.reason}`}
            </dd>
          </>
        )}
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
      {view.face.kind === "FIGURE" && view.face.atRisk && (
        <div className="mt-2">
          <AtRiskStrip atRisk={view.face.atRisk} />
        </div>
      )}
      {view.seals.length > 0 && (
        <ol
          className="mt-2 list-none space-y-1 text-xs text-zinc-300"
          aria-label="Footnotes"
          data-testid="card-footnotes"
        >
          {view.seals.map((seal, i) => (
            <li key={`${seal.id}-${i}`} className="break-words">
              <sup className="text-amber-300">{i + 1}</sup> {seal.footnote}{" "}
              <span className="text-zinc-400">({seal.name})</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
