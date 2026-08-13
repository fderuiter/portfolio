"use client";

import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/BentoGrid";
import { 
  IconVolume, 
  IconVolumeOff, 
  IconTrophy, 
  IconDeviceGamepad2, 
  IconDeviceWatch, 
  IconBrain, 
  IconMusic,
  IconChevronRight,
  IconRefresh
} from "@tabler/icons-react";

// Web Audio API Synthesis helper to avoid external audio assets
let audioCtx: AudioContext | null = null;

function playSynthBeep(frequency: number, duration: number, volume: number) {
  if (volume <= 0) return;
  try {
    const AudioCtxClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxClass) return;
    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // Choose wave type: "sine" for clean beep
    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
    
    // Soft volume mapping to prevent excessively loud output
    const scaleVolume = (volume / 100) * 0.15;
    gainNode.gain.setValueAtTime(scaleVolume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (err) {
    console.error("Synthesizer error:", err);
  }
}

// Game Obstacle Type
interface Obstacle {
  id: number;
  x: number;
  width: number;
  height: number;
  type: string;
}

export const SmartwatchSimulator: React.FC = () => {
  // Volume state: Starts at 0 (muted) to satisfy autoplay guardrails
  const [volume, setVolume] = useState<number>(0);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  
  // Watch OS current active screen: "home" | "game" | "skills" | "synth"
  const [activeScreen, setActiveScreen] = useState<"home" | "game" | "skills" | "synth">("home");
  
  // Simulated stats state
  const [statsBoost, setStatsBoost] = useState<number>(0);

  // Time state
  const [time, setTime] = useState<string>("12:00:00");
  
  // Synth note frequencies
  const synthNotes = [
    { name: "C4", freq: 261.63, color: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30" },
    { name: "E4", freq: 329.63, color: "bg-cyan-500/20 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30" },
    { name: "G4", freq: 392.00, color: "bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30" },
    { name: "C5", freq: 523.25, color: "bg-purple-500/20 border-purple-500/40 text-purple-400 hover:bg-purple-500/30" },
  ];

  // 1. Digital Clock effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      const secs = String(now.getSeconds()).padStart(2, "0");
      setTime(`${hrs}:${mins}:${secs}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- GAME STATE & PHYSICS LOOP ---
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  
  // High score state loaded directly via lazy state initializer to bypass ESLint sync effect warnings
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("fdr_watch_highscore");
        return saved ? parseInt(saved, 10) : 0;
      } catch {
        return 0;
      }
    }
    return 0;
  });
  
  // Physics parameters (in pixels, scaled inside 160x140 game view)
  const [runnerY, setRunnerY] = useState<number>(0); // 0 = ground
  const runnerVelocity = useRef<number>(0);
  const gameFrameId = useRef<number | null>(null);
  
  // Mirror ref + state pattern to avoid ref read during render warnings
  const obstaclesRef = useRef<Obstacle[]>([]);
  const [obstaclesList, setObstaclesList] = useState<Obstacle[]>([]);
  
  const lastObstacleId = useRef<number>(0);
  const lastSpawnTime = useRef<number>(0);

  const triggerJump = () => {
    if (!gameActive) {
      if (isGameOver) {
        // Reset and start
        setScore(0);
        setIsGameOver(false);
        setRunnerY(0);
        runnerVelocity.current = 0;
        obstaclesRef.current = [];
        setObstaclesList([]);
        lastSpawnTime.current = Date.now();
        setGameActive(true);
        playSynthBeep(440, 0.1, volume);
        setTimeout(() => playSynthBeep(554.37, 0.1, volume), 100);
      } else {
        // Just starting first time
        setScore(0);
        setRunnerY(0);
        runnerVelocity.current = 0;
        obstaclesRef.current = [];
        setObstaclesList([]);
        lastSpawnTime.current = Date.now();
        setGameActive(true);
        playSynthBeep(523.25, 0.15, volume);
      }
      return;
    }

    // Only jump if on ground
    if (runnerY === 0) {
      runnerVelocity.current = 4.8; // jump impulse velocity
      playSynthBeep(659.25, 0.08, volume);
    }
  };

  // Main game physics loop (60fps)
  useEffect(() => {
    if (!gameActive) {
      if (gameFrameId.current) {
        cancelAnimationFrame(gameFrameId.current);
        gameFrameId.current = null;
      }
      return;
    }

    const GRAVITY = -0.22;
    const GROUND_Y = 0;
    const GAME_SPEED = 2.0;

    const gameLoop = () => {
      // 1. Update Runner position
      setRunnerY((prev) => {
        const nextV = runnerVelocity.current + GRAVITY;
        runnerVelocity.current = nextV;
        let nextY = prev + nextV;
        if (nextY <= GROUND_Y) {
          nextY = GROUND_Y;
          runnerVelocity.current = 0;
        }
        return nextY;
      });

      // 2. Spawn obstacles
      const now = Date.now();
      if (now - lastSpawnTime.current > 1600 + Math.random() * 1200) {
        const types = ["Reflow", "LCP Shift", "XML Bug"];
        const type = types[Math.floor(Math.random() * types.length)];
        const obsWidth = 8 + Math.floor(Math.random() * 6);
        const obsHeight = 12 + Math.floor(Math.random() * 8);
        
        lastObstacleId.current += 1;
        obstaclesRef.current.push({
          id: lastObstacleId.current,
          x: 160, // spawn right off screen
          width: obsWidth,
          height: obsHeight,
          type
        });
        lastSpawnTime.current = now;
      }

      // 3. Move & filter obstacles + collision detection
      let hit = false;
      const currentRunnerY = runnerY; // reference current frame
      const RUNNER_X = 25;
      const RUNNER_WIDTH = 12;
      const RUNNER_HEIGHT = 14;

      obstaclesRef.current = obstaclesRef.current
        .map((obs) => {
          const nextX = obs.x - GAME_SPEED;
          
          // Collision logic (bounding boxes)
          const runnerRight = RUNNER_X + RUNNER_WIDTH;
          const runnerTop = currentRunnerY + RUNNER_HEIGHT;
          const obsRight = nextX + obs.width;
          const obsTop = obs.height;

          // Check intersection
          if (
            RUNNER_X < obsRight &&
            runnerRight > nextX &&
            currentRunnerY < obsTop &&
            runnerTop > 0
          ) {
            hit = true;
          }

          return { ...obs, x: nextX };
        })
        .filter((obs) => {
          if (obs.x + obs.width < 0) {
            // Passed successfully! Score increases
            setScore((prev) => {
              const nextScore = prev + 1;
              playSynthBeep(880, 0.05, volume); // high-pitched success beep
              return nextScore;
            });
            return false;
          }
          return true;
        });

      // Sync state for render
      setObstaclesList([...obstaclesRef.current]);

      if (hit) {
        // Game Over!
        setGameActive(false);
        setIsGameOver(true);
        playSynthBeep(220, 0.25, volume); // sad sound
        setTimeout(() => playSynthBeep(146.83, 0.3, volume), 150);

        setHighScore((prev) => {
          const nextHigh = score > prev ? score : prev;
          try {
            localStorage.setItem("fdr_watch_highscore", nextHigh.toString());
          } catch {
            // ignore
          }
          return nextHigh;
        });
        return;
      }

      gameFrameId.current = requestAnimationFrame(gameLoop);
    };

    gameFrameId.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameFrameId.current) {
        cancelAnimationFrame(gameFrameId.current);
      }
    };
  }, [gameActive, runnerY, score, volume]);

  const cycleScreen = () => {
    // Reset state when switching screens
    setGameActive(false);
    setIsGameOver(false);
    
    // Play transition sound
    playSynthBeep(400, 0.06, volume);
    setTimeout(() => playSynthBeep(600, 0.06, volume), 40);

    const screens: Array<"home" | "game" | "skills" | "synth"> = ["home", "game", "skills", "synth"];
    const currIdx = screens.indexOf(activeScreen);
    const nextScreen = screens[(currIdx + 1) % screens.length];
    setActiveScreen(nextScreen);
  };

  const handleMuteToggle = () => {
    setHasInteracted(true);
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(30);
      // Play brief test beep so the user knows it's unmuted
      playSynthBeep(523.25, 0.1, 30);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasInteracted(true);
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (val > 0) {
      // Play tiny feedback beep
      playSynthBeep(523.25, 0.05, val);
    }
  };

  return (
    <Card className="flex flex-col justify-between items-center w-full h-[440px] bg-zinc-950/20 border border-zinc-900 rounded-[48px] overflow-hidden p-6 relative group select-none">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e1e24_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      
      {/* 1. Header Frame - Custom Volume Slider Bar */}
      <div className="w-full flex justify-between items-center z-10 border-b border-zinc-900/60 pb-3">
        <div className="flex items-center gap-2">
          <IconDeviceWatch className="w-4 h-4 text-brand-cyan animate-pulse" />
          <span className="text-[10px] font-mono font-bold tracking-widest text-zinc-400 uppercase">
            FDR Smartwatch v1.0
          </span>
        </div>

        {/* volume slider frame */}
        <div className="flex items-center gap-2.5 bg-zinc-950/40 border border-zinc-900/80 px-2.5 py-1 rounded-xl">
          <button
            onClick={handleMuteToggle}
            aria-label={volume === 0 ? "Unmute Simulator Audio" : "Mute Simulator Audio"}
            className="text-zinc-500 hover:text-brand-cyan transition-colors"
          >
            {volume === 0 ? (
              <IconVolumeOff className="w-3.5 h-3.5 text-zinc-500" />
            ) : (
              <IconVolume className="w-3.5 h-3.5 text-brand-cyan" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={volume}
            onChange={handleVolumeChange}
            className="w-12 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-brand-cyan [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-cyan [&::-webkit-slider-thumb]:appearance-none"
            style={{ touchAction: "none" }}
          />
          <span className="text-[9px] font-mono text-zinc-500 min-w-[18px] text-right">
            {volume}%
          </span>
        </div>
      </div>

      {/* Unmute warning callout if zero interactions and volume is 0 */}
      {!hasInteracted && volume === 0 && (
        <div className="absolute top-[44px] left-1/2 -translate-x-1/2 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan text-[8px] font-mono px-2 py-0.5 rounded-full z-20 animate-bounce pointer-events-none uppercase tracking-widest">
          🔇 Tap to unmute beeps
        </div>
      )}

      {/* 2. Core Watch Body Container */}
      <div className="relative flex items-center justify-center py-2 select-none">
        
        {/* Virtual watch side hardware buttons */}
        <div className="absolute -right-[66px] top-1/2 -translate-y-1/2 flex flex-col gap-5 z-10">
          {/* Top side Action button */}
          <button
            onClick={cycleScreen}
            className="w-14 h-5 bg-gradient-to-l from-zinc-800 to-zinc-900 hover:from-brand-cyan hover:to-brand-blue border border-zinc-700/50 rounded-r-md text-[8px] font-mono font-black text-zinc-500 hover:text-zinc-950 flex items-center justify-start pl-2 shadow-md hover:shadow-brand-cyan/10 active:scale-95 transition-all uppercase tracking-tighter cursor-pointer"
            title="Cycle Active Watch App"
            style={{ touchAction: "manipulation" }}
          >
            Mode
          </button>

          {/* Bottom side Jump button */}
          <button
            onClick={() => {
              if (activeScreen === "game") {
                triggerJump();
              } else {
                cycleScreen();
              }
            }}
            className="w-14 h-5 bg-gradient-to-l from-zinc-800 to-zinc-900 hover:from-brand-cyan hover:to-brand-blue border border-zinc-700/50 rounded-r-md text-[8px] font-mono font-black text-zinc-500 hover:text-zinc-950 flex items-center justify-start pl-2 shadow-md hover:shadow-brand-cyan/10 active:scale-95 transition-all uppercase tracking-tighter cursor-pointer"
            title={activeScreen === "game" ? "Jump Hero" : "Switch Mode"}
            style={{ touchAction: "manipulation" }}
          >
            {activeScreen === "game" ? "Jump" : "Act"}
          </button>
        </div>

        {/* Outer Bezel (Squircle Premium Watch Design) */}
        <div className="w-[206px] h-[206px] rounded-full bg-zinc-900/80 border-[6px] border-zinc-950 flex items-center justify-center shadow-inner relative select-none">
          
          {/* Decorative dial ticks */}
          <div className="absolute inset-0 rounded-full border border-dashed border-zinc-800/60 pointer-events-none" />
          
          {/* Glowing ring */}
          <div className="absolute inset-0 rounded-full border border-brand-cyan/10 pointer-events-none animate-pulse" />

          {/* Watch Touch Screen */}
          <div 
            onClick={() => {
              if (activeScreen === "game") {
                triggerJump();
              } else {
                cycleScreen();
              }
            }}
            style={{ touchAction: "manipulation" }}
            className="w-[178px] h-[178px] rounded-full bg-black border border-zinc-900 flex flex-col items-center justify-between overflow-hidden relative p-4 cursor-pointer select-none"
          >
            
            {/* Screen overlay to prevent interference with dragging */}
            <div className="absolute inset-0 bg-transparent" />

            {/* SCREEN 1: CLOCK & FITNESS PROGRESS DIALS */}
            {activeScreen === "home" && (
              <div className="flex-1 w-full flex flex-col justify-between items-center py-2 relative z-10 text-center">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em]">FDR OS v1.0</span>
                
                {/* Big Glowing Time */}
                <div className="my-1">
                  <div className="text-xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 tracking-wider">
                    {time.split(":")[0]}:{time.split(":")[1]}
                  </div>
                  <div className="text-[10px] font-mono text-brand-cyan font-bold leading-none animate-pulse">
                    {time.split(":")[2]}
                  </div>
                </div>

                {/* Progress Rings (Mock Activity Rings) */}
                <div className="flex gap-2 items-center justify-center w-full">
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-brand-cyan/20 border-t-brand-cyan flex items-center justify-center">
                      <span className="text-[6px] font-mono text-brand-cyan">CD</span>
                    </div>
                    <span className="text-[6px] font-mono text-zinc-600 mt-1">95%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-purple-500/20 border-t-purple-500 flex items-center justify-center">
                      <span className="text-[6px] font-mono text-purple-400">LP</span>
                    </div>
                    <span className="text-[6px] font-mono text-zinc-600 mt-1">90%</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-5 h-5 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 flex items-center justify-center">
                      <span className="text-[6px] font-mono text-emerald-400">WS</span>
                    </div>
                    <span className="text-[6px] font-mono text-zinc-600 mt-1">80%</span>
                  </div>
                </div>

                <div className="text-[7px] font-mono text-zinc-500 flex items-center gap-1 mt-1 uppercase animate-pulse">
                  <span>● Mode: Tap to Cycle</span>
                </div>
              </div>
            )}

            {/* SCREEN 2: GAME SCREEN ("DINO JUMP / XML BUG DODGER") */}
            {activeScreen === "game" && (
              <div className="flex-1 w-full flex flex-col justify-between items-center relative z-10 text-center overflow-hidden">
                {/* Header Info */}
                <div className="w-full flex justify-between items-center text-[8px] font-mono text-zinc-500 leading-none">
                  <span className="flex items-center gap-0.5 text-brand-cyan font-extrabold">
                    <IconDeviceGamepad2 className="w-2.5 h-2.5" />
                    BUG RUN
                  </span>
                  <span className="flex items-center gap-0.5">
                    <IconTrophy className="w-2 h-2 text-yellow-500" />
                    {highScore}
                  </span>
                </div>

                {/* Main Game Screen Window */}
                <div className="relative w-[146px] h-[86px] bg-zinc-950 border border-zinc-900 rounded-xl overflow-hidden mt-1.5 flex flex-col justify-between">
                  {/* Score HUD */}
                  <div className="absolute top-1 left-1.5 text-[8px] font-mono font-bold text-white z-20">
                    PTS: {score}
                  </div>

                  {!gameActive && !isGameOver ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-2 bg-zinc-950/90 z-20">
                      <p className="text-[8px] font-mono text-neutral-300 font-bold uppercase tracking-wider animate-pulse mb-1">
                        TAP SCREEN
                      </p>
                      <p className="text-[6px] font-mono text-zinc-500 uppercase">
                        TO JUMP XML BUGS
                      </p>
                    </div>
                  ) : null}

                  {isGameOver ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-1.5 bg-red-950/20 backdrop-blur-[1px] z-20">
                      <span className="text-[8px] font-mono text-red-500 font-bold uppercase tracking-widest leading-none mb-0.5">
                        REFRESH FAULT
                      </span>
                      <span className="text-[6px] font-mono text-zinc-400 mb-1 leading-none">
                        COLLIDED WITH REDESIGN
                      </span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerJump();
                        }}
                        style={{ touchAction: "manipulation" }}
                        className="flex items-center gap-1 bg-red-950 border border-red-800 text-red-400 px-1.5 py-0.5 rounded-md text-[6px] font-mono hover:bg-red-900 hover:text-white cursor-pointer"
                      >
                        <IconRefresh className="w-2.5 h-2.5" />
                        REBOOT
                      </button>
                    </div>
                  ) : null}

                  {/* Ground Line */}
                  <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-zinc-850" />
                  
                  {/* Sky/Decorative Grid lines */}
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-950 border-b border-dashed border-zinc-900 pointer-events-none" />

                  {/* Game Runner Avatar */}
                  <div 
                    style={{ 
                      bottom: `${16 + runnerY}px`,
                      left: `25px`
                    }}
                    className="absolute w-3.5 h-3.5 bg-gradient-to-tr from-brand-cyan to-brand-blue rounded-md border border-brand-cyan/40 z-15 flex items-center justify-center font-mono text-[7px] text-white font-black leading-none transition-bottom duration-75"
                  >
                    F
                  </div>

                  {/* Obstacles Rendering */}
                  {obstaclesList.map((obs) => (
                    <div
                      key={obs.id}
                      style={{
                        bottom: `16px`,
                        left: `${obs.x}px`,
                        width: `${obs.width}px`,
                        height: `${obs.height}px`
                      }}
                      className="absolute bg-red-500/20 border border-red-500/80 rounded-t-sm z-10 flex items-center justify-center pointer-events-none"
                    >
                      {/* Obstacle symbol */}
                      <span className="text-[5px] font-mono text-red-400 select-none">!</span>
                    </div>
                  ))}
                </div>

                {/* Quick Hint Footer */}
                <div className="text-[7px] font-mono text-zinc-600 uppercase mt-1 animate-pulse">
                  {gameActive ? "TAP SCREEN TO JUMP" : "Tap Mode to Switch"}
                </div>
              </div>
            )}

            {/* SCREEN 3: DEVELOPER SKILLS MONITOR */}
            {activeScreen === "skills" && (
              <div className="flex-1 w-full flex flex-col justify-between items-center py-1.5 relative z-10 text-center">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-0.5">
                  <IconBrain className="w-3 h-3 text-brand-cyan" />
                  COGNITIVE CAP
                </span>

                <div className="w-full space-y-1.5 my-1 text-left px-1.5">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[6px] font-mono">
                      <span className="text-zinc-400 font-bold">SYSTEM ARCH</span>
                      <span className="text-brand-cyan font-bold">{Math.min(100, 95 + statsBoost)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, 95 + statsBoost)}%` }} 
                        className="h-full bg-brand-cyan transition-all duration-300" 
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[6px] font-mono">
                      <span className="text-zinc-400 font-bold">LAYOUT PHYSICS</span>
                      <span className="text-purple-400 font-bold">{Math.min(100, 90 + statsBoost)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, 90 + statsBoost)}%` }} 
                        className="h-full bg-purple-500 transition-all duration-300" 
                      />
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[6px] font-mono">
                      <span className="text-zinc-400 font-bold">CLINICAL ENG</span>
                      <span className="text-emerald-400 font-bold">{Math.min(100, 85 + statsBoost)}%</span>
                    </div>
                    <div className="h-1 bg-zinc-900 border border-zinc-850 rounded-full overflow-hidden">
                      <div 
                        style={{ width: `${Math.min(100, 85 + statsBoost)}%` }} 
                        className="h-full bg-emerald-500 transition-all duration-300" 
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatsBoost((prev) => (prev < 15 ? prev + 5 : 0));
                    playSynthBeep(659.25 + statsBoost * 50, 0.08, volume);
                  }}
                  style={{ touchAction: "manipulation" }}
                  className="bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan rounded-md text-[7px] font-mono px-2 py-0.5 hover:bg-brand-cyan/20 active:scale-95 transition-all flex items-center gap-0.5 cursor-pointer"
                >
                  BOOST STATS
                  <IconChevronRight className="w-2.5 h-2.5" />
                </button>
              </div>
            )}

            {/* SCREEN 4: SYNTH pad MELODY MAKER */}
            {activeScreen === "synth" && (
              <div className="flex-1 w-full flex flex-col justify-between items-center py-1.5 relative z-10 text-center">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-0.5">
                  <IconMusic className="w-3 h-3 text-brand-cyan animate-bounce" />
                  SYNTH PLAY
                </span>

                <div className="grid grid-cols-2 gap-1.5 my-1.5 w-full px-1">
                  {synthNotes.map((note) => (
                    <button
                      key={note.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasInteracted(true);
                        playSynthBeep(note.freq, 0.35, volume);
                      }}
                      style={{ touchAction: "manipulation" }}
                      className={`py-2 border rounded-xl font-mono text-[9px] font-black tracking-wider transition-all active:scale-95 flex flex-col justify-center items-center cursor-pointer select-none ${note.color}`}
                    >
                      <span>{note.name}</span>
                      <span className="text-[5px] opacity-40 font-mono font-normal mt-0.5">{Math.round(note.freq)}Hz</span>
                    </button>
                  ))}
                </div>

                <div className="text-[7px] font-mono text-zinc-600 uppercase">
                  TAP PADS TO COMPOSE
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* 3. Footer frame labels */}
      <div className="w-full flex justify-between items-center border-t border-zinc-900/60 pt-3 z-10">
        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
          SYS STATUS: <span className="text-emerald-400 font-bold animate-pulse">OK</span>
        </span>
        <button
          onClick={cycleScreen}
          className="text-[8px] font-mono font-bold text-brand-cyan hover:text-white transition-colors uppercase tracking-widest flex items-center gap-0.5 cursor-pointer"
          style={{ touchAction: "manipulation" }}
        >
          APP CYCLE
          <IconChevronRight className="w-3 h-3" />
        </button>
      </div>
    </Card>
  );
};
