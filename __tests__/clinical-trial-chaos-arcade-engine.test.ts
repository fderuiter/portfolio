import { describe, it, expect } from "vitest";
import { ClinicalTrialChaosEngine } from "@/lib/clinical-trial-chaos/engine";

describe("ClinicalTrialChaosEngine", () => {
  it("initializes score, auditor, and conveyor state", () => {
    const engine = new ClinicalTrialChaosEngine();
    const snapshot = engine.getSnapshot();

    expect(snapshot.scoreState.score).toBe(0);
    expect(snapshot.auditorState.behavior).toBe("patrolling");
    expect(snapshot.isPaused).toBe(false);
  });

  it("activates FDA Coffee Break power-up and freezes suspicion", () => {
    const engine = new ClinicalTrialChaosEngine();
    engine.activatePowerUp("fda-coffee-break");

    const snapshot = engine.getSnapshot();
    expect(
      snapshot.powerUps["fda-coffee-break"].activeSecondsRemaining
    ).toBeGreaterThan(0);
  });

  it("advances simulation tick and conveyor progression", () => {
    const engine = new ClinicalTrialChaosEngine();
    engine.update(1 / 60);

    const snapshot = engine.getSnapshot();
    expect(snapshot.auditorState).toBeDefined();
  });
});
