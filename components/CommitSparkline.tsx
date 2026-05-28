"use client";

import React, { useMemo, useId } from "react";

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

  // Generate SVG path coordinates
  const { pathD, areaD } = useMemo(() => {
    const width = 300;
    const height = 60;
    const padding = 6;
    const usableHeight = height - padding * 2;

    const points = dataPoints.map((val, i) => {
      const x = (i / (dataPoints.length - 1)) * width;
      // Inverse coordinate space: y = 0 is top
      const percentage = (val - minVal) / ((maxVal - minVal) || 1);
      const y = height - padding - (percentage * usableHeight);
      return { x, y };
    });

    if (points.length === 0) return { pathD: "", areaD: "" };

    // Construct highly smooth cubic bezier path commands
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) / 2;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    const area = `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;

    return { pathD: path, areaD: area };
  }, [dataPoints, minVal, maxVal]);

  const id = useId();
  const uniqueId = useMemo(() => `sparkline-${id.replace(/:/g, "-")}`, [id]);

  return (
    <div className={`w-full relative select-none ${className || ""}`}>
      {/* Sparkline Title Metadata */}
      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 mb-2">
        <span className="tracking-widest uppercase">Commit Activity (12 Months)</span>
        <span className="text-brand-cyan font-bold">{totalCommits} Commits</span>
      </div>

      {/* SVG Canvas Sparkline Graph */}
      <div className="relative bg-zinc-950/40 border border-zinc-900/60 rounded-xl p-2.5 overflow-hidden flex items-center justify-center">
        {/* Glow ambient accent light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-12 rounded-full bg-brand-cyan/5 blur-2xl pointer-events-none" />

        <svg
          viewBox="0 0 300 60"
          className="w-full h-[60px] overflow-visible relative z-10"
          role="img"
          aria-label={`GitHub commit activity timeline over the last 12 months. Total commits: ${totalCommits}`}
        >
          <defs>
            {/* Area gradient under the path */}
            <linearGradient id={`${uniqueId}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
            </linearGradient>
            
            {/* Timeline color stroke gradient */}
            <linearGradient id={`${uniqueId}-stroke`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>

            {/* Glowing line filter */}
            <filter id={`${uniqueId}-glow`} x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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
            filter={`url(#${uniqueId}-glow)`}
            className="transition-all duration-300"
          />
        </svg>
      </div>
    </div>
  );
};
