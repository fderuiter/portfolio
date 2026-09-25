import React from "react";
import type { FigurePlot } from "@/lib/trial-and-error";

interface MiniFigureProps {
  plot: FigurePlot;
  size: "card" | "detail";
  /** Accessible description for the detail view. */
  label?: string;
}

// Explicit hex presentation attributes (AGENTS.md §17), matching --te-chips
// and --te-plus-mult, so the plot rasterizes the same without CSS.
const SERIES_STROKES = ["#93c5fd", "#f59e0b"];
const AXIS = "#52525b";
const W = 120;
const H = 60;
const PAD = 4;

function scale(values: number[], lo: number, hi: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return (v: number) => lo + ((v - min) / span) * (hi - lo);
}

/** A KM step path: horizontal, then vertical, at each event time. */
function stepPath(
  points: [number, number][],
  x: (v: number) => number,
  y: (v: number) => number
) {
  return points
    .map(([px, py], i) => {
      if (i === 0) return `M${x(px)},${y(py)}`;
      return `H${x(px)}V${y(py)}`;
    })
    .join("");
}

/** A KM step function's value at time t. */
function kmValueAt(points: [number, number][], t: number) {
  let value = points[0]?.[1] ?? 1;
  for (const [px, py] of points) if (px <= t) value = py;
  return value;
}

/**
 * A Figure face drawn from the card's data: a Kaplan-Meier step curve, a
 * sparkline, or a forest plot of subgroup intervals.
 */
export function MiniFigure({ plot, size, label }: MiniFigureProps) {
  const detail = size === "detail";
  let body: React.ReactNode;

  if (plot.type === "FOREST") {
    const all = plot.intervals
      .flatMap((i) => [i.lower, i.upper])
      .concat(plot.reference);
    const x = scale(all, PAD + 30, W - PAD);
    const rowH = (H - PAD * 2) / plot.intervals.length;
    body = (
      <>
        <line
          x1={x(plot.reference)}
          x2={x(plot.reference)}
          y1={PAD}
          y2={H - PAD}
          stroke={AXIS}
          strokeWidth={0.75}
          strokeDasharray="2 2"
        />
        {plot.intervals.map((interval, i) => {
          const cy = PAD + rowH * (i + 0.5);
          return (
            <g key={interval.label}>
              <text
                x={PAD}
                y={cy + 2.5}
                fontSize={detail ? 5 : 6}
                fill="#a1a1aa"
              >
                {interval.label}
              </text>
              <line
                x1={x(interval.lower)}
                x2={x(interval.upper)}
                y1={cy}
                y2={cy}
                stroke={SERIES_STROKES[0]}
                strokeWidth={1}
              />
              <rect
                x={x(interval.estimate) - 1.5}
                y={cy - 1.5}
                width={3}
                height={3}
                fill={SERIES_STROKES[1]}
                stroke="none"
              />
            </g>
          );
        })}
      </>
    );
  } else {
    const points = plot.series.flatMap((s) => s.points);
    const x = scale(
      points.map((p) => p[0]),
      PAD,
      W - PAD
    );
    const y = scale(
      points.map((p) => p[1]),
      H - PAD,
      PAD
    );
    body = (
      <>
        <line
          x1={PAD}
          x2={W - PAD}
          y1={H - PAD}
          y2={H - PAD}
          stroke={AXIS}
          strokeWidth={0.75}
        />
        <line
          x1={PAD}
          x2={PAD}
          y1={PAD}
          y2={H - PAD}
          stroke={AXIS}
          strokeWidth={0.75}
        />
        {plot.type === "KM" &&
          plot.series.flatMap((series, i) =>
            (series.censors ?? []).map((t, j) => {
              const cx = x(t);
              const cy = y(kmValueAt(series.points, t));
              return (
                <line
                  key={`${series.label}-tick-${j}`}
                  data-censor-tick=""
                  x1={cx}
                  x2={cx}
                  y1={cy - 2.5}
                  y2={cy + 2.5}
                  stroke={SERIES_STROKES[i % SERIES_STROKES.length]}
                  strokeWidth={0.75}
                />
              );
            })
          )}
        {plot.series.map((series, i) => (
          <path
            key={series.label}
            d={
              plot.type === "KM"
                ? stepPath(series.points, x, y)
                : series.points
                    .map(([px, py], j) => `${j ? "L" : "M"}${x(px)},${y(py)}`)
                    .join("")
            }
            fill="none"
            stroke={SERIES_STROKES[i % SERIES_STROKES.length]}
            strokeWidth={detail ? 1 : 1.5}
          />
        ))}
      </>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={detail ? "h-auto w-full max-w-md" : "h-full w-full"}
      preserveAspectRatio="xMidYMid meet"
      data-face-kind="FIGURE"
      {...(detail && label
        ? { role: "img", "aria-label": label }
        : { "aria-hidden": true })}
    >
      {body}
    </svg>
  );
}

/** A plain-language description of a figure's data, for the detail view. */
export function describePlot(plot: FigurePlot): string {
  if (plot.type === "FOREST") {
    return `Forest plot, reference ${plot.reference}: ${plot.intervals
      .map((i) => `${i.label} ${i.estimate} (${i.lower} to ${i.upper})`)
      .join("; ")}.`;
  }
  const kind = plot.type === "KM" ? "Kaplan-Meier curve" : "Line chart";
  return `${kind}: ${plot.series
    .map(
      (s) =>
        `${s.label} ${s.points.map(([x, y]) => `${x}: ${y}`).join(", ")}${
          s.censors && s.censors.length > 0
            ? `, censored at ${s.censors.join(", ")}`
            : ""
        }`
    )
    .join("; ")}.`;
}
