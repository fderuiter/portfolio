import { describe, it, expect } from "vitest";
import {
  cloneAST,
  findNodeById,
  replaceNode,
  areNodesEqual,
  renderASTString,
  evaluateArithmetic,
  evaluateBooleanExpression,
  astToPolynomial,
  areRingEquivalent,
  areAllSubgoalsClosed,
  generateLeanProofScript,
} from "../lib/quasi-perfect/engine";
import { tacticDefs } from "../lib/quasi-perfect/tactics";
import { puzzleLevels } from "../lib/quasi-perfect/levels";
import { ASTNode, SubGoal } from "../lib/quasi-perfect/types";

describe("Quasi-Perfect Puzzler Engine Core", () => {
  it("clones AST deeply without sharing references", () => {
    const original: ASTNode = {
      id: "root",
      type: "Operator",
      value: "+",
      children: [
        { id: "left", type: "Variable", value: "x" },
        { id: "right", type: "Constant", value: 0 },
      ],
    };
    const cloned = cloneAST(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    expect(cloned.children![0]).not.toBe(original.children![0]);
  });

  it("finds nodes by id and replaces nodes accurately", () => {
    const tree: ASTNode = {
      id: "eq-root",
      type: "Equality",
      value: "=",
      children: [
        { id: "var-a", type: "Variable", value: "a" },
        { id: "var-c", type: "Variable", value: "c" },
      ],
    };

    const found = findNodeById(tree, "var-a");
    expect(found).not.toBeNull();
    expect(found?.value).toBe("a");

    const replacement: ASTNode = { id: "var-b", type: "Variable", value: "b" };
    const updated = replaceNode(tree, "var-a", replacement);
    expect(updated.children![0].value).toBe("b");
    expect(renderASTString(updated)).toBe("b = c");
  });

  it("checks deep structural equality between two subtrees", () => {
    const nodeA: ASTNode = {
      id: "1",
      type: "Operator",
      value: "+",
      children: [
        { id: "2", type: "Variable", value: "x" },
        { id: "3", type: "Constant", value: 5 },
      ],
    };
    const nodeB: ASTNode = {
      id: "99",
      type: "Operator",
      value: "+",
      children: [
        { id: "100", type: "Variable", value: "x" },
        { id: "101", type: "Constant", value: 5 },
      ],
    };
    const nodeC: ASTNode = {
      id: "102",
      type: "Operator",
      value: "+",
      children: [
        { id: "103", type: "Variable", value: "y" },
        { id: "104", type: "Constant", value: 5 },
      ],
    };

    expect(areNodesEqual(nodeA, nodeB)).toBe(true);
    expect(areNodesEqual(nodeA, nodeC)).toBe(false);
  });

  it("evaluates arithmetic constants and boolean expressions accurately", () => {
    const addExpr: ASTNode = {
      id: "add",
      type: "Operator",
      value: "+",
      children: [
        { id: "2", type: "Constant", value: 2 },
        { id: "3", type: "Constant", value: 3 },
      ],
    };
    expect(evaluateArithmetic(addExpr)).toBe(5);

    const multExpr: ASTNode = {
      id: "mult",
      type: "Operator",
      value: "*",
      children: [
        { id: "4", type: "Constant", value: 4 },
        { id: "5", type: "Constant", value: 5 },
      ],
    };
    expect(evaluateArithmetic(multExpr)).toBe(20);

    const conjExpr: ASTNode = {
      id: "conj",
      type: "Conjunction",
      value: "∧",
      children: [
        {
          id: "eq1",
          type: "Equality",
          value: "=",
          children: [
            { id: "c4", type: "Constant", value: 4 },
            { id: "c4b", type: "Constant", value: 4 },
          ],
        },
        {
          id: "ineq1",
          type: "Inequality",
          value: ">",
          children: [
            { id: "c10", type: "Constant", value: 10 },
            { id: "c2", type: "Constant", value: 2 },
          ],
        },
      ],
    };
    expect(evaluateBooleanExpression(conjExpr)).toBe(true);
  });

  it("proves polynomial ring equivalence via areRingEquivalent", () => {
    // (a + b)^2
    const polyLHS: ASTNode = {
      id: "lhs",
      type: "Operator",
      value: "^",
      children: [
        {
          id: "add",
          type: "Operator",
          value: "+",
          children: [
            { id: "a", type: "Variable", value: "a" },
            { id: "b", type: "Variable", value: "b" },
          ],
        },
        { id: "2", type: "Constant", value: 2 },
      ],
    };

    // a^2 + 2*a*b + b^2
    const polyRHS: ASTNode = {
      id: "rhs",
      type: "Operator",
      value: "+",
      children: [
        {
          id: "a2",
          type: "Operator",
          value: "^",
          children: [
            { id: "a_r", type: "Variable", value: "a" },
            { id: "2_r", type: "Constant", value: 2 },
          ],
        },
        {
          id: "mid",
          type: "Operator",
          value: "+",
          children: [
            {
              id: "2ab",
              type: "Operator",
              value: "*",
              children: [
                {
                  id: "2a",
                  type: "Operator",
                  value: "*",
                  children: [
                    { id: "c2", type: "Constant", value: 2 },
                    { id: "a_m", type: "Variable", value: "a" },
                  ],
                },
                { id: "b_m", type: "Variable", value: "b" },
              ],
            },
            {
              id: "b2",
              type: "Operator",
              value: "^",
              children: [
                { id: "b_r", type: "Variable", value: "b" },
                { id: "2_r2", type: "Constant", value: 2 },
              ],
            },
          ],
        },
      ],
    };

    expect(areRingEquivalent(polyLHS, polyRHS)).toBe(true);
  });

  it("checks areAllSubgoalsClosed accurately", () => {
    const sg1: SubGoal = {
      id: "1",
      label: "Goal 1",
      goal: { id: "b1", type: "Boolean", value: true },
      hypotheses: [],
      isCompleted: true,
    };
    const sg2: SubGoal = {
      id: "2",
      label: "Goal 2",
      goal: { id: "b2", type: "Boolean", value: true },
      hypotheses: [],
      isCompleted: true,
    };
    const sg3: SubGoal = {
      id: "3",
      label: "Goal 3",
      goal: { id: "b3", type: "Variable", value: "P" },
      hypotheses: [],
      isCompleted: false,
    };

    expect(areAllSubgoalsClosed([sg1, sg2])).toBe(true);
    expect(areAllSubgoalsClosed([sg1, sg3])).toBe(false);
  });

  it("generates clean, syntactically valid Lean 4 proof scripts", () => {
    const lvl = puzzleLevels[0];
    const script = generateLeanProofScript(
      lvl,
      [
        {
          id: "1",
          tacticId: "rfl",
          leanLine: "rfl",
          explanation: "reflexivity",
          goalBefore: "x = x",
          goalAfter: "True",
        },
      ],
      true
    );

    expect(script).toContain("theorem identity_crisis (x : Nat) : x = x := by");
    expect(script).toContain("  rfl");
    expect(script).toContain("  -- Q.E.D. Goal closed! 🚀");
  });
});

describe("Quasi-Perfect Puzzler Expanded Tactics", () => {
  it("executes intro tactic on implication", () => {
    const impGoal: ASTNode = {
      id: "imp",
      type: "Implication",
      value: "→",
      children: [
        { id: "P", type: "Variable", value: "P" },
        { id: "Q", type: "Variable", value: "Q" },
      ],
    };

    const res = tacticDefs.intro.execute(impGoal, impGoal, [], "h1");
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(2);
    expect(res.newHypotheses?.length).toBe(1);
    expect(res.newHypotheses![0].metadata?.name).toBe("h1");
    expect(res.newAST?.value).toBe("Q");
    expect(res.leanProofStep).toBe("intro h1");
  });

  it("executes apply tactic for modus ponens backwards reasoning", () => {
    const hypImp: ASTNode = {
      id: "h_imp",
      type: "Implication",
      value: "→",
      metadata: { name: "h_imp" },
      children: [
        { id: "P", type: "Variable", value: "P" },
        { id: "Q", type: "Variable", value: "Q" },
      ],
    };
    const goalQ: ASTNode = { id: "goal-q", type: "Variable", value: "Q" };

    const res = tacticDefs.apply.execute(goalQ, goalQ, [hypImp], "h_imp");
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(3);
    expect(res.newAST?.value).toBe("P");
    expect(res.leanProofStep).toBe("apply h_imp");
  });

  it("executes exact tactic to close goal from hypothesis", () => {
    const hypP: ASTNode = {
      id: "h_p",
      type: "Variable",
      value: "P",
      metadata: { name: "h_p" },
    };
    const goalP: ASTNode = { id: "goal-p", type: "Variable", value: "P" };

    const res = tacticDefs.exact.execute(goalP, goalP, [hypP], "h_p");
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(1);
    expect(res.isProofComplete).toBe(true);
    expect(res.leanProofStep).toBe("exact h_p");
  });

  it("executes cases tactic splitting disjunction into 2 subgoals", () => {
    const hypOr: ASTNode = {
      id: "h_or",
      type: "Disjunction",
      value: "∨",
      metadata: { name: "h_or" },
      children: [
        { id: "P", type: "Variable", value: "P" },
        { id: "Q", type: "Variable", value: "Q" },
      ],
    };
    const goalRoot: ASTNode = { id: "goal-root", type: "Variable", value: "R" };

    const res = tacticDefs.cases.execute(goalRoot, goalRoot, [hypOr], "h_or");
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(4);
    expect(res.newSubGoals?.length).toBe(2);
    expect(res.newSubGoals![0].label).toContain("Case 1: P");
    expect(res.newSubGoals![1].label).toContain("Case 2: Q");
    expect(res.leanProofStep).toBe("cases h_or with h_left h_right");
  });

  it("executes ring tactic on binomial expansion (Level 4)", () => {
    const lvl4 = puzzleLevels[3];
    const res = tacticDefs.ring.execute(lvl4.goal, lvl4.goal, lvl4.hypotheses);
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(4);
    expect(res.isProofComplete).toBe(true);
    expect(res.leanProofStep).toBe("ring");
  });

  it("executes norm_num on compound boolean/arithmetic (Level 8)", () => {
    const lvl8 = puzzleLevels[7];
    const res = tacticDefs.norm_num.execute(lvl8.goal, lvl8.goal, lvl8.hypotheses);
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(3);
    expect(res.isProofComplete).toBe(true);
    expect(res.leanProofStep).toBe("norm_num");
  });
});

describe("Quasi-Perfect Puzzler 3-Chapter Level Solvability", () => {
  it("solves all 11 campaign levels with valid tactics", () => {
    // Chapter 1: Level 1 (rfl)
    const l1 = puzzleLevels[0];
    expect(tacticDefs.rfl.execute(l1.goal, l1.goal, []).success).toBe(true);

    // Chapter 1: Level 2 (rw + rfl)
    const l2 = puzzleLevels[1];
    let a2 = cloneAST(l2.goal);
    a2 = tacticDefs.rw.execute(a2.children![0], a2, l2.hypotheses, "h1").newAST!;
    a2 = tacticDefs.rw.execute(a2.children![0], a2, l2.hypotheses, "h2").newAST!;
    expect(tacticDefs.rfl.execute(a2, a2, l2.hypotheses).success).toBe(true);

    // Chapter 1: Level 3 (rw [add_zero] + rfl)
    const l3 = puzzleLevels[2];
    let a3 = cloneAST(l3.goal);
    a3 = tacticDefs.rw.execute(a3.children![0], a3, l3.hypotheses, "add_zero").newAST!;
    expect(tacticDefs.rfl.execute(a3, a3, l3.hypotheses).success).toBe(true);

    // Chapter 1: Level 4 (ring)
    const l4 = puzzleLevels[3];
    expect(tacticDefs.ring.execute(l4.goal, l4.goal, []).success).toBe(true);

    // Chapter 2: Level 5 (intro + exact)
    const l5 = puzzleLevels[4];
    const intro5 = tacticDefs.intro.execute(l5.goal, l5.goal, l5.hypotheses, "h");
    expect(intro5.success).toBe(true);
    const exact5 = tacticDefs.exact.execute(
      intro5.newAST!,
      intro5.newAST!,
      intro5.newHypotheses!,
      "h"
    );
    expect(exact5.success).toBe(true);

    // Chapter 2: Level 6 (apply + exact)
    const l6 = puzzleLevels[5];
    const apply6 = tacticDefs.apply.execute(l6.goal, l6.goal, l6.hypotheses, "h_imp");
    expect(apply6.success).toBe(true);
    const exact6 = tacticDefs.exact.execute(
      apply6.newAST!,
      apply6.newAST!,
      l6.hypotheses,
      "h_p"
    );
    expect(exact6.success).toBe(true);

    // Chapter 2: Level 7 (cases)
    const l7 = puzzleLevels[6];
    const cases7 = tacticDefs.cases.execute(l7.goal, l7.goal, l7.hypotheses, "h_or");
    expect(cases7.success).toBe(true);
    expect(cases7.newSubGoals?.length).toBe(2);

    // Chapter 2: Level 8 (norm_num)
    const l8 = puzzleLevels[7];
    expect(tacticDefs.norm_num.execute(l8.goal, l8.goal, []).success).toBe(true);

    // Chapter 3: Level 9 (omega)
    const l9 = puzzleLevels[8];
    expect(tacticDefs.omega.execute(l9.goal, l9.goal, l9.hypotheses).success).toBe(true);

    // Chapter 3: Level 10 (rw [h_def] + linarith)
    const l10 = puzzleLevels[9];
    const rw10 = tacticDefs.rw.execute(l10.goal.children![0], l10.goal, l10.hypotheses, "h_def");
    expect(rw10.success).toBe(true);
    const lin10 = tacticDefs.linarith.execute(rw10.newAST!, rw10.newAST!, l10.hypotheses);
    expect(lin10.success).toBe(true);

    // Chapter 3: Level 11 Capstone (rw [h_sig] + ring)
    const l11 = puzzleLevels[10];
    const rw11 = tacticDefs.rw.execute(
      l11.goal.children![0].children![0].children![0],
      l11.goal,
      l11.hypotheses,
      "h_sig"
    );
    expect(rw11.success).toBe(true);
    const ring11 = tacticDefs.ring.execute(rw11.newAST!, rw11.newAST!, l11.hypotheses);
    expect(ring11.success).toBe(true);
  });

  it("generates Lean 4 proof scripts for completed and in-progress proofs", () => {
    const l1 = puzzleLevels[0];
    const scriptEmpty = generateLeanProofScript(l1, [], false);
    expect(scriptEmpty).toContain("sorry -- Goal open");

    const scriptDone = generateLeanProofScript(
      l1,
      [
        {
          id: "step-1",
          tacticId: "rfl",
          leanLine: "rfl",
          explanation: "Reflexivity closes trivial equalities",
          goalBefore: "x = x",
          goalAfter: "True",
        },
      ],
      true
    );
    expect(scriptDone).toContain("theorem identity_crisis");
    expect(scriptDone).toContain("  rfl");
    expect(scriptDone).toContain("Q.E.D.");
  });

  it("handles tactic error branches for intro, exact, apply, cases, and norm_num", () => {
    const nonImp: ASTNode = { id: "1", type: "Variable", value: "P" };
    expect(tacticDefs.intro.execute(nonImp, nonImp, []).success).toBe(false);

    expect(tacticDefs.exact.execute(nonImp, nonImp, [], "missing").success).toBe(false);

    expect(tacticDefs.apply.execute(nonImp, nonImp, [], "missing").success).toBe(false);

    expect(tacticDefs.cases.execute(nonImp, nonImp, [], "missing").success).toBe(false);

    expect(tacticDefs.norm_num.execute(nonImp, nonImp, []).success).toBe(false);

    // sorry tactic
    const sorryRes = tacticDefs.sorry.execute(nonImp, nonImp, []);
    expect(sorryRes.success).toBe(true);
    expect(sorryRes.leanProofStep).toBe("sorry");
  });

  it("converts AST nodes to canonical polynomials and tests ring equivalence", () => {
    const const0: ASTNode = { id: "c0", type: "Constant", value: 0 };
    expect(astToPolynomial(const0)).toEqual({});

    const const5: ASTNode = { id: "c5", type: "Constant", value: 5 };
    expect(astToPolynomial(const5)).toEqual({ "": 5 });

    const negX: ASTNode = {
      id: "neg",
      type: "Operator",
      value: "-",
      children: [{ id: "x", type: "Variable", value: "x" }],
    };
    expect(astToPolynomial(negX)).toEqual({ x: -1 });

    const diff: ASTNode = {
      id: "diff",
      type: "Operator",
      value: "-",
      children: [
        { id: "x", type: "Variable", value: "x" },
        { id: "c2", type: "Constant", value: 2 },
      ],
    };
    expect(astToPolynomial(diff)).toEqual({ x: 1, "": -2 });

    const pow: ASTNode = {
      id: "pow",
      type: "Operator",
      value: "^",
      children: [
        { id: "x", type: "Variable", value: "x" },
        { id: "exp", type: "Constant", value: 2 },
      ],
    };
    expect(astToPolynomial(pow)).toEqual({ "x^2": 1 });

    expect(areRingEquivalent(const5, const5)).toBe(true);
    expect(areRingEquivalent(const5, const0)).toBe(false);
  });
});
