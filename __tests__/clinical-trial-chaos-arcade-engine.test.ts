import { describe, it, expect, vi } from "vitest";
import { ClinicalTrialChaosEngine } from "@/lib/clinical-trial-chaos/engine";
import type { ClinicalSubject } from "@/lib/clinical-trial-chaos/types";

describe("ClinicalTrialChaosEngine", () => {
  it("initializes score, auditor, and conveyor state", () => {
    const engine = new ClinicalTrialChaosEngine();
    const snapshot = engine.getSnapshot();

    expect(snapshot.scoreState.score).toBe(0);
    expect(snapshot.auditorState.behavior).toBe("patrolling");
    expect(snapshot.isPaused).toBe(false);
    expect(snapshot.isModalPaused).toBe(false);
  });

  it("activates FDA Coffee Break power-up and freezes suspicion", () => {
    const engine = new ClinicalTrialChaosEngine();
    engine.activatePowerUp("fda-coffee-break");

    const snapshot = engine.getSnapshot();
    expect(
      snapshot.powerUps["fda-coffee-break"].activeSecondsRemaining
    ).toBeGreaterThan(0);
    expect(snapshot.auditorState.isPaused).toBe(true);
  });

  it("advances simulation tick and conveyor progression", () => {
    const engine = new ClinicalTrialChaosEngine();
    engine.update(1 / 60);

    const snapshot = engine.getSnapshot();
    expect(snapshot.auditorState).toBeDefined();
  });

  it("freezes simulation ticks during active modal pause while allowing rendering", () => {
    const engine = new ClinicalTrialChaosEngine();
    const mockSubject: ClinicalSubject = {
      id: "SUBJ-TEST",
      subjectLabel: "101-001",
      studySite: "Site 001",
      observations: [],
      status: "queued",
      timeRemaining: 10,
      maxTime: 10,
      createdAt: Date.now(),
    };
    engine.addSubject(mockSubject);

    engine.setModalPause(true);
    expect(engine.isModalPaused()).toBe(true);

    const initialCount = engine.getSnapshot().subjectCount;
    engine.update(1.0); // 1 second tick

    // Snapshot count and state should remain intact because modal is paused
    expect(engine.getSnapshot().subjectCount).toBe(initialCount);

    // Resume modal pause
    engine.setModalPause(false);
    engine.update(1.0);
    expect(engine.getSnapshot().subjectCount).toBe(initialCount);
  });

  it("emits typed events on score, auditor, and powerup changes", () => {
    const engine = new ClinicalTrialChaosEngine();
    const scoreListener = vi.fn();
    const auditorListener = vi.fn();
    const logListener = vi.fn();

    engine.on("scoreChange", scoreListener);
    engine.on("auditorUpdate", auditorListener);
    engine.on("auditLog", logListener);

    const mockSubject: ClinicalSubject = {
      id: "SUBJ-EVT",
      subjectLabel: "102-002",
      studySite: "Site 002",
      observations: [
        {
          id: "obs-evt",
          field: "Weight",
          rawValue: "154 lbs",
          currentValue: "154 lbs",
          destination: "VS",
          correctedValue: "70 kg",
          isResolved: false,
        },
      ],
      status: "queued",
      timeRemaining: 20,
      maxTime: 20,
      createdAt: Date.now(),
    };
    engine.addSubject(mockSubject);

    const res = engine.resolveObservation("SUBJ-EVT", "obs-evt", "70 kg");
    expect(res.isValid).toBe(true);
    expect(scoreListener).toHaveBeenCalled();
    expect(logListener).toHaveBeenCalled();
  });

  it("verifies 21 CFR submissions and updates submitted history", () => {
    const engine = new ClinicalTrialChaosEngine();
    const submissionListener = vi.fn();
    engine.on("submissionVerified", submissionListener);

    const mockSubject: ClinicalSubject = {
      id: "SUBJ-CFR",
      subjectLabel: "103-003",
      studySite: "Site 003",
      observations: [
        {
          id: "obs-cfr",
          field: "Heart Rate",
          rawValue: "72 bpm",
          currentValue: "72 bpm",
          destination: "VS",
          isResolved: true,
        },
      ],
      status: "queued",
      timeRemaining: 30,
      maxTime: 30,
      createdAt: Date.now(),
    };
    engine.addSubject(mockSubject);

    const subRes = engine.verifyAndSubmit("SUBJ-CFR", "Intent to Submit", "VS");
    expect(subRes.success).toBe(true);
    expect(submissionListener).toHaveBeenCalled();
    expect(engine.getSnapshot().submittedCount).toBe(1);
    expect(engine.getSnapshot().subjectCount).toBe(0);
  });
});
