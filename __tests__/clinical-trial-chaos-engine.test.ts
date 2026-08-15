import { describe, it, expect } from "vitest";
import {
  createInitialScoreState,
  createInitialAuditorState,
  createInitialPowerUpInventory,
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
  formatAuditTimestamp,
  createAuditLogEntry,
  generateSDTMDataset,
  exportToCDISCODMXML,
  exportToSDTMCSV,
  generateBIMOReport,
} from "../lib/clinical-trial-chaos/engine";
import {
  SEEDED_SCENARIOS,
  INITIAL_STATIONS,
  getStationsForPhase,
  generateClinicalSubject,
  AMENDMENT_PRESETS,
} from "../lib/clinical-trial-chaos/scenarios";
import * as soundEffects from "../lib/clinical-trial-chaos/sound-effects";
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

  it("initializes power-up inventory with all 4 lifelines", () => {
    const inventory = createInitialPowerUpInventory();
    expect(inventory["fda-coffee-break"]).toBeDefined();
    expect(inventory["auto-clean"]).toBeDefined();
    expect(inventory["query-extension"]).toBeDefined();
    expect(inventory["fast-sign"]).toBeDefined();
    expect(inventory["fda-coffee-break"].hotkey).toBe("Q");
  });

  it("formats audit timestamps with brackets", () => {
    const date = new Date(2026, 7, 14, 14, 2, 1);
    const formatted = formatAuditTimestamp(date);
    expect(formatted).toBe("[14:02:01]");
  });

  it("validates multi-choice observation selections correctly", () => {
    const subject = SEEDED_SCENARIOS[0];
    const rawObs = subject.observations[0]; // Height: 180 m -> 180 cm

    // Test correct choice
    const correctRes = validateObservationChoice(rawObs, "180 cm");
    expect(correctRes.isValid).toBe(true);
    expect(correctRes.observation.isResolved).toBe(true);
    expect(correctRes.observation.currentValue).toBe("180 cm");
    expect(correctRes.scoreDelta).toBe(75);
    expect(correctRes.suspicionDelta).toBe(-3);

    // Test incorrect choice
    const incorrectRes = validateObservationChoice(rawObs, "1800 mm");
    expect(incorrectRes.isValid).toBe(false);
    expect(incorrectRes.observation.isResolved).toBe(false);
    expect(incorrectRes.scoreDelta).toBe(-25);
    expect(incorrectRes.suspicionDelta).toBe(8);
  });

  it("fixes an observation using fallback fixObservation", () => {
    const subject = SEEDED_SCENARIOS[0];
    const rawObs = subject.observations[0];
    const { observation: fixedObs, isValid } = fixObservation(rawObs);
    expect(isValid).toBe(true);
    expect(fixedObs.isResolved).toBe(true);
    expect(fixedObs.currentValue).toBe("180 cm");
  });

  it("checks full subject compliance only when all observations are resolved", () => {
    const subjectWithErrors = JSON.parse(JSON.stringify(SEEDED_SCENARIOS[0])) as ClinicalSubject;
    expect(isSubjectFullyCompliant(subjectWithErrors)).toBe(false);

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
    // Base 200 + 2*60 + (20/40)*120 (=60) + 0 + 150 = 530 * 2 = 1060
    expect(points).toBe(1060);
  });

  it("charges and ticks power-up meters", () => {
    let inventory = createInitialPowerUpInventory();
    expect(inventory["fda-coffee-break"].charge).toBe(0);

    inventory = chargePowerUps(inventory, 2);
    expect(inventory["fda-coffee-break"].charge).toBe(2);

    inventory["fda-coffee-break"].activeSecondsRemaining = 5;
    inventory = tickPowerUps(inventory, 2);
    expect(inventory["fda-coffee-break"].activeSecondsRemaining).toBe(3);
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

    auditor = tickAuditor(auditor, 1.0, 6);
    expect(auditor.x).toBeGreaterThan(0.1);
    expect(auditor.suspicion).toBeCloseTo(11.1);
  });

  it("pauses auditor patrol when behavior is coffee_break", () => {
    const auditor = createInitialAuditorState();
    auditor.behavior = "coffee_break";
    auditor.isPaused = true;
    auditor.x = 0.5;

    const updated = tickAuditor(auditor, 2.0, 10);
    expect(updated.x).toBe(0.5);
    expect(updated.behavior).toBe("coffee_break");
  });

  it("returns tiered stations for Phase 1 vs Phase 2", () => {
    const phase1Stations = getStationsForPhase(1);
    expect(phase1Stations).toHaveLength(4);
    expect(phase1Stations.map((s) => s.id)).toEqual(["DM", "VS", "AE", "LB"]);

    const phase2Stations = getStationsForPhase(2);
    expect(phase2Stations.length).toBeGreaterThanOrEqual(6);
    expect(phase2Stations.some((s) => s.id === "CM")).toBe(true);
    expect(phase2Stations.some((s) => s.id === "EX")).toBe(true);
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

  it("generates compliant SDTM dataset rows from clinical subjects", () => {
    const subjects = [
      {
        ...SEEDED_SCENARIOS[0],
        observations: [
          {
            id: "obs-1",
            field: "Height",
            rawValue: "180 cm",
            currentValue: "180 cm",
            destination: "DM" as const,
            ctCode: "HEIGHT",
            isResolved: true,
          },
          {
            id: "obs-2",
            field: "Systolic BP",
            rawValue: "120 mmHg",
            currentValue: "120 mmHg",
            destination: "VS" as const,
            ctCode: "SYSBP",
            isResolved: true,
          },
        ],
      },
    ];

    const rows = generateSDTMDataset(subjects);
    expect(rows).toHaveLength(2);
    expect(rows[0].DOMAIN).toBe("DM");
    expect(rows[0].TESTCD).toBe("HEIGHT");
    expect(rows[0].STRESC).toBe("180 cm");
    expect(rows[0].STRESN).toBe(180);
    expect(rows[0].STATUS).toBe("COMPLIANT");

    expect(rows[1].DOMAIN).toBe("VS");
    expect(rows[1].TESTCD).toBe("SYSBP");
    expect(rows[1].STRESN).toBe(120);
  });

  it("exports valid CDISC ODM 1.3 XML document", () => {
    const subjects = [SEEDED_SCENARIOS[0] as ClinicalSubject];
    const rows = generateSDTMDataset(subjects);
    const xml = exportToCDISCODMXML(subjects, rows);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<ODM xmlns="http://www.cdisc.org/ns/odm/v1.3"');
    expect(xml).toContain("STUDY.CT-CHAOS-2026");
    expect(xml).toContain(subjects[0].subjectLabel);
  });

  it("exports valid SDTM CSV text", () => {
    const subjects = [SEEDED_SCENARIOS[0] as ClinicalSubject];
    const rows = generateSDTMDataset(subjects);
    const csv = exportToSDTMCSV(rows);

    expect(csv).toContain("STUDYID,DOMAIN,USUBJID,SEQ,TESTCD,TEST,ORRES,STRESC,STRESN,STRESU,VISIT,DY,SIGNDATE,STATUS");
    expect(csv).toContain("CT-CHAOS-2026");
    expect(csv).toContain("DM");
  });

  it("generates FDA BIMO inspection report with regulatory determination", () => {
    const score = {
      ...createInitialScoreState(),
      subjectsSubmitted: 6,
      cleanSubmissions: 6,
      auditViolations: 0,
    };
    const auditor = createInitialAuditorState();
    const logs = [createAuditLogEntry("Audit passed", "COMPLIANT")];

    const report = generateBIMOReport(score, auditor, logs);
    expect(report.overallScore).toBe(100);
    expect(report.verdict).toContain("NAI (No Action Indicated - Approved)");
    expect(report.cleanRate).toBe(100);
  });

  it("generates BIMO inspection report with VAI and OAI verdicts based on violations", () => {
    // VAI verdict
    const vaiScore = {
      ...createInitialScoreState(),
      subjectsSubmitted: 10,
      cleanSubmissions: 7,
      auditViolations: 2,
    };
    const vaiAuditor = { ...createInitialAuditorState(), total483Citations: 1 };
    const vaiReport = generateBIMOReport(vaiScore, vaiAuditor, []);
    expect(vaiReport.verdict).toContain("VAI (Voluntary Action Indicated)");

    // OAI verdict
    const oaiScore = {
      ...createInitialScoreState(),
      subjectsSubmitted: 5,
      cleanSubmissions: 1,
      auditViolations: 8,
    };
    const oaiAuditor = { ...createInitialAuditorState(), total483Citations: 4 };
    const oaiReport = generateBIMOReport(oaiScore, oaiAuditor, []);
    expect(oaiReport.verdict).toContain("OAI (Official Action Indicated");

    const zeroSubmissionsReport = generateBIMOReport(createInitialScoreState(), createInitialAuditorState(), []);
    expect(zeroSubmissionsReport.cleanRate).toBe(100);
  });

  it("handles verify21CFRSubmission with non-compliant subjects or invalid domain", () => {
    const dirtySubject = JSON.parse(JSON.stringify(SEEDED_SCENARIOS[0])) as ClinicalSubject;
    const dirtyRes = verify21CFRSubmission(dirtySubject, "Intent to Submit", "DM");
    expect(dirtyRes.success).toBe(false);
    expect(dirtyRes.suspicionDelta).toBeGreaterThan(0);

    const wrongDomainRes = verify21CFRSubmission(dirtySubject, "Intent to Submit", "LB");
    expect(wrongDomainRes.success).toBe(false);
  });

  it("generates clinical subjects across diverse domains, error probabilities, and SAE modes", () => {
    expect(AMENDMENT_PRESETS.length).toBe(4);

    // Standard subject
    const subj1 = generateClinicalSubject(0.0, false, 2001, ["DM", "VS"]);
    expect(subj1.subjectLabel).toBe("SUBJ-2001");
    expect(subj1.observations.every((o) => o.isResolved)).toBe(true);

    // Corrupted subject
    const subj2 = generateClinicalSubject(1.0, false, 2002, ["DM", "VS", "AE", "LB"]);
    expect(subj2.subjectLabel).toBe("SUBJ-2002");
    expect(subj2.observations.some((o) => !o.isResolved)).toBe(true);

    // Force SAE subject
    const saeSubj = generateClinicalSubject(0.5, true, 2003, ["DM", "AE"]);
    expect(saeSubj.isSAE).toBe(true);
    expect(saeSubj.maxTime).toBe(22);
  });

  it("exercises sound-effects module safely with synthetic audio calls", () => {
    // In JSDOM / headless, window.AudioContext may be absent or mocked
    expect(() => soundEffects.playValidationSound()).not.toThrow();
    expect(() => soundEffects.playChoiceIncorrectSound()).not.toThrow();
    expect(() => soundEffects.playSignatureVerifiedSound()).not.toThrow();
    expect(() => soundEffects.playAuditErrorBuzz()).not.toThrow();
    expect(() => soundEffects.playAmendmentSirenSound()).not.toThrow();
    expect(() => soundEffects.playForm483AlarmSound()).not.toThrow();
    expect(() => soundEffects.playPowerUpSound()).not.toThrow();
    expect(() => soundEffects.playPneumaticChuteSound()).not.toThrow();
    expect(() => soundEffects.startProceduralBGM(200)).not.toThrow();
    expect(() => soundEffects.updateBGMTempo(50)).not.toThrow();
    expect(() => soundEffects.stopProceduralBGM()).not.toThrow();
  });
});
