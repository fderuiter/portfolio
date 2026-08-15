"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore, useCallback, useMemo } from "react";
import Link from "next/link";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconPlayerPlay,
  IconPlayerPause,
  IconTrophy,
  IconFileText,
  IconShieldCheck,
  IconFlame,
  IconArrowsShuffle,
  IconExternalLink,
  IconVolume,
  IconVolumeOff,
  IconClock,
  IconLock,
  IconInfoCircle,
} from "@tabler/icons-react";

import {
  CDISCDomain,
  ClinicalObservation,
  ClinicalSubject,
  AuditorState,
  ProtocolAmendment,
  AuditLogEntry,
  GamePhase,
  GameMode,
  PlayState,
  GameScoreState,
  SignatureModalState,
  SignatureReason,
  StationConfig,
} from "@/lib/clinical-trial-chaos/types";

import {
  createInitialScoreState,
  createInitialAuditorState,
  createAuditLogEntry,
  fixObservation,
  isSubjectFullyCompliant,
  calculateSubmissionPoints,
  tickSubjectTimers,
  tickAuditor,
  scrambleStations,
  verify21CFRSubmission,
  triggerRandomAmendment,
} from "@/lib/clinical-trial-chaos/engine";

import {
  INITIAL_STATIONS,
  SEEDED_SCENARIOS,
  generateClinicalSubject,
} from "@/lib/clinical-trial-chaos/scenarios";

import {
  playValidationSound,
  playSignatureVerifiedSound,
  playAuditErrorBuzz,
  playAmendmentSirenSound,
  playForm483AlarmSound,
} from "@/lib/clinical-trial-chaos/sound-effects";

const emptySubscribe = () => () => {};

const subscribeHighScore = (callback: () => void) => {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
};
const getHighScoreSnapshot = () => {
  try {
    return localStorage.getItem("clinical_chaos_highscore") || "0";
  } catch {
    return "0";
  }
};
const getHighScoreServerSnapshot = () => "0";

export const ClinicalTrialChaos: React.FC = () => {
  const isMounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const rawHighScore = useSyncExternalStore(
    subscribeHighScore,
    getHighScoreSnapshot,
    getHighScoreServerSnapshot
  );
  const loadedHighScore = parseInt(rawHighScore, 10) || 0;
  const { playSuccess, muted: globalMuted } = useAudio();
  const { recordEvent } = useTelemetry();

  // Game configuration & mode
  const [gameMode, setGameMode] = useState<GameMode>("campaign");
  const [phase, setPhase] = useState<GamePhase>(1);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Entities & Engine state
  const [scoreState, setScoreState] = useState<GameScoreState>(createInitialScoreState);
  const effectiveHighScore = Math.max(scoreState.highScore, loadedHighScore);
  const [auditor, setAuditor] = useState<AuditorState>(createInitialAuditorState);
  const [stations, setStations] = useState<StationConfig[]>(INITIAL_STATIONS);
  const [conveyorSubjects, setConveyorSubjects] = useState<ClinicalSubject[]>([]);
  const [activeAmendment, setActiveAmendment] = useState<ProtocolAmendment | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Selection & Modal States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [validatingObs, setValidatingObs] = useState<{ subjectId: string; obs: ClinicalObservation } | null>(null);
  const [signatureModal, setSignatureModal] = useState<SignatureModalState>({
    isOpen: false,
    subject: null,
    selectedReason: "Intent to Submit",
    passwordInput: "••••••••",
    requiresReason: true,
  });
  const [targetRoutingStation, setTargetRoutingStation] = useState<CDISCDomain>("DM");

  // DOM & Canvas references
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const amendmentTimerRef = useRef<number>(0);
  const terminalBottomRef = useRef<HTMLDivElement>(null);

  // 2. Logging helper
  const addAuditLog = useCallback(
    (message: string, level: "INFO" | "WARN" | "CRITICAL" | "COMPLIANT" = "INFO", suspicionDelta = 0) => {
      const entry = createAuditLogEntry(message, level, suspicionDelta);
      setAuditLogs((prev) => [...prev.slice(-40), entry]);
    },
    []
  );

  // 3. Sound trigger wrapper
  const triggerSound = useCallback(
    (type: "validate" | "sign" | "error" | "amendment" | "alarm") => {
      if (!soundEnabled || globalMuted) return;
      if (type === "validate") playValidationSound();
      else if (type === "sign") playSignatureVerifiedSound();
      else if (type === "error") playAuditErrorBuzz();
      else if (type === "amendment") playAmendmentSirenSound();
      else if (type === "alarm") playForm483AlarmSound();
    },
    [soundEnabled, globalMuted]
  );

  // 4. Start / Restart game
  const startGame = useCallback(
    (mode: GameMode = "campaign", targetPhase: GamePhase = 1) => {
      setGameMode(mode);
      setPhase(targetPhase);
      setPlayState("playing");
      setAuditor(createInitialAuditorState());
      setStations(INITIAL_STATIONS);
      setActiveAmendment(null);
      setSelectedSubjectId(null);
      setValidatingObs(null);
      setSignatureModal({
        isOpen: false,
        subject: null,
        selectedReason: "Intent to Submit",
        passwordInput: "••••••••",
        requiresReason: true,
      });

      // Initial subjects: Seeded for Phase 1, random for others
      const initialSubs =
        targetPhase === 1 && mode === "campaign"
          ? JSON.parse(JSON.stringify(SEEDED_SCENARIOS))
          : [
              generateClinicalSubject(0.4, false, 100),
              generateClinicalSubject(0.6, false, 101),
              generateClinicalSubject(0.7, targetPhase >= 2, 102),
            ];

      setConveyorSubjects(initialSubs);
      setSelectedSubjectId(initialSubs[0]?.id ?? null);
      setScoreState({
        ...createInitialScoreState(),
        highScore: effectiveHighScore,
      });

      addAuditLog(
        `[SYSTEM INITIALIZED] Study Protocol ${targetPhase === 1 ? "PHASE-I (Healthy Cohort)" : targetPhase === 2 ? "PHASE-II (Dose Escalation)" : "PHASE-III (Global Multi-Center)"} online. Auditor dispatched to floor.`,
        "INFO"
      );

      recordEvent("clinical_trial_chaos", "project_click").catch(() => {});
    },
    [addAuditLog, recordEvent, effectiveHighScore]
  );

  // 5. Active Subject
  const activeSubject = useMemo(() => {
    return conveyorSubjects.find((s) => s.id === selectedSubjectId) || conveyorSubjects[0] || null;
  }, [conveyorSubjects, selectedSubjectId]);

  // 6. Validation Fix Action
  const handleFixObservation = useCallback(
    (subjectId: string, obsId: string) => {
      setConveyorSubjects((prev) =>
        prev.map((sub) => {
          if (sub.id !== subjectId) return sub;
          const updatedObs = sub.observations.map((obs) => {
            if (obs.id !== obsId) return obs;
            const { observation: fixed } = fixObservation(obs);
            return fixed;
          });
          return { ...sub, observations: updatedObs };
        })
      );

      setScoreState((prev) => ({
        ...prev,
        correctionsMade: prev.correctionsMade + 1,
        score: prev.score + 50,
      }));

      triggerSound("validate");
      addAuditLog(`Observation verified & standardized: ${obsId} [21 CFR § 11.10(a) Validation Check Passed]`, "COMPLIANT");
      setValidatingObs(null);
    },
    [addAuditLog, triggerSound]
  );

  // 7. Open Signature Modal for Submit
  const handleInitiateSubmission = useCallback(
    (domain: CDISCDomain) => {
      if (!activeSubject) return;
      setTargetRoutingStation(domain);
      setSignatureModal({
        isOpen: true,
        subject: activeSubject,
        selectedReason: activeSubject.isSAE ? "Urgent Safety Expedited" : "Intent to Submit",
        passwordInput: "••••••••",
        requiresReason: true,
      });
    },
    [activeSubject]
  );

  // 8. Confirm 21 CFR Electronic Signature
  const handleConfirmSignature = useCallback(() => {
    if (!signatureModal.subject) return;
    const subj = signatureModal.subject;
    const reason = signatureModal.selectedReason;
    const domain = targetRoutingStation;

    const result = verify21CFRSubmission(subj, reason, domain);

    if (result.success) {
      triggerSound("sign");
      addAuditLog(result.logMessage, "COMPLIANT", result.suspicionDelta);

      // Points & Combo calculation
      const points = calculateSubmissionPoints(subj, scoreState.multiplier, true);
      const nextCombo = scoreState.combo + 1;
      const nextMultiplier = Math.min(4, 1 + Math.floor(nextCombo / 3));

      setScoreState((prev) => {
        const newScore = prev.score + points;
        const newHighScore = Math.max(newScore, prev.highScore);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem("clinical_chaos_highscore", newHighScore.toString());
          } catch {}
        }
        return {
          ...prev,
          score: newScore,
          highScore: newHighScore,
          combo: nextCombo,
          maxCombo: Math.max(prev.maxCombo, nextCombo),
          multiplier: nextMultiplier,
          subjectsSubmitted: prev.subjectsSubmitted + 1,
          cleanSubmissions: prev.cleanSubmissions + 1,
        };
      });

      // Cool down auditor suspicion
      setAuditor((prev) => ({
        ...prev,
        suspicion: Math.max(0, prev.suspicion + result.suspicionDelta),
      }));

      // Update station stats
      setStations((prev) =>
        prev.map((s) => (s.id === domain ? { ...s, processedCount: s.processedCount + 1 } : s))
      );

      // Remove from conveyor
      setConveyorSubjects((prev) => prev.filter((s) => s.id !== subj.id));
      setSelectedSubjectId(null);
      setSignatureModal((prev) => ({ ...prev, isOpen: false, subject: null }));

      // Phase completion check in Campaign mode
      if (gameMode === "campaign") {
        if (scoreState.subjectsSubmitted + 1 >= (phase === 1 ? 5 : phase === 2 ? 8 : 12)) {
          if (phase < 3) {
            setPlayState("phase_cleared");
            playSuccess();
          } else {
            setPlayState("phase_cleared");
            playSuccess();
          }
        }
      }
    } else {
      triggerSound("error");
      addAuditLog(result.logMessage, result.level, result.suspicionDelta);

      setScoreState((prev) => ({
        ...prev,
        combo: 0,
        multiplier: 1,
        auditViolations: prev.auditViolations + 1,
      }));

      setAuditor((prev) => {
        const nextSusp = Math.min(100, prev.suspicion + result.suspicionDelta);
        return {
          ...prev,
          suspicion: nextSusp,
          behavior: nextSusp >= 100 ? "issuing_483" : "suspicious",
        };
      });

      setSignatureModal((prev) => ({ ...prev, isOpen: false, subject: null }));
    }
  }, [
    signatureModal,
    targetRoutingStation,
    scoreState,
    gameMode,
    phase,
    triggerSound,
    addAuditLog,
    playSuccess,
  ]);

  // 9. Canvas 2D Renderer
  const renderConveyorCanvas = useCallback((
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    auditorState: AuditorState,
    subjects: ClinicalSubject[]
  ) => {
    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.fillStyle = "#09090b";
    ctx.fillRect(0, 0, width, height);

    // Conveyor Belt Track
    const beltY = height * 0.42;
    const beltHeight = 44;
    ctx.fillStyle = "#18181b";
    ctx.fillRect(20, beltY, width - 40, beltHeight);

    // Conveyor Rollers
    ctx.fillStyle = "#27272a";
    const rollerCount = 24;
    const timeOffset = (Date.now() / 40) % 20;
    for (let i = 0; i < rollerCount; i++) {
      const rx = 24 + i * ((width - 48) / rollerCount) + timeOffset;
      if (rx < width - 24) {
        ctx.fillRect(rx, beltY + 4, 3, beltHeight - 8);
      }
    }

    // Belt borders
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 2;
    ctx.strokeRect(20, beltY, width - 40, beltHeight);

    // Conveyor subjects parcels
    const slotWidth = (width - 60) / 5;
    subjects.forEach((subj, idx) => {
      const px = 30 + idx * slotWidth;
      const py = beltY - 26;

      // Parcel Box
      const isSelected = subj.id === selectedSubjectId;
      ctx.fillStyle = subj.isSAE ? "#7f1d1d" : isSelected ? "#1e3a8a" : "#1f2937";
      ctx.strokeStyle = subj.isSAE ? "#ef4444" : isSelected ? "#38bdf8" : "#4b5563";
      ctx.lineWidth = isSelected ? 2 : 1;
      ctx.fillRect(px, py, slotWidth - 10, 52);
      ctx.strokeRect(px, py, slotWidth - 10, 52);

      // Label & Timer Bar
      ctx.fillStyle = "#f3f4f6";
      ctx.font = "bold 10px monospace";
      ctx.fillText(subj.subjectLabel, px + 6, py + 16);

      // Status pip
      const allClean = isSubjectFullyCompliant(subj);
      ctx.fillStyle = allClean ? "#10b981" : "#f59e0b";
      ctx.beginPath();
      ctx.arc(px + slotWidth - 20, py + 12, 4, 0, Math.PI * 2);
      ctx.fill();

      // Mini timer bar
      const timePercent = Math.max(0, subj.timeRemaining / subj.maxTime);
      ctx.fillStyle = "#374151";
      ctx.fillRect(px + 6, py + 38, slotWidth - 22, 5);
      ctx.fillStyle = timePercent < 0.3 ? "#ef4444" : timePercent < 0.6 ? "#f59e0b" : "#3b82f6";
      ctx.fillRect(px + 6, py + 38, (slotWidth - 22) * timePercent, 5);
    });

    // Auditor Sprite on Top Patrol Floor
    const auditorX = 40 + auditorState.x * (width - 80);
    const auditorY = height * 0.16;

    // Suspicion Aura
    const suspRatio = auditorState.suspicion / 100;
    if (suspRatio > 0.3) {
      const grad = ctx.createRadialGradient(auditorX, auditorY, 5, auditorX, auditorY, 35);
      grad.addColorStop(0, `rgba(239, 68, 68, ${suspRatio * 0.4})`);
      grad.addColorStop(1, "rgba(239, 68, 68, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(auditorX, auditorY, 35, 0, Math.PI * 2);
      ctx.fill();
    }

    // Auditor Body
    ctx.fillStyle = auditorState.behavior === "issuing_483" ? "#dc2626" : auditorState.behavior === "suspicious" ? "#ea580c" : "#0284c7";
    ctx.fillRect(auditorX - 10, auditorY - 14, 20, 28);

    // Auditor Clipboard & Badge
    ctx.fillStyle = "#fef08a";
    ctx.fillRect(auditorX + (auditorState.direction > 0 ? 4 : -12), auditorY - 6, 8, 12);

    // Auditor Head
    ctx.fillStyle = "#fed7aa";
    ctx.beginPath();
    ctx.arc(auditorX, auditorY - 18, 7, 0, Math.PI * 2);
    ctx.fill();

    // Auditor Hat / Glasses
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(auditorX - 8, auditorY - 26, 16, 4);
    ctx.fillRect(auditorX - 5, auditorY - 30, 10, 5);

    // Auditor Name Tag
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FDA AUDITOR", auditorX, auditorY - 34);
    ctx.textAlign = "left";
  }, [selectedSubjectId]);

  // 10. Main Game Loop Tick (requestAnimationFrame)
  useEffect(() => {
    if (playState !== "playing") return;

    let isRunning = true;

    const gameLoop = () => {
      if (!isRunning) return;

      const now = Date.now();
      const deltaSeconds = Math.min(0.1, (now - lastTickTimeRef.current) / 1000);
      lastTickTimeRef.current = now;

      // 1. Tick subjects on conveyor
      setConveyorSubjects((prev) => {
        const { updatedSubjects, expiredSubjects } = tickSubjectTimers(prev, deltaSeconds);

        if (expiredSubjects.length > 0) {
          expiredSubjects.forEach((exp) => {
            triggerSound("error");
            addAuditLog(
              `[AUDIT TIMEOUT] Subject ${exp.subjectLabel} expired unverified on conveyor! Auditor suspicion +20%`,
              "CRITICAL",
              20
            );
          });

          setAuditor((aud) => {
            const nextSusp = Math.min(100, aud.suspicion + expiredSubjects.length * 20);
            return {
              ...aud,
              suspicion: nextSusp,
              behavior: nextSusp >= 100 ? "issuing_483" : "suspicious",
            };
          });

          setScoreState((sc) => ({ ...sc, combo: 0, multiplier: 1, auditViolations: sc.auditViolations + expiredSubjects.length }));
        }

        return updatedSubjects;
      });

      // 2. Tick Auditor AI
      setAuditor((prev) => {
        const updatedAuditor = tickAuditor(prev, deltaSeconds, conveyorSubjects.length);
        if (updatedAuditor.suspicion >= 100 && playState === "playing") {
          triggerSound("alarm");
          setPlayState("game_over");
          addAuditLog(
            `[FDA NOTICE OF STUDY TERMINATION] 21 CFR Part 11 Audit Suspicion reached 100%. Form 483 Issued.`,
            "CRITICAL"
          );
        }
        return updatedAuditor;
      });

      // 3. Tick Protocol Amendment countdown
      setActiveAmendment((prev) => {
        if (!prev || !prev.active) return null;
        const remaining = prev.timeRemaining - deltaSeconds;
        if (remaining <= 0) {
          addAuditLog(`Protocol Amendment ${prev.version} expired. Normal operations resumed.`, "INFO");
          return null;
        }
        return { ...prev, timeRemaining: remaining };
      });

      // 4. Random Protocol Amendment triggers
      amendmentTimerRef.current += deltaSeconds;
      const amendmentInterval = phase === 1 ? 45 : phase === 2 ? 30 : 22;
      if (amendmentTimerRef.current > amendmentInterval) {
        amendmentTimerRef.current = 0;
        const newAmendment = triggerRandomAmendment();
        setActiveAmendment(newAmendment);
        triggerSound("amendment");
        addAuditLog(`[PROTOCOL AMENDMENT ALERT] ${newAmendment.version}: ${newAmendment.title}!`, "WARN");

        if (newAmendment.type === "station-scramble") {
          setStations((st) => scrambleStations(st));
        } else if (newAmendment.type === "sae-priority-rush") {
          const saeSubj = generateClinicalSubject(0.7, true);
          setConveyorSubjects((cs) => [saeSubj, ...cs]);
        }
      }

      // 5. Spawning new subjects
      spawnTimerRef.current += deltaSeconds;
      const spawnInterval = phase === 1 ? 7.0 : phase === 2 ? 5.0 : 3.8;
      if (spawnTimerRef.current > spawnInterval && conveyorSubjects.length < 5) {
        spawnTimerRef.current = 0;
        const errorChance = phase === 1 ? 0.45 : phase === 2 ? 0.65 : 0.8;
        const isSAE = Math.random() < (phase === 1 ? 0.1 : 0.3);
        const newSub = generateClinicalSubject(errorChance, isSAE);
        setConveyorSubjects((prev) => [...prev, newSub]);
        if (!selectedSubjectId) {
          setSelectedSubjectId(newSub.id);
        }
      }

      // 6. Render Canvas Animation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderConveyorCanvas(ctx, canvas.width, canvas.height, auditor, conveyorSubjects);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    lastTickTimeRef.current = Date.now();
    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    playState,
    phase,
    conveyorSubjects,
    selectedSubjectId,
    auditor,
    addAuditLog,
    triggerSound,
    renderConveyorCanvas,
  ]);

  // 11. Keyboard Boundary and Hotkeys
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key;

    // Intercept keys
    if (["1", "2", "3", "4", " ", "Escape", "Enter"].includes(key)) {
      e.preventDefault();
    }

    if (playState !== "playing") {
      if (key === " " || key === "Enter") {
        startGame(gameMode, phase);
      }
      return;
    }

    if (signatureModal.isOpen) {
      if (key === "Escape") {
        setSignatureModal((prev) => ({ ...prev, isOpen: false }));
      } else if (key === "Enter") {
        handleConfirmSignature();
      }
      return;
    }

    // Number keys 1-4 trigger station routing
    if (key === "1") handleInitiateSubmission("DM");
    else if (key === "2") handleInitiateSubmission("VS");
    else if (key === "3") handleInitiateSubmission("AE");
    else if (key === "4") handleInitiateSubmission("LB");
  };

  // Auto-scroll terminal log safely
  useEffect(() => {
    if (typeof terminalBottomRef.current?.scrollIntoView === "function") {
      terminalBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [auditLogs]);

  // SSR check
  if (!isMounted) {
    return (
      <section
        aria-labelledby="clinical-chaos-heading"
        className="rounded-2xl border border-brand-blue/25 bg-zinc-950/80 p-5 shadow-[0_0_30px_-12px_rgba(59,130,246,0.35)]"
      >
        <h2 id="clinical-chaos-heading" className="text-xl font-bold font-mono text-zinc-100">
          INITIALIZING CLINICAL TRIAL CHAOS ARCADE...
        </h2>
      </section>
    );
  }

  const sortedStations = [...stations].sort((a, b) => a.positionIndex - b.positionIndex);

  return (
    <div
      ref={containerRef}
      data-keyboard-boundary="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="relative w-full rounded-2xl border border-blue-500/30 bg-zinc-950 p-4 md:p-6 shadow-2xl font-mono focus:outline-none focus:ring-1 focus:ring-brand-cyan transition-all"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-cyan">
              21 CFR Part 11 Compliance Arcade · Zero PHI
            </p>
          </div>
          <h2 id="clinical-chaos-heading" className="mt-1 text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Clinical Trial Chaos
          </h2>
        </div>

        {/* Score & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs">
            <IconTrophy className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Score: </span>
              <span className="font-bold text-white">{scoreState.score}</span>
              <span className="text-[10px] text-zinc-500 ml-2">(High: {effectiveHighScore})</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs">
            <IconFlame className={`h-4 w-4 ${scoreState.combo > 2 ? "text-rose-500 animate-bounce" : "text-zinc-500"}`} />
            <span className="text-zinc-400 text-[10px]">COMBO:</span>
            <span className="font-bold text-brand-cyan">{scoreState.combo}x</span>
            <span className="text-[10px] text-amber-400 ml-1">({scoreState.multiplier}x Multiplier)</span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            title={soundEnabled ? "Mute Arcade SFX" : "Unmute Arcade SFX"}
          >
            {soundEnabled ? <IconVolume className="h-4 w-4 text-brand-cyan" /> : <IconVolumeOff className="h-4 w-4 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Auditor Pressure Gauge & Mode Selector */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Auditor Gauge */}
        <div className="md:col-span-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <IconShieldCheck className={`h-4 w-4 ${auditor.suspicion > 60 ? "text-rose-500" : "text-blue-400"}`} />
              <span className="font-bold text-zinc-300">FDA AUDITOR SCRUTINY:</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  auditor.behavior === "issuing_483"
                    ? "bg-rose-600 text-white animate-pulse"
                    : auditor.behavior === "suspicious"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {auditor.behavior}
              </span>
            </div>
            <span
              className={`font-mono font-bold ${
                auditor.suspicion > 75 ? "text-rose-400 animate-pulse" : auditor.suspicion > 40 ? "text-amber-300" : "text-emerald-400"
              }`}
            >
              {Math.round(auditor.suspicion)}% SUSPICION
            </span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${
                auditor.suspicion > 75
                  ? "bg-gradient-to-r from-amber-500 to-rose-600"
                  : auditor.suspicion > 40
                  ? "bg-gradient-to-r from-blue-500 to-amber-500"
                  : "bg-gradient-to-r from-teal-500 to-emerald-500"
              }`}
              style={{ width: `${Math.min(100, auditor.suspicion)}%` }}
            />
            {/* 100% threshold marker */}
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500" title="Form 483 Threshold (100%)" />
          </div>
        </div>

        {/* Phase / Mode Badge */}
        <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-2">
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 uppercase">MODE: {gameMode.toUpperCase()}</p>
            <p className="text-xs font-bold text-zinc-300">
              {gameMode === "campaign" ? `PHASE ${phase} OF 3` : "ENDLESS SPRINT"}
            </p>
          </div>
          {playState === "playing" ? (
            <button
              onClick={() => setPlayState("paused")}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 transition"
            >
              <IconPlayerPause className="h-3.5 w-3.5" /> Pause
            </button>
          ) : (
            <button
              onClick={() => startGame(gameMode, phase)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-cyan/50 bg-brand-cyan/20 text-xs font-bold text-cyan-300 hover:bg-brand-cyan/30 transition shadow-[0_0_15px_-3px_rgba(6,182,212,0.4)]"
            >
              <IconPlayerPlay className="h-3.5 w-3.5" /> {playState === "paused" ? "Resume" : "Start Shift"}
            </button>
          )}
        </div>
      </div>

      {/* Active Protocol Amendment Warning Banner */}
      {activeAmendment && activeAmendment.active && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-amber-200 animate-pulse">
          <div className="flex items-center gap-2">
            <IconArrowsShuffle className="h-5 w-5 text-amber-400" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                PROTOCOL AMENDMENT: {activeAmendment.title}
              </span>
              <p className="text-[11px] text-amber-200/80">{activeAmendment.description}</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-300">
            {Math.ceil(activeAmendment.timeRemaining)}s
          </span>
        </div>
      )}

      {/* HTML5 Canvas Conveyor Simulation */}
      <div className="mt-4 relative rounded-xl border border-zinc-800 bg-black overflow-hidden">
        <canvas ref={canvasRef} width={760} height={200} className="w-full h-[180px] block" />

        {/* Overlay Overlay for Idle / Paused / Game Over / Phase Cleared */}
        {playState !== "playing" && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            {playState === "game_over" ? (
              <div className="max-w-md w-full border border-rose-500/40 bg-zinc-950 p-5 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-rose-400 font-bold mb-2">
                  <IconAlertTriangle className="h-6 w-6 text-rose-500 animate-bounce" />
                  <span className="text-lg">FDA FORM 483 WARNING LETTER</span>
                </div>
                <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                  The clinical trial has been terminated under 21 CFR § 312.44. Multiple unverified CRFs and audit violations reached critical threshold.
                </p>
                <div className="grid grid-cols-3 gap-2 bg-zinc-900/80 p-3 rounded-lg text-xs font-mono mb-4 text-left">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">FINAL SCORE</span>
                    <span className="font-bold text-white">{scoreState.score}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">SUBMITTED</span>
                    <span className="font-bold text-emerald-400">{scoreState.subjectsSubmitted} CRFs</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">VIOLATIONS</span>
                    <span className="font-bold text-rose-400">{scoreState.auditViolations}</span>
                  </div>
                </div>
                <button
                  onClick={() => startGame("campaign", 1)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg"
                >
                  <IconRefresh className="h-4 w-4" /> Re-open Trial & Restart Phase I
                </button>
              </div>
            ) : playState === "phase_cleared" ? (
              <div className="max-w-md w-full border border-emerald-500/40 bg-zinc-950 p-5 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-2">
                  <IconShieldCheck className="h-6 w-6 text-emerald-400" />
                  <span className="text-lg">
                    {phase < 3 ? `PHASE ${phase} COMPLIANCE AUDIT PASSED!` : "STUDY PROTOCOL SUCCESSFULLY SUBMITTED!"}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mb-4">
                  {phase < 3
                    ? `Excellent work, Data Manager. The FDA auditor confirmed 100% CDISC mapping integrity. Ready for Phase ${phase + 1}?`
                    : "Full 21 CFR Part 11 data lock completed with zero major findings. Trial approved for NDA submission."}
                </p>
                <button
                  onClick={() => startGame("campaign", (phase < 3 ? phase + 1 : 1) as GamePhase)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition"
                >
                  {phase < 3 ? `Advance to Phase ${phase + 1}` : "Play Victory Lap / Re-run"}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-base font-bold text-zinc-100 mb-2">Ready to manage clinical data under FDA audit pressure?</p>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
                  Review raw subject data badges, fix typos in the Validation Drawer, route to CDISC stations (DM/VS/AE/LB), and sign with 21 CFR Part 11 lock.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => startGame("campaign", 1)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 transition shadow-[0_0_20px_-3px_rgba(6,182,212,0.5)]"
                  >
                    <IconPlayerPlay className="h-4 w-4" /> Start 3-Phase Campaign
                  </button>
                  <button
                    onClick={() => startGame("endless", 1)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-900 text-zinc-200 font-bold text-xs uppercase tracking-wider hover:bg-zinc-800 transition"
                  >
                    Endless Sprint Mode
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Active Subject CRF Inspection & Validation Drawer */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Subject Card */}
        <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                ACTIVE SUBJECT DOSSIER
              </span>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {activeSubject ? activeSubject.subjectLabel : "NO SUBJECT SELECTED"}
                {activeSubject?.isSAE && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    SAE URGENT
                  </span>
                )}
              </h3>
            </div>
            {activeSubject && (
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 block">{activeSubject.studySite}</span>
                <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                  <IconClock className="h-3.5 w-3.5" /> {Math.ceil(activeSubject.timeRemaining)}s remaining
                </span>
              </div>
            )}
          </div>

          {/* Observations Grid */}
          {activeSubject ? (
            <div className="grid gap-2 sm:grid-cols-2">
              {activeSubject.observations.map((obs) => (
                <div
                  key={obs.id}
                  onClick={() => setValidatingObs({ subjectId: activeSubject.id, obs })}
                  className={`cursor-pointer rounded-lg border p-3 transition ${
                    !obs.isResolved
                      ? "border-amber-500/40 bg-amber-500/5 hover:border-amber-500 hover:bg-amber-500/10 shadow-[0_0_15px_-4px_rgba(245,158,11,0.2)]"
                      : "border-zinc-800 bg-zinc-950/70 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-300">{obs.field}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        obs.destination === "DM"
                          ? "bg-blue-500/20 text-blue-400"
                          : obs.destination === "VS"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : obs.destination === "AE"
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {obs.destination}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <p className={`text-sm font-bold ${!obs.isResolved ? "text-amber-300" : "text-zinc-100"}`}>
                      {obs.currentValue}
                    </p>
                    {!obs.isResolved ? (
                      <span className="text-[10px] font-bold text-amber-400 underline">Fix Typo →</span>
                    ) : (
                      <IconCheck className="h-4 w-4 text-emerald-400" />
                    )}
                  </div>
                  {obs.hint && !obs.isResolved && (
                    <p className="mt-1.5 text-[10px] text-amber-400/80 italic">{obs.hint}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-zinc-500 text-xs">
              Conveyor empty or all subjects processed. Awaiting incoming site transfers...
            </div>
          )}

          {/* Conveyor Subject Thumbnails Queue */}
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-[10px] text-zinc-500 uppercase shrink-0">Queue:</span>
            {conveyorSubjects.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-mono shrink-0 border transition ${
                  sub.id === selectedSubjectId
                    ? "border-brand-cyan bg-cyan-950/60 text-cyan-300 font-bold"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {sub.subjectLabel} {sub.isSAE && "⚠️"}
              </button>
            ))}
          </div>
        </div>

        {/* CDISC Domain Routing Workstations (DM, VS, AE, LB) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase">
            <span>EDC Form Stations</span>
            <span className="text-zinc-500">Hotkeys: [1-4]</span>
          </div>

          <div className="grid grid-cols-2 gap-2 flex-1">
            {sortedStations.map((station, index) => (
              <div
                key={station.id}
                onClick={() => handleInitiateSubmission(station.id)}
                className="group cursor-pointer rounded-xl border border-zinc-800 bg-zinc-900/90 p-3 hover:border-brand-cyan/60 hover:bg-zinc-800/90 transition flex flex-col justify-between"
                style={{ borderColor: station.accentColor }}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-zinc-500">[{index + 1}]</span>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {station.vendor}
                    </span>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-white group-hover:text-brand-cyan transition">
                    {station.label}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5 leading-tight">{station.name}</p>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-zinc-800 pt-2 text-[10px]">
                  <span className="text-zinc-500">Clean Submits:</span>
                  <span className="font-bold text-emerald-400">{station.processedCount}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-zinc-500 text-center">
            Click station or press [1-4] to route validated observations with simulated 21 CFR Part 11 Electronic Signature.
          </p>
        </div>
      </div>

      {/* Quick Validation Drawer Modal */}
      {validatingObs && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border border-amber-500/50 bg-zinc-950 p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <IconAlertTriangle className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Validation Station Check</h3>
              </div>
              <button
                onClick={() => setValidatingObs(null)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕ ESC
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase block">Clinical Variable</span>
                <p className="text-sm font-bold text-zinc-200">{validatingObs.obs.field}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-[10px] text-rose-400 uppercase block">Raw Site Entry</span>
                  <p className="text-sm font-mono font-bold text-rose-300">{validatingObs.obs.rawValue}</p>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase block">Standardized Target</span>
                  <p className="text-sm font-mono font-bold text-emerald-300">
                    {validatingObs.obs.correctedValue || validatingObs.obs.rawValue}
                  </p>
                </div>
              </div>

              {validatingObs.obs.hint && (
                <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-[11px] text-amber-300">
                  <IconInfoCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{validatingObs.obs.hint}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setValidatingObs(null)}
                className="px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => handleFixObservation(validatingObs.subjectId, validatingObs.obs.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition"
              >
                <IconCheck className="h-4 w-4" /> Standardize & Clean Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 21 CFR Part 11 Electronic Signature Modal */}
      {signatureModal.isOpen && signatureModal.subject && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-brand-cyan/60 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <IconLock className="h-5 w-5 text-brand-cyan" />
                <h3 className="text-base font-bold text-white">
                  21 CFR Part 11 Electronic Signature
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {targetRoutingStation} FORM LOCK
              </span>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono">
              <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <p className="text-zinc-400">
                  <span className="text-zinc-500">SUBJECT:</span> {signatureModal.subject.subjectLabel} (
                  {signatureModal.subject.studySite})
                </p>
                <p className="text-zinc-400 mt-1">
                  <span className="text-zinc-500">TARGET EDC:</span> {targetRoutingStation} Domain Desk (
                  {stations.find((s) => s.id === targetRoutingStation)?.vendor})
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1.5">
                  Select Legal Signature Reason [21 CFR § 11.50]
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      "Intent to Submit",
                      "Author Verification",
                      "Protocol Compliance Review",
                      "Urgent Safety Expedited",
                    ] as SignatureReason[]
                  ).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSignatureModal((prev) => ({ ...prev, selectedReason: r }))}
                      className={`p-2 rounded-lg text-left text-[11px] border transition ${
                        signatureModal.selectedReason === r
                          ? "border-brand-cyan bg-cyan-950/60 text-cyan-300 font-bold"
                          : "border-zinc-800 bg-zinc-900 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">
                  User Authenticator Password
                </label>
                <input
                  type="password"
                  value={signatureModal.passwordInput}
                  onChange={(e) =>
                    setSignatureModal((prev) => ({ ...prev, passwordInput: e.target.value }))
                  }
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-zinc-200 focus:border-brand-cyan focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-zinc-500 leading-relaxed italic">
                By executing this signature, I legally attest that all clinical data points conform to CDISC Controlled Terminology and ICH GCP E6(R2) standards.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setSignatureModal((prev) => ({ ...prev, isOpen: false, subject: null }))}
                className="px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:text-white"
              >
                Cancel (Esc)
              </button>
              <button
                onClick={handleConfirmSignature}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg shadow-cyan-500/20"
              >
                <IconShieldCheck className="h-4 w-4" /> Sign & Lock CRF (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Real-time Scrolling Audit Trail Terminal */}
      <div className="mt-4 rounded-xl border border-zinc-800 bg-black/90 p-3">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2 text-[10px] text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-bold uppercase tracking-wider text-zinc-400">
              AUDIT TRAIL LOG · 21 CFR PART 11 COMPLIANT
            </span>
          </div>
          <span>SECURE IMMUTABLE RECORD</span>
        </div>

        <div className="h-24 overflow-y-auto font-mono text-[11px] space-y-1 scrollbar-thin scrollbar-thumb-zinc-800">
          {auditLogs.length === 0 ? (
            <p className="text-zinc-600 italic">Audit logger standing by. Ready for event stream...</p>
          ) : (
            auditLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-zinc-600 shrink-0">{log.timestamp}</span>
                <span
                  className={
                    log.level === "CRITICAL"
                      ? "text-rose-400 font-bold"
                      : log.level === "WARN"
                      ? "text-amber-300"
                      : log.level === "COMPLIANT"
                      ? "text-emerald-400"
                      : "text-zinc-400"
                  }
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
          <div ref={terminalBottomRef} />
        </div>
      </div>

      {/* Educational Disclaimer & Cross-Link to iMednet Python SDK Case Study */}
      <div className="mt-4 rounded-xl border border-brand-blue/30 bg-brand-blue/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="text-xs">
          <div className="flex items-center gap-2 font-bold text-brand-blue uppercase tracking-wider text-[11px]">
            <IconFileText className="h-4 w-4" />
            <span>Case Study Synergy: iMednet Python SDK</span>
          </div>
          <p className="text-zinc-400 mt-1 leading-relaxed">
            Interested in real-world clinical EDC integration and CDISC ODM XML extraction? Explore the production architecture case study.
          </p>
        </div>

        <Link
          href="/case-studies/imednet-python-sdk"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-brand-blue/40 bg-brand-blue/15 text-xs font-bold text-brand-cyan hover:bg-brand-blue/25 transition shadow-sm"
        >
          <span>Read SDK Case Study</span>
          <IconExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
};
