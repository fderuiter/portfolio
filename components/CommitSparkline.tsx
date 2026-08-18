"use client";

import React, { useMemo, useId } from "react";
import { mapDataToCoordinates, generateHermiteSplinePath } from "@/lib/graphics-math";

interface CommitSparklineProps {
  activity: number[];
  className?: string;
}

export const CommitSparkline: React.FC<CommitSparklineProps> = ({ 
  activity,
  className 
}) => {
  // Ensure we have exactly 52 data points (if less, default to baseline)
  const dataPoints = useMemo(() => {
    if (!activity || activity.length === 0) {
      return Array.from({ length: 52 }, () => 0);
    }
    return activity;
  }, [activity]);

  // Aggregate total commits in this 12-month period
  const totalCommits = useMemo(() => {
    return dataPoints.reduce((a, b) => a + b, 0);
  }, [dataPoints]);

  const maxVal = useMemo(() => Math.max(...dataPoints, 1), [dataPoints]);
  const minVal = useMemo(() => Math.min(...dataPoints, 0), [dataPoints]);

  // Generate SVG path coordinates utilizing the central graphics engine
  const { pathD, areaD } = useMemo(() => {
    const width = 300;
    const height = 60;
    const padding = 6;

    const points = mapDataToCoordinates(dataPoints, width, height, padding, minVal, maxVal);
    return generateHermiteSplinePath(points, height);
  }, [dataPoints, minVal, maxVal]);

  const id = useId();
  const uniqueId = useMemo(() => `sparkline-${id.replace(/:/g, "-")}`, [id]);

  return (
    <div className={`w-full relative select-none ${className || ""}`}>
      {/* Sparkline Title Metadata */}
      <div className="flex justify-between items-center text-[10px] font-mono text-[var(--muted,#94a3b8)] mb-2">
        <span className="tracking-widest uppercase">Commit Activity (12 Months)</span>
        <span className="text-[var(--brand-cyan,#06b6d4)] font-bold">{totalCommits} Commits</span>
      </div>

      {/* SVG Canvas Sparkline Graph */}
      <div className="relative bg-[var(--surface-1,rgba(20,22,28,0.4))] border border-[var(--border,rgba(255,255,255,0.08))] rounded-xl p-2.5 overflow-hidden flex items-center justify-center">
        {/* Glow ambient accent light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 rounded-full bg-[var(--brand-cyan-glow,rgba(6,182,212,0.05))] blur-2xl pointer-events-none" />

        <svg
          viewBox="0 0 300 60"
          className="w-full h-[60px] overflow-visible relative z-10"
          role="img"
          aria-label={`GitHub commit activity timeline over the last 12 months. Total commits: ${totalCommits}`}
        >
          <defs>
            {/* Area gradient under the path */}
            <linearGradient id={`${uniqueId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--brand-cyan, #06b6d4)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--brand-cyan, #06b6d4)" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Timeline color stroke gradient */}
            <linearGradient id={`${uniqueId}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--brand-cyan, #06b6d4)" />
              <stop offset="50%" stopColor="var(--brand-blue, #3b82f6)" />
              <stop offset="100%" stopColor="var(--brand-cyan, #06b6d4)" />
            </linearGradient>
          </defs>

          {/* Shaded Area */}
          <path
            d={areaD}
            fill={`url(#${uniqueId}-area)`}
            className="transition-all duration-300"
          />

          {/* Sparkline Neon Path */}
          <path
            d={pathD}
            fill="none"
            stroke={`url(#${uniqueId}-stroke)`}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="svg-glow-cyan transition-all duration-300"
          />
        </svg>
      </div>
    </div>
  );
};
