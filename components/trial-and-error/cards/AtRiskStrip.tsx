import React from "react";
import type { CardFace } from "@/lib/trial-and-error";

type AtRisk = NonNullable<Extract<CardFace, { kind: "FIGURE" }>["atRisk"]>;

interface AtRiskStripProps {
  atRisk: AtRisk;
  /** Cells to mark, keyed `row:col`: open discrepancies and reconciled ones. */
  marks?: Readonly<Record<string, "open" | "reconciled">>;
  caption?: string;
}

const MARK_STYLES = {
  open: "bg-rose-500/10 text-rose-300",
  reconciled: "bg-amber-500/10 text-amber-300",
} as const;

/** The Number-at-Risk strip under a Kaplan–Meier plot: one row per arm. */
export function AtRiskStrip({ atRisk, marks = {}, caption }: AtRiskStripProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse font-mono text-xs tabular-nums"
        data-testid="at-risk-strip"
      >
        <caption className="text-left text-[10px] uppercase tracking-wider text-zinc-400">
          {caption ?? "Number at risk"}
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="border border-zinc-800 px-2 py-1 text-left font-normal text-zinc-400"
            >
              Time
            </th>
            {atRisk.times.map((t) => (
              <th
                key={t}
                scope="col"
                className="border border-zinc-800 px-2 py-1 text-right font-normal text-zinc-400"
              >
                {t}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {atRisk.rows.map((row, r) => (
            <tr key={row.label}>
              <th
                scope="row"
                className="border border-zinc-800 px-2 py-1 text-left font-normal text-zinc-300"
              >
                {row.label}
              </th>
              {row.values.map((v, c) => {
                const mark = marks[`${r}:${c}`];
                return (
                  <td
                    key={c}
                    data-mark={mark}
                    className={`border border-zinc-800 px-2 py-1 text-right ${mark ? MARK_STYLES[mark] : "text-zinc-200"}`}
                  >
                    {v}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
