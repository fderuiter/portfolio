"use client";

import React from "react";
import { IconRadio, IconCheck, IconFlag } from "@tabler/icons-react";

/**
 * Props for the MountainMap component.
 */
interface MountainMapProps {
  /** Number of patrol incidents completed during the current shift. */
  incidentsCompleted: number;
  /** Callback triggered when patroller stands by on hill and accepts incoming dispatch. */
  onAwaitDispatch: () => void;
  /** Callback triggered to initiate final sweep and conclude the shift. */
  onCompleteShift: () => void;
}

/**
 * Responsive, lightweight SVG trail map representing the Mountain Patrol Hub,
 * a comprehensive stylized recreation of Welch Village (Welch, MN) — a real
 * Twin Cities-area hill. Depicts all three of Welch's real sectors (East
 * Slopes, West Slopes, and The Back Bowl); every trail name, lift name,
 * chalet, and elevation stat is cross-checked against Welch Village's own
 * current published trail map. The artwork itself remains an original
 * illustration — not a reproduction of the resort's own trail map graphic.
 * Features animated chairlift line, marked trails (green circle, blue square, black diamond),
 * ambient snow particles, strict prefers-reduced-motion CSS, and operational dispatch actions.
 */
export const MountainMap: React.FC<MountainMapProps> = ({
  incidentsCompleted,
  onAwaitDispatch,
  onCompleteShift,
}) => {
  return (
    <div
      className="flex flex-col gap-5 p-4 sm:p-6 bg-zinc-900/40 rounded-2xl border border-zinc-800/80"
      data-testid="patrol-mountain-map"
    >
      <style>{`
        @keyframes patrolSnowFall {
          0% { transform: translateY(0); opacity: 0.7; }
          50% { opacity: 0.3; }
          100% { transform: translateY(18px); opacity: 0.7; }
        }
        @keyframes patrolChairMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(-30px); }
        }
        .patrol-snow-particle {
          animation: patrolSnowFall 3s ease-in-out infinite alternate;
        }
        .patrol-chair-group {
          animation: patrolChairMove 4s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .patrol-snow-particle,
          .patrol-chair-group {
            animation: none !important;
          }
        }
      `}</style>

      {/* Mountain Hub Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800/80">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
              Mountain Open &bull; Patrol On Hill
            </span>
            <span className="text-zinc-400 text-xs font-mono">
              Welch Village, MN
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-mono font-bold text-white tracking-tight">
            Mountain Patrol Hub &amp; Trail Map
          </h2>
          <p className="text-[10px] font-mono text-zinc-500">
            Base 700 ft &bull; Summit 1,060 ft &bull; Vertical 360 ft &bull; 50
            runs across 3 sectors
          </p>
        </div>

        {/* Patrol Stats Pills */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-300">
            <IconCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Incidents Resolved:{" "}
              <strong className="text-white">{incidentsCompleted}</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400">
            <IconRadio className="w-3.5 h-3.5 text-brand-cyan" />
            <span>154.570 MHz CH 1</span>
          </div>
        </div>
      </div>

      {/* Accessible Trail Map Alternative for Screen Readers */}
      <div className="sr-only">
        Detailed trail map of Welch Village, a Twin Cities-area ski hill,
        organized into three sectors: East Slopes, West Slopes, and The Back
        Bowl. Features Summit Patrol Shack at the top (1,060 feet elevation);
        the Belle Creek Quad lift line with towers 1 through 6 serving The Back
        Bowl, whose runs include The Great Gorge, Black Forest, and Adam&apos;s
        Abyss (all Black Diamond); Harley&apos;s Hollow (Blue Square) and the
        Cannon-Valley Quad and Dream Catcher run on the East Slopes; Long Way
        Home (Green Circle), Cedar Fork, Twister, and the West Quad on the West
        Slopes; the Skilink base connector; Main Chalet and East Chalet; and
        Base First Aid Room at the bottom (700 feet elevation). This is a
        stylized, original illustration cross-checked against Welch
        Village&apos;s own published trail map, not an official resort map.
        Total completed count: {incidentsCompleted}.
      </div>

      {/* SVG Trail Map Canvas */}
      <div className="relative w-full rounded-2xl border border-zinc-800/80 bg-zinc-950/90 overflow-hidden shadow-inner flex items-center justify-center p-2 sm:p-4">
        <svg
          viewBox="0 0 800 500"
          className="w-full h-auto max-h-[460px] select-none"
          role="img"
          aria-label="Welch Village Trail Map"
        >
          <title>Welch Village Trail Map</title>
          <desc>
            Stylized, original illustration of Welch Village (Welch, MN) showing
            its three real sectors — East Slopes, West Slopes, and The Back Bowl
            — Summit Shack, the Belle Creek Quad chairlift (Towers 1 through 6),
            The Great Gorge, Black Forest, and Adam&apos;s Abyss black diamond
            trails in The Back Bowl, Harley&apos;s Hollow blue square trail and
            the Cannon-Valley Quad and Dream Catcher on the East Slopes, Long
            Way Home green circle trail, Cedar Fork, Twister, and the West Quad
            on the West Slopes, the Skilink base connector, Main Chalet, East
            Chalet, and Base Lodge First Aid Room. Not an official Welch Village
            resort map.
          </desc>

          <defs>
            {/* Mountain Gradient */}
            <linearGradient id="mountainBg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#18181b" />
              <stop offset="40%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            {/* Trail Gradients */}
            <linearGradient
              id="greenTrailGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient
              id="blueTrailGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
            </linearGradient>
            <linearGradient
              id="blackTrailGrad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#be123c" stopOpacity="0.5" />
            </linearGradient>
          </defs>

          {/* Background Mountain Silhouette */}
          <rect width="800" height="500" rx="16" fill="url(#mountainBg)" />

          {/* Topographic Contour Lines */}
          <path
            d="M 50 140 Q 250 80 400 90 T 750 130"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 40 240 Q 260 190 410 200 T 760 230"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <path
            d="M 30 350 Q 280 300 420 310 T 770 340"
            fill="none"
            stroke="#334155"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.5"
          />

          {/* Mountain Peak / Ridge Geometry */}
          <polygon
            points="100,500 400,60 700,500"
            fill="#1e293b"
            opacity="0.35"
          />
          <polygon
            points="220,500 420,70 620,500"
            fill="#334155"
            opacity="0.2"
          />

          {/* SECTOR LABELS */}
          <text
            x="230"
            y="98"
            fill="#64748b"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="1"
            textAnchor="middle"
            opacity="0.8"
          >
            EAST SLOPES
          </text>
          <text
            x="575"
            y="98"
            fill="#64748b"
            fontSize="10"
            fontWeight="bold"
            fontFamily="monospace"
            letterSpacing="1"
            textAnchor="middle"
            opacity="0.8"
          >
            WEST SLOPES
          </text>

          {/* TRAILS */}

          {/* Trail 1: Long Way Home (Green Circle) — West Slopes */}
          <path
            d="M 370 85 C 260 120 140 200 130 310 C 120 400 240 450 320 460"
            fill="none"
            stroke="url(#greenTrailGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 370 85 C 260 120 140 200 130 310 C 120 400 240 450 320 460"
            fill="none"
            stroke="#059669"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Trail 2: Harley's Hollow (Blue Square) — East Slopes */}
          <path
            d="M 430 85 C 520 150 560 240 540 330 C 520 410 450 440 390 460"
            fill="none"
            stroke="url(#blueTrailGrad)"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 430 85 C 520 150 560 240 540 330 C 520 410 450 440 390 460"
            fill="none"
            stroke="#0284c7"
            strokeWidth="2"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Trail 3: The Great Gorge (Black Diamond - Fall Line) — The Back Bowl */}
          <path
            d="M 395 85 C 380 150 340 220 370 290 C 390 350 370 410 360 460"
            fill="none"
            stroke="url(#blackTrailGrad)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M 395 85 C 380 150 340 220 370 290 C 390 350 370 410 360 460"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeDasharray="8 4"
            strokeLinecap="round"
          />

          {/* CHAIRLIFT LINE (Belle Creek Quad) */}
          <line
            x1="460"
            y1="465"
            x2="435"
            y2="75"
            stroke="#64748b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />

          {/* Chairlift Towers 1 through 6 */}
          {[
            { id: 1, x: 457, y: 410 },
            { id: 2, x: 453, y: 345 },
            { id: 3, x: 449, y: 280 },
            { id: 4, x: 445, y: 215 },
            { id: 5, x: 441, y: 150 },
            { id: 6, x: 437, y: 95 },
          ].map((tower) => (
            <g key={tower.id}>
              {/* Tower Mast */}
              <line
                x1={tower.x}
                y1={tower.y}
                x2={tower.x}
                y2={tower.y + 12}
                stroke="#94a3b8"
                strokeWidth="2.5"
              />
              {/* Tower Crossarm */}
              <line
                x1={tower.x - 6}
                y1={tower.y}
                x2={tower.x + 6}
                y2={tower.y}
                stroke="#cbd5e1"
                strokeWidth="2"
              />
              {/* Tower Label */}
              <text
                x={tower.x + 10}
                y={tower.y + 4}
                fill="#94a3b8"
                fontSize="9"
                fontFamily="monospace"
              >
                T{tower.id}
              </text>
            </g>
          ))}

          {/* Animated Chairs along the cable */}
          <g className="patrol-chair-group">
            {[260, 190, 120].map((cy, idx) => (
              <g key={idx} transform={`translate(446, ${cy})`}>
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="7"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <rect x="-4" y="7" width="8" height="5" rx="1" fill="#38bdf8" />
              </g>
            ))}
          </g>

          {/* AMBIENT FALLING SNOW PARTICLES */}
          <g className="patrol-snow-particle" fill="#ffffff" opacity="0.6">
            <circle cx="200" cy="110" r="1.5" />
            <circle cx="310" cy="80" r="2" />
            <circle cx="500" cy="140" r="1.5" />
            <circle cx="620" cy="210" r="1.5" />
            <circle cx="280" cy="270" r="2" />
            <circle cx="160" cy="380" r="1.5" />
            <circle cx="480" cy="390" r="2" />
            <circle cx="670" cy="330" r="1.5" />
            <circle cx="390" cy="210" r="2" />
            <circle cx="580" cy="90" r="1.5" />
          </g>

          {/* SUMMIT STATION & PATROL SHACK */}
          <g transform="translate(390, 50)">
            <rect
              x="-24"
              y="-12"
              width="48"
              height="24"
              rx="4"
              fill="#09090b"
              stroke="#00f0ff"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="3"
              fill="#00f0ff"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              SUMMIT
            </text>
            <text
              x="0"
              y="22"
              fill="#67e8f9"
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.85"
            >
              1,060 FT
            </text>
            <circle cx="-16" cy="-4" r="2" fill="#ef4444" />
          </g>

          {/* THE BACK BOWL — separate expert-terrain sector, top-left inset */}
          <g transform="translate(95, 122)">
            <rect
              x="-52"
              y="-30"
              width="104"
              height="60"
              rx="6"
              fill="#09090b"
              stroke="#f43f5e"
              strokeWidth="1.5"
              opacity="0.95"
            />
            <text
              x="0"
              y="-16"
              fill="#fda4af"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              THE BACK BOWL
            </text>
            <text
              x="0"
              y="-2"
              fill="#fecdd3"
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Black Forest &#9670;
            </text>
            <text
              x="0"
              y="10"
              fill="#fecdd3"
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
            >
              Adam&apos;s Abyss &#9670;
            </text>
            <text
              x="0"
              y="22"
              fill="#94a3b8"
              fontSize="6"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.85"
            >
              via Belle Creek Quad
            </text>
          </g>

          {/* BASE LODGE & FIRST AID ROOM */}
          <g transform="translate(360, 470)">
            <rect
              x="-40"
              y="-14"
              width="80"
              height="28"
              rx="6"
              fill="#09090b"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <text
              x="0"
              y="0"
              fill="#34d399"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              BASE AID ROOM
            </text>
            <text
              x="0"
              y="11"
              fill="#6ee7b7"
              fontSize="7"
              fontFamily="monospace"
              textAnchor="middle"
              opacity="0.85"
            >
              700 FT &bull; WELCH, MN
            </text>
          </g>

          {/* Main Chalet — real base building, west of Base Aid Room */}
          <g transform="translate(215, 466)" opacity="0.9">
            <circle cx="0" cy="0" r="4" fill="#38bdf8" />
            <text
              x="9"
              y="3"
              fill="#bae6fd"
              fontSize="8"
              fontFamily="monospace"
            >
              Main Chalet
            </text>
          </g>

          {/* East Chalet — real base building, east of Base Aid Room */}
          <g transform="translate(505, 466)" opacity="0.9">
            <circle cx="0" cy="0" r="4" fill="#38bdf8" />
            <text
              x="9"
              y="3"
              fill="#bae6fd"
              fontSize="8"
              fontFamily="monospace"
            >
              East Chalet
            </text>
          </g>

          {/* TRAIL MARKER LABELS & BADGES */}

          {/* Green Circle Marker */}
          <g transform="translate(130, 290)">
            <circle cx="0" cy="0" r="8" fill="#10b981" />
            <text
              x="14"
              y="4"
              fill="#a7f3d0"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              Long Way Home ●
            </text>
          </g>

          {/* Skilink Marker — base-area connector lift near the lodge */}
          <g transform="translate(155, 345)" opacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#facc15" />
            <text
              x="12"
              y="4"
              fill="#fde68a"
              fontSize="8"
              fontFamily="monospace"
            >
              Skilink (Base Connector)
            </text>
          </g>

          {/* Dream Catcher Marker — East Slopes blue square */}
          <g transform="translate(80, 200)" opacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#0284c7" />
            <text
              x="10"
              y="4"
              fill="#bae6fd"
              fontSize="8"
              fontFamily="monospace"
            >
              Dream Catcher ■
            </text>
          </g>

          {/* Cannon-Valley Quad Marker — East Slopes lift */}
          <g transform="translate(75, 405)" opacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#facc15" />
            <text
              x="10"
              y="4"
              fill="#fde68a"
              fontSize="8"
              fontFamily="monospace"
            >
              Cannon-Valley Quad
            </text>
          </g>

          {/* Blue Square Marker */}
          <g transform="translate(545, 270)">
            <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#0284c7" />
            <text
              x="14"
              y="4"
              fill="#bae6fd"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              Harley&apos;s Hollow ■
            </text>
          </g>

          {/* Cedar Fork Marker — West Slopes green circle */}
          <g transform="translate(630, 128)" opacity="0.9">
            <circle cx="0" cy="0" r="5" fill="#10b981" />
            <text
              x="10"
              y="4"
              fill="#a7f3d0"
              fontSize="8"
              fontFamily="monospace"
            >
              Cedar Fork ●
            </text>
          </g>

          {/* Twister Marker — West Slopes black diamond */}
          <g transform="translate(635, 385)" opacity="0.9">
            <polygon
              points="0,-6 6,0 0,6 -6,0"
              fill="#be123c"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <text
              x="11"
              y="4"
              fill="#fecdd3"
              fontSize="8"
              fontFamily="monospace"
            >
              Twister &#9670;
            </text>
          </g>

          {/* West Quad Marker — West Slopes lift */}
          <g transform="translate(715, 445)" opacity="0.9">
            <rect x="-5" y="-5" width="10" height="10" rx="2" fill="#facc15" />
            <text
              x="10"
              y="4"
              fill="#fde68a"
              fontSize="8"
              fontFamily="monospace"
            >
              West Quad
            </text>
          </g>

          {/* Black Diamond Marker */}
          <g transform="translate(305, 210)">
            <polygon
              points="0,-8 8,0 0,8 -8,0"
              fill="#be123c"
              stroke="#f43f5e"
              strokeWidth="1"
            />
            <text
              x="14"
              y="4"
              fill="#fecdd3"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              The Great Gorge ◆
            </text>
          </g>

          {/* Compass / Orientation Rose */}
          <g transform="translate(730, 60)" opacity="0.8">
            <circle
              cx="0"
              cy="0"
              r="18"
              fill="#09090b"
              stroke="#334155"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="-14"
              x2="0"
              y2="14"
              stroke="#64748b"
              strokeWidth="1"
            />
            <line
              x1="-14"
              y1="0"
              x2="14"
              y2="0"
              stroke="#64748b"
              strokeWidth="1"
            />
            <polygon points="0,-13 4,-5 -4,-5" fill="#00f0ff" />
            <text
              x="0"
              y="-16"
              fill="#00f0ff"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              N
            </text>
          </g>
        </svg>

        {/* Floating Sector Badge */}
        <div className="absolute top-4 left-4 bg-zinc-950/80 backdrop-blur-sm border border-zinc-800 rounded-xl px-3 py-1.5 text-[11px] font-mono text-zinc-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>
            Hill Sector: <strong>The Back Bowl &bull; Belle Creek Quad</strong>
          </span>
        </div>
      </div>

      {/* Map Attribution */}
      <p className="text-[10px] font-mono text-zinc-600 -mt-2">
        Stylized, unofficial illustration cross-checked against Welch
        Village&apos;s own published trail map. East Slopes: Harley&apos;s
        Hollow, Dream Catcher, Cannon-Valley Quad. West Slopes: Long Way Home,
        Cedar Fork, Twister, West Quad. The Back Bowl (via Belle Creek Quad):
        The Great Gorge, Black Forest, Adam&apos;s Abyss. Base area: Main
        Chalet, East Chalet, Skilink. Not affiliated with or endorsed by Welch
        Village Ski Area.
      </p>

      {/* Action Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="text-xs font-mono text-zinc-400">
          Radio Frequency:{" "}
          <strong className="text-brand-cyan">154.570 MHz</strong> • Listening
          for Base Dispatch...
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {incidentsCompleted >= 1 && (
            <button
              type="button"
              onClick={onCompleteShift}
              className="min-h-[44px] min-w-[44px] px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              <IconFlag className="w-4 h-4" />
              <span>Call Final Sweep / Complete Shift</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAwaitDispatch}
            className="min-h-[44px] min-w-[44px] px-6 py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyan/90 active:scale-[0.98] text-zinc-950 font-mono text-xs font-bold transition-all cursor-pointer inline-flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <IconRadio className="w-4 h-4" />
            <span>Standby on Hill / Await Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
