"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTelemetry } from "@/hooks/useTelemetry";
import { useAudio } from "@/components/providers/AudioProvider";
import { IconTrophy, IconRefresh } from "@tabler/icons-react";

// Stage 1 (Classic Baseline Maze for backward-compatibility & tests)
const STAGE_1_MAZE = [
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

// Stage 2 (Firewall Subnet with Security Patrols)
const STAGE_2_MAZE = [
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "P", " ", " ", " ", "#", " ", " ", " ", "#", " ", " ", " ", " ", "#"],
  ["#", " ", "#", "#", " ", "#", " ", "#", " ", "#", " ", "#", "#", " ", "#"],
  ["#", " ", "#", " ", " ", " ", " ", "#", " ", " ", " ", " ", "#", " ", "#"],
  ["#", " ", "#", " ", "#", "#", " ", "#", " ", "#", "#", " ", "#", " ", "#"],
  ["#", " ", " ", " ", "#", " ", " ", " ", " ", " ", "#", " ", " ", " ", "#"],
  ["#", "#", "#", " ", "#", " ", "#", "#", "#", " ", "#", " ", "#", "#", "#"],
  ["#", " ", " ", " ", " ", " ", "#", " ", " ", " ", "#", " ", " ", "E", "#"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
];

const MAZE = STAGE_1_MAZE;

const START_X = 1;
const START_Y = 1;
const EXIT_X = 13;
const EXIT_Y = 7;

interface Drone {
  x: number;
  y: number;
  dir: "left" | "right" | "up" | "down";
  minX: number;
  maxX: number;
}

interface RetroLabyrinthProps {
  isMounted: boolean;
}

export const RetroLabyrinth: React.FC<RetroLabyrinthProps> = ({ isMounted }) => {
  const [stage, setStage] = useState<number>(1);
  const [currentMaze, setCurrentMaze] = useState<string[][]>(STAGE_1_MAZE);
  const [playerPosition, setPlayerPosition] = useState({ x: START_X, y: START_Y });
  const [gameStatus, setGameStatus] = useState<"playing" | "victory" | "caught">("playing");
  const [isFocused, setIsFocused] = useState(false);
  const [movesCount, setMovesCount] = useState(0);
  const [dronesStunned, setDronesStunned] = useState(false);

  // Dynamic Drones for stage 2
  const [drones, setDrones] = useState<Drone[]>([
    { x: 6, y: 5, dir: "right", minX: 5, maxX: 9 },
  ]);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { recordEvent } = useTelemetry();
  const { playNote, playSuccess } = useAudio();

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Switch Stage
  const switchStage = useCallback((stgNum: number) => {
    setStage(stgNum);
    setCurrentMaze(stgNum === 2 ? STAGE_2_MAZE : STAGE_1_MAZE);
    setPlayerPosition({ x: START_X, y: START_Y });
    setGameStatus("playing");
    setMovesCount(0);
    setDronesStunned(false);
    if (stgNum === 2) {
      setDrones([{ x: 6, y: 5, dir: "right", minX: 5, maxX: 9 }]);
    } else {
      setDrones([]);
    }
  }, []);

  // Restart the current stage
  const handleRestart = useCallback(() => {
    setPlayerPosition({ x: START_X, y: START_Y });
    setGameStatus("playing");
    setMovesCount(0);
    setDronesStunned(false);
  }, []);

  // Drone patrol movement loop
  useEffect(() => {
    if (gameStatus !== "playing" || dronesStunned || drones.length === 0) return;

    const droneInterval = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => {
          let nextX = d.x;
          let nextDir = d.dir;

          if (d.dir === "right") {
            if (nextX >= d.maxX) {
              nextDir = "left";
              nextX -= 1;
            } else {
              nextX += 1;
            }
          } else {
            if (nextX <= d.minX) {
              nextDir = "right";
              nextX += 1;
            } else {
              nextX -= 1;
            }
          }

          // Check if drone catches player
          if (nextX === playerPosition.x && d.y === playerPosition.y) {
            setGameStatus("caught");
            playNote(220, 0.2);
          }

          return { ...d, x: nextX, dir: nextDir };
        })
      );
    }, 600);

    return () => clearInterval(droneInterval);
  }, [gameStatus, dronesStunned, drones.length, playerPosition, playNote]);

  // Attempt move
  const tryMove = useCallback((dx: number, dy: number) => {
    if (gameStatus !== "playing") return;

    const nextX = playerPosition.x + dx;
    const nextY = playerPosition.y + dy;

    // Check boundary & wall collision against active maze
    if (
      nextY >= 0 &&
      nextY < currentMaze.length &&
      nextX >= 0 &&
      nextX < currentMaze[0].length &&
      currentMaze[nextY][nextX] !== "#"
    ) {
      setPlayerPosition({ x: nextX, y: nextY });
      setMovesCount((prev) => prev + 1);

      // Footstep audio beep
      playNote(523.25 + (nextX + nextY) * 20, 0.02);

      // Check drone collision
      if (!dronesStunned && drones.some((d) => d.x === nextX && d.y === nextY)) {
        setGameStatus("caught");
        playNote(200, 0.2);
        return;
      }

      // Check if exit reached
      if (nextX === EXIT_X && nextY === EXIT_Y) {
        setGameStatus("victory");
        playSuccess();
        recordEvent("labyrinth_solved", "project_click").catch((err) => {
          console.error("Failed to record telemetry for labyrinth solution:", err);
        });
      }
    }
  }, [gameStatus, playerPosition, currentMaze, drones, dronesStunned, playNote, playSuccess, recordEvent]);

  // Keyboard controls
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameStatus !== "playing") return;

    const key = e.key;
    const interceptKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "w",
      "a",
      "s",
      "d",
      "W",
      "A",
      "S",
      "D",
      " ",
    ];

    if (interceptKeys.includes(key)) {
      e.preventDefault();
    } else {
      return;
    }

    if (key === "ArrowUp" || key.toLowerCase() === "w") {
      tryMove(0, -1);
    } else if (key === "ArrowDown" || key.toLowerCase() === "s") {
      tryMove(0, 1);
    } else if (key === "ArrowLeft" || key.toLowerCase() === "a") {
      tryMove(-1, 0);
    } else if (key === "ArrowRight" || key.toLowerCase() === "d") {
      tryMove(1, 0);
    } else if (key === " ") {
      // Trigger EMP Blast
      setDronesStunned(true);
      playNote(880, 0.15);
      setTimeout(() => setDronesStunned(false), 4000);
    }
  };

  // Draw Game State on Canvas
  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellWidth = canvas.width / currentMaze[0].length;
    const cellHeight = canvas.height / currentMaze.length;

    // 1. Draw Maze Grid
    for (let y = 0; y < currentMaze.length; y++) {
      for (let x = 0; x < currentMaze[y].length; x++) {
        const cell = currentMaze[y][x];
        const px = x * cellWidth;
        const py = y * cellHeight;

        if (cell === "#") {
          ctx.fillStyle = "#171717";
          ctx.fillRect(px, py, cellWidth, cellHeight);

          ctx.strokeStyle = "rgba(6, 182, 212, 0.18)";
          ctx.lineWidth = 1;
          ctx.strokeRect(px + 0.5, py + 0.5, cellWidth - 1, cellHeight - 1);
        } else if (x === EXIT_X && y === EXIT_Y) {
          // Draw Exit Portal E
          ctx.fillStyle = "rgba(16, 185, 129, 0.2)";
          ctx.fillRect(px, py, cellWidth, cellHeight);

          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1.5, py + 1.5, cellWidth - 3, cellHeight - 3);

          ctx.fillStyle = "#10b981";
          ctx.font = "bold 9px monospace";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("E", px + cellWidth / 2, py + cellHeight / 2);
        } else {
          // Standard path dots
          ctx.fillStyle = "rgba(6, 182, 212, 0.12)";
          ctx.beginPath();
          ctx.arc(px + cellWidth / 2, py + cellHeight / 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Patrolling Security Drones
    drones.forEach((d) => {
      const dX = d.x * cellWidth + cellWidth / 2;
      const dY = d.y * cellHeight + cellHeight / 2;

      ctx.fillStyle = dronesStunned ? "rgba(56, 189, 248, 0.3)" : "rgba(239, 68, 68, 0.3)";
      ctx.beginPath();
      ctx.arc(dX, dY, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = dronesStunned ? "#38bdf8" : "#ef4444";
      ctx.beginPath();
      ctx.arc(dX, dY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Player
    const pX = playerPosition.x * cellWidth + cellWidth / 2;
    const pY = playerPosition.y * cellHeight + cellHeight / 2;

    const glowGradient = ctx.createRadialGradient(pX, pY, 2, pX, pY, 12);
    glowGradient.addColorStop(0, "rgba(6, 182, 212, 0.7)");
    glowGradient.addColorStop(1, "rgba(6, 182, 212, 0)");
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(pX, pY, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#06b6d4";
    ctx.beginPath();
    ctx.arc(pX, pY, 4, 0, Math.PI * 2);
    ctx.fill();
  }, [isMounted, playerPosition, gameStatus, currentMaze, drones, dronesStunned]);

  // Generate ASCII fallback string for perfect Server-Side non-JS compatibility
  const renderAsciiFallback = () => {
    return MAZE.map((row, y) =>
      row
        .map((cell, x) => {
          if (cell === "#") return "█";
          if (x === START_X && y === START_Y) return "@";
          if (x === EXIT_X && y === EXIT_Y) return "E";
          return "·";
        })
        .join(" ")
    ).join("\n");
  };

  if (!isMounted) {
    return (
      <div className="relative w-full h-[240px] bg-neutral-950/80 border border-neutral-900 rounded-2xl flex flex-col items-center justify-center font-mono select-none overflow-hidden my-6">
        <div className="absolute top-3 left-4 right-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
          <span>SYSTEM_LABYRINTH.EXE</span>
          <span className="text-neutral-600">OFFLINE</span>
        </div>

        <pre className="text-[10px] sm:text-[11px] leading-4 tracking-normal text-brand-cyan/60 font-mono select-none text-center p-2">
          {renderAsciiFallback()}
        </pre>

        <div className="absolute bottom-3 left-4 right-4 text-center text-[9px] font-bold text-neutral-500 uppercase tracking-widest">
          [INITIALIZING LABYRINTH ENGINE...]
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none my-6">
      {/* Stage Selector & Controls Banner */}
      <div className="mb-2 w-full flex flex-wrap items-center justify-between gap-2 px-1">
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

        {/* Stage Selector */}
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 rounded-lg text-[9px] font-mono">
          <button
            onClick={() => switchStage(1)}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              stage === 1 ? "bg-brand-cyan text-black font-bold" : "text-neutral-400"
            }`}
          >
            Subnet 01
          </button>
          <button
            onClick={() => switchStage(2)}
            className={`px-2 py-0.5 rounded cursor-pointer ${
              stage === 2 ? "bg-brand-cyan text-black font-bold" : "text-neutral-400"
            }`}
          >
            Subnet 02 (Firewall)
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-full h-[250px] bg-neutral-950/80 border rounded-2xl flex flex-col items-center justify-center overflow-hidden outline-none transition-all duration-300 ${
          isFocused
            ? "border-brand-cyan ring-2 ring-brand-cyan/10 shadow-[0_0_20px_rgba(34,211,238,0.1)] scale-[1.01]"
            : "border-neutral-900"
        }`}
      >
        {/* Header HUD */}
        <div className="absolute top-2.5 left-4 right-4 flex justify-between items-center text-[10px] font-bold text-neutral-500 font-mono uppercase tracking-wider">
          <span>SYSTEM_LABYRINTH.EXE · STAGE {stage}</span>
          <span className={isFocused ? "text-brand-cyan animate-pulse" : "text-neutral-500"}>
            {isFocused ? "● LIVE" : "IDLE"}
          </span>
        </div>

        {/* Game Canvas */}
        <div className="relative w-[240px] h-[144px] flex items-center justify-center mt-2">
          <canvas
            ref={canvasRef}
            width={240}
            height={144}
            className="block w-[240px] h-[144px] rounded-lg border border-neutral-900/40 bg-neutral-950"
          />

          {/* Victory Overlay */}
          {gameStatus === "victory" && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-3 rounded-lg border border-brand-cyan/30">
              <div className="w-7 h-7 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-1 text-emerald-400 animate-bounce">
                <IconTrophy className="w-4 h-4" />
              </div>
              <h3 className="text-emerald-400 font-bold text-xs uppercase tracking-widest">
                CORE RESOLVED
              </h3>
              <p className="text-[9px] text-neutral-400 mt-0.5 leading-relaxed">
                Solved in <span className="font-bold text-brand-cyan">{movesCount}</span> moves. Rating: ⭐⭐⭐
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                  containerRef.current?.focus();
                }}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-brand-cyan/40 text-neutral-200 hover:text-brand-cyan text-[9px] font-bold rounded-lg transition-all cursor-pointer"
              >
                <IconRefresh className="w-3 h-3" />
                Play Again
              </button>
            </div>
          )}

          {/* Caught Overlay */}
          {gameStatus === "caught" && (
            <div className="absolute inset-0 bg-neutral-950/95 flex flex-col items-center justify-center text-center p-3 rounded-lg border border-rose-500/30">
              <h3 className="text-rose-400 font-bold text-xs uppercase tracking-widest">
                DRONE INTERCEPTED!
              </h3>
              <p className="text-[9px] text-neutral-400 mt-1">
                Security drone triggered firewall lockout.
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRestart();
                  containerRef.current?.focus();
                }}
                className="mt-2 px-3 py-1 bg-neutral-900 text-rose-300 border border-rose-800 text-[9px] font-bold rounded cursor-pointer"
              >
                RETRY STAGE
              </button>
            </div>
          )}
        </div>

        {/* Footer HUD */}
        <div className="absolute bottom-2 left-4 right-4 flex justify-between items-center text-[9px] font-mono font-bold text-neutral-500 uppercase tracking-widest">
          {gameStatus === "victory" ? (
            <span className="text-emerald-400 animate-pulse w-full text-center">SYSTEM CORRUPTION PURGED!</span>
          ) : isFocused ? (
            <>
              <span>WASD / ARROWS · SPACE: EMP</span>
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
