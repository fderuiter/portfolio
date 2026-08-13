"use client";

import React, { useState, useEffect, useRef } from "react";
import { IconCircle } from "@tabler/icons-react";

interface Obstacle {
  id: number;
  x: number; // percentage from left, 0 to 100
  y: number; // percentage from top, 10 to 90
}

export const GarminWatchSimulator: React.FC = () => {
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [playerY, setPlayerY] = useState(50); // percentage 10 to 90
  const [isLightOn, setIsLightOn] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const obstacleIdCounter = useRef(0);
  const gameLoopRef = useRef<number | null>(null);

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Play controls
  const moveUp = () => {
    if (gameState !== "playing") return;
    setPlayerY((prev) => Math.max(12, prev - 12));
  };

  const moveDown = () => {
    if (gameState !== "playing") return;
    setPlayerY((prev) => Math.min(88, prev + 12));
  };

  const toggleLight = () => {
    setIsLightOn((prev) => !prev);
  };

  const triggerStartStop = () => {
    if (gameState === "idle" || gameState === "gameover") {
      setGameState("playing");
      setPlayerY(50);
      setScore(0);
      setObstacles([
        { id: ++obstacleIdCounter.current, x: 100, y: 30 },
        { id: ++obstacleIdCounter.current, x: 140, y: 70 },
      ]);
      setIsLightOn(false);
    } else if (gameState === "playing") {
      setGameState("idle");
    }
  };

  const triggerBack = () => {
    if (gameState === "gameover") {
      setGameState("idle");
      setScore(0);
      setObstacles([]);
    } else {
      // Reset score and obstacles
      setGameState("idle");
      setScore(0);
      setObstacles([]);
      setIsLightOn(false);
    }
  };

  // Keyboard listener inside the simulator boundary
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // List of keys we handle locally to prevent browser actions (e.g. page scrolling)
    const interceptKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      " ",
      "l",
      "L",
      "Enter",
      "Escape",
      "Backspace"
    ];

    if (interceptKeys.includes(e.key)) {
      e.preventDefault(); // Stop default browser behaviors (such as page scrolling)
    }

    if (e.key === "ArrowUp") {
      moveUp();
    } else if (e.key === "ArrowDown") {
      moveDown();
    } else if (e.key.toLowerCase() === "l") {
      toggleLight();
    } else if (e.key === "Enter" || e.key === " ") {
      triggerStartStop();
    } else if (e.key === "Backspace" || e.key === "Escape") {
      triggerBack();
    }
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== "playing") {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      return;
    }

    let lastTime = performance.now();

    const update = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      // Update obstacles position
      setObstacles((prev) => {
        let hit = false;
        const nextObstacles = prev
          .map((obs) => {
            // Obstacles move left.
            // If LIGHT is on, they move slightly slower or get pushed back!
            const speed = isLightOn ? 0.15 : 0.25;
            const nextX = obs.x - speed * delta;

            // Collision detection (player is at x = 20%)
            const playerWidth = 10;
            const obstacleWidth = 8;
            const xDist = Math.abs(nextX - 20);
            const yDist = Math.abs(obs.y - playerY);

            // Light beam can destroy obstacle if obstacle is within 40% and light is on
            if (isLightOn && nextX > 20 && nextX < 60 && Math.abs(obs.y - playerY) < 25) {
              // Destroy obstacle (spawn it off-screen)
              return { ...obs, x: -50 };
            }

            if (xDist < (playerWidth + obstacleWidth) / 2 && yDist < 12) {
              hit = true;
            }

            return { ...obs, x: nextX };
          })
          // Filter out destroyed/passed obstacles
          .filter((obs) => obs.x > -10);

        if (hit) {
          setGameState("gameover");
          return prev;
        }

        // Spawn new obstacles
        if (nextObstacles.length < 3) {
          const maxObstacleX = nextObstacles.reduce((max, obs) => Math.max(max, obs.x), 0);
          if (maxObstacleX < 75) {
            const randomY = 15 + Math.floor(Math.random() * 70); // 15 to 85
            nextObstacles.push({
              id: ++obstacleIdCounter.current,
              x: 110,
              y: randomY,
            });
          }
        }

        return nextObstacles;
      });

      // Score counter
      setScore((prev) => {
        const nextScore = prev + 1;
        if (nextScore > highScore) {
          setHighScore(nextScore);
        }
        return nextScore;
      });

      gameLoopRef.current = requestAnimationFrame(update);
    };

    gameLoopRef.current = requestAnimationFrame(update);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, playerY, isLightOn, highScore]);

  return (
    <div className="w-full flex flex-col items-center select-none my-8">
      {/* Keyboard Capture Status Banner */}
      <div className="mb-3 text-center">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border transition-all duration-300 ${
            isFocused
              ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30 shadow-[0_0_10px_rgba(34,211,238,0.15)] animate-pulse"
              : "bg-zinc-950 text-zinc-500 border-zinc-800"
          }`}
        >
          <IconCircle
            className={`w-2.5 h-2.5 ${
              isFocused ? "fill-brand-cyan stroke-none" : "fill-zinc-600 stroke-none"
            }`}
          />
          {isFocused ? "Watch Keyboard Captures: ACTIVE" : "Click Watch to Focus controls"}
        </span>
      </div>

      {/* Outer Watch Chassis */}
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-72 h-72 rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 p-6 flex items-center justify-center border-4 select-none outline-none transition-all duration-300 ${
          isFocused
            ? "border-brand-cyan ring-4 ring-brand-cyan/20 shadow-[0_0_40px_rgba(34,211,238,0.25)] scale-[1.01]"
            : "border-zinc-700 shadow-2xl"
        }`}
      >
        {/* Bezel Labels & Physical Buttons */}

        {/* 1. LIGHT BUTTON (Top Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLight();
            containerRef.current?.focus();
          }}
          className="absolute -left-3 top-[25%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          LIGHT
        </button>

        {/* 2. UP BUTTON (Middle Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            moveUp();
            containerRef.current?.focus();
          }}
          className="absolute -left-3 top-[46%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          UP
        </button>

        {/* 3. DOWN BUTTON (Bottom Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            moveDown();
            containerRef.current?.focus();
          }}
          className="absolute -left-3 top-[67%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          DOWN
        </button>

        {/* 4. START/STOP BUTTON (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerStartStop();
            containerRef.current?.focus();
          }}
          className="absolute -right-3 top-[30%] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          START
        </button>

        {/* 5. BACK BUTTON (Bottom Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerBack();
            containerRef.current?.focus();
          }}
          className="absolute -right-3 top-[60%] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          BACK
        </button>

        {/* Outer Circular Bezel Dial */}
        <div className="absolute inset-2 rounded-full border border-zinc-750/50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-full relative">
            {/* Bezel markers around watch */}
            <div className="absolute top-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">12</div>
            <div className="absolute bottom-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">6</div>
            <div className="absolute left-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">9</div>
            <div className="absolute right-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">3</div>
          </div>
        </div>

        {/* Watch Inner Circular Screen Display */}
        <div
          className={`w-full h-full rounded-full flex flex-col justify-between p-4 relative select-none overflow-hidden border-2 transition-all duration-300 ${
            isLightOn
              ? "bg-cyan-950/90 border-cyan-500/40 shadow-[inset_0_0_20px_rgba(6,182,212,0.6)]"
              : "bg-zinc-950 border-zinc-850 shadow-[inset_0_0_15px_rgba(0,0,0,0.95)]"
          }`}
        >
          {/* Subtle grid lines on watch screen */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.05)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none opacity-40" />

          {/* Screen Header */}
          <div className="relative z-10 flex flex-col items-center pt-2 select-none">
            <span className="text-[8px] font-bold font-mono uppercase tracking-widest text-zinc-500">GARMIN WATCH</span>
            <div className="flex justify-between w-full px-4 mt-0.5 text-[10px] font-bold text-zinc-400 font-mono">
              <span className="text-zinc-500">HI: {highScore}</span>
              <span className={isLightOn ? "text-cyan-400 animate-pulse font-mono font-black" : "text-zinc-500"}>
                {isLightOn ? "⚡ LIGHT ON" : "LIGHT OFF"}
              </span>
            </div>
          </div>

          {/* Screen Content Window */}
          <div className="flex-1 relative border-y border-zinc-900/60 my-1 overflow-hidden flex items-center justify-center">
            {gameState === "idle" && (
              <div className="text-center p-1 relative z-10 flex flex-col items-center justify-center h-full">
                <p className="text-emerald-400 font-bold text-[11px] animate-pulse uppercase tracking-wider">READY TO EXPLORE</p>
                <p className="text-zinc-500 text-[9px] mt-1">Press START or SPACE</p>
                <p className="text-zinc-600 text-[8px] mt-1">Use Arrow Keys & L</p>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="text-center p-1 relative z-10 flex flex-col items-center justify-center h-full animate-bounce">
                <p className="text-red-500 font-extrabold text-[12px] tracking-wide uppercase">GAME OVER</p>
                <p className="text-zinc-300 text-[10px] font-bold mt-1">SCORE: {score}</p>
                <p className="text-zinc-500 text-[8px] mt-1">Press BACK to reset</p>
              </div>
            )}

            {gameState === "playing" && (
              <div className="absolute inset-0 select-none">
                {/* Visual Light Beam from Player if Light is active */}
                {isLightOn && (
                  <div
                    style={{ top: `${playerY - 10}%` }}
                    className="absolute left-[20%] w-[45%] h-[20%] bg-gradient-to-r from-cyan-400/30 to-transparent rounded-r-full blur-[2px] pointer-events-none transition-all duration-75"
                  />
                )}

                {/* Submarine Player avatar */}
                <div
                  style={{ top: `${playerY}%` }}
                  className="absolute left-[15%] -translate-y-[50%] transition-all duration-100 ease-out z-20"
                >
                  <span className="text-[12px] filter drop-shadow-[0_0_3px_rgba(255,255,255,0.4)]">
                    🚀
                  </span>
                </div>

                {/* Obstacles (sharks/mines) */}
                {obstacles.map((obs) => (
                  <div
                    key={obs.id}
                    style={{ left: `${obs.x}%`, top: `${obs.y}%` }}
                    className="absolute -translate-y-[50%] -translate-x-[50%] transition-all duration-75 ease-linear z-10 text-[10px]"
                  >
                    👾
                  </div>
                ))}

                {/* Vertical safe boundaries */}
                <div className="absolute left-0 right-0 top-0 h-1 bg-red-950/20" />
                <div className="absolute left-0 right-0 bottom-0 h-1 bg-red-950/20" />
              </div>
            )}
          </div>

          {/* Screen Footer */}
          <div className="relative z-10 flex justify-between items-center px-4 pb-2 text-zinc-400 font-bold select-none text-[10px]">
            <span>SCORE</span>
            <span className="text-[12px] font-extrabold font-mono text-zinc-200">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
