"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { IconCircle, IconTrophy, IconHeartFilled, IconBolt } from "@tabler/icons-react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";

export type GarminActivityMode = "ocean" | "trail" | "space";
export type WatchBezelTheme = "slate" | "solar" | "cyan" | "neon";

interface Hazard {
  id: number;
  x: number; // percentage 0-100
  y: number; // percentage 10-90
  type: "hazard" | "powerup" | "solar";
  icon: string;
  speed: number;
}

export const GarminWatchSimulator: React.FC = () => {
  const { playNote, playSuccess } = useAudio();
  const { recordEvent } = useTelemetry();

  // Mode and hardware states
  const [activityMode, setActivityMode] = useState<GarminActivityMode>("ocean");
  const [bezelTheme, setBezelTheme] = useState<WatchBezelTheme>("slate");
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover" | "summary">("idle");
  const [playerY, setPlayerY] = useState(50); // percentage 10 to 90
  const [isLightOn, setIsLightOn] = useState(false);
  const [battery, setBattery] = useState(100); // 0-100%
  const [heartRate, setHeartRate] = useState(142); // bpm
  const [distanceKm, setDistanceKm] = useState(0); // km
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hazards, setHazards] = useState<Hazard[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [trainingEffect, setTrainingEffect] = useState(3.5);

  const containerRef = useRef<HTMLDivElement>(null);
  const hazardIdCounter = useRef(0);
  const gameLoopRef = useRef<number | null>(null);

  // Focus management
  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  // Audio helper functions
  const playBeep = useCallback((freq = 1200, dur = 0.04) => {
    try {
      playNote(freq, dur);
    } catch {}
  }, [playNote]);

  const playButtonTone = useCallback(() => {
    playBeep(1400, 0.025);
  }, [playBeep]);

  // Controls
  const moveUp = useCallback(() => {
    if (gameState !== "playing") return;
    playBeep(900, 0.02);
    setPlayerY((prev) => Math.max(12, prev - 12));
    setHeartRate((hr) => Math.min(185, hr + 1));
  }, [gameState, playBeep]);

  const moveDown = useCallback(() => {
    if (gameState !== "playing") return;
    playBeep(700, 0.02);
    setPlayerY((prev) => Math.min(88, prev + 12));
    setHeartRate((hr) => Math.min(185, hr + 1));
  }, [gameState, playBeep]);

  const toggleLight = useCallback(() => {
    playButtonTone();
    setIsLightOn((prev) => !prev);
  }, [playButtonTone]);

  const triggerStartStop = useCallback(() => {
    playButtonTone();
    if (gameState === "idle" || gameState === "gameover" || gameState === "summary") {
      setGameState("playing");
      setPlayerY(50);
      setScore(0);
      setDistanceKm(0);
      setBattery(100);
      setHeartRate(activityMode === "trail" ? 155 : 138);
      setHazards([
        { id: ++hazardIdCounter.current, x: 100, y: 30, type: "hazard", icon: activityMode === "ocean" ? "🦈" : activityMode === "trail" ? "🪨" : "🛰️", speed: 0.2 },
        { id: ++hazardIdCounter.current, x: 140, y: 70, type: "hazard", icon: activityMode === "ocean" ? "🐙" : activityMode === "trail" ? "🪵" : "☄️", speed: 0.22 },
        { id: ++hazardIdCounter.current, x: 170, y: 50, type: "powerup", icon: "⚡", speed: 0.18 },
      ]);
      setIsLightOn(false);
      recordEvent("garmin_simulator_start", "project_click").catch(() => {});
    } else if (gameState === "playing") {
      setGameState("summary");
      setTrainingEffect(+(Math.min(5.0, 2.0 + score * 0.005)).toFixed(1));
      playSuccess();
    }
  }, [gameState, activityMode, score, playButtonTone, playSuccess, recordEvent]);

  const triggerBack = useCallback(() => {
    playButtonTone();
    if (gameState === "gameover" || gameState === "summary") {
      setGameState("idle");
      setScore(0);
      setHazards([]);
    } else if (gameState === "playing") {
      setGameState("summary");
      setTrainingEffect(+(Math.min(5.0, 2.0 + score * 0.005)).toFixed(1));
    } else {
      setGameState("idle");
      setScore(0);
      setHazards([]);
      setIsLightOn(false);
    }
  }, [gameState, score, playButtonTone]);

  // Keyboard listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      "Backspace",
      "m",
      "M",
    ];

    if (interceptKeys.includes(e.key)) {
      e.preventDefault();
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
    } else if (e.key.toLowerCase() === "m") {
      // Cycle activity mode
      setActivityMode((curr) => (curr === "ocean" ? "trail" : curr === "trail" ? "space" : "ocean"));
    }
  };

  // Game Physics Loop
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
      const delta = Math.min(40, now - lastTime);
      lastTime = now;

      // Battery drain when flashlight/sonar is active
      if (isLightOn) {
        setBattery((b) => {
          const next = b - 0.08 * (delta / 16);
          if (next <= 0) {
            setIsLightOn(false);
            playBeep(300, 0.1);
            return 0;
          }
          return next;
        });
      }

      // Distance and calories increment
      setDistanceKm((d) => +(d + 0.001 * (delta / 16)).toFixed(2));

      // Update Hazards & Powerups
      setHazards((prev) => {
        let hitHazard = false;

        const nextHazards = prev
          .map((item) => {
            const baseSpeed = item.speed;
            const effectiveSpeed = isLightOn ? baseSpeed * 0.7 : baseSpeed;
            const nextX = item.x - effectiveSpeed * delta;

            const playerWidth = 10;
            const itemWidth = 8;
            const xDist = Math.abs(nextX - 20);
            const yDist = Math.abs(item.y - playerY);

            // Light beam destroys hazards ahead if light is ON and within range
            if (
              isLightOn &&
              item.type === "hazard" &&
              nextX > 20 &&
              nextX < 65 &&
              Math.abs(item.y - playerY) < 22
            ) {
              playBeep(1600, 0.03);
              return { ...item, x: -50 };
            }

            // Powerup pickup
            if (item.type === "powerup" && xDist < 12 && yDist < 14) {
              setBattery((b) => Math.min(100, b + 25));
              playSuccess();
              return { ...item, x: -50 };
            }

            if (item.type === "solar" && xDist < 12 && yDist < 14) {
              setScore((s) => s + 50);
              playBeep(1200, 0.05);
              return { ...item, x: -50 };
            }

            // Collision with hazard
            if (item.type === "hazard" && xDist < (playerWidth + itemWidth) / 2 && yDist < 11) {
              hitHazard = true;
            }

            return { ...item, x: nextX };
          })
          .filter((item) => item.x > -10);

        if (hitHazard) {
          setGameState("gameover");
          playBeep(200, 0.2);
          return prev;
        }

        // Spawn new hazards / powerups
        if (nextHazards.length < 4) {
          const maxX = nextHazards.reduce((max, h) => Math.max(max, h.x), 0);
          if (maxX < 75) {
            const randomY = 15 + Math.floor(Math.random() * 70);
            const isPower = Math.random() < 0.25;
            const isSolar = !isPower && Math.random() < 0.2;

            let icon = activityMode === "ocean" ? "🦈" : activityMode === "trail" ? "🪨" : "☄️";
            let type: "hazard" | "powerup" | "solar" = "hazard";

            if (isPower) {
              icon = "⚡";
              type = "powerup";
            } else if (isSolar) {
              icon = "☀️";
              type = "solar";
            }

            nextHazards.push({
              id: ++hazardIdCounter.current,
              x: 110,
              y: randomY,
              type,
              icon,
              speed: 0.18 + Math.random() * 0.08,
            });
          }
        }

        return nextHazards;
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
  }, [gameState, playerY, isLightOn, highScore, activityMode, playBeep, playSuccess]);

  // Visual Theme Styling
  const getThemeChassis = () => {
    switch (bezelTheme) {
      case "solar":
        return "from-amber-900 via-zinc-900 to-zinc-950 border-amber-600/50";
      case "cyan":
        return "from-cyan-900 via-zinc-900 to-zinc-950 border-cyan-500/50";
      case "neon":
        return "from-lime-900 via-zinc-900 to-zinc-950 border-lime-500/50";
      default:
        return "from-zinc-800 via-zinc-900 to-zinc-950 border-zinc-700";
    }
  };

  return (
    <div className="w-full flex flex-col items-center select-none my-8">
      {/* Keyboard Capture Status Banner */}
      <div className="mb-3 text-center flex flex-wrap items-center justify-center gap-2">
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

        {/* Theme Switcher */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-mono">
          <button
            onClick={() => setBezelTheme("slate")}
            className={`px-2 py-0.5 rounded-full cursor-pointer ${
              bezelTheme === "slate" ? "bg-zinc-700 text-white font-bold" : "text-zinc-400"
            }`}
          >
            Tactix
          </button>
          <button
            onClick={() => setBezelTheme("solar")}
            className={`px-2 py-0.5 rounded-full cursor-pointer ${
              bezelTheme === "solar" ? "bg-amber-600 text-black font-bold" : "text-zinc-400"
            }`}
          >
            Solar
          </button>
          <button
            onClick={() => setBezelTheme("cyan")}
            className={`px-2 py-0.5 rounded-full cursor-pointer ${
              bezelTheme === "cyan" ? "bg-cyan-500 text-black font-bold" : "text-zinc-400"
            }`}
          >
            Cyan
          </button>
        </div>
      </div>

      {/* Outer Watch Chassis */}
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-80 h-80 rounded-full bg-gradient-to-br p-6 flex items-center justify-center border-4 select-none outline-none transition-all duration-300 ${getThemeChassis()} ${
          isFocused
            ? "ring-4 ring-brand-cyan/20 shadow-[0_0_40px_rgba(34,211,238,0.25)] scale-[1.01]"
            : "shadow-2xl"
        }`}
      >
        {/* Physical Bezel Buttons */}
        {/* 1. LIGHT BUTTON (Top Left) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleLight();
            containerRef.current?.focus();
          }}
          className="absolute -left-3.5 top-[25%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
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
          className="absolute -left-3.5 top-[46%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
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
          className="absolute -left-3.5 top-[67%] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
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
          className="absolute -right-3.5 top-[30%] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          START
        </button>

        {/* 5. BACK/LAP BUTTON (Bottom Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            triggerBack();
            containerRef.current?.focus();
          }}
          className="absolute -right-3.5 top-[60%] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer"
        >
          BACK
        </button>

        {/* Outer Circular Bezel Dial with Compass Markers */}
        <div className="absolute inset-2 rounded-full border border-zinc-750/50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-full relative">
            <div className="absolute top-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">N · 0°</div>
            <div className="absolute bottom-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">S · 180°</div>
            <div className="absolute left-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">W</div>
            <div className="absolute right-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">E</div>
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
          {/* Subtle LCD Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.05)_1px,transparent_1px)] bg-[size:4px_4px] pointer-events-none opacity-40" />

          {/* Screen Header: Metrics & Garmin Status */}
          <div className="relative z-10 flex flex-col items-center pt-2 select-none">
            <div className="flex justify-between w-full px-3 text-[9px] font-bold font-mono text-zinc-400">
              <span className="flex items-center gap-1 text-rose-400">
                <IconHeartFilled className="w-2.5 h-2.5 animate-pulse" />
                {heartRate}
              </span>
              <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">
                {activityMode.toUpperCase()}
              </span>
              <span className="flex items-center gap-0.5 text-amber-400">
                <IconBolt className="w-2.5 h-2.5" />
                {Math.round(battery)}%
              </span>
            </div>
          </div>

          {/* Screen Content Window */}
          <div className="flex-1 relative border-y border-zinc-900/60 my-1 overflow-hidden flex items-center justify-center">
            {gameState === "idle" && (
              <div className="text-center p-1 relative z-10 flex flex-col items-center justify-center h-full">
                <p className="text-emerald-400 font-bold text-[11px] animate-pulse uppercase tracking-wider">
                  {activityMode === "ocean" ? "🌊 DEEP OCEAN" : activityMode === "trail" ? "🏔️ TRAIL ULTRA" : "🚀 ORBIT RADAR"}
                </p>
                <p className="text-zinc-400 text-[9px] mt-0.5 font-mono">Press START / SPACE</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setActivityMode("ocean")}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${activityMode === "ocean" ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40" : "text-zinc-600"}`}
                  >
                    Ocean
                  </button>
                  <button
                    onClick={() => setActivityMode("trail")}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${activityMode === "trail" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "text-zinc-600"}`}
                  >
                    Trail
                  </button>
                  <button
                    onClick={() => setActivityMode("space")}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono ${activityMode === "space" ? "bg-amber-500/20 text-amber-400 border border-amber-500/40" : "text-zinc-600"}`}
                  >
                    Space
                  </button>
                </div>
              </div>
            )}

            {gameState === "gameover" && (
              <div className="text-center p-1 relative z-10 flex flex-col items-center justify-center h-full">
                <p className="text-rose-500 font-extrabold text-[12px] tracking-wide uppercase animate-bounce">INCIDENT LOGGED</p>
                <p className="text-zinc-300 text-[10px] font-bold mt-0.5 font-mono">SCORE: {score}</p>
                <button
                  onClick={triggerStartStop}
                  className="mt-1 px-2.5 py-1 bg-zinc-800 text-brand-cyan text-[8px] font-bold rounded cursor-pointer border border-zinc-700"
                >
                  RESTART [ENTER]
                </button>
              </div>
            )}

            {gameState === "summary" && (
              <div className="text-center p-2 relative z-10 flex flex-col items-center justify-center h-full font-mono">
                <div className="flex items-center gap-1 text-emerald-400 text-[10px] font-bold mb-1">
                  <IconTrophy className="w-3 h-3 text-amber-400" />
                  WORKOUT SAVED
                </div>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[8px] text-zinc-400 text-left w-full px-2">
                  <div>DIST: <span className="text-white font-bold">{distanceKm} km</span></div>
                  <div>SCORE: <span className="text-brand-cyan font-bold">{score}</span></div>
                  <div>TE: <span className="text-emerald-400 font-bold">{trainingEffect}</span></div>
                  <div>AVG HR: <span className="text-rose-400 font-bold">{heartRate}</span></div>
                </div>
                <button
                  onClick={triggerBack}
                  className="mt-2 px-2 py-0.5 bg-zinc-800 text-zinc-300 text-[8px] font-bold rounded cursor-pointer"
                >
                  DONE
                </button>
              </div>
            )}

            {gameState === "playing" && (
              <div className="absolute inset-0 select-none">
                {/* Visual Light Beam from Player */}
                {isLightOn && (
                  <div
                    style={{ top: `${playerY - 12}%` }}
                    className="absolute left-[20%] w-[55%] h-[24%] bg-gradient-to-r from-cyan-400/35 to-transparent rounded-r-full blur-[2px] pointer-events-none transition-all duration-75"
                  />
                )}

                {/* Player Avatar */}
                <div
                  style={{ top: `${playerY}%` }}
                  className="absolute left-[15%] -translate-y-[50%] transition-all duration-75 ease-out z-20"
                >
                  <span className="text-[13px] filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]">
                    {activityMode === "ocean" ? "🤿" : activityMode === "trail" ? "🏃" : "🛰️"}
                  </span>
                </div>

                {/* Hazards & Collectibles */}
                {hazards.map((item) => (
                  <div
                    key={item.id}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className={`absolute -translate-y-[50%] -translate-x-[50%] transition-all duration-75 ease-linear z-10 text-[11px] ${
                      item.type === "powerup" ? "animate-pulse filter drop-shadow-[0_0_4px_#38bdf8]" : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Screen Footer: Score & High Score */}
          <div className="relative z-10 flex justify-between items-center px-4 pb-2 text-zinc-400 font-bold select-none text-[9px] font-mono">
            <span>HI: {highScore}</span>
            <span className="text-[11px] font-extrabold text-zinc-200">{score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
