"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useSyncExternalStore,
  useCallback,
  useMemo,
} from "react";
import Link from "next/link";
import { useAudio } from "@/components/providers/AudioProvider";
import { useTelemetry } from "@/hooks/useTelemetry";
import {
  IconAlertTriangle,
  IconCheck,
  IconRefresh,
  IconPlayerPlay,
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
  IconDownload,
  IconCoffee,
  IconSparkles,
  IconDatabase,
  IconTable,
  IconHelp,
  IconBolt,
  IconMusic,
} from "@tabler/icons-react";
import { FieldManualButton } from "@/components/FieldManualButton";
import { FullscreenButton } from "@/components/arcade/FullscreenButton";
import { DynamicTabletOrientationHint as TabletOrientationHint } from "@/components/arcade/DynamicTabletOrientationHint";
import { useFullscreen } from "@/hooks/useFullscreen";

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
  PowerUpInventory,
  PowerUpType,
  SDTMRow,
  BIMOInspectionReport,
} from "@/lib/clinical-trial-chaos/types";

import {
  createInitialScoreState,
  createInitialAuditorState,
  createInitialPowerUpInventory,
  createAuditLogEntry,
  fixObservation,
  validateObservationChoice,
  isSubjectFullyCompliant,
  calculateSubmissionPoints,
  tickSubjectTimers,
  tickAuditor,
  tickPowerUps,
  chargePowerUps,
  scrambleStations,
  verify21CFRSubmission,
  triggerRandomAmendment,
  generateSDTMDataset,
  exportToCDISCODMXML,
  exportToSDTMCSV,
  generateBIMOReport,
} from "@/lib/clinical-trial-chaos/engine";

import {
  getStationsForPhase,
  SEEDED_SCENARIOS,
  generateClinicalSubject,
} from "@/lib/clinical-trial-chaos/scenarios";

import {
  playValidationSound,
  playChoiceIncorrectSound,
  playSignatureVerifiedSound,
  playAuditErrorBuzz,
  playAmendmentSirenSound,
  playForm483AlarmSound,
  playPowerUpSound,
  playPneumaticChuteSound,
  startProceduralBGM,
  stopProceduralBGM,
  updateBGMTempo,
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

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  life: number;
}

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

  // 1. Game configuration & modes
  const [gameMode, setGameMode] = useState<GameMode>("campaign");
  const [phase, setPhase] = useState<GamePhase>(1);
  const [playState, setPlayState] = useState<PlayState>("idle");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgmEnabled, setBgmEnabled] = useState(false);
  const [activeTab, setActiveTab] = useState<"conveyor" | "sdtm_studio" | "audit_trail">("conveyor");
  const [sdtmFilterDomain, setSdtmFilterDomain] = useState<string>("ALL");

  // 2. Entities & Engine State
  const [scoreState, setScoreState] = useState<GameScoreState>(createInitialScoreState);
  const effectiveHighScore = Math.max(scoreState.highScore, loadedHighScore);
  const [auditor, setAuditor] = useState<AuditorState>(createInitialAuditorState);
  const [stations, setStations] = useState<StationConfig[]>(() => getStationsForPhase(1, "campaign"));
  const [conveyorSubjects, setConveyorSubjects] = useState<ClinicalSubject[]>([]);
  const [submittedHistory, setSubmittedHistory] = useState<ClinicalSubject[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUpInventory>(createInitialPowerUpInventory);
  const [activeAmendment, setActiveAmendment] = useState<ProtocolAmendment | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // 3. Modals & Interactive States
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [validatingObs, setValidatingObs] = useState<{
    subjectId: string;
    obs: ClinicalObservation;
    selectedChoice?: string;
    feedback?: { isValid: boolean; text: string };
  } | null>(null);

  const [signatureModal, setSignatureModal] = useState<SignatureModalState>({
    isOpen: false,
    subject: null,
    selectedReason: "Intent to Submit",
    passwordInput: "••••••••",
    requiresReason: true,
  });
  const [targetRoutingStation, setTargetRoutingStation] = useState<CDISCDomain>("DM");
  const [bimoReport, setBimoReport] = useState<BIMOInspectionReport | null>(null);

  // 4. DOM & Canvas references
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);
  const spawnTimerRef = useRef<number>(0);
  const amendmentTimerRef = useRef<number>(0);
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const coffeeBreakTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Unmount effect for coffee break timer
  useEffect(() => {
    return () => {
      if (coffeeBreakTimerRef.current) {
        clearTimeout(coffeeBreakTimerRef.current);
        coffeeBreakTimerRef.current = null;
      }
    };
  }, []);

  // 5. Audit Logger
  const addAuditLog = useCallback(
    (
      message: string,
      level: "INFO" | "WARN" | "CRITICAL" | "COMPLIANT" = "INFO",
      suspicionDelta = 0
    ) => {
      const entry = createAuditLogEntry(message, level, suspicionDelta);
      setAuditLogs((prev) => [...prev.slice(-50), entry]);
    },
    []
  );

  // 6. Sound Effects Handler
  const triggerSound = useCallback(
    (
      type:
        | "validate"
        | "incorrect"
        | "sign"
        | "error"
        | "amendment"
        | "alarm"
        | "powerup"
        | "chute"
    ) => {
      if (!soundEnabled || globalMuted) return;
      if (type === "validate") playValidationSound();
      else if (type === "incorrect") playChoiceIncorrectSound();
      else if (type === "sign") playSignatureVerifiedSound();
      else if (type === "error") playAuditErrorBuzz();
      else if (type === "amendment") playAmendmentSirenSound();
      else if (type === "alarm") playForm483AlarmSound();
      else if (type === "powerup") playPowerUpSound();
      else if (type === "chute") playPneumaticChuteSound();
    },
    [soundEnabled, globalMuted]
  );

  // 7. BGM Synth Controller
  useEffect(() => {
    if (bgmEnabled && soundEnabled && !globalMuted && playState === "playing") {
      startProceduralBGM();
      updateBGMTempo(auditor.suspicion);
    } else {
      stopProceduralBGM();
    }
    return () => {
      stopProceduralBGM();
    };
  }, [bgmEnabled, soundEnabled, globalMuted, playState, auditor.suspicion]);

  // 8. Start / Restart shift
  const startGame = useCallback(
    (mode: GameMode = "campaign", targetPhase: GamePhase = 1) => {
      if (coffeeBreakTimerRef.current) {
        clearTimeout(coffeeBreakTimerRef.current);
        coffeeBreakTimerRef.current = null;
      }
      setGameMode(mode);
      setPhase(targetPhase);
      setPlayState("playing");
      setAuditor(createInitialAuditorState());
      const phaseStations = getStationsForPhase(targetPhase, mode);
      setStations(phaseStations);
      setActiveAmendment(null);
      setSelectedSubjectId(null);
      setValidatingObs(null);
      setBimoReport(null);
      setPowerUps(createInitialPowerUpInventory());
      setSignatureModal({
        isOpen: false,
        subject: null,
        selectedReason: "Intent to Submit",
        passwordInput: "••••••••",
        requiresReason: true,
      });

      // Initial subjects: Seeded for Phase 1 campaign, generated for others
      const activeDomains = phaseStations.map((s) => s.id);
      const initialSubs =
        targetPhase === 1 && mode === "campaign"
          ? JSON.parse(JSON.stringify(SEEDED_SCENARIOS))
          : [
              generateClinicalSubject(0.4, false, 100, activeDomains),
              generateClinicalSubject(0.6, false, 101, activeDomains),
              generateClinicalSubject(0.7, targetPhase >= 2, 102, activeDomains),
            ];

      setConveyorSubjects(initialSubs);
      setSelectedSubjectId(initialSubs[0]?.id ?? null);
      setScoreState({
        ...createInitialScoreState(),
        highScore: effectiveHighScore,
      });

      addAuditLog(
        `[STUDY PROTOCOL ONLINE] Phase ${targetPhase} (${
          targetPhase === 1
            ? "Phase-I Healthy Cohort"
            : targetPhase === 2
            ? "Phase-II Dose Escalation & ConMed"
            : "Phase-III Global Multi-Center"
        }) EDC Stations Activated: [${activeDomains.join(", ")}].`,
        "INFO"
      );

      recordEvent("clinical_trial_chaos", "project_click").catch(() => {});
    },
    [addAuditLog, recordEvent, effectiveHighScore]
  );

  // 9. Active Subject in Dossier
  const activeSubject = useMemo(() => {
    return conveyorSubjects.find((s) => s.id === selectedSubjectId) || conveyorSubjects[0] || null;
  }, [conveyorSubjects, selectedSubjectId]);

  // 10. Generate full SDTM dataset from submitted subjects
  const sdtmDataset: SDTMRow[] = useMemo(() => {
    return generateSDTMDataset(submittedHistory);
  }, [submittedHistory]);

  const filteredSDTMRows = useMemo(() => {
    if (sdtmFilterDomain === "ALL") return sdtmDataset;
    return sdtmDataset.filter((r) => r.DOMAIN === sdtmFilterDomain);
  }, [sdtmDataset, sdtmFilterDomain]);

  // 11. Spawn Canvas Sparkle Particles
  const spawnSparkles = useCallback((x: number, y: number, color = "#10b981") => {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: Math.random() * 3 + 2,
        life: 1,
      });
    }
  }, []);

  // 12. Handle Multi-Choice Validation Selection
  const handleSelectChoice = useCallback(
    (choice: string) => {
      if (!validatingObs) return;
      const { subjectId, obs } = validatingObs;

      const result = validateObservationChoice(obs, choice);

      if (result.isValid) {
        triggerSound("validate");
        setValidatingObs((prev) => (prev ? { ...prev, selectedChoice: choice, feedback: { isValid: true, text: result.explanation } } : null));

        // Update observation on subject
        setConveyorSubjects((prev) =>
          prev.map((sub) => {
            if (sub.id !== subjectId) return sub;
            const updatedObs = sub.observations.map((o) => (o.id === obs.id ? result.observation : o));
            return { ...sub, observations: updatedObs };
          })
        );

        setScoreState((prev) => {
          const nextScore = prev.score + result.scoreDelta;
          return {
            ...prev,
            score: nextScore,
            correctionsMade: prev.correctionsMade + 1,
          };
        });

        // Charge power-ups
        setPowerUps((pu) => chargePowerUps(pu, 1));

        addAuditLog(
          `Observation Standardized: ${obs.field} -> '${choice}' [${result.explanation}]`,
          "COMPLIANT",
          result.suspicionDelta
        );

        // Auto close after brief display
        setTimeout(() => {
          setValidatingObs(null);
        }, 550);
      } else {
        triggerSound("incorrect");
        setValidatingObs((prev) => (prev ? { ...prev, selectedChoice: choice, feedback: { isValid: false, text: result.explanation } } : null));

        setAuditor((aud) => {
          const nextSusp = Math.min(100, aud.suspicion + result.suspicionDelta);
          return {
            ...aud,
            suspicion: nextSusp,
            behavior: nextSusp >= 100 ? "issuing_483" : "suspicious",
          };
        });

        addAuditLog(
          `[DATA MISMATCH] Invalid code selected: ${choice} for ${obs.field}. Suspicion +${result.suspicionDelta}%`,
          "WARN",
          result.suspicionDelta
        );
      }
    },
    [validatingObs, triggerSound, addAuditLog]
  );

  // 13. Power-Up Trigger Execution
  const triggerPowerUp = useCallback(
    (type: PowerUpType) => {
      const p = powerUps[type];
      if (!p || p.charge < p.maxCharge || playState !== "playing") return;

      triggerSound("powerup");

      if (type === "fda-coffee-break") {
        if (coffeeBreakTimerRef.current) {
          clearTimeout(coffeeBreakTimerRef.current);
          coffeeBreakTimerRef.current = null;
        }

        setAuditor((aud) => ({
          ...aud,
          behavior: "coffee_break",
          isPaused: true,
          suspicion: Math.max(0, aud.suspicion - 15),
        }));
        addAuditLog("☕ [POWER-UP ACTIVATED] FDA Coffee Break! Auditor halted for 8 seconds.", "COMPLIANT");

        coffeeBreakTimerRef.current = setTimeout(() => {
          setAuditor((aud) => ({
            ...aud,
            behavior: "patrolling",
            isPaused: false,
          }));
          addAuditLog("☕ FDA Coffee Break ended. Auditor resumed inspection floor patrol.", "INFO");
          coffeeBreakTimerRef.current = null;
        }, 8000);
      } else if (type === "auto-clean") {
        if (activeSubject) {
          setConveyorSubjects((prev) =>
            prev.map((sub) => {
              if (sub.id !== activeSubject.id) return sub;
              const cleaned = sub.observations.map((obs) => fixObservation(obs).observation);
              return { ...sub, observations: cleaned };
            })
          );
          addAuditLog(`✨ [POWER-UP ACTIVATED] CDISC Auto-Clean standardized all fields on ${activeSubject.subjectLabel}.`, "COMPLIANT");
        }
      } else if (type === "query-extension") {
        setConveyorSubjects((prev) =>
          prev.map((sub) => ({
            ...sub,
            timeRemaining: Math.min(sub.maxTime + 10, sub.timeRemaining + 12),
          }))
        );
        addAuditLog("⏱️ [POWER-UP ACTIVATED] Site Query Extension added +12s to all active conveyors.", "COMPLIANT");
      } else if (type === "fast-sign") {
        if (activeSubject) {
          // Auto clean and submit immediately to first matching domain
          const domain = activeSubject.observations[0]?.destination || "DM";
          const cleanedSubject = {
            ...activeSubject,
            observations: activeSubject.observations.map((obs) => fixObservation(obs).observation),
          };

          const points = calculateSubmissionPoints(cleanedSubject, scoreState.multiplier, true);
          setScoreState((prev) => ({
            ...prev,
            score: prev.score + points,
            subjectsSubmitted: prev.subjectsSubmitted + 1,
            cleanSubmissions: prev.cleanSubmissions + 1,
            combo: prev.combo + 1,
            maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
          }));

          setSubmittedHistory((prev) => [...prev, cleanedSubject]);
          setConveyorSubjects((prev) => prev.filter((s) => s.id !== activeSubject.id));
          setSelectedSubjectId(null);
          triggerSound("sign");
          addAuditLog(`⚡ [FAST-TRACK 21 CFR PASS] Expedited NDA sign-off for ${cleanedSubject.subjectLabel} -> ${domain}.`, "COMPLIANT");
        }
      }

      // Reset power-up charge
      setPowerUps((prev) => ({
        ...prev,
        [type]: {
          ...prev[type],
          charge: 0,
          activeSecondsRemaining: p.duration,
        },
      }));
    },
    [powerUps, playState, activeSubject, scoreState.multiplier, triggerSound, addAuditLog]
  );

  // 14. Initiate 21 CFR Electronic Signature Modal
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

  // 15. Confirm 21 CFR Signature & Route Subject
  const handleConfirmSignature = useCallback(() => {
    if (!signatureModal.subject) return;
    const subj = signatureModal.subject;
    const reason = signatureModal.selectedReason;
    const domain = targetRoutingStation;

    const result = verify21CFRSubmission(subj, reason, domain);

    if (result.success) {
      triggerSound("sign");
      triggerSound("chute");
      spawnSparkles(380, 100, "#38bdf8");
      addAuditLog(result.logMessage, "COMPLIANT", result.suspicionDelta);

      const allClean = isSubjectFullyCompliant(subj);
      const points = calculateSubmissionPoints(subj, scoreState.multiplier, allClean);
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
          cleanSubmissions: allClean ? prev.cleanSubmissions + 1 : prev.cleanSubmissions,
        };
      });

      // Charge power-ups
      setPowerUps((pu) => chargePowerUps(pu, allClean ? 2 : 1));

      // Cool down auditor suspicion
      setAuditor((prev) => ({
        ...prev,
        suspicion: Math.max(0, prev.suspicion + result.suspicionDelta),
      }));

      // Update station stats
      setStations((prev) =>
        prev.map((s) => (s.id === domain ? { ...s, processedCount: s.processedCount + 1 } : s))
      );

      // Record to submitted history
      setSubmittedHistory((prev) => [...prev, subj]);

      // Remove from conveyor
      setConveyorSubjects((prev) => prev.filter((s) => s.id !== subj.id));
      setSelectedSubjectId(null);
      setSignatureModal((prev) => ({ ...prev, isOpen: false, subject: null }));

      // Phase completion check in Campaign mode
      if (gameMode === "campaign") {
        const targetCount = phase === 1 ? 5 : phase === 2 ? 8 : 12;
        if (scoreState.subjectsSubmitted + 1 >= targetCount) {
          setPlayState("phase_cleared");
          playSuccess();
          const report = generateBIMOReport(
            { ...scoreState, subjectsSubmitted: scoreState.subjectsSubmitted + 1 },
            auditor,
            auditLogs
          );
          setBimoReport(report);
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
    auditor,
    auditLogs,
    gameMode,
    phase,
    triggerSound,
    spawnSparkles,
    addAuditLog,
    playSuccess,
  ]);

  // 16. Canvas 2D Simulation Renderer
  const renderConveyorCanvas = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      auditorState: AuditorState,
      subjects: ClinicalSubject[],
      particles: Particle[]
    ) => {
      ctx.clearRect(0, 0, width, height);

      // Background Grid
      ctx.fillStyle = "#09090b";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "#18181b";
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Conveyor Belt Track
      const beltY = height * 0.44;
      const beltHeight = 44;
      ctx.fillStyle = "#18181b";
      ctx.fillRect(20, beltY, width - 40, beltHeight);

      // Rollers Animation
      ctx.fillStyle = "#27272a";
      const rollerCount = 28;
      const timeOffset = (Date.now() / 35) % 20;
      for (let i = 0; i < rollerCount; i++) {
        const rx = 24 + i * ((width - 48) / rollerCount) + timeOffset;
        if (rx < width - 24) {
          ctx.fillRect(rx, beltY + 4, 3, beltHeight - 8);
        }
      }

      ctx.strokeStyle = "#3f3f46";
      ctx.lineWidth = 2;
      ctx.strokeRect(20, beltY, width - 40, beltHeight);

      // Draw Pneumatic Chutes on the Right Wall
      ctx.fillStyle = "#27272a";
      ctx.fillRect(width - 24, beltY - 30, 16, beltHeight + 60);
      ctx.strokeStyle = "#06b6d4";
      ctx.lineWidth = 1;
      ctx.strokeRect(width - 24, beltY - 30, 16, beltHeight + 60);
      ctx.fillStyle = "#06b6d4";
      ctx.font = "bold 8px monospace";
      ctx.fillText("EDC", width - 22, beltY - 34);

      // Conveyor Subject Parcels
      const slotWidth = (width - 70) / 5;
      subjects.forEach((subj, idx) => {
        const px = 28 + idx * slotWidth;
        const py = beltY - 26;

        const isSelected = subj.id === selectedSubjectId;
        ctx.fillStyle = subj.isSAE ? "#7f1d1d" : isSelected ? "#1e3a8a" : "#1f2937";
        ctx.strokeStyle = subj.isSAE ? "#ef4444" : isSelected ? "#38bdf8" : "#4b5563";
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.fillRect(px, py, slotWidth - 10, 52);
        ctx.strokeRect(px, py, slotWidth - 10, 52);

        // Subject Label
        ctx.fillStyle = "#f3f4f6";
        ctx.font = "bold 10px monospace";
        ctx.fillText(subj.subjectLabel, px + 6, py + 16);

        // SAE Badge or Domain Badge
        if (subj.isSAE) {
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 8px monospace";
          ctx.fillText("⚡ SAE", px + slotWidth - 45, py + 16);
        }

        // Compliance status pip
        const allClean = isSubjectFullyCompliant(subj);
        ctx.fillStyle = allClean ? "#10b981" : "#f59e0b";
        ctx.beginPath();
        ctx.arc(px + slotWidth - 18, py + 12, 4, 0, Math.PI * 2);
        ctx.fill();

        // Mini timer bar
        const timePercent = Math.max(0, subj.timeRemaining / subj.maxTime);
        ctx.fillStyle = "#374151";
        ctx.fillRect(px + 6, py + 38, slotWidth - 22, 5);
        ctx.fillStyle =
          timePercent < 0.25 ? "#ef4444" : timePercent < 0.5 ? "#f59e0b" : "#3b82f6";
        ctx.fillRect(px + 6, py + 38, (slotWidth - 22) * timePercent, 5);
      });

      // Data Manager Desk Avatar (bottom left)
      ctx.fillStyle = "#10b981";
      ctx.fillRect(30, height - 28, 20, 20);
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(40, height - 33, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 8px monospace";
      ctx.fillText("DM DESK", 18, height - 42);

      // Auditor Sprite on Top Patrol Floor
      const auditorX = 50 + auditorState.x * (width - 100);
      const auditorY = height * 0.16;

      // Suspicion Aura
      const suspRatio = auditorState.suspicion / 100;
      if (suspRatio > 0.2) {
        const grad = ctx.createRadialGradient(auditorX, auditorY, 4, auditorX, auditorY, 36);
        grad.addColorStop(0, `rgba(239, 68, 68, ${suspRatio * 0.45})`);
        grad.addColorStop(1, "rgba(239, 68, 68, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(auditorX, auditorY, 36, 0, Math.PI * 2);
        ctx.fill();
      }

      // Auditor Body
      ctx.fillStyle =
        auditorState.behavior === "issuing_483"
          ? "#dc2626"
          : auditorState.behavior === "coffee_break"
          ? "#8b5cf6"
          : auditorState.behavior === "suspicious"
          ? "#ea580c"
          : "#0284c7";
      ctx.fillRect(auditorX - 10, auditorY - 14, 20, 28);

      // Clipboard / Coffee Cup
      if (auditorState.behavior === "coffee_break") {
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(auditorX + 5, auditorY - 8, 8, 10);
      } else {
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(auditorX + (auditorState.direction > 0 ? 4 : -12), auditorY - 6, 8, 12);
      }

      // Head
      ctx.fillStyle = "#fed7aa";
      ctx.beginPath();
      ctx.arc(auditorX, auditorY - 18, 7, 0, Math.PI * 2);
      ctx.fill();

      // Glasses / Hat
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(auditorX - 8, auditorY - 26, 16, 4);
      ctx.fillRect(auditorX - 5, auditorY - 30, 10, 5);

      // Auditor Name / Status Tag
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.fillText(
        auditorState.behavior === "coffee_break"
          ? "☕ FDA COFFEE BREAK"
          : `FDA AUDITOR [${Math.round(auditorState.suspicion)}%]`,
        auditorX,
        auditorY - 34
      );
      ctx.textAlign = "left";

      // Render Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.02;
        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    [selectedSubjectId]
  );

  // 17. Main Game Loop Tick (requestAnimationFrame)
  useEffect(() => {
    if (playState !== "playing") return;

    let isRunning = true;
    let isContextLost = false;
    const canvas = canvasRef.current;

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      isContextLost = true;
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };

    const handleContextRestored = () => {
      isContextLost = false;
      lastTickTimeRef.current = Date.now();
      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    if (canvas) {
      canvas.addEventListener("contextlost", handleContextLost);
      canvas.addEventListener("contextrestored", handleContextRestored);
    }

    const gameLoop = () => {
      if (!isRunning || isContextLost) return;

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
            if (aud.isPaused || aud.behavior === "coffee_break") return aud;
            const nextSusp = Math.min(100, aud.suspicion + expiredSubjects.length * 20);
            return {
              ...aud,
              suspicion: nextSusp,
              behavior: nextSusp >= 100 ? "issuing_483" : "suspicious",
            };
          });

          setScoreState((sc) => ({
            ...sc,
            combo: 0,
            multiplier: 1,
            auditViolations: sc.auditViolations + expiredSubjects.length,
          }));
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
          const report = generateBIMOReport(scoreState, updatedAuditor, auditLogs);
          setBimoReport(report);
        }
        return updatedAuditor;
      });

      // 3. Tick Power-ups
      setPowerUps((pu) => tickPowerUps(pu, deltaSeconds));

      // 4. Tick Protocol Amendment countdown
      setActiveAmendment((prev) => {
        if (!prev || !prev.active) return null;
        const remaining = prev.timeRemaining - deltaSeconds;
        if (remaining <= 0) {
          addAuditLog(`Protocol Amendment ${prev.version} concluded. Standard site procedures resumed.`, "INFO");
          return null;
        }
        return { ...prev, timeRemaining: remaining };
      });

      // 5. Random Protocol Amendments
      amendmentTimerRef.current += deltaSeconds;
      const amendmentInterval = phase === 1 ? 40 : phase === 2 ? 28 : 20;
      if (amendmentTimerRef.current > amendmentInterval) {
        amendmentTimerRef.current = 0;
        const newAmendment = triggerRandomAmendment();
        setActiveAmendment(newAmendment);
        triggerSound("amendment");
        addAuditLog(`[PROTOCOL AMENDMENT ALERT] ${newAmendment.version}: ${newAmendment.title}!`, "WARN");

        if (newAmendment.type === "station-scramble") {
          setStations((st) => scrambleStations(st));
        } else if (newAmendment.type === "sae-priority-rush") {
          const saeSubj = generateClinicalSubject(0.7, true, undefined, stations.map((s) => s.id));
          setConveyorSubjects((cs) => [saeSubj, ...cs]);
        }
      }

      // 6. Spawning new subjects
      spawnTimerRef.current += deltaSeconds;
      const spawnInterval = phase === 1 ? 6.5 : phase === 2 ? 4.8 : 3.5;
      if (spawnTimerRef.current > spawnInterval && conveyorSubjects.length < 5) {
        spawnTimerRef.current = 0;
        const errorChance = phase === 1 ? 0.45 : phase === 2 ? 0.65 : 0.8;
        const isSAE = Math.random() < (phase === 1 ? 0.1 : 0.3);
        const newSub = generateClinicalSubject(
          errorChance,
          isSAE,
          undefined,
          stations.map((s) => s.id)
        );
        setConveyorSubjects((prev) => [...prev, newSub]);
        if (!selectedSubjectId) {
          setSelectedSubjectId(newSub.id);
        }
      }

      // 7. Render Canvas Simulation
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          renderConveyorCanvas(
            ctx,
            canvas.width,
            canvas.height,
            auditor,
            conveyorSubjects,
            particlesRef.current
          );
        }
      }

      animFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    lastTickTimeRef.current = Date.now();
    animFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (canvas) {
        canvas.removeEventListener("contextlost", handleContextLost);
        canvas.removeEventListener("contextrestored", handleContextRestored);
      }
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [
    playState,
    phase,
    conveyorSubjects,
    selectedSubjectId,
    auditor,
    stations,
    scoreState,
    auditLogs,
    addAuditLog,
    triggerSound,
    renderConveyorCanvas,
  ]);

  // 18. Hotkeys and Keyboard Boundary
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key.toUpperCase();

    // Prevent scrolling on gameplay keys
    if (["1", "2", "3", "4", "5", "6", " ", "ESCAPE", "ENTER", "Q", "W", "E", "R", "TAB"].includes(key)) {
      e.preventDefault();
    }

    if (playState !== "playing") {
      if (key === " " || key === "ENTER") {
        startGame(gameMode, phase);
      }
      return;
    }

    if (validatingObs) {
      if (key === "ESCAPE") {
        setValidatingObs(null);
      }
      return;
    }

    if (signatureModal.isOpen) {
      if (key === "ESCAPE") {
        setSignatureModal((prev) => ({ ...prev, isOpen: false }));
      } else if (key === "ENTER") {
        handleConfirmSignature();
      }
      return;
    }

    // Power-up hotkeys Q, W, E, R
    if (key === "Q") triggerPowerUp("fda-coffee-break");
    else if (key === "W") triggerPowerUp("auto-clean");
    else if (key === "E") triggerPowerUp("query-extension");
    else if (key === "R") triggerPowerUp("fast-sign");

    // Station routing hotkeys 1-6
    const sorted = [...stations].sort((a, b) => a.positionIndex - b.positionIndex);
    const keyNum = parseInt(key, 10);
    if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= sorted.length) {
      const station = sorted[keyNum - 1];
      if (station) handleInitiateSubmission(station.id);
    }

    // Tab key cycles active subject
    if (key === "TAB" && conveyorSubjects.length > 0) {
      const currentIdx = conveyorSubjects.findIndex((s) => s.id === selectedSubjectId);
      const nextIdx = (currentIdx + 1) % conveyorSubjects.length;
      setSelectedSubjectId(conveyorSubjects[nextIdx].id);
    }
  };

  // 19. Export Downloads
  const downloadODMXML = () => {
    const xml = exportToCDISCODMXML(submittedHistory, sdtmDataset);
    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `CDISC_ODM_Snapshot_${Date.now()}.xml`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog("CDISC ODM 1.3 XML snapshot exported and downloaded.", "COMPLIANT");
  };

  const downloadSDTMCSV = () => {
    const csv = exportToSDTMCSV(sdtmDataset);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `SDTM_Dataset_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addAuditLog("CDISC SDTM observation dataset (.csv) exported and downloaded.", "COMPLIANT");
  };

  // Auto-scroll terminal log
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
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

  const handleCanvasClickOrTouch = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    const beltY = canvas.height * 0.44;
    const slotWidth = (canvas.width - 70) / 5;

    if (y >= beltY - 35 && y <= beltY + 60) {
      conveyorSubjects.forEach((subj, idx) => {
        const px = 28 + idx * slotWidth;
        if (x >= px && x <= px + slotWidth - 10) {
          setSelectedSubjectId(subj.id);
          triggerSound("validate");
        }
      });
    }
  };

  const sortedStations = [...stations].sort((a, b) => a.positionIndex - b.positionIndex);

  return (
    <div
      ref={containerRef}
      data-keyboard-boundary="true"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative w-full font-mono focus:outline-none transition-all ${
        isFullscreen
          ? "fixed inset-0 z-50 w-screen h-screen max-w-none max-h-none rounded-none border-none bg-black p-4 sm:p-6 overflow-y-auto overflow-x-hidden"
          : "rounded-2xl border border-blue-500/30 bg-zinc-950 p-4 md:p-6 shadow-2xl focus:ring-1 focus:ring-brand-cyan"
      }`}
    >
      <FullscreenButton
        isFullscreen={isFullscreen}
        onToggle={toggleFullscreen}
        variant="floating"
      />

      {/* Tablet Orientation Recommendation */}
      <TabletOrientationHint className="w-full mb-4" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand-cyan">
              21 CFR Part 11 &amp; CDISC SDTM Mega-Arcade · Zero PHI
            </p>
          </div>
          <h2
            id="clinical-chaos-heading"
            className="mt-1 text-2xl md:text-3xl font-extrabold text-white tracking-tight"
          >
            Clinical Trial Chaos: <span className="text-emerald-400">CDISC Compliance</span>
          </h2>
        </div>

        {/* Score, Sound, & Manual Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <FieldManualButton manualId="clinical-chaos" label="Manual" />
          <FullscreenButton isFullscreen={isFullscreen} onToggle={toggleFullscreen} variant="header" />

          {/* Score Counter */}
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/90 px-3 py-1.5 text-xs">
            <IconTrophy className="h-4 w-4 text-amber-400" />
            <div>
              <span className="text-[10px] text-zinc-400 uppercase">Score: </span>
              <span className="font-bold text-white">{scoreState.score}</span>
              <span className="text-[10px] text-zinc-500 ml-2">(High: {effectiveHighScore})</span>
            </div>
          </div>

          {/* Combo Meter */}
          <div className="hidden sm:flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900/90 px-2.5 py-1.5 text-xs">
            <IconFlame
              className={`h-4 w-4 ${
                scoreState.combo > 2 ? "text-rose-500 animate-bounce" : "text-zinc-500"
              }`}
            />
            <span className="text-zinc-400 text-[10px]">COMBO:</span>
            <span className="font-bold text-brand-cyan">{scoreState.combo}x</span>
            <span className="text-[10px] text-amber-400 ml-1">
              ({scoreState.multiplier}x Multiplier)
            </span>
          </div>

          {/* Procedural BGM Synth Toggle */}
          <button
            onClick={() => setBgmEnabled(!bgmEnabled)}
            className={`rounded-lg border px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1.5 ${
              bgmEnabled
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300"
            }`}
            title="Toggle 8-Bit Procedural Synth BGM"
          >
            <IconMusic className="h-3.5 w-3.5" />
            <span className="text-[10px] uppercase">BGM {bgmEnabled ? "ON" : "OFF"}</span>
          </button>

          {/* Master SFX Mute */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 hover:text-white transition"
            title={soundEnabled ? "Mute Arcade SFX" : "Unmute Arcade SFX"}
          >
            {soundEnabled ? (
              <IconVolume className="h-4 w-4 text-brand-cyan" />
            ) : (
              <IconVolumeOff className="h-4 w-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation View Switcher (Conveyor Ops vs Live SDTM Studio vs Audit Log) */}
      <div className="mt-3 flex items-center justify-between border-b border-zinc-800/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("conveyor")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "conveyor"
                ? "bg-brand-cyan/20 text-cyan-300 border border-brand-cyan/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconBolt className="h-3.5 w-3.5" />
            <span>Conveyor Floor</span>
          </button>

          <button
            onClick={() => setActiveTab("sdtm_studio")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "sdtm_studio"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconDatabase className="h-3.5 w-3.5" />
            <span>Live SDTM Studio ({sdtmDataset.length} rows)</span>
          </button>

          <button
            onClick={() => setActiveTab("audit_trail")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "audit_trail"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <IconFileText className="h-3.5 w-3.5" />
            <span>Audit Trail Log</span>
          </button>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-zinc-500 uppercase">MODE: {gameMode.toUpperCase()}</span>
          <p className="text-xs font-bold text-zinc-300">
            {gameMode === "campaign" ? `PHASE ${phase} OF 3` : "ENDLESS SPRINT"}
          </p>
        </div>
      </div>

      {/* Auditor Pressure Gauge & Power-Up Lifelines Bar */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Auditor Gauge */}
        <div className="lg:col-span-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <IconShieldCheck
                className={`h-4 w-4 ${auditor.suspicion > 60 ? "text-rose-500" : "text-blue-400"}`}
              />
              <span className="font-bold text-zinc-300">FDA AUDITOR SCRUTINY:</span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                  auditor.behavior === "issuing_483"
                    ? "bg-rose-600 text-white animate-pulse"
                    : auditor.behavior === "coffee_break"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    : auditor.behavior === "suspicious"
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {auditor.behavior === "coffee_break" ? "☕ COFFEE BREAK" : auditor.behavior}
              </span>
            </div>
            <span
              className={`font-mono font-bold ${
                auditor.suspicion > 75
                  ? "text-rose-400 animate-pulse"
                  : auditor.suspicion > 40
                  ? "text-amber-300"
                  : "text-emerald-400"
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
            <div
              className="absolute right-0 top-0 bottom-0 w-1 bg-rose-500"
              title="Form 483 Termination Threshold (100%)"
            />
          </div>
        </div>

        {/* Combo-Charged Regulatory Lifelines */}
        <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["fda-coffee-break", "auto-clean", "query-extension", "fast-sign"] as PowerUpType[]).map(
            (type) => {
              const p = powerUps[type];
              const isReady = p.charge >= p.maxCharge;
              return (
                <button
                  key={type}
                  onClick={() => triggerPowerUp(type)}
                  disabled={!isReady || playState !== "playing"}
                  className={`p-2 rounded-xl border flex flex-col justify-between text-left transition ${
                    isReady
                      ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:bg-emerald-500/20"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-500 opacity-70"
                  }`}
                  title={p.description}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-bold font-mono">[{p.hotkey}]</span>
                    {type === "fda-coffee-break" && <IconCoffee className="w-3.5 h-3.5" />}
                    {type === "auto-clean" && <IconSparkles className="w-3.5 h-3.5" />}
                    {type === "query-extension" && <IconClock className="w-3.5 h-3.5" />}
                    {type === "fast-sign" && <IconBolt className="w-3.5 h-3.5" />}
                  </div>
                  <p className="text-[10px] font-bold mt-1 truncate text-zinc-200">{p.name}</p>
                  <div className="mt-1.5 flex items-center justify-between text-[9px]">
                    <span className={isReady ? "text-emerald-400 font-bold" : "text-zinc-500"}>
                      {isReady ? "READY!" : `${p.charge}/${p.maxCharge}`}
                    </span>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Active Protocol Amendment Banner */}
      {activeAmendment && activeAmendment.active && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-500/50 bg-amber-500/10 p-3 text-amber-200 animate-pulse">
          <div className="flex items-center gap-2">
            <IconArrowsShuffle className="h-5 w-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-amber-300">
                PROTOCOL AMENDMENT ALERT: {activeAmendment.title}
              </span>
              <p className="text-[11px] text-amber-200/80">{activeAmendment.description}</p>
            </div>
          </div>
          <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-amber-500/20 text-amber-300 shrink-0">
            {Math.ceil(activeAmendment.timeRemaining)}s
          </span>
        </div>
      )}

      {/* TAB 1: Conveyor Floor View */}
      {activeTab === "conveyor" && (
        <>
          {/* HTML5 Canvas Simulation */}
          <div className="mt-4 relative rounded-xl border border-zinc-800 bg-black overflow-hidden">
            <canvas
              ref={canvasRef}
              width={760}
              height={200}
              onClick={(e) => handleCanvasClickOrTouch(e.clientX, e.clientY)}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                if (touch) handleCanvasClickOrTouch(touch.clientX, touch.clientY);
              }}
              style={{ touchAction: "none" }}
              className={`w-full ${isFullscreen ? "h-auto max-h-[300px] aspect-[760/200] object-contain" : "h-[180px]"} block cursor-pointer`}
            />

            {/* Overlays for Idle / Paused / Game Over / Cleared */}
            {playState !== "playing" && (
              <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                {playState === "game_over" ? (
                  <div className="max-w-md w-full border border-rose-500/40 bg-zinc-950 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-center gap-2 text-rose-400 font-bold mb-2">
                      <IconAlertTriangle className="h-6 w-6 text-rose-500 animate-bounce" />
                      <span className="text-lg">FDA FORM 483 ISSUED · TRIAL TERMINATED</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                      Auditor suspicion reached 100%. Major source data validation discrepancies triggered clinical hold under 21 CFR § 312.44.
                    </p>
                    <div className="grid grid-cols-3 gap-2 bg-zinc-900/80 p-3 rounded-lg text-xs font-mono mb-4 text-left">
                      <div>
                        <span className="text-[10px] text-zinc-500 block">SCORE</span>
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => startGame("campaign", 1)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition shadow-lg"
                      >
                        <IconRefresh className="h-4 w-4" /> Restart Phase I
                      </button>
                    </div>
                  </div>
                ) : playState === "phase_cleared" ? (
                  <div className="max-w-md w-full border border-emerald-500/40 bg-zinc-950 p-5 rounded-2xl shadow-2xl">
                    <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold mb-2">
                      <IconShieldCheck className="h-6 w-6 text-emerald-400" />
                      <span className="text-lg">
                        {phase < 3
                          ? `PHASE ${phase} COMPLIANCE AUDIT PASSED!`
                          : "STUDY PROTOCOL APPROVED FOR NDA SUBMISSION!"}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4">
                      {phase < 3
                        ? `The FDA inspection concluded with 100% verified CDISC SDTM mappings. Advance to Phase ${phase + 1} with expanded EDC domains?`
                        : "Full 21 CFR Part 11 database lock achieved. All trial data successfully validated and archived."}
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
                    <p className="text-base font-bold text-zinc-100 mb-2">
                      Manage Multi-Center Clinical Data under 21 CFR &amp; CDISC Audit Scrutiny
                    </p>
                    <p className="text-xs text-zinc-400 max-w-md mx-auto mb-4">
                      Solve multi-choice Controlled Terminology puzzles, route clinical packets across tiered EDC stations (DM, VS, AE, LB, CM, EX), charge regulatory lifelines, and download real SDTM datasets.
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

          {/* Active Subject Dossier & EDC Domain Routing Stations */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Active Subject Dossier Card */}
            <div className="lg:col-span-7 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex items-center justify-between mb-3 border-b border-zinc-800/80 pb-2">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    ACTIVE CASE REPORT FORM (CRF)
                  </span>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {activeSubject ? activeSubject.subjectLabel : "NO SUBJECT SELECTED"}
                    {activeSubject?.isSAE && (
                      <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        ⚡ SAE EXPEDITED
                      </span>
                    )}
                  </h3>
                </div>
                {activeSubject && (
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block">{activeSubject.studySite}</span>
                    <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1 justify-end">
                      <IconClock className="h-3.5 w-3.5" /> {Math.ceil(activeSubject.timeRemaining)}s
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
                              : obs.destination === "LB"
                              ? "bg-purple-500/20 text-purple-400"
                              : obs.destination === "CM"
                              ? "bg-pink-500/20 text-pink-400"
                              : "bg-cyan-500/20 text-cyan-400"
                          }`}
                        >
                          {obs.destination}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <p
                          className={`text-sm font-bold ${
                            !obs.isResolved ? "text-amber-300" : "text-zinc-100"
                          }`}
                        >
                          {obs.currentValue}
                        </p>
                        {!obs.isResolved ? (
                          <span className="text-[10px] font-bold text-amber-400 underline">
                            Validate Choice →
                          </span>
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
                  Conveyor empty or all subjects submitted. Awaiting next site transfer...
                </div>
              )}

              {/* Conveyor Subject Queue Selector */}
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
                    {sub.subjectLabel} {sub.isSAE && "⚡"}
                  </button>
                ))}
              </div>
            </div>

            {/* EDC Domain Workstations (DM, VS, AE, LB, CM, EX, etc.) */}
            <div className="lg:col-span-5 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400 uppercase">
                <span>Tiered EDC Workstations</span>
                <span className="text-zinc-500">Hotkeys: [1-{sortedStations.length}]</span>
              </div>

              <div
                className={`grid gap-2 flex-1 ${
                  sortedStations.length > 4 ? "grid-cols-3" : "grid-cols-2"
                }`}
              >
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
                        <span className="text-[8px] font-bold uppercase px-1 py-0.5 rounded bg-zinc-800 text-zinc-400 truncate max-w-[80px]">
                          {station.vendor}
                        </span>
                      </div>
                      <h4 className="mt-1 text-sm font-bold text-white group-hover:text-brand-cyan transition">
                        {station.label}
                      </h4>
                      <p className="text-[9px] text-zinc-400 mt-0.5 leading-tight">{station.name}</p>
                    </div>

                    <div className="mt-2 flex items-center justify-between border-t border-zinc-800 pt-1.5 text-[10px]">
                      <span className="text-zinc-500">Submits:</span>
                      <span className="font-bold text-emerald-400">{station.processedCount}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-zinc-500 text-center">
                Route validated packet with 21 CFR Part 11 signature. Press [Tab] to cycle queue.
              </p>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Live CDISC SDTM Studio & Dataset Inspector */}
      {activeTab === "sdtm_studio" && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <IconDatabase className="h-5 w-5 text-emerald-400" />
                <span>Live CDISC SDTM Dataset Studio</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Inspect real-time SDTM clinical observation variables mapped from submitted subject packets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={downloadODMXML}
                disabled={submittedHistory.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-cyan/40 bg-brand-cyan/10 text-cyan-300 text-xs font-bold hover:bg-brand-cyan/20 disabled:opacity-40"
              >
                <IconDownload className="h-3.5 w-3.5" />
                <span>Export CDISC ODM XML</span>
              </button>

              <button
                onClick={downloadSDTMCSV}
                disabled={sdtmDataset.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs font-bold hover:bg-emerald-500/20 disabled:opacity-40"
              >
                <IconTable className="h-3.5 w-3.5" />
                <span>Export SDTM CSV</span>
              </button>
            </div>
          </div>

          {/* Domain Filter Pills */}
          <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
            <span className="text-[10px] text-zinc-500 uppercase shrink-0">Filter Domain:</span>
            {["ALL", "DM", "VS", "AE", "LB", "CM", "EX", "DS", "MH"].map((dom) => (
              <button
                key={dom}
                onClick={() => setSdtmFilterDomain(dom)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 border transition ${
                  sdtmFilterDomain === dom
                    ? "border-emerald-500 bg-emerald-950/60 text-emerald-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700"
                }`}
              >
                {dom}
              </button>
            ))}
          </div>

          {/* SDTM Table */}
          <div className="overflow-x-auto max-h-72 border border-zinc-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-zinc-950 text-zinc-400 uppercase text-[10px] border-b border-zinc-800 sticky top-0">
                <tr>
                  <th className="p-2.5">STUDYID</th>
                  <th className="p-2.5">DOMAIN</th>
                  <th className="p-2.5">USUBJID</th>
                  <th className="p-2.5">TESTCD</th>
                  <th className="p-2.5">TEST NAME</th>
                  <th className="p-2.5">RAW (ORRES)</th>
                  <th className="p-2.5">STANDARDIZED (STRESC)</th>
                  <th className="p-2.5">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 bg-zinc-900/40">
                {filteredSDTMRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-zinc-500 italic">
                      No compliant SDTM records generated yet. Complete electronic signatures on conveyor subjects to populate database.
                    </td>
                  </tr>
                ) : (
                  filteredSDTMRows.map((row, idx) => (
                    <tr key={`${row.USUBJID}-${row.SEQ}-${idx}`} className="hover:bg-zinc-800/40">
                      <td className="p-2.5 text-zinc-500">{row.STUDYID}</td>
                      <td className="p-2.5 font-bold text-brand-cyan">{row.DOMAIN}</td>
                      <td className="p-2.5 text-zinc-300">{row.USUBJID}</td>
                      <td className="p-2.5 font-bold text-amber-300">{row.TESTCD}</td>
                      <td className="p-2.5 text-zinc-200">{row.TEST}</td>
                      <td className="p-2.5 text-rose-400">{row.ORRES}</td>
                      <td className="p-2.5 text-emerald-300 font-bold">{row.STRESC}</td>
                      <td className="p-2.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            row.STATUS === "COMPLIANT"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-amber-500/20 text-amber-300"
                          }`}
                        >
                          {row.STATUS}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail Log Tab */}
      {activeTab === "audit_trail" && (
        <div className="mt-4 rounded-xl border border-zinc-800 bg-black/90 p-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span className="font-bold uppercase tracking-wider text-zinc-300">
                21 CFR PART 11 IMMUTABLE AUDIT TRAIL
              </span>
            </div>
            <span>TOTAL EVENTS: {auditLogs.length}</span>
          </div>

          <div
            ref={terminalContainerRef}
            className="h-64 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-zinc-800 p-2"
          >
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
          </div>
        </div>
      )}

      {/* Multi-Choice Regulatory Validation Drawer Modal */}
      {validatingObs && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full rounded-2xl border border-amber-500/50 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <IconHelp className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">CDISC Controlled Terminology Validation</h3>
              </div>
              <button
                onClick={() => setValidatingObs(null)}
                className="text-zinc-500 hover:text-white text-xs font-mono"
              >
                ✕ ESC
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Clinical Variable</span>
                  <p className="text-sm font-bold text-zinc-100">{validatingObs.obs.field}</p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {validatingObs.obs.destination} DOMAIN
                </span>
              </div>

              <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <span className="text-[10px] text-rose-400 uppercase block">Raw Site Entry Discrepancy</span>
                <p className="text-sm font-mono font-bold text-rose-300">{validatingObs.obs.rawValue}</p>
                {validatingObs.obs.hint && (
                  <p className="mt-1 text-[11px] text-amber-400/90 italic">{validatingObs.obs.hint}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-2">
                  Select Compliant CDISC Standard Value / CT Code
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(validatingObs.obs.options || [
                    validatingObs.obs.correctedValue || validatingObs.obs.rawValue,
                    validatingObs.obs.rawValue,
                  ]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleSelectChoice(opt)}
                      className={`p-2.5 rounded-xl border text-left font-mono text-xs transition ${
                        validatingObs.selectedChoice === opt
                          ? validatingObs.feedback?.isValid
                            ? "border-emerald-500 bg-emerald-950/60 text-emerald-300 font-bold"
                            : "border-rose-500 bg-rose-950/60 text-rose-300 font-bold"
                          : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-brand-cyan hover:bg-zinc-800"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {validatingObs.feedback && (
                <div
                  className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    validatingObs.feedback.isValid
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  <p className="font-bold mb-0.5">
                    {validatingObs.feedback.isValid ? "✓ Standard Verified" : "✗ Regulatory Query"}
                  </p>
                  <p>{validatingObs.feedback.text}</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                onClick={() => setValidatingObs(null)}
                className="px-4 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-400 hover:text-white"
              >
                Close (Esc)
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
                <h3 className="text-base font-bold text-white">21 CFR Part 11 Electronic Signature</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {targetRoutingStation} EDC LOCK
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
                <IconShieldCheck className="h-4 w-4" /> Sign &amp; Lock CRF (Enter)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FDA BIMO Inspection Report Modal */}
      {bimoReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full rounded-2xl border border-emerald-500/50 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <IconShieldCheck className="h-6 w-6 text-emerald-400" />
                <div>
                  <h3 className="text-base font-bold text-white">FDA Bioresearch Monitoring (BIMO) Report</h3>
                  <span className="text-[10px] text-zinc-500">{bimoReport.runId} · {bimoReport.auditDate}</span>
                </div>
              </div>
              <button onClick={() => setBimoReport(null)} className="text-zinc-500 hover:text-white text-xs font-mono">
                ✕ ESC
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-mono">
              <div className="grid grid-cols-3 gap-3 bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-500 uppercase block">Compliance Score</span>
                  <span className="text-lg font-bold text-emerald-400">{bimoReport.overallScore}/100</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Clean Rate</span>
                  <span className="text-lg font-bold text-brand-cyan">{bimoReport.cleanRate}%</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">CRFs Processed</span>
                  <span className="text-lg font-bold text-white">{bimoReport.submittedCRFs}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">
                  Regulatory Determination
                </span>
                <p
                  className={`p-3 rounded-xl font-bold border ${
                    bimoReport.verdict.includes("NAI")
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : bimoReport.verdict.includes("VAI")
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                  }`}
                >
                  {bimoReport.verdict}
                </p>
                <p className="mt-2 text-zinc-400 leading-relaxed text-[11px]">{bimoReport.summary}</p>
              </div>

              {bimoReport.findings.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">
                    Inspection Findings ({bimoReport.findings.length})
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {bimoReport.findings.map((f) => (
                      <div
                        key={f.id}
                        className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                f.severity === "Critical"
                                  ? "bg-rose-500/20 text-rose-400"
                                  : f.severity === "Major"
                                  ? "bg-amber-500/20 text-amber-400"
                                  : "bg-blue-500/20 text-blue-400"
                              }`}
                            >
                              {f.severity}
                            </span>
                            <span className="font-bold text-zinc-300">{f.category}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-zinc-400">{f.description}</p>
                          <span className="text-[9px] text-zinc-500 block mt-0.5">{f.regulation}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-3">
              <div className="flex gap-2">
                <button
                  onClick={downloadODMXML}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-white"
                >
                  <IconDownload className="h-3.5 w-3.5" /> ODM XML
                </button>
                <button
                  onClick={downloadSDTMCSV}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl border border-zinc-800 bg-zinc-900 text-xs text-zinc-300 hover:text-white"
                >
                  <IconTable className="h-3.5 w-3.5" /> SDTM CSV
                </button>
              </div>
              <button
                onClick={() => setBimoReport(null)}
                className="px-5 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider hover:bg-emerald-400 transition"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Case Study Cross-Link */}
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
