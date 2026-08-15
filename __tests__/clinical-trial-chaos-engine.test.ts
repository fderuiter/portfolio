import { describe, it, expect } from "vitest";
import {
  createInitialScoreState,
  createInitialAuditorState,
  fixObservation,
  isSubjectFullyCompliant,
  calculateSubmissionPoints,
  tickSubjectTimers,
  tickAuditor,
  scrambleStations,
  verify21CFRSubmission,
  formatAuditTimestamp,
  createAuditLogEntry,
} from "../lib/clinical-trial-chaos/engine";
import {
  SEEDED_SCENARIOS,
  INITIAL_STATIONS,
  generateClinicalSubject,
} from "../lib/clinical-trial-chaos/scenarios";
import { ClinicalSubject, StationConfig } from "../lib/clinical-trial-chaos/types";

describe("Clinical Trial Chaos Engine - Unit Tests", () => {
  it("initializes score state with zeroed values and multiplier 1", () => {
    const score = createInitialScoreState();
    expect(score.score).toBe(0);
    expect(score.multiplier).toBe(1);
    expect(score.combo).toBe(0);
    expect(score.subjectsSubmitted).toBe(0);
  });

  it("initializes auditor state with 0% suspicion in patrolling mode", () => {
    const auditor = createInitialAuditorState();
    expect(auditor.suspicion).toBe(0);
    expect(auditor.behavior).toBe("patrolling");
    expect(auditor.total483Citations).toBe(0);
  });

  it("formats audit timestamps with brackets", () => {
    const date = new Date(2026, 7, 14, 14, 2, 1);
    const formatted = formatAuditTimestamp(date);
    expect(formatted).toBe("[14:02:01]");
  });

  it("fixes an observation using the corrected value and marks it resolved", () => {
    const subject = SEEDED_SCENARIOS[0];
    const rawObs = subject.observations[0]; // Height: 180 m -> 180 cm
    expect(rawObs.isResolved).toBe(false);

    const { observation: fixedObs, isValid } = fixObservation(rawObs);
    expect(isValid).toBe(true);
    expect(fixedObs.isResolved).toBe(true);
    expect(fixedObs.currentValue).toBe("180 cm");
  });

  it("checks full subject compliance only when all observations are resolved", () => {
    const subjectWithErrors = JSON.parse(JSON.stringify(SEEDED_SCENARIOS[0])) as ClinicalSubject;
    expect(isSubjectFullyCompliant(subjectWithErrors)).toBe(false);

    // Fix all observations
    subjectWithErrors.observations.forEach((obs) => {
      obs.isResolved = true;
      obs.currentValue = obs.correctedValue ?? obs.rawValue;
    });

    expect(isSubjectFullyCompliant(subjectWithErrors)).toBe(true);
  });

  it("calculates submission points factoring in observations, speed bonus, SAE and multiplier", () => {
    const subject = JSON.parse(JSON.stringify(SEEDED_SCENARIOS[0])) as ClinicalSubject;
    subject.timeRemaining = 20;
    subject.maxTime = 40;

    const points = calculateSubmissionPoints(subject, 2, true);
    // Base 200 + 2*50 + (20/40)*100 (=50) + 0 + 100 = 450 * 2 = 900
    expect(points).toBe(900);
  });

  it("advances subject timers and detects expired subjects", () => {
    const subjects = [
      { ...SEEDED_SCENARIOS[0], timeRemaining: 1.5 },
      { ...SEEDED_SCENARIOS[1], timeRemaining: 10.0 },
    ];

    const { updatedSubjects, expiredSubjects } = tickSubjectTimers(subjects, 2.0);
    expect(expiredSubjects).toHaveLength(1);
    expect(expiredSubjects[0].subjectLabel).toBe("SUBJ-1001");
    expect(updatedSubjects).toHaveLength(1);
    expect(updatedSubjects[0].subjectLabel).toBe("SUBJ-1002");
    expect(updatedSubjects[0].timeRemaining).toBeCloseTo(8.0);
  });

  it("moves Auditor patrol and increases suspicion when backlog is high", () => {
    let auditor = createInitialAuditorState();
    auditor.suspicion = 10;

    // Delta 1 second with 6 backlog items (>4 items adds pressure)
    auditor = tickAuditor(auditor, 1.0, 6);
    expect(auditor.x).toBeGreaterThan(0.1);
    // Suspicion should increase from backlog pressure: 10 - 0.5 + (6-4)*0.8 = 10 - 0.5 + 1.6 = 11.1
    expect(auditor.suspicion).toBeCloseTo(11.1);
  });

  it("triggers FDA Form 483 when suspicion reaches 100%", () => {
    let auditor = createInitialAuditorState();
    auditor.suspicion = 99.5;
    auditor = tickAuditor(auditor, 2.0, 10);

    expect(auditor.suspicion).toBe(100);
    expect(auditor.behavior).toBe("issuing_483");
    expect(auditor.total483Citations).toBe(1);
  });

  it("scrambles station positions circularly", () => {
    const originalStations: StationConfig[] = JSON.parse(JSON.stringify(INITIAL_STATIONS));
    const scrambled = scrambleStations(originalStations);

    expect(scrambled[0].positionIndex).toBe(originalStations[1].positionIndex);
    expect(scrambled[3].positionIndex).toBe(originalStations[0].positionIndex);
  });

  it("verifies compliant 21 CFR Part 11 signature submission and cools suspicion", () => {
    const compliantSubject: ClinicalSubject = {
      ...SEEDED_SCENARIOS[0],
      observations: [
        {
          id: "obs-1",
          field: "Height",
          rawValue: "180 cm",
          currentValue: "180 cm",
          destination: "DM",
          isResolved: true,
        },
      ],
    };

    const result = verify21CFRSubmission(compliantSubject, "Intent to Submit", "DM");
    expect(result.success).toBe(true);
    expect(result.level).toBe("COMPLIANT");
    expect(result.suspicionDelta).toBe(-5);
  });

  it("rejects 21 CFR submission if observation has unverified raw data", () => {
    const dirtySubject: ClinicalSubject = {
      ...SEEDED_SCENARIOS[0],
      observations: [
        {
          id: "obs-1",
          field: "Height",
          rawValue: "180 m",
          currentValue: "180 m",
          destination: "DM",
          isResolved: false,
        },
      ],
    };

    const result = verify21CFRSubmission(dirtySubject, "Intent to Submit", "DM");
    expect(result.success).toBe(false);
    expect(result.level).toBe("CRITICAL");
    expect(result.suspicionDelta).toBe(25);
  });

  it("generates random clinical subjects with observations across known domains", () => {
    const subject = generateClinicalSubject(0.7, true, 2049);
    expect(subject.subjectLabel).toBe("SUBJ-2049");
    expect(subject.isSAE).toBe(true);
    expect(subject.observations.length).toBeGreaterThanOrEqual(2);
    expect(["DM", "VS", "AE", "LB"]).toContain(subject.observations[0].destination);
  });

  it("creates audit log entries with appropriate levels", () => {
    const log = createAuditLogEntry("User clicked raw data", "WARN", 15);
    expect(log.level).toBe("WARN");
    expect(log.suspicionDelta).toBe(15);
    expect(log.message).toContain("User clicked raw data");
  });
});
