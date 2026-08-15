"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback } from "react";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  IconFlame,
  IconRefresh,
  IconTrophy,
  IconPlayerPlay,
  IconSnowflake,
} from "@tabler/icons-react";
import { FieldManualButton } from "@/components/FieldManualButton";
import {
  LaserMode,
  LaserType,
  Target,
  IceBlock,
  Particle,
  FloatingText,
  createInitialState,
  spawnTarget as engineSpawnTarget,
  createIceBlock as engineCreateIceBlock,
  updateIceBlocksAndCollisions,
  updateTargetsPosition,
  checkLaserRayHit,
  calculateNextComboAndMultiplier,
  createExplosionParticles,
  updateParticles,
  updateFloatingTexts,
  WEAPONS,
  DEFAULT_CANVAS_WIDTH,
  DEFAULT_CANVAS_HEIGHT,
} from "@/lib/laser-loon";

const emptySubscribe = () => () => {};

const subscribeHighScore = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getHighScoreSnapshot = () => {
  try {
    return localStorage.getItem("laser_loon_high_score") || "0";
  } catch {
    return "0";
  }
};
const getHighScoreServerSnapshot = () => "0";

export const LaserLoon: React.FC = () => {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const rawHighScore = useSyncExternalStore(
    subscribeHighScore,
    getHighScoreSnapshot,
    getHighScoreServerSnapshot
  );
  const loadedHighScore = parseInt(rawHighScore, 10) || 0;
  const { playNote, playSuccess } = useAudio();
  const { recordEvent } = useTelemetry();

  // Game configuration & React state
  const [mode, setMode] = useState<LaserMode>("arcade");
  const [laserType, setLaserType] = useState<LaserType>("ice-cannon");
  const [gameState, setGameState] = useState<"idle" | "playing" | "gameover">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const effectiveHighScore = Math.max(highScore, loadedHighScore);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isFocused, setIsFocused] = useState(false);
  const [screenShakeEnabled, setScreenShakeEnabled] = useState(true);
  const [gravity, setGravity] = useState<number>(0.15); // for sandbox mode

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Mutable Game Physics & Animation Refs
  const targetsRef = useRef<Target[]>([]);
  const iceBlocksRef = useRef<IceBlock[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const loonPosRef = useRef({ x: 120, y: 180, targetX: 120, targetY: 180 });
  const aimPosRef = useRef({ x: 380, y: 180 });
  const isFiringRef = useRef(false);
  const isDraggingLoonRef = useRef(false);
  const nextTargetIdRef = useRef(1);
  const nextIceIdRef = useRef(1);
  const nextTextIdRef = useRef(1);
  const lastFireTimeRef = useRef(0);
  const lastComboTimeRef = useRef(0);
  const animFrameIdRef = useRef<number | null>(null);
  const shakeIntensityRef = useRef(0);

  // Audio synthesis helpers with robust error handling
  const playLaserSound = useCallback((type: LaserType) => {
    try {
      if (type === "cyan-pulse") {
        playNote(880, 0.04);
        setTimeout(() => playNote(440, 0.03), 20);
      } else if (type === "emerald-beam") {
        playNote(587.33, 0.06);
        setTimeout(() => playNote(783.99, 0.04), 30);
      } else if (type === "rainbow-chaos") {
        playNote(523.25, 0.04);
        playNote(659.25, 0.04);
        playNote(783.99, 0.04);
      } else if (type === "ice-cannon") {
        playNote(330, 0.08);
        setTimeout(() => playNote(660, 0.06), 30);
      }
    } catch {}
  }, [playNote]);

  const playIceShatterSound = useCallback(() => {
    try {
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
      freqs.forEach((f, idx) => {
        setTimeout(() => playNote(f, 0.05), idx * 25);
      });
    } catch {}
  }, [playNote]);

  const playExplodeSound = useCallback(() => {
    try {
      playNote(220, 0.08);
      setTimeout(() => playNote(110, 0.12), 40);
    } catch {}
  }, [playNote]);

  const playComboSound = useCallback((comboCount: number) => {
    try {
      const baseFreq = Math.min(1200, 440 + comboCount * 60);
      playNote(baseFreq, 0.1);
      setTimeout(() => playNote(baseFreq * 1.25, 0.12), 60);
    } catch {}
  }, [playNote]);

  // Floating text helper
  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: nextTextIdRef.current++,
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.2,
    });
  }, []);

  // Particle helper
  const spawnExplosion = useCallback((x: number, y: number, color: string, count = 18, isIce = false) => {
    const newParticles = createExplosionParticles(x, y, color, count, isIce);
    particlesRef.current.push(...newParticles);
  }, []);

  // Launch Ice Block
  const launchIceBlock = useCallback((fromX: number, fromY: number, targetX: number, targetY: number) => {
    const { iceBlock, nextId } = engineCreateIceBlock(fromX, fromY, targetX, targetY, nextIceIdRef.current);
    nextIceIdRef.current = nextId;
    iceBlocksRef.current.push(iceBlock);
    spawnExplosion(fromX, fromY, "#38bdf8", 6, true);
  }, [spawnExplosion]);

  // High score updater
  const addScore = useCallback((pts: number) => {
    setScore((s) => {
      const next = s + pts;
      setHighScore((h) => {
        if (next > h) {
          if (typeof window !== "undefined") {
            try {
              localStorage.setItem("laser_loon_high_score", next.toString());
            } catch {}
          }
          return next;
        }
        return h;
      });
      return next;
    });
  }, []);

  // Spawner callback
  const spawnTarget = useCallback((width: number, height: number) => {
    const { updatedTargets, nextId } = engineSpawnTarget(
      targetsRef.current,
      nextTargetIdRef.current,
      width,
      height
    );
    targetsRef.current = updatedTargets;
    nextTargetIdRef.current = nextId;
  }, []);

  // Start game session
  const startGame = useCallback(() => {
    const fresh = createInitialState(mode);
    setGameState("playing");
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    setTimeLeft(fresh.timeLeft);
    targetsRef.current = [];
    iceBlocksRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    loonPosRef.current = { x: 120, y: 180, targetX: 120, targetY: 180 };

    recordEvent("laser_loon_start", "project_click").catch(() => {});
  }, [mode, recordEvent]);

  // Reset Game
  const resetGame = useCallback(() => {
    setGameState("idle");
    setScore(0);
    setCombo(0);
    setMultiplier(1);
    targetsRef.current = [];
    iceBlocksRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
  }, []);

  // Countdown timer for arcade mode
  useEffect(() => {
    if (gameState !== "playing" || mode === "sandbox") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("gameover");
          playSuccess();
          recordEvent("laser_loon_complete", "project_click").catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, mode, playSuccess, recordEvent]);

  // Weapon fire trigger
  const fireWeapon = useCallback(() => {
    const now = performance.now();
    const weapon = WEAPONS[laserType];
    const fireInterval = weapon ? weapon.fireIntervalMs : 140;

    if (now - lastFireTimeRef.current < fireInterval) return;
    lastFireTimeRef.current = now;

    playLaserSound(laserType);

    const loon = loonPosRef.current;
    const eyeX = loon.x + 32;
    const eyeY = loon.y - 12;
    const beakX = loon.x + 48;
    const beakY = loon.y - 8;
    const aim = aimPosRef.current;

    if (laserType === "ice-cannon") {
      launchIceBlock(beakX, beakY, aim.x, aim.y);
      return;
    }

    // Raycast hit check
    const hitResult = checkLaserRayHit(eyeX, eyeY, aim.x, aim.y, laserType, targetsRef.current);
    targetsRef.current = hitResult.updatedTargets;

    hitResult.damagedPoints.forEach((pt) => {
      spawnExplosion(pt.x, pt.y, pt.color, 4);
    });

    if (hitResult.killedTargets.length > 0) {
      playExplodeSound();
      if (screenShakeEnabled) shakeIntensityRef.current = 6;

      hitResult.killedTargets.forEach((t) => {
        spawnExplosion(t.x, t.y, t.color, 24);

        const { nextCombo, nextMultiplier } = calculateNextComboAndMultiplier(
          combo,
          lastComboTimeRef.current,
          now
        );
        lastComboTimeRef.current = now;
        setCombo(nextCombo);
        setMultiplier(nextMultiplier);

        const pts = t.points * nextMultiplier;
        addScore(pts);
        addFloatingText(t.x, t.y, `+${pts}`, t.color);

        if (nextCombo > 1 && nextCombo % 3 === 0) {
          playComboSound(nextCombo);
          addFloatingText(t.x, t.y - 20, `${nextMultiplier}x COMBO!`, "#38bdf8");
        }
      });
    } else if (hitResult.hitAny && screenShakeEnabled && shakeIntensityRef.current === 0) {
      shakeIntensityRef.current = 2;
    }
  }, [
    laserType,
    combo,
    screenShakeEnabled,
    playLaserSound,
    playExplodeSound,
    playComboSound,
    spawnExplosion,
    addFloatingText,
    launchIceBlock,
    addScore,
  ]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    if (!isMounted || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let lastFrameTime = performance.now();

    const renderLoop = (time: number) => {
      const dt = Math.min(32, time - lastFrameTime) / 16.666;
      lastFrameTime = time;

      const width = canvas.width || DEFAULT_CANVAS_WIDTH;
      const height = canvas.height || DEFAULT_CANVAS_HEIGHT;

      // Screen shake calculation
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (shakeIntensityRef.current > 0) {
        shakeOffsetX = (Math.random() - 0.5) * shakeIntensityRef.current;
        shakeOffsetY = (Math.random() - 0.5) * shakeIntensityRef.current;
        shakeIntensityRef.current = Math.max(0, shakeIntensityRef.current - 0.3 * dt);
      }

      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // 1. Clear background & draw retro cyber grid
      ctx.fillStyle = "#09090b";
      ctx.fillRect(-10, -10, width + 20, height + 20);

      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        20,
        width / 2,
        height / 2,
        width * 0.7
      );
      bgGrad.addColorStop(0, laserType === "ice-cannon" ? "rgba(56, 189, 248, 0.08)" : "rgba(6, 182, 212, 0.06)");
      bgGrad.addColorStop(1, "rgba(9, 9, 11, 0)");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Cyber Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Loon Position Smooth Lerp
      const loon = loonPosRef.current;
      if (!isDraggingLoonRef.current) {
        loon.x += (loon.targetX - loon.x) * 0.1 * dt;
        loon.y += (loon.targetY - loon.y) * 0.1 * dt;
      }

      // Continuous firing when mouse is held
      if (isFiringRef.current && (gameState === "playing" || mode === "sandbox")) {
        fireWeapon();
      }

      // 3. Spawning targets in playing mode
      if (gameState === "playing") {
        const maxTargets = mode === "arcade" ? 6 : 8;
        if (targetsRef.current.length < maxTargets && Math.random() < 0.035 * dt) {
          spawnTarget(width, height);
        }
      }

      // 4. Update & Render Ice Blocks and Collisions
      const iceResult = updateIceBlocksAndCollisions(
        iceBlocksRef.current,
        targetsRef.current,
        dt,
        mode,
        gravity,
        width,
        height
      );
      iceBlocksRef.current = iceResult.updatedIceBlocks;
      targetsRef.current = iceResult.updatedTargets;

      // Handle ice shatter events
      iceResult.shatteredBlocks.forEach((pt) => {
        playIceShatterSound();
        spawnExplosion(pt.x, pt.y, "#38bdf8", 18, true);
        if (screenShakeEnabled) shakeIntensityRef.current = 4;
      });

      iceResult.frozenTargets.forEach((t) => {
        addFloatingText(t.x, t.y, "CRYO-FROZEN!", "#38bdf8");
      });

      if (iceResult.pointsEarned > 0) {
        addScore(iceResult.pointsEarned);
      }

      iceResult.killedTargets.forEach((t) => {
        spawnExplosion(t.x, t.y, "#38bdf8", 28, true);
        addFloatingText(t.x, t.y, `SHATTERED! +${t.points * 2}`, "#38bdf8");
      });

      // Render Active Ice Blocks
      iceBlocksRef.current.forEach((block) => {
        ctx.save();
        ctx.translate(block.x, block.y);
        ctx.rotate(block.rotation);

        const s = block.size;
        const half = s / 2;

        const iceGlow = ctx.createRadialGradient(0, 0, 2, 0, 0, s);
        iceGlow.addColorStop(0, "rgba(56, 189, 248, 0.7)");
        iceGlow.addColorStop(0.6, "rgba(56, 189, 248, 0.2)");
        iceGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = iceGlow;
        ctx.beginPath();
        ctx.arc(0, 0, s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(186, 230, 253, 0.85)";
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-half, -half, s, s, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-half + 3, -half + 3);
        ctx.lineTo(half - 6, -half + 3);
        ctx.moveTo(-half + 3, -half + 3);
        ctx.lineTo(-half + 3, half - 6);
        ctx.stroke();

        ctx.fillStyle = "#0284c7";
        ctx.font = "bold 11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("❄️", 0, 0);

        ctx.restore();
      });

      // 5. Update & Render Targets
      targetsRef.current = updateTargetsPosition(targetsRef.current, dt, mode, gravity, height);

      targetsRef.current.forEach((t) => {
        const pulse = Math.sin(t.pulsePhase) * 3;
        const glow = ctx.createRadialGradient(t.x, t.y, 2, t.x, t.y, t.radius + 8 + pulse);
        glow.addColorStop(0, (t.frozenTimer > 0 ? "#38bdf8" : t.color) + "66");
        glow.addColorStop(1, t.color + "00");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius + 8 + pulse, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = t.frozenTimer > 0 ? "rgba(186, 230, 253, 0.9)" : "#18181b";
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = t.frozenTimer > 0 ? "#38bdf8" : t.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (t.frozenTimer > 0) {
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(t.x - t.radius - 2, t.y - t.radius - 2, (t.radius + 2) * 2, (t.radius + 2) * 2);
        }

        if (t.maxHp > 1) {
          ctx.strokeStyle = "#10b981";
          ctx.lineWidth = 3;
          ctx.beginPath();
          const hpPct = Math.max(0, t.hp / t.maxHp);
          ctx.arc(t.x, t.y, t.radius + 3, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * hpPct);
          ctx.stroke();
        }

        ctx.fillStyle = t.frozenTimer > 0 ? "#0369a1" : "#ffffff";
        ctx.font = "bold 9px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const shortName = t.label.length > 10 ? t.label.slice(0, 8) + ".." : t.label;
        ctx.fillText(shortName, t.x, t.y);
      });

      // 6. Laser Aim Reticle & Active Laser Beams
      const eyeX = loon.x + 32;
      const eyeY = loon.y - 12;
      const aim = aimPosRef.current;

      ctx.strokeStyle = laserType === "ice-cannon" ? "rgba(56, 189, 248, 0.4)" : "rgba(6, 182, 212, 0.4)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(eyeX, eyeY);
      ctx.lineTo(aim.x, aim.y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = laserType === "ice-cannon" ? "#38bdf8" : "#06b6d4";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(aim.x, aim.y, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(aim.x - 12, aim.y);
      ctx.lineTo(aim.x + 12, aim.y);
      ctx.moveTo(aim.x, aim.y - 12);
      ctx.lineTo(aim.x + 12, aim.y);
      ctx.stroke();

      if (isFiringRef.current && laserType !== "ice-cannon") {
        ctx.save();
        if (laserType === "cyan-pulse") {
          ctx.strokeStyle = "#22d3ee";
          ctx.shadowColor = "#06b6d4";
          ctx.shadowBlur = 12;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY);
          ctx.lineTo(aim.x, aim.y);
          ctx.stroke();

          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (laserType === "emerald-beam") {
          ctx.strokeStyle = "#10b981";
          ctx.shadowColor = "#34d399";
          ctx.shadowBlur = 18;
          ctx.lineWidth = 8;
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY);
          ctx.lineTo(aim.x, aim.y);
          ctx.stroke();

          ctx.strokeStyle = "#a7f3d0";
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          const grad = ctx.createLinearGradient(eyeX, eyeY, aim.x, aim.y);
          grad.addColorStop(0, "#f43f5e");
          grad.addColorStop(0.33, "#eab308");
          grad.addColorStop(0.66, "#06b6d4");
          grad.addColorStop(1, "#a855f7");

          ctx.strokeStyle = grad;
          ctx.shadowColor = "#ec4899";
          ctx.shadowBlur = 15;
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(eyeX, eyeY);
          ctx.lineTo(aim.x, aim.y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 7. Render Canadian Laser Loon
      ctx.save();
      ctx.translate(loon.x, loon.y);

      if (laserType === "ice-cannon") {
        const loonGlow = ctx.createRadialGradient(10, 0, 5, 10, 0, 45);
        loonGlow.addColorStop(0, "rgba(56, 189, 248, 0.35)");
        loonGlow.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = loonGlow;
        ctx.beginPath();
        ctx.arc(10, 0, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = laserType === "ice-cannon" ? "rgba(56, 189, 248, 0.3)" : "rgba(6, 182, 212, 0.15)";
      ctx.beginPath();
      ctx.ellipse(-20, 20, 30, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.ellipse(0, 10, 36, 20, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = laserType === "ice-cannon" ? "#38bdf8" : "#27272a";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = "#e4e4e7";
      ctx.beginPath();
      ctx.rect(14, -8, 6, 16);
      ctx.fill();
      ctx.fillStyle = "#18181b";
      ctx.beginPath();
      ctx.rect(16, -6, 2, 12);
      ctx.fill();

      ctx.fillStyle = "#09090b";
      ctx.beginPath();
      ctx.ellipse(22, -10, 14, 18, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = laserType === "ice-cannon" ? "#38bdf8" : "#f59e0b";
      ctx.beginPath();
      ctx.moveTo(34, -14);
      ctx.lineTo(54, -10);
      ctx.lineTo(34, -6);
      ctx.closePath();
      ctx.fill();

      const eyeColor =
        laserType === "ice-cannon"
          ? "#38bdf8"
          : laserType === "emerald-beam"
          ? "#10b981"
          : laserType === "rainbow-chaos"
          ? "#f43f5e"
          : "#06b6d4";

      ctx.fillStyle = eyeColor;
      ctx.shadowColor = eyeColor;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(30, -12, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(31, -12, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 8. Update & Draw Particles
      particlesRef.current = updateParticles(particlesRef.current, dt);
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = p.shape === "crystal" ? 8 : 4;

        if (p.shape === "crystal") {
          ctx.translate(p.x, p.y);
          if (p.rotation !== undefined) ctx.rotate(p.rotation);
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 9. Update & Draw Floating Texts
      floatingTextsRef.current = updateFloatingTexts(floatingTextsRef.current, dt);
      floatingTextsRef.current.forEach((f) => {
        ctx.save();
        ctx.globalAlpha = Math.max(0, f.alpha);
        ctx.fillStyle = f.color;
        ctx.font = "bold 12px monospace";
        ctx.textAlign = "center";
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 8;
        ctx.fillText(f.text, f.x, f.y);
        ctx.restore();
      });

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameIdRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    isMounted,
    gameState,
    mode,
    laserType,
    gravity,
    screenShakeEnabled,
    spawnTarget,
    fireWeapon,
    playIceShatterSound,
    spawnExplosion,
    addFloatingText,
    addScore,
  ]);

  // Pointer / Mouse / Touch Controls
  const updatePointerAim = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = (canvasRef.current.width || DEFAULT_CANVAS_WIDTH) / (rect.width || 1);
    const scaleY = (canvasRef.current.height || DEFAULT_CANVAS_HEIGHT) / (rect.height || 1);

    const mouseX = (clientX - rect.left) * scaleX;
    const mouseY = (clientY - rect.top) * scaleY;

    aimPosRef.current = { x: mouseX, y: mouseY };

    if (isDraggingLoonRef.current) {
      loonPosRef.current.x = mouseX;
      loonPosRef.current.y = mouseY;
      loonPosRef.current.targetX = mouseX;
      loonPosRef.current.targetY = mouseY;
    } else {
      loonPosRef.current.targetY = Math.max(40, Math.min((canvasRef.current.height || DEFAULT_CANVAS_HEIGHT) - 40, mouseY));
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    updatePointerAim(e.clientX, e.clientY);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    containerRef.current?.focus();

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = (canvasRef.current.width || DEFAULT_CANVAS_WIDTH) / (rect.width || 1);
    const scaleY = (canvasRef.current.height || DEFAULT_CANVAS_HEIGHT) / (rect.height || 1);
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const distToLoon = Math.hypot(mouseX - loonPosRef.current.x, mouseY - loonPosRef.current.y);
    if (mode === "sandbox" && distToLoon < 45) {
      isDraggingLoonRef.current = true;
    } else {
      isFiringRef.current = true;
      fireWeapon();
    }
  };

  const handleCanvasMouseUp = () => {
    isFiringRef.current = false;
    isDraggingLoonRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerAim(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      updatePointerAim(e.touches[0].clientX, e.touches[0].clientY);
      isFiringRef.current = true;
      fireWeapon();
    }
  };

  const handleTouchEnd = () => {
    isFiringRef.current = false;
    isDraggingLoonRef.current = false;
  };

  // Keyboard Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
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
      "1",
      "2",
      "3",
      "4",
      "Enter",
      "Escape",
    ];

    if (interceptKeys.includes(e.key)) {
      e.preventDefault();
    }

    if (e.key === " " || e.key === "Enter") {
      if (gameState === "idle" || gameState === "gameover") {
        startGame();
      } else {
        isFiringRef.current = true;
        fireWeapon();
      }
    } else if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
      loonPosRef.current.targetY = Math.max(40, loonPosRef.current.targetY - 25);
    } else if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
      loonPosRef.current.targetY = Math.min(340, loonPosRef.current.targetY + 25);
    } else if (e.key === "1") {
      setLaserType("cyan-pulse");
    } else if (e.key === "2") {
      setLaserType("emerald-beam");
    } else if (e.key === "3") {
      setLaserType("rainbow-chaos");
    } else if (e.key === "4") {
      setLaserType("ice-cannon");
    } else if (e.key === "Escape") {
      resetGame();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === " " || e.key === "Enter") {
      isFiringRef.current = false;
    }
  };

  if (!isMounted) {
    return (
      <div className="w-full h-[460px] bg-neutral-950 border border-neutral-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center font-mono select-none">
        <div className="text-brand-cyan text-sm font-bold animate-pulse mb-2">
          [INITIALIZING LASER LOON CRYO ENGINE...]
        </div>
        <p className="text-xs text-neutral-500 max-w-sm">
          Compiling WebGL, Canvas physics, and glacial ice block projectile shaders.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center select-none my-6">
      {/* HUD Header Bar & Mode Selector */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-3 px-2">
        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl backdrop-blur-md">
          <button
            onClick={() => {
              setMode("arcade");
              resetGame();
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              mode === "arcade"
                ? "bg-brand-cyan text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            🕹️ Arcade Survival
          </button>
          <button
            onClick={() => {
              setMode("sandbox");
              setGameState("playing");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              mode === "sandbox"
                ? "bg-brand-cyan text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ⚛️ Zero-G Sandbox
          </button>
        </div>

        {/* Laser Weapon Selector with Ice Block Cannon! */}
        <div className="flex items-center gap-1.5 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl backdrop-blur-md">
          <button
            onClick={() => setLaserType("ice-cannon")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
              laserType === "ice-cannon"
                ? "bg-sky-500/20 text-sky-400 border border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.3)]"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            <IconSnowflake className="w-3.5 h-3.5" />
            Ice Cannon (4)
          </button>
          <button
            onClick={() => setLaserType("cyan-pulse")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
              laserType === "cyan-pulse"
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            Pulse (1)
          </button>
          <button
            onClick={() => setLaserType("emerald-beam")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
              laserType === "emerald-beam"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            Plasma (2)
          </button>
          <button
            onClick={() => setLaserType("rainbow-chaos")}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
              laserType === "rainbow-chaos"
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/40"
                : "text-neutral-400 hover:text-white border border-transparent"
            }`}
          >
            Chaos (3)
          </button>
        </div>

        {/* Score Indicators & Field Manual */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <FieldManualButton manualId="laser-loon" label="Manual" />

          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300">
            <IconTrophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] text-neutral-500">HI:</span>
            <span className="font-bold text-amber-400">{effectiveHighScore}</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-300">
            <span className="text-[10px] text-neutral-500">SCORE:</span>
            <span className="font-bold text-brand-cyan">{score}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Game Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        data-keyboard-boundary="true"
        className={`relative w-full max-w-3xl h-[420px] bg-neutral-950 border rounded-3xl overflow-hidden outline-none transition-all duration-300 shadow-2xl flex flex-col justify-between ${
          isFocused
            ? "border-sky-400 ring-4 ring-sky-400/20 shadow-[0_0_40px_rgba(56,189,248,0.25)]"
            : "border-neutral-800 hover:border-neutral-700"
        }`}
      >
        {/* Top Floating HUD */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center pointer-events-none">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md pointer-events-auto ${
                isFocused
                  ? "bg-sky-500/10 text-sky-400 border-sky-500/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                  : "bg-neutral-900/80 text-neutral-500 border-neutral-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFocused ? "bg-sky-400 animate-ping" : "bg-neutral-600"
                }`}
              />
              {isFocused ? "Loon Controls: ACTIVE" : "Click to Aim & Shoot Ice Blocks"}
            </span>

            {combo > 1 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                <IconFlame className="w-3 h-3 text-amber-400" />
                {combo}x Combo ({multiplier}x pts)
              </span>
            )}
          </div>

          {mode === "arcade" && gameState === "playing" && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-800 font-mono text-xs font-bold text-neutral-200">
              <span>TIME:</span>
              <span className={timeLeft <= 10 ? "text-rose-400 animate-ping font-extrabold" : "text-sky-400"}>
                {timeLeft}s
              </span>
            </div>
          )}
        </div>

        {/* Game Canvas */}
        <canvas
          ref={canvasRef}
          width={768}
          height={420}
          onMouseMove={handleCanvasMouseMove}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={handleCanvasMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* Start Overlay Screen */}
        {gameState === "idle" && mode === "arcade" && (
          <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 select-none">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4 text-sky-400 shadow-[0_0_30px_rgba(56,189,248,0.3)] animate-pulse">
              <IconSnowflake className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-100 font-mono tracking-tight mb-2">
              LASER LOON: CRYO ICE HUNTER
            </h3>
            <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
              Vaporize bugs, memory leaks, and runtime exceptions by shooting <span className="text-sky-400 font-bold">blocks of ice 🧊</span> and laser beams. Ice blocks smash into shards and freeze enemies solid!
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startGame();
                  containerRef.current?.focus();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-400 hover:bg-sky-300 text-neutral-950 font-mono font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <IconPlayerPlay className="w-4 h-4 fill-current" />
                <span>LAUNCH CRYO HUNT [SPACE]</span>
              </button>

              <FieldManualButton manualId="laser-loon" label="Field Manual" />
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-6 text-[10px] font-mono text-neutral-500">
              <span>MOUSE / WASD: AIM & FLY</span>
              <span>CLICK / SPACE: SHOOT ICE BLOCKS</span>
              <span>KEYS 1-4: SWITCH BEAMS / ICE</span>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === "gameover" && mode === "arcade" && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md z-30 flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-3 text-sky-400 animate-bounce">
              <IconTrophy className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-bold text-sky-400 font-mono tracking-tight mb-1">
              GLACIAL PURGE COMPLETE!
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Exceptions frozen and shattered into crystalline dust by Laser Loon.
            </p>
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 mb-6 min-w-[240px]">
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Final Score</span>
                <span className="text-xl font-mono font-bold text-sky-400">{score}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono text-neutral-500 uppercase block">Max Combo</span>
                <span className="text-xl font-mono font-bold text-amber-400">{combo}x</span>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                startGame();
                containerRef.current?.focus();
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-sky-400 hover:bg-sky-300 text-neutral-950 font-mono font-bold text-sm rounded-xl shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
            >
              <IconRefresh className="w-4 h-4" />
              PLAY AGAIN [SPACE]
            </button>
          </div>
        )}

        {/* Sandbox Controls Bar */}
        {mode === "sandbox" && (
          <div className="absolute bottom-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 p-2 bg-neutral-900/80 border border-neutral-800 rounded-2xl backdrop-blur-md pointer-events-auto">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-400">GRAVITY:</span>
              <button
                onClick={() => setGravity(0)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                  gravity === 0 ? "bg-sky-400 text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                Zero-G
              </button>
              <button
                onClick={() => setGravity(0.15)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                  gravity === 0.15 ? "bg-sky-400 text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                Earth
              </button>
              <button
                onClick={() => setGravity(-0.15)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                  gravity === -0.15 ? "bg-sky-400 text-black" : "bg-neutral-800 text-neutral-400"
                }`}
              >
                Inverted
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const loon = loonPosRef.current;
                  launchIceBlock(loon.x + 48, loon.y - 8, aimPosRef.current.x, aimPosRef.current.y);
                }}
                className="px-3 py-1 bg-sky-950 hover:bg-sky-900 text-sky-300 text-[10px] font-mono font-bold rounded-lg border border-sky-800/60 cursor-pointer"
              >
                🧊 Launch Ice Block
              </button>
              <button
                onClick={() => {
                  if (canvasRef.current) {
                    spawnTarget(canvasRef.current.width, canvasRef.current.height);
                  }
                }}
                className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-brand-cyan text-[10px] font-mono font-bold rounded-lg border border-neutral-700 cursor-pointer"
              >
                + Spawn Test Bug
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Touch Controls Bar */}
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-2 p-3 mt-3 rounded-2xl bg-neutral-950/80 border border-neutral-800 lg:hidden">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setLaserType("ice-cannon")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              laserType === "ice-cannon"
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/50 shadow-[0_0_10px_rgba(56,189,248,0.2)]"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            🧊 Ice Cannon
          </button>
          <button
            type="button"
            onClick={() => setLaserType("cyan-pulse")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              laserType === "cyan-pulse"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            ⚡ Pulse
          </button>
          <button
            type="button"
            onClick={() => setLaserType("emerald-beam")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              laserType === "emerald-beam"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            🟢 Plasma
          </button>
          <button
            type="button"
            onClick={() => setLaserType("rainbow-chaos")}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              laserType === "rainbow-chaos"
                ? "bg-pink-500/20 text-pink-300 border border-pink-500/50 shadow-[0_0_10px_rgba(244,114,182,0.2)]"
                : "bg-neutral-900 text-neutral-400 border border-neutral-800"
            }`}
          >
            🌈 Chaos
          </button>
        </div>

        <div className="flex items-center gap-2">
          {gameState !== "playing" ? (
            <button
              type="button"
              onClick={() => {
                startGame();
                containerRef.current?.focus();
              }}
              className="px-4 py-2 rounded-xl bg-sky-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md active:scale-95"
            >
              <IconPlayerPlay className="w-3.5 h-3.5 fill-current" />
              START GAME
            </button>
          ) : (
            <button
              type="button"
              onTouchStart={() => {
                isFiringRef.current = true;
                fireWeapon();
              }}
              onTouchEnd={() => {
                isFiringRef.current = false;
              }}
              onMouseDown={() => {
                isFiringRef.current = true;
                fireWeapon();
              }}
              onMouseUp={() => {
                isFiringRef.current = false;
              }}
              className="px-6 py-2.5 rounded-xl bg-sky-400 text-black font-mono font-extrabold text-sm active:bg-sky-300 active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)]"
            >
              🔥 FIRE
            </button>
          )}
        </div>
      </div>

      {/* Footer Instructions */}
      <div className="w-full max-w-3xl flex justify-between items-center px-4 mt-2 text-[10px] font-mono text-neutral-500">
        <span>Controls: Click / Tap / Space to Shoot Ice Blocks · Touch buttons to switch weapon</span>
        <button
          onClick={() => setScreenShakeEnabled((prev) => !prev)}
          className="hover:text-neutral-300 transition-colors cursor-pointer"
        >
          Screen Shake: {screenShakeEnabled ? "ON" : "OFF"}
        </button>
      </div>
    </div>
  );
};
