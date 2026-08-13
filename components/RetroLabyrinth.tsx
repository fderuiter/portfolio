"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";

const MAZE = [
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "P", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
  ["#", "#", "#", " ", "#", " ", "#", "#", "#", "#", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", " ", " ", " ", " ", " ", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", "#", "#", "#", "#", "#", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", " ", " ", " ", " ", " ", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", "#", " ", "#", "#", "#", " ", "#", " ", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", "#", " ", " ", " ", " ", " ", " ", " ", "#", "E", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
];

const START_X = 1;
const START_Y = 1;
const EXIT_X = 13;
const EXIT_Y = 7;

interface RetroLabyrinthProps {
  isMounted: boolean;
}

export const RetroLabyrinth: React.FC<RetroLabyrinthProps> = ({ isMounted }) => {
  const [playerPosition, setPlayerPosition] = useState({ x: START_X, y: START_Y });
  const [gameStatus, setGameStatus] = useState<"playing" | "victory">("playing");
  const [isFocused, setIsFocused] = useState(false);
  const [movesCount, setMovesCount] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { recordEvent } = useTelemetry();

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Restart the game
  const handleRestart = () => {
    setPlayerPosition({ x: START_X, y: START_Y });
    setGameStatus("playing");
    setMovesCount(0);
  };

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameStatus !== "playing") return;

    const key = e.key;
    const interceptKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d", "W", "A", "S", "D"];

    if (interceptKeys.includes(key)) {
      e.preventDefault(); // Prevent standard page scroll
    } else {
      return;
    }

    let nextX = playerPosition.x;
    let nextY = playerPosition.y;

    if (key === "ArrowUp" || key.toLowerCase() === "w") {
      nextY -= 1;
    } else if (key === "ArrowDown" || key.toLowerCase() === "s") {
      nextY += 1;
    } else if (key === "ArrowLeft" || key.toLowerCase() === "a") {
      nextX -= 1;
    } else if (key === "ArrowRight" || key.toLowerCase() === "d") {
      nextX += 1;
    }

    // Check boundary & wall collision
    if (
      nextY >= 0 &&
      nextY < MAZE.length &&
      nextX >= 0 &&
      nextX < MAZE[0].length &&
      MAZE[nextY][nextX] !== "#"
    ) {
      setPlayerPosition({ x: nextX, y: nextY });
      setMovesCount((prev) => prev + 1);

      // Check if exit reached
      if (nextX === EXIT_X && nextY === EXIT_Y) {
        setGameStatus("victory");
        // Record telemetry event asynchronously
        recordEvent("labyrinth_solved", "project_click").catch((err) => {
          console.error("Failed to record telemetry for labyrinth solution:", err);
        });
      }
    }
  };

  // Draw Game State on Canvas (highly optimized event-driven draw loop)
  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#09090b"; // bg-brand-dark
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / MAZE[0].length; // 16px
    const cellHeight = canvas.height / MAZE.length; // 16px

    // 1. Draw Maze Grid
    for (let y = 0; y < MAZE.length; y++) {
      for (let x = 0; x < MAZE[y].length; x++) {
        const cell = MAZE[y][x];
        const px = x * cellWidth;
        const py = y * cellHeight;

        if (cell === "#") {
          // Draw Retro Neon Indigo/Dark Walls
          ctx.fillStyle = "#171717"; // neutral-900
          ctx.fillRect(px, py, cellWidth, cellHeight);
          
          // Outer subtle border
          ctx.strokeStyle = "rgba(6, 182, 212, 0.15)"; // brand-cyan border with opacity
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellWidth - 1, cellHeight - 1);
        } else if (x === EXIT_X && y === EXIT_Y) {
          // Draw Exit E
          ctx.fillStyle = "rgba(16, 185, 129, 0.15)"; // green-500 opacity
          ctx.fillRect(px, py, cellWidth, cellHeight);
          
          ctx.strokeStyle = "#10b981"; // emerald-500 border
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1.5, py + 1.5, cellWidth - 3, cellHeight - 3);

          // Draw 'E' in center
          ctx.fillStyle = "#10b981";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("E", px + cellWidth / 2, py + cellHeight / 2);
        } else {
          // Draw standard path: tiny dot
          ctx.fillStyle = "rgba(6, 182, 212, 0.1)";
          ctx.beginPath();
          ctx.arc(px + cellWidth / 2, py + cellHeight / 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Player P
    const pX = playerPosition.x * cellWidth + cellWidth / 2;
    const pY = playerPosition.y * cellHeight + cellHeight / 2;

    // Draw player glow
    const glowGradient = ctx.createRadialGradient(pX, pY, 2, pX, pY, 10);
    glowGradient.addColorStop(0, "rgba(6, 182, 212, 0.6)");
    glowGradient.addColorStop(1, "rgba(6, 182, 212, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(pX, pY, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw inner player core
    ctx.fillStyle = "#06b6d4"; // brand cyan
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, Math.PI * 2);
    ctx.fill();

  }, [isMounted, playerPosition, gameStatus, isFocused]);

  // Generate ASCII fallback string for perfect Server-Side non-JS compatibility
  const renderAsciiFallback = () => {
    return MAZE.map((row, y) =>
      row.map((cell, x) => {
        if (cell === "#") return "█";
        if (x === START_X && y === START_Y) return "@";
        if (x === EXIT_X && y === EXIT_Y) return "E";
        return "·";
      }).join(" ")
    ).join("\n");
  };

  if (!isMounted) {
    // Non-JavaScript and Pre-rendering Fallback Representation
    return (
      <div className="relative w-full h-[240px] bg-neutral-950/80 border border-neutral-900 rounded-2xl flex flex-col items-center justify-center font-mono select-none overflow-hidden my-6">
        {/* Header */}
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          <span>SYSTEM_LABYRINTH.EXE</span>
          <span className="text-neutral-600">OFFLINE</span>
        </div>

        {/* Maze Grid */}
        <pre className="text-[10px] sm:text-[11px] leading-4 tracking-normal text-brand-cyan/60 font-mono select-none text-center p-2">
          {renderAsciiFallback()}
        </pre>

        {/* Footer */}
        <div className="absolute bottom-3 left-4 right-4 text-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
          [INITIALIZING LABYRINTH ENGINE...]
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none my-6">
      {/* Keyboard Capture Status Banner */}
      <div className="mb-2 text-center w-full">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${
            isFocused
              ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse"
              : "bg-neutral-950 text-neutral-500 border-neutral-900"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              isFocused ? "bg-brand-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" : "bg-neutral-700"
            }`}
          />
          {isFocused ? "Labyrinth Controls: ACTIVE" : "Click Maze to Focus & Play"}
        </span>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-full h-[240px] bg-neutral-950/80 border rounded-2xl flex flex-col items-center justify-center overflow-hidden outline-none transition-all duration-300 ${
          isFocused
            ? "border-brand-cyan ring-2 ring-brand-cyan/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.01]"
            : "border-neutral-900"
        }`}
      >
        {/* Header HUD */}
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 font-mono uppercase tracking-wider">
          <span>SYSTEM_LABYRINTH.EXE</span>
          <span className={isFocused ? "text-brand-cyan animate-pulse" : "text-neutral-500"}>
            {isFocused ? "● LIVE" : "IDLE"}
          </span>
        </div>

        {/* Game Canvas Container */}
        <div className="relative w-[240px] h-[144px] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={240}
            height={144}
            className="block w-[240px] h-[144px] rounded-lg border border-neutral-900/40 bg-neutral-950"
          />

          {/* Victory Overlay Screen */}
          {gameStatus === "victory" && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-3 rounded-lg border border-brand-cyan/30">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1 text-emerald-400 animate-bounce">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                CORE RESOLVED
              </h3>
              <p className="text-[10px] text-neutral-400 mt-1 max-w-[180px] leading-relaxed">
                Solved in <span className="font-bold text-brand-cyan">{movesCount}</span> moves. Nodes stabilized.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                  containerRef.current?.focus();
                }}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-neutral-200 hover:text-brand-cyan text-[10px] font-bold rounded-lg transition-all duration-200 cursor-pointer animate-pulse"
              >
                <svg className="w-3 h-3 animate-spin-reverse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                </svg>
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Footer HUD */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
          {gameStatus === "victory" ? (
            <span className="text-emerald-400 animate-pulse w-full text-center">SYSTEM CORRUPTION PURGED!</span>
          ) : isFocused ? (
            <>
              <span>KEYS: WASD / ARROWS</span>
              <span>MOVES: {movesCount}</span>
            </>
          ) : (
            <span className="w-full text-center text-neutral-600">[CLICK HERE TO ENGAGE INTERACTIVE MODE]</span>
          )}
        </div>
      </div>
    </div>
  );
};
