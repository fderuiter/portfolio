import { describe, it, expect } from "vitest";
import {
  THEOREMS,
  evaluateProofStatus,
  canConnect,
  getNextTacticHint,
  getDeductionLedger,
  applyRuleToAsts,
  parseFormula,
  formatFormula,
  type TheoremId,
} from "../lib/proof-utils";

describe("Formal Theorem Library & Multi-Theorem Validation", () => {
  const coreTheoremIds: TheoremId[] = [
    "modus-ponens",
    "modus-tollens",
    "hypothetical-syllogism",
    "disjunctive-syllogism",
    "resolution",
  ];

  it("registers all distinct theorems with complete specifications", () => {
    expect(Object.keys(THEOREMS).length).toBeGreaterThanOrEqual(5);
    coreTheoremIds.forEach((id) => {
      const th = THEOREMS[id];
      expect(th).toBeDefined();
      expect(th.title).toBeTruthy();
      expect(th.nodes).toHaveLength(5);
      expect(th.initialEdges).toHaveLength(2);
      expect(th.validPairs.length).toBeGreaterThan(0);
      expect(th.leanCode).toContain("theorem");
      expect(th.latexCode).toContain("\\begin{prooftree}");
      expect(th.simulationSteps.length).toBeGreaterThan(5);
    });
  });

  describe("Modus Tollens (Memory Safety)", () => {
    it("correctly starts with intermediate Node C proven from initial edges", () => {
      const th = THEOREMS["modus-tollens"];
      const status = evaluateProofStatus(th.initialEdges, "modus-tollens");
      expect(status.isC_Proven).toBe(true);
      expect(status.isE_Proven).toBe(false);
    });

    it("evaluates to Q.E.D. when C and D are wired to E", () => {
      const edges = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
        { source: "C", target: "E" },
        { source: "D", target: "E" },
      ];
      const status = evaluateProofStatus(edges, "modus-tollens");
      expect(status.isC_Proven).toBe(true);
      expect(status.isE_Proven).toBe(true);

      const hint = getNextTacticHint(edges, "modus-tollens");
      expect(hint.isCompleted).toBe(true);
      expect(hint.title).toContain("Q.E.D.");
    });
  });

  describe("Hypothetical Syllogism (Service SLA Chaining)", () => {
    it("provides contextual tactic hints through each step", () => {
      const hint1 = getNextTacticHint([], "hypothetical-syllogism");
      expect(hint1.stepNumber).toBe(1);
      expect(hint1.suggestedSource).toBe("A");
      expect(hint1.suggestedTarget).toBe("C");

      // Has req1 but missing req2
      const hint1b = getNextTacticHint([{ source: "A", target: "C" }], "hypothetical-syllogism");
      expect(hint1b.stepNumber).toBe(1);
      expect(hint1b.suggestedSource).toBe("B");

      const edgesPartial = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
      ];
      const hint2 = getNextTacticHint(edgesPartial, "hypothetical-syllogism");
      expect(hint2.stepNumber).toBe(2);
      expect(hint2.suggestedSource).toBe("C");
      expect(hint2.suggestedTarget).toBe("E");

      // Has cReq1 but missing cReq2
      const hint2b = getNextTacticHint(
        [
          { source: "A", target: "C" },
          { source: "B", target: "C" },
          { source: "C", target: "E" },
        ],
        "hypothetical-syllogism"
      );
      expect(hint2b.stepNumber).toBe(2);
      expect(hint2b.suggestedSource).toBe("D");

      // Fully complete
      const hint3 = getNextTacticHint(
        [
          { source: "A", target: "C" },
          { source: "B", target: "C" },
          { source: "C", target: "E" },
          { source: "D", target: "E" },
        ],
        "hypothetical-syllogism"
      );
      expect(hint3.isCompleted).toBe(true);
    });
  });

  describe("Disjunctive Syllogism (Consensus Failover)", () => {
    it("allows valid pairs and rejects invalid connections", () => {
      expect(canConnect("A", "C", [], "disjunctive-syllogism").allowed).toBe(true);
      expect(canConnect("B", "C", [], "disjunctive-syllogism").allowed).toBe(true);
      expect(canConnect("C", "E", [], "disjunctive-syllogism").allowed).toBe(true);
      expect(canConnect("D", "E", [], "disjunctive-syllogism").allowed).toBe(true);

      expect(canConnect("A", "E", [], "disjunctive-syllogism").allowed).toBe(false);
      expect(canConnect("B", "D", [], "disjunctive-syllogism").allowed).toBe(false);
    });
  });

  describe("Resolution Refutation (Deadlock Safety)", () => {
    it("generates complete deduction ledger table with status flags", () => {
      const edges = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
        { source: "C", target: "E" },
        { source: "D", target: "E" },
      ];
      const ledger = getDeductionLedger(edges, "resolution");
      expect(ledger).toHaveLength(5);
      expect(ledger[0].formula).toBe("P ∨ Q");
      expect(ledger[2].isProven).toBe(true);
      expect(ledger[4].isProven).toBe(true);
      expect(ledger[4].rule).toBe("Modus Ponens");
    });
  });

  describe("Two-Phase Commit (2PC) & Quorum Overlap Scenarios", () => {
    it("supports 2PC distributed transaction invariants", () => {
      const th = THEOREMS["two-phase-commit"];
      expect(th).toBeDefined();
      expect(th.category).toBe("Distributed Systems");
      expect(th.title).toContain("Two-Phase Commit");

      const edges = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
        { source: "C", target: "E" },
        { source: "D", target: "E" },
      ];
      const status = evaluateProofStatus(edges, "two-phase-commit");
      expect(status.isE_Proven).toBe(true);
    });

    it("evaluates AST rule applications accurately", () => {
      const astP = parseFormula("P");
      const astImp = parseFormula("P -> Q");
      expect(astP).toBeDefined();
      expect(astImp).toBeDefined();

      const mpResult = applyRuleToAsts("mp", [astP!, astImp!]);
      expect(mpResult.success).toBe(true);
      expect(formatFormula(mpResult.resultAst!)).toBe("Q");
    });
  });
});
