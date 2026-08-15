import { describe, it, expect } from "vitest";
import { getFallacyDiagnosis } from "../lib/proof-utils";

describe("Formal Fallacy Diagnostic Engine & Truth Tables", () => {
  it("identifies Fallacy of Circular Reasoning when connecting a node to itself", () => {
    const diagnosis = getFallacyDiagnosis("C", "C", []);
    expect(diagnosis.fallacyName).toContain("Circular Reasoning");
    expect(diagnosis.formalFormula).toContain("P ⊢ P");
    expect(diagnosis.softwareAnalogy).toContain("Circular dependency");
    expect(diagnosis.truthTable.some((r) => r.isCounterexample)).toBe(true);
  });

  it("identifies Fallacy of Affirming the Consequent when wiring C -> A", () => {
    const diagnosis = getFallacyDiagnosis("C", "A", []);
    expect(diagnosis.fallacyName).toContain("Affirming the Consequent");
    expect(diagnosis.formalFormula).toContain("((P → Q) ∧ Q) ⊬ P");
    expect(diagnosis.truthTable.length).toBeGreaterThan(2);

    const counterexample = diagnosis.truthTable.find((r) => r.isCounterexample);
    expect(counterexample).toBeDefined();
    expect(counterexample?.p).toBe(false);
    expect(counterexample?.q).toBe(true);
    expect(counterexample?.conclusion).toBe(false);
  });

  it("identifies Fallacy of Denying the Antecedent when wiring A -> D", () => {
    const diagnosis = getFallacyDiagnosis("A", "D", []);
    expect(diagnosis.fallacyName).toContain("Denying the Antecedent");
    expect(diagnosis.formalFormula).toContain("((P → Q) ∧ ¬P) ⊬ ¬Q");
    expect(diagnosis.softwareAnalogy).toContain("¬P");
  });

  it("identifies Non Sequitur / Incompatible Terms for unconnected pairs", () => {
    const diagnosis = getFallacyDiagnosis("B", "D", []);
    expect(diagnosis.fallacyName).toContain("Incompatible Terms");
    expect(diagnosis.softwareAnalogy).toContain("Type mismatch");
  });
});
