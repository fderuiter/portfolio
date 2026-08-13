"use client";

import React, { useState, useEffect, useRef } from "react";

// Native Web Audio API sounds to keep asset footprints strictly at 0 KB
const playSound = (type: "move" | "collide" | "key" | "win") => {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === "move") {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } else if (type === "collide") {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(100, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "key") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5
      osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16); // G5
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else if (type === "win") {
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.connect(g);
        g.connect(ctx.destination);
        o.type = "sine";
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        g.gain.setValueAtTime(0.05, ctx.currentTime + idx * 0.07);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);
        o.start(ctx.currentTime + idx * 0.07);
        o.stop(ctx.currentTime + idx * 0.07 + 0.2);
      });
    }
  } catch (e) {
    console.error("Synthesizer audio block encountered an issue:", e);
  }
};

// Depth-First Search Maze Generator
function generateMaze(w: number, h: number) {
  // Start with a grid of all walls (1 = wall, 0 = path)
  const maze = Array(h)
    .fill(null)
    .map(() => Array(w).fill(1));

  const stack: [number, number][] = [];
  // Start node
  maze[1][1] = 0;
  stack.push([1, 1]);

  while (stack.length > 0) {
    const [r, c] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = []; // [next_r, next_c, wall_r, wall_c]

    const dirs = [
      [-2, 0, -1, 0], // Up
      [2, 0, 1, 0],   // Down
      [0, -2, 0, -1], // Left
      [0, 2, 0, 1],   // Right
    ];

    for (const [dr, dc, wr, wc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr > 0 && nr < h - 1 && nc > 0 && nc < w - 1 && maze[nr][nc] === 1) {
        neighbors.push([nr, nc, r + wr, c + wc]);
      }
    }

    if (neighbors.length > 0) {
      // Pick random unvisited neighbor
      const [nr, nc, wr, wc] = neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[wr][wc] = 0;
      maze[nr][nc] = 0;
      stack.push([nr, nc]);
    } else {
      stack.pop();
    }
  }

  // Define critical nodes
  // 3 = Key, 4 = Exit, 0 = Path, 1 = Wall
  maze[h - 2][w - 2] = 4; // Exit
  maze[h - 2][1] = 3;     // Key location

  return maze;
}

export default function LabyrinthGame() {
  const [gameState, setGameState] = useState<"playing" | "won">("playing");
  const [moves, setMoves] = useState(0);
  const [hasKey, setHasKey] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Game dimensions (must be odd sizes for DFS generation)
  const width = 15;
  const height = 15;
  const cellSize = 24; // size in pixels

  const gridRef = useRef<number[][]>([]);
  const playerPosRef = useRef({ r: 1, c: 1 });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize/Reset game
  const resetGame = () => {
    gridRef.current = generateMaze(width, height);
    playerPosRef.current = { r: 1, c: 1 };
    setMoves(0);
    setHasKey(false);
    setTimeElapsed(0);
    setGameState("playing");

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);
  };

  useEffect(() => {
    resetGame();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Handle movement validation
  const movePlayer = (dr: number, dc: number) => {
    if (gameState !== "playing") return;

    const nextR = playerPosRef.current.r + dr;
    const nextC = playerPosRef.current.c + dc;

    // Check bounds & wall collisions
    if (
      nextR >= 0 &&
      nextR < height &&
      nextC >= 0 &&
      nextC < width &&
      gridRef.current[nextR]?.[nextC] !== 1
    ) {
      playerPosRef.current = { r: nextR, c: nextC };
      setMoves((prev) => prev + 1);

      const cellValue = gridRef.current[nextR][nextC];
      if (cellValue === 3) {
        // Collect Key
        gridRef.current[nextR][nextC] = 0; // replace with open path
        setHasKey(true);
        playSound("key");
      } else if (cellValue === 4) {
        // Exit
        if (hasKey) {
          setGameState("won");
          if (timerRef.current) clearInterval(timerRef.current);
          playSound("win");
        } else {
          playSound("collide");
        }
      } else {
        playSound("move");
      }
    } else {
      playSound("collide");
    }
  };

  // Keyboard navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      let dr = 0;
      let dc = 0;
      let handled = false;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          dr = -1;
          handled = true;
          break;
        case "ArrowDown":
        case "s":
        case "S":
          dr = 1;
          handled = true;
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          dc = -1;
          handled = true;
          break;
        case "ArrowRight":
        case "d":
        case "D":
          dc = 1;
          handled = true;
          break;
        default:
          break;
      }

      if (handled) {
        e.preventDefault(); // Stop scrolling the viewport
        movePlayer(dr, dc);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, hasKey]);

  // Request Animation Loop for Canvas Rendering
  useEffect(() => {
    let animationId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const grid = gridRef.current;
      if (!grid || grid.length === 0) return;

      // Draw Grid Elements
      for (let r = 0; r < height; r++) {
        for (let c = 0; c < width; c++) {
          const type = grid[r][c];
          const x = c * cellSize;
          const y = r * cellSize;

          if (type === 1) {
            // Neon Cyberpunk Wall
            ctx.fillStyle = "#171717";
            ctx.fillRect(x, y, cellSize, cellSize);

            ctx.strokeStyle = "rgba(6, 182, 212, 0.4)";
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
          } else if (type === 3) {
            // Pulsing Key
            const pulse = 1 + Math.sin(Date.now() * 0.008) * 0.15;
            ctx.save();
            ctx.translate(x + cellSize / 2, y + cellSize / 2);
            ctx.scale(pulse, pulse);

            // Draw simple custom Key design
            ctx.fillStyle = "#eab308";
            ctx.beginPath();
            ctx.arc(-2, 0, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = "#eab308";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(2, 0);
            ctx.lineTo(8, 0);
            ctx.moveTo(5, 0);
            ctx.lineTo(5, 3);
            ctx.moveTo(8, 0);
            ctx.lineTo(8, 3);
            ctx.stroke();

            ctx.restore();
          } else if (type === 4) {
            // Exit portal
            ctx.save();
            ctx.translate(x + cellSize / 2, y + cellSize / 2);

            if (hasKey) {
              // Glowing green unlocked portal
              const angle = (Date.now() * 0.003) % (Math.PI * 2);
              ctx.rotate(angle);
              ctx.strokeStyle = "#22c55e";
              ctx.lineWidth = 2;
              ctx.strokeRect(-cellSize / 3, -cellSize / 3, (cellSize * 2) / 3, (cellSize * 2) / 3);

              ctx.fillStyle = "rgba(34, 197, 94, 0.2)";
              ctx.fillRect(-cellSize / 4, -cellSize / 4, cellSize / 2, cellSize / 2);
            } else {
              // Locked orange-red portal
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 2;
              ctx.beginPath();
              ctx.arc(0, 0, cellSize / 3, 0, Math.PI * 2);
              ctx.stroke();

              // Lock details
              ctx.fillStyle = "#ef4444";
              ctx.fillRect(-2, -1, 4, 4);
              ctx.beginPath();
              ctx.arc(0, -2, 2, Math.PI, 0);
              ctx.strokeStyle = "#ef4444";
              ctx.lineWidth = 1;
              ctx.stroke();
            }
            ctx.restore();
          }
        }
      }

      // Draw Player Position with visual trails
      const px = playerPosRef.current.c * cellSize + cellSize / 2;
      const py = playerPosRef.current.r * cellSize + cellSize / 2;

      ctx.save();
      ctx.shadowColor = "#06b6d4";
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#06b6d4";
      ctx.beginPath();
      ctx.arc(px, py, cellSize / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [hasKey]);

  // Click handler for mouse movement (taps adjacent cells to make mouse interaction work)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || gameState !== "playing") return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const clickedC = Math.floor(clickX / cellSize);
    const clickedR = Math.floor(clickY / cellSize);

    const dr = clickedR - playerPosRef.current.r;
    const dc = clickedC - playerPosRef.current.c;

    // Must be directly adjacent to current player position to step
    if (Math.abs(dr) + Math.abs(dc) === 1) {
      movePlayer(dr, dc);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-xl w-full max-w-sm mx-auto text-center relative z-30">
      {/* Game Header Status */}
      <div className="flex justify-between items-center w-full mb-4 font-mono text-xs text-neutral-400">
        <div>
          MOVES: <span className="text-white font-bold">{moves}</span>
        </div>
        <div className="flex items-center gap-1.5">
          KEY:{" "}
          {hasKey ? (
            <span className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-500 border border-yellow-500/40 rounded font-bold">
              ACQUIRED
            </span>
          ) : (
            <span className="px-1.5 py-0.5 bg-neutral-900 text-neutral-600 border border-neutral-800 rounded">
              MISSING
            </span>
          )}
        </div>
        <div>
          TIME: <span className="text-white font-bold">{timeElapsed}s</span>
        </div>
      </div>

      {/* Main Canvas View */}
      <div className="relative border border-neutral-800 rounded-lg overflow-hidden bg-[#0a0a0a] shadow-inner mb-4">
        {gameState === "playing" ? (
          <canvas
            ref={canvasRef}
            width={width * cellSize}
            height={height * cellSize}
            onClick={handleCanvasClick}
            className="cursor-pointer block max-w-full touch-none"
          />
        ) : (
          <div
            className="flex flex-col items-center justify-center bg-black/90 text-center px-4"
            style={{ width: width * cellSize, height: height * cellSize }}
          >
            <span className="text-brand-cyan text-[10px] font-mono font-bold tracking-widest uppercase mb-1">
              SYSTEM UNLOCKED
            </span>
            <h2 className="text-2xl font-extrabold text-white mb-2">
              Labyrinth Cleared!
            </h2>
            <div className="font-mono text-xs text-neutral-400 space-y-1 mb-6">
              <div>Total Moves: {moves}</div>
              <div>Duration: {timeElapsed} seconds</div>
            </div>
            <button
              onClick={resetGame}
              className="px-5 py-2.5 bg-brand-cyan hover:bg-cyan-500 text-black font-bold rounded-xl text-xs transition-all duration-300"
            >
              Reboot Matrix
            </button>
          </div>
        )}
      </div>

      {/* Control Instructions */}
      <div className="text-neutral-500 text-[10px] font-mono leading-normal text-center mb-4">
        NAVIGATE WITH{" "}
        <span className="text-neutral-300 font-bold bg-neutral-900 px-1 py-0.5 border border-neutral-800 rounded">
          WASD
        </span>{" "}
        /{" "}
        <span className="text-neutral-300 font-bold bg-neutral-900 px-1 py-0.5 border border-neutral-800 rounded">
          ARROWS
        </span>{" "}
        OR TAP ADJACENT TILES
      </div>

      {/* Action Bar */}
      <div className="flex gap-2 w-full">
        <button
          onClick={resetGame}
          className="flex-1 py-2 text-xs font-mono font-bold bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 rounded-xl transition-all duration-200"
        >
          RESET GRID
        </button>
      </div>
    </div>
  );
}
