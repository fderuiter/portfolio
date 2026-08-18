"use client";

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import {
  IconCircle,
  IconBolt,
  IconCpu,
  IconFlame,
  IconPlayerPlay,
  IconCalendar,
} from "@tabler/icons-react";
import { FieldManualButton } from "@/components/FieldManualButton";
import { FullscreenButton } from "@/components/arcade/FullscreenButton";
import { DynamicTabletOrientationHint as TabletOrientationHint } from "@/components/arcade/DynamicTabletOrientationHint";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  triggerHapticFeedback,
  triggerAudioFeedback,
  isolateGesture,
} from "@/lib/arcade/virtual-input-bridge";
import {
  DeviceTarget,
  DEVICE_PROFILES,
  createInitialState,
  startGame,
  jettisonOldestVariable,
  triggerGarbageCollection,
  wipeScreenFog,
  updateGameSimulation,
  renderCanvasFrame,
  JUMP_FORCE,
  CANVAS_SIZE,
  GameEngineState,
} from "@/lib/garmin-engine";

type WatchBezelTheme = "slate" | "solar" | "cyan" | "neon";

const subscribeHighScore = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getHighScoreSnapshot = () => {
  try {
    return localStorage.getItem("garmin_simulator_high_score") || "0";
  } catch {
    return "0";
  }
};
const getHighScoreServerSnapshot = () => "0";

export const GarminWatchSimulator: React.FC = () => {
  const rawHighScore = useSyncExternalStore(
    subscribeHighScore,
    getHighScoreSnapshot,
    getHighScoreServerSnapshot
  );
  const loadedHighScore = parseInt(rawHighScore, 10) || 0;
  const { playNote, playSuccess } = useAudio();
  const { recordEvent } = useTelemetry();

  // Hardware & Simulation State
  const [bezelTheme, setBezelTheme] = useState<WatchBezelTheme>("slate");
  const [deviceTarget, setDeviceTarget] = useState<DeviceTarget>("fenix");
  const [gameState, setGameState] = useState<GameEngineState>(() => createInitialState("fenix", loadedHighScore));
  const effectiveHighScore = Math.max(gameState.highScore, loadedHighScore);
  const [isFocused, setIsFocused] = useState(false);
  const [isDraggingFog, setIsDraggingFog] = useState(false);

  // References for Canvas and Animation Loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const outerContainerRef = useRef<HTMLDivElement | null>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(outerContainerRef);
  const gameLoopRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const stateRef = useRef<GameEngineState>(gameState);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  // Save new high scores safely
  useEffect(() => {
    if (gameState.score > gameState.highScore) {
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("garmin_simulator_high_score", gameState.score.toString());
        } catch {}
      }
    }
  }, [gameState.score, gameState.highScore]);

  // Audio Beep Helpers (Authentic Garmin 1200-1600Hz Piezo)
  const playBeep = useCallback(
    (freq = 1200, dur = 0.04) => {
      try {
        playNote(freq, dur);
      } catch {}
    },
    [playNote]
  );

  const playButtonTone = useCallback(() => {
    playBeep(1400, 0.025);
  }, [playBeep]);

  // Jump (UP)
  const handleJump = useCallback(() => {
    const current = stateRef.current;
    if (current.gameState !== "playing" || !current.isGrounded) return;
    playBeep(900, 0.03);
    setGameState((prev) => ({
      ...prev,
      playerVy: JUMP_FORCE,
      isGrounded: false,
    }));
  }, [playBeep]);

  // Jettison Oldest Variable (DOWN)
  const handleJettison = useCallback(() => {
    const current = stateRef.current;
    if (current.gameState !== "playing") return;
    playBeep(650, 0.035);
    setGameState((prev) => {
      const { state: nextState } = jettisonOldestVariable(prev);
      return nextState;
    });
  }, [playBeep]);

  // Trigger Backlight / Flashlight (LIGHT)
  const handleToggleLight = useCallback(() => {
    playButtonTone();
    setGameState((prev) => {
      const nextLight = !prev.isLightOn;
      if (nextLight && prev.battery > 0) {
        playBeep(1600, 0.04);
      }
      return {
        ...prev,
        isLightOn: prev.battery > 0 ? nextLight : false,
      };
    });
  }, [playButtonTone, playBeep]);

  // Force Garbage Collection (BACK)
  const handleForceGc = useCallback(() => {
    const current = stateRef.current;
    if (current.gameState !== "playing" || current.isGcActive) return;
    playBeep(450, 0.08);
    setGameState((prev) => {
      const { state: nextState } = triggerGarbageCollection(prev);
      return nextState;
    });
  }, [playBeep]);

  // Start / Pause / Restart (START)
  const handleStartStop = useCallback(() => {
    playButtonTone();
    const current = stateRef.current;
    if (current.gameState === "idle" || current.gameState === "crashed" || current.gameState === "summary") {
      const next = startGame(current, deviceTarget);
      setGameState(next);
      recordEvent("garmin_simulator_start", "project_click").catch(() => {});
      playSuccess();
    } else if (current.gameState === "playing") {
      setGameState((prev) => ({ ...prev, gameState: "paused" }));
    } else if (current.gameState === "paused") {
      setGameState((prev) => ({ ...prev, gameState: "playing" }));
    }
  }, [deviceTarget, playButtonTone, playSuccess, recordEvent]);

  // Quick Fog Wipe (W / Touch / Mouse)
  const handleWipeFog = useCallback(
    (canvasX = CANVAS_SIZE / 2, canvasY = CANVAS_SIZE / 2) => {
      playBeep(1100, 0.015);
      setGameState((prev) => wipeScreenFog(prev, canvasX, canvasY, 35));
    },
    [playBeep]
  );

  // Switch Device Profile
  const handleSelectDevice = (target: DeviceTarget) => {
    playButtonTone();
    setDeviceTarget(target);
    setGameState((prev) => createInitialState(target, prev.highScore));
  };

  // Keyboard Event Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const interceptKeys = [
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "PageUp",
      "PageDown",
      " ",
      "l",
      "L",
      "w",
      "W",
      "Enter",
      "Escape",
      "Backspace",
    ];

    if (interceptKeys.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      handleJump();
    } else if (e.key === "ArrowDown") {
      handleJettison();
    } else if (e.key.toLowerCase() === "l") {
      handleToggleLight();
    } else if (e.key.toLowerCase() === "w") {
      handleWipeFog();
    } else if (e.key === "Backspace" || e.key === "Escape") {
      handleForceGc();
    } else if (e.key === "Enter" || e.key === " ") {
      handleStartStop();
    }
  };

  // Canvas Mouse & Touch Drag Wiping for Overheat Fog
  const handleCanvasPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingFog && e.buttons === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    handleWipeFog(x, y);
  };

  // Main 60FPS Game Physics and Rendering Loop
  useEffect(() => {
    let animationFrameId: number;
    let isContextLost = false;
    const canvas = canvasRef.current;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };

    const handleContextRestored = () => {
      isContextLost = false;
      lastFrameTimeRef.current = performance.now();
      animationFrameId = requestAnimationFrame(gameTick);
      gameLoopRef.current = animationFrameId;
    };

    if (canvas) {
      canvas.addEventListener("contextlost", handleContextLost);
      canvas.addEventListener("contextrestored", handleContextRestored);
    }

    const gameTick = (timestamp: number) => {
      if (isContextLost) return;

      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp;
      }
      const deltaMs = Math.min(40, timestamp - lastFrameTimeRef.current);
      lastFrameTimeRef.current = timestamp;

      // Update simulation if active
      if (stateRef.current.gameState === "playing") {
        setGameState((current) => updateGameSimulation(current, deltaMs));
      }

      // Render Canvas Frame
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderCanvasFrame(ctx, stateRef.current);
        }
      }

      animationFrameId = requestAnimationFrame(gameTick);
    };

    animationFrameId = requestAnimationFrame(gameTick);
    gameLoopRef.current = animationFrameId;

    return () => {
      if (canvas) {
        canvas.removeEventListener("contextlost", handleContextLost);
        canvas.removeEventListener("contextrestored", handleContextRestored);
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  // Theme styling helpers
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

  const currentProfile = DEVICE_PROFILES[deviceTarget];

  return (
    <div
      ref={outerContainerRef}
      className={`w-full select-none ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none border-none bg-black p-4 sm:p-6 overflow-y-auto flex flex-col items-center justify-between"
          : "flex flex-col items-center my-8"
      }`}
    >
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        variant="floating"
      />

      {/* Tablet Orientation Recommendation */}
      <TabletOrientationHint className="w-full max-w-md mb-3" />

      {/* Keyboard Capture Status Banner & Controls Bar */}
      <div className="mb-4 text-center flex flex-wrap items-center justify-center gap-3">
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
          {isFocused ? "Watch Keyboard Captures: ACTIVE" : "Click Watch to Focus Controls"}
        </span>

        {/* Device Profile Target (Memory Limit) Selector */}
        <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-full text-[9px] font-mono">
          <button
            onClick={() => handleSelectDevice("fenix")}
            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
              deviceTarget === "fenix" ? "bg-rose-600 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Fēnix (32KB)
          </button>
          <button
            onClick={() => handleSelectDevice("forerunner")}
            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
              deviceTarget === "forerunner" ? "bg-amber-600 text-black font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Forerunner (64KB)
          </button>
          <button
            onClick={() => handleSelectDevice("edge")}
            className={`px-2.5 py-0.5 rounded-full cursor-pointer transition-all ${
              deviceTarget === "edge" ? "bg-emerald-600 text-white font-bold" : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Edge (128KB)
          </button>
        </div>

        {/* Bezel Theme Switcher & Field Manual */}
        <div className="flex items-center gap-2">
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

          <FieldManualButton manualId="garmin-watch" label="Manual" />
          <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} variant="header" />
        </div>
      </div>

      {/* Outer Watch Chassis */}
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        data-keyboard-boundary="true"
        className={`relative w-84 h-84 rounded-full bg-gradient-to-br p-6 flex items-center justify-center border-4 select-none outline-none transition-all duration-300 ${getThemeChassis()} ${
          isFocused
            ? "ring-4 ring-brand-cyan/20 shadow-[0_0_40px_rgba(34,211,238,0.25)] scale-[1.01]"
            : "shadow-2xl"
        }`}
      >
        {/* Physical Bezel Buttons */}
        {/* 1. LIGHT BUTTON (Top Left) */}
        <button
          onClick={(e) => {
            isolateGesture(e);
            triggerHapticFeedback(15);
            triggerAudioFeedback(700, 0.02);
            handleToggleLight();
            containerRef.current?.focus({ preventScroll: true });
          }}
          title="Backlight (L): +0.3%/s Battery"
          className="absolute -left-4 top-[22%] min-w-[44px] min-h-[44px] px-2 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-amber-500 hover:to-amber-600 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center touch-none"
          style={{ touchAction: "none" }}
        >
          <span>LIGHT</span>
          <span className="text-[6px] text-amber-300/80">[L]</span>
        </button>

        {/* 2. UP BUTTON (Middle Left) */}
        <button
          onClick={(e) => {
            isolateGesture(e);
            triggerHapticFeedback(15);
            triggerAudioFeedback(880, 0.02);
            handleJump();
            containerRef.current?.focus({ preventScroll: true });
          }}
          title="Jump (ArrowUp / UP)"
          className="absolute -left-4 top-[44%] min-w-[44px] min-h-[44px] px-2.5 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-brand-cyan hover:to-brand-cyan/80 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center touch-none"
          style={{ touchAction: "none" }}
        >
          <span>UP</span>
          <span className="text-[6px] text-cyan-300/80">[▲]</span>
        </button>

        {/* 3. DOWN BUTTON (Bottom Left) */}
        <button
          onClick={(e) => {
            isolateGesture(e);
            triggerHapticFeedback(15);
            triggerAudioFeedback(600, 0.02);
            handleJettison();
            containerRef.current?.focus({ preventScroll: true });
          }}
          title="Jettison Variable (ArrowDown / DOWN)"
          className="absolute -left-4 top-[66%] min-w-[44px] min-h-[44px] px-2 py-1.5 bg-gradient-to-r from-zinc-700 to-zinc-800 hover:from-rose-500 hover:to-rose-600 text-[8px] font-bold text-zinc-300 hover:text-black rounded-l-md border-y border-l border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center touch-none"
          style={{ touchAction: "none" }}
        >
          <span>DOWN</span>
          <span className="text-[6px] text-rose-300/80">[▼] POP</span>
        </button>

        {/* 4. START/STOP BUTTON (Top Right) */}
        <button
          onClick={(e) => {
            isolateGesture(e);
            triggerHapticFeedback(20);
            triggerAudioFeedback(1050, 0.03);
            handleStartStop();
            containerRef.current?.focus({ preventScroll: true });
          }}
          title="Start / Pause / Restart (Enter / Space)"
          className="absolute -right-4 top-[28%] min-w-[44px] min-h-[44px] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-emerald-500 hover:to-emerald-600 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center touch-none"
          style={{ touchAction: "none" }}
        >
          <span>START</span>
          <span className="text-[6px] text-emerald-300/80">[ENTER]</span>
        </button>

        {/* 5. BACK/GC BUTTON (Bottom Right) */}
        <button
          onClick={(e) => {
            isolateGesture(e);
            triggerHapticFeedback(20);
            triggerAudioFeedback(950, 0.03);
            handleForceGc();
            containerRef.current?.focus({ preventScroll: true });
          }}
          title="Force Garbage Collection (Backspace / Escape): 500ms Freeze"
          className="absolute -right-4 top-[60%] min-w-[44px] min-h-[44px] px-2.5 py-1.5 bg-gradient-to-l from-zinc-700 to-zinc-800 hover:from-purple-500 hover:to-purple-600 text-[8px] font-bold text-zinc-300 hover:text-black rounded-r-md border-y border-r border-zinc-600 active:scale-95 transition-all shadow-md cursor-pointer flex flex-col items-center justify-center touch-none"
          style={{ touchAction: "none" }}
        >
          <span>BACK</span>
          <span className="text-[6px] text-purple-300/80">[GC]</span>
        </button>

        {/* Outer Circular Bezel Dial with Compass / Memory Markers */}
        <div className="absolute inset-2 rounded-full border border-zinc-750/50 pointer-events-none flex items-center justify-center">
          <div className="w-full h-full rounded-full relative">
            <div className="absolute top-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">
              CIQ · {currentProfile.ramLimitKb}KB
            </div>
            <div className="absolute bottom-1 left-[50%] -translate-x-[50%] text-[8px] font-bold tracking-widest text-zinc-500">
              HEAP · 0x00
            </div>
            <div className="absolute left-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">
              GC
            </div>
            <div className="absolute right-2 top-[50%] -translate-y-[50%] text-[8px] font-bold tracking-widest text-zinc-500">
              RUN
            </div>
          </div>
        </div>

        {/* Watch Inner Circular 280x280 Screen Display */}
        <div className="relative w-[280px] h-[280px] rounded-full overflow-hidden border-2 border-zinc-800 bg-black shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            onPointerDown={(e) => {
              setIsDraggingFog(true);
              handleCanvasPointerMove(e);
              containerRef.current?.focus({ preventScroll: true });
            }}
            onPointerUp={() => setIsDraggingFog(false)}
            onPointerMove={handleCanvasPointerMove}
            className="w-full h-full rounded-full cursor-crosshair touch-none"
          />

          {/* Idle Menu Overlay */}
          {gameState.gameState === "idle" && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center z-30 font-mono">
              <span className="text-[12px] font-extrabold text-brand-cyan tracking-wider uppercase flex items-center gap-1">
                <IconCpu className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
                MONKEY C RUNNER
              </span>
              <span className="text-[9px] text-rose-400 font-bold mt-1">
                LIMIT: {currentProfile.ramLimitKb} KB RAM
              </span>
              <p className="text-[8px] text-zinc-400 mt-2 max-w-[190px] leading-tight">
                Survive memory allocations, jump over bugs, pop variables &amp; trigger GC!
              </p>
              <button
                onClick={handleStartStop}
                className="mt-3 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[9px] rounded-full flex items-center gap-1 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <IconPlayerPlay className="w-3 h-3" />
                START SIMULATION
              </button>
            </div>
          )}

          {/* Game Over / Execution Summary Completion Overlay */}
          {(gameState.gameState === "crashed" || gameState.gameState === "summary") && (
            <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-3 text-center z-30 font-mono space-y-1.5">
              <span className="text-[11px] font-extrabold text-rose-400 tracking-wider uppercase">
                {gameState.gameState === "crashed" ? "CRASH / OOM" : "RUN COMPLETE"}
              </span>
              <div className="text-[10px] text-zinc-300">
                SCORE: <strong className="text-amber-400">{gameState.score}</strong>
              </div>
              <a
                href="/schedule"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => recordEvent("garmin_simulator", "project_click")}
                className="mt-1 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[9px] rounded-full flex items-center gap-1 shadow-lg cursor-pointer transition-all active:scale-95"
              >
                <IconCalendar className="w-3 h-3" />
                <span>Book Consultation</span>
              </a>
              <button
                onClick={handleStartStop}
                className="px-2.5 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[8px] rounded-full flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
              >
                <IconPlayerPlay className="w-2.5 h-2.5" />
                <span>Restart Session</span>
              </button>
            </div>
          )}

          {/* Overheat Fog Quick Wipe Floating Badge */}
          {gameState.fogLevel > 0.35 && gameState.gameState === "playing" && (
            <button
              onClick={(e) => {
                isolateGesture(e);
                triggerHapticFeedback(15);
                triggerAudioFeedback(1100, 0.02);
                handleWipeFog();
              }}
              className="absolute top-12 right-8 z-30 min-w-[44px] min-h-[44px] px-3 py-2 bg-amber-500/90 text-black font-bold text-xs font-mono rounded-full border border-amber-300 shadow-md animate-bounce cursor-pointer flex items-center justify-center touch-none"
              style={{ touchAction: "none" }}
            >
              WIPE [W]
            </button>
          )}
        </div>
      </div>

      {/* Real-time Engineering Telemetry & Controls Dashboard Below Watch */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-zinc-400 max-w-xl text-center">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
          <IconCpu className="w-3.5 h-3.5 text-brand-cyan" />
          <span>RAM: <strong className="text-white">{gameState.allocatedRamKb.toFixed(1)} / {currentProfile.ramLimitKb} KB</strong></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
          <IconBolt className="w-3.5 h-3.5 text-amber-400" />
          <span>BATTERY: <strong className="text-white">{Math.round(gameState.battery)}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
          <IconFlame className={`w-3.5 h-3.5 ${gameState.thermalStress > 0.4 ? "text-orange-500 animate-pulse" : "text-zinc-500"}`} />
          <span>THERMAL STRESS: <strong className="text-white">{Math.round((gameState.thermalStress ?? 0) * 100)}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
          <IconFlame className={`w-3.5 h-3.5 ${gameState.fogLevel > 0.4 ? "text-rose-500 animate-pulse" : "text-zinc-500"}`} />
          <span>CONDENSATION: <strong className="text-white">{Math.round(gameState.fogLevel * 100)}%</strong></span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900/80 border border-zinc-800 rounded-lg">
          <span className="text-amber-400 font-bold">🏆 HI-SCORE:</span>
          <strong className="text-amber-300">{effectiveHighScore}</strong>
        </div>
      </div>

      {/* Control Quick Reference Guide */}
      <div className="mt-3 flex flex-wrap justify-center gap-2 text-[10px] font-mono text-zinc-500">
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded"><strong className="text-zinc-300">UP / ▲:</strong> Jump</span>
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded"><strong className="text-zinc-300">DOWN / ▼:</strong> Pop Heap Variable</span>
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded"><strong className="text-zinc-300">BACK / [GC]:</strong> Trigger Garbage Collector</span>
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded"><strong className="text-zinc-300">LIGHT / [L]:</strong> Backlight (Burns Bat)</span>
        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded"><strong className="text-zinc-300">SWIPE / [W]:</strong> Wipe Screen Fog</span>
      </div>
    </div>
  );
};
