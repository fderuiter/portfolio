import React from "react";
import type { CardFace } from "@/lib/trial-and-error";

type TableFace = Extract<CardFace, { kind: "TABLE" }>;
type ListingFace = Extract<CardFace, { kind: "LISTING" }>;

interface MiniTableProps {
  face: TableFace | ListingFace;
  /** "card": a decorative miniature inside the card button. "detail": a real table. */
  size: "card" | "detail";
  caption?: string;
}

/**
 * A Table or Listing face. On the card it is a hairline-gridded miniature of
 * spans (a `<button>` may not contain a `<table>`, and the card's accessible
 * name already describes it); in the detail view it is a real table.
 */
export function MiniTable({ face, size, caption }: MiniTableProps) {
  const header = face.kind === "TABLE" ? ["", ...face.columns] : face.columns;
  const rows =
    face.kind === "TABLE"
      ? face.rows.map((row) => [row.label, ...row.values])
      : face.rows;

  if (size === "detail") {
    return (
      <table className="w-full border-collapse text-left text-sm tabular-nums">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="border border-zinc-800 px-2 py-1 font-normal text-zinc-400"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) =>
                c === 0 ? (
                  <th
                    key={c}
                    scope="row"
                    className="border border-zinc-800 px-2 py-1 font-normal text-zinc-300"
                  >
                    {cell}
                  </th>
                ) : (
                  <td
                    key={c}
                    className="border border-zinc-800 px-2 py-1 text-right text-[color:var(--te-text)]"
                  >
                    {cell}
                  </td>
                )
              )}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-face-kind={face.kind}
      className="grid w-full gap-px bg-zinc-800 text-[9px] leading-tight tabular-nums"
      style={{
        gridTemplateColumns: `minmax(0,1.3fr) repeat(${header.length - 1}, minmax(0,1fr))`,
      }}
    >
      {[header, ...rows].map((row, r) =>
        row.map((cell, c) => (
          <span
            key={`${r}:${c}`}
            className={`truncate bg-[color:var(--te-surface-1)] px-0.5 ${
              r === 0
                ? "text-zinc-400"
                : c === 0
                  ? "text-zinc-300"
                  : "text-right text-[color:var(--te-text)]"
            }`}
          >
            {cell}
          </span>
        ))
      )}
    </span>
  );
}
