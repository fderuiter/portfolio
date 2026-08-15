import {
  AuditLogEntry,
  AuditorState,
  CDISCDomain,
  ClinicalObservation,
  ClinicalSubject,
  GameScoreState,
  ProtocolAmendment,
  SignatureReason,
  StationConfig,
} from "./types";
import { AMENDMENT_PRESETS } from "./scenarios";

export function createInitialScoreState(): GameScoreState {
  return {
    score: 0,
    highScore: 0,
    combo: 0,
    maxCombo: 0,
    multiplier: 1,
    subjectsSubmitted: 0,
    correctionsMade: 0,
    cleanSubmissions: 0,
    auditViolations: 0,
  };
}

export function createInitialAuditorState(): AuditorState {
  return {
    x: 0.1,
    y: 0.5,
    direction: 1,
    behavior: "patrolling",
    suspicion: 0,
    suspicionDecayRate: 0.5, // 0.5% decay per second
    inspectTimer: 0,
    total483Citations: 0,
  };
}

export function formatAuditTimestamp(date = new Date()): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `[${h}:${m}:${s}]`;
}

export function createAuditLogEntry(
  message: string,
  level: "INFO" | "WARN" | "CRITICAL" | "COMPLIANT",
  suspicionDelta = 0
): AuditLogEntry {
  return {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: formatAuditTimestamp(),
    level,
    message,
    suspicionDelta,
  };
}

/**
 * Resolves or corrects a single clinical observation on a subject.
 */
export function fixObservation(
  observation: ClinicalObservation,
  suggestedCorrection?: string
): { observation: ClinicalObservation; isValid: boolean } {
  const target = suggestedCorrection ?? observation.correctedValue;
  if (!target) {
    // If no correction needed, already resolved
    return {
      observation: { ...observation, isResolved: true },
      isValid: true,
    };
  }

  // Check if valid correction
  const isValid = target === observation.correctedValue || target.trim().length > 0;
  return {
    observation: {
      ...observation,
      currentValue: target,
      isResolved: true,
    },
    isValid,
  };
}

/**
 * Validates whether all observations on a subject are resolved and compliant.
 */
export function isSubjectFullyCompliant(subject: ClinicalSubject): boolean {
  return subject.observations.every((obs) => obs.isResolved);
}

/**
 * Computes score delta for a successful subject submission.
 */
export function calculateSubmissionPoints(
  subject: ClinicalSubject,
  multiplier: number,
  allClean: boolean
): number {
  const basePoints = 200;
  const observationBonus = subject.observations.length * 50;
  const speedBonus = Math.floor((subject.timeRemaining / subject.maxTime) * 100);
  const saeBonus = subject.isSAE ? 250 : 0;
  const cleanBonus = allClean ? 100 : 0;

  return Math.round((basePoints + observationBonus + speedBonus + saeBonus + cleanBonus) * multiplier);
}

/**
 * Advances conveyor subjects timer by deltaSeconds.
 * If time runs out, returns expired subjects and suspicion increase.
 */
export function tickSubjectTimers(
  subjects: ClinicalSubject[],
  deltaSeconds: number
): {
  updatedSubjects: ClinicalSubject[];
  expiredSubjects: ClinicalSubject[];
} {
  const updated: ClinicalSubject[] = [];
  const expired: ClinicalSubject[] = [];

  for (const subject of subjects) {
    if (subject.status === "submitted" || subject.status === "rejected") {
      continue;
    }

    const nextTime = Math.max(0, subject.timeRemaining - deltaSeconds);
    if (nextTime <= 0 && subject.status !== "expired") {
      expired.push({ ...subject, timeRemaining: 0, status: "expired" });
    } else {
      updated.push({ ...subject, timeRemaining: nextTime });
    }
  }

  return { updatedSubjects: updated, expiredSubjects: expired };
}

/**
 * Updates Auditor AI physics and state machine.
 */
export function tickAuditor(
  auditor: AuditorState,
  deltaSeconds: number,
  unresolvedBacklogCount: number
): AuditorState {
  const { suspicion } = auditor;
  let { x, direction, behavior, inspectTimer, total483Citations } = auditor;

  // 1. Move patrol position across floor
  x += direction * 0.12 * deltaSeconds;
  if (x >= 0.9) {
    x = 0.9;
    direction = -1;
  } else if (x <= 0.1) {
    x = 0.1;
    direction = 1;
  }

  // 2. State machine transitions
  if (behavior === "patrolling") {
    inspectTimer += deltaSeconds;
    if (inspectTimer > 8) {
      behavior = "inspecting";
      inspectTimer = 0;
    }
  } else if (behavior === "inspecting") {
    inspectTimer += deltaSeconds;
    if (inspectTimer > 3) {
      behavior = suspicion > 50 ? "suspicious" : "patrolling";
      inspectTimer = 0;
    }
  } else if (behavior === "suspicious") {
    inspectTimer += deltaSeconds;
    if (inspectTimer > 5 && suspicion < 40) {
      behavior = "patrolling";
      inspectTimer = 0;
    }
  }

  // 3. Passive suspicion decay and backlog pressure
  let nextSuspicion = suspicion - auditor.suspicionDecayRate * deltaSeconds;
  if (unresolvedBacklogCount > 4) {
    // Backlog increases audit scrutiny
    nextSuspicion += (unresolvedBacklogCount - 4) * 0.8 * deltaSeconds;
  }

  nextSuspicion = Math.max(0, Math.min(100, nextSuspicion));

  if (nextSuspicion >= 100) {
    behavior = "issuing_483";
    total483Citations += 1;
  }

  return {
    ...auditor,
    x,
    direction,
    behavior,
    suspicion: nextSuspicion,
    inspectTimer,
    total483Citations,
  };
}

/**
 * Scrambles station positions (for Protocol Amendment event).
 */
export function scrambleStations(stations: StationConfig[]): StationConfig[] {
  const currentIndices = stations.map((s) => s.positionIndex);
  // Shift indices by 1
  const shiftedIndices = [...currentIndices.slice(1), currentIndices[0]];

  return stations.map((station, i) => ({
    ...station,
    positionIndex: shiftedIndices[i],
  }));
}

/**
 * Evaluates 21 CFR Part 11 Electronic Signature submission.
 */
export function verify21CFRSubmission(
  subject: ClinicalSubject,
  reason: SignatureReason | string,
  targetStation: CDISCDomain
): {
  success: boolean;
  suspicionDelta: number;
  logMessage: string;
  level: "COMPLIANT" | "WARN" | "CRITICAL";
} {
  const validReasons: SignatureReason[] = [
    "Intent to Submit",
    "Author Verification",
    "Protocol Compliance Review",
    "Urgent Safety Expedited",
  ];

  if (!validReasons.includes(reason as SignatureReason)) {
    return {
      success: false,
      suspicionDelta: 20,
      logMessage: `[AUDIT REJECT] 21 CFR Part 11 Lock violated for ${subject.subjectLabel}: Invalid signature reason '${reason}'`,
      level: "CRITICAL",
    };
  }

  // Check if unvalidated observations exist
  const hasUnresolved = subject.observations.some((obs) => !obs.isResolved);
  if (hasUnresolved) {
    return {
      success: false,
      suspicionDelta: 25,
      logMessage: `[AUDIT REJECT] ${subject.subjectLabel} submitted to ${targetStation} with UNVERIFIED raw data entries! Suspicion +25%`,
      level: "CRITICAL",
    };
  }

  // Check if subject has observations matching the target station domain
  const hasMatchingDomain = subject.observations.some((obs) => obs.destination === targetStation);
  if (!hasMatchingDomain) {
    return {
      success: false,
      suspicionDelta: 15,
      logMessage: `[AUDIT WARN] CDISC Domain Mismatch: ${subject.subjectLabel} routed to ${targetStation} with no matching domain observations!`,
      level: "WARN",
    };
  }

  return {
    success: true,
    suspicionDelta: -5, // Cools down suspicion
    logMessage: `[COMPLIANT] 21 CFR Part 11 Signature verified for ${subject.subjectLabel} -> ${targetStation} (${reason}). Auditor satisfied.`,
    level: "COMPLIANT",
  };
}

/**
 * Spawns a random mid-game protocol amendment.
 */
export function triggerRandomAmendment(): ProtocolAmendment {
  const picked = AMENDMENT_PRESETS[Math.floor(Math.random() * AMENDMENT_PRESETS.length)];
  return {
    ...picked,
    timeRemaining: picked.durationSeconds,
    active: true,
  };
}
