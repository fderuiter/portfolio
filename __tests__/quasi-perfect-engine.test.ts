import { describe, it, expect } from "vitest";
import {
  cloneAST,
  findNodeById,
  replaceNode,
  areNodesEqual,
  renderASTString,
  evaluateArithmetic,
  simplifyNode,
  isProofComplete,
} from "../lib/quasi-perfect/engine";
import { tacticDefs } from "../lib/quasi-perfect/tactics";
import { puzzleLevels } from "../lib/quasi-perfect/levels";
import { ASTNode } from "../lib/quasi-perfect/types";

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

  it("evaluates arithmetic constants accurately", () => {
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
  });

  it("simplifies arithmetic identities and constants", () => {
    // x + 0 -> x
    const xPlusZero: ASTNode = {
      id: "add-0",
      type: "Operator",
      value: "+",
      children: [
        { id: "x", type: "Variable", value: "x" },
        { id: "0", type: "Constant", value: 0 },
      ],
    };
    const simplified = simplifyNode(xPlusZero);
    expect(simplified.changed).toBe(true);
    expect(simplified.node.type).toBe("Variable");
    expect(simplified.node.value).toBe("x");

    // 2 + 2 -> 4
    const twoPlusTwo: ASTNode = {
      id: "add-2",
      type: "Operator",
      value: "+",
      children: [
        { id: "2a", type: "Constant", value: 2 },
        { id: "2b", type: "Constant", value: 2 },
      ],
    };
    const simplified2 = simplifyNode(twoPlusTwo);
    expect(simplified2.changed).toBe(true);
    expect(simplified2.node.value).toBe(4);
  });
});

describe("Quasi-Perfect Puzzler Tactics & Level Solvability", () => {
  it("solves Level 1 (The Identity Crisis) with rfl", () => {
    const lvl = puzzleLevels[0];
    const targetNode = lvl.goal;
    const res = tacticDefs.rfl.execute(targetNode, lvl.goal, lvl.hypotheses);
    expect(res.success).toBe(true);
    expect(res.ramConsumed).toBe(1);
    expect(res.newAST?.type).toBe("Boolean");
    expect(res.newAST?.value).toBe(true);
    expect(isProofComplete(res.newAST!)).toBe(true);
  });

  it("fails rfl on unequal terms and consumes 1 GB RAM penalty", () => {
    const unequalGoal: ASTNode = {
      id: "eq",
      type: "Equality",
      value: "=",
      children: [
        { id: "a", type: "Variable", value: "a" },
        { id: "c", type: "Variable", value: "c" },
      ],
    };
    const res = tacticDefs.rfl.execute(unequalGoal, unequalGoal, []);
    expect(res.success).toBe(false);
    expect(res.ramConsumed).toBe(1);
    expect(res.message).toContain("type mismatch");
  });

  it("solves Level 2 (The Art of Substitution) via rw [h1] then rfl", () => {
    const lvl = puzzleLevels[1];
    let currentAST = cloneAST(lvl.goal);

    // Apply rw [h1] on 'a'
    const targetNodeA = findNodeById(currentAST, "var-a-goal")!;
    const rw1 = tacticDefs.rw.execute(targetNodeA, currentAST, lvl.hypotheses, "h1");
    expect(rw1.success).toBe(true);
    expect(rw1.ramConsumed).toBe(2);
    currentAST = rw1.newAST!;
    expect(renderASTString(currentAST)).toBe("b = c");

    // Apply rw [h2] on 'b'
    const targetNodeB = findNodeById(currentAST, "var-b-h1") || currentAST.children![0];
    const rw2 = tacticDefs.rw.execute(targetNodeB, currentAST, lvl.hypotheses, "h2");
    expect(rw2.success).toBe(true);
    currentAST = rw2.newAST!;
    expect(renderASTString(currentAST)).toBe("c = c");

    // Apply rfl
    const rflRes = tacticDefs.rfl.execute(currentAST, currentAST, lvl.hypotheses);
    expect(rflRes.success).toBe(true);
    expect(isProofComplete(rflRes.newAST!)).toBe(true);
  });

  it("solves Level 3 (Brute Force is Expensive) via optimal rw [add_zero] saving RAM", () => {
    const lvl = puzzleLevels[2];
    let currentAST = cloneAST(lvl.goal);

    // Using rw [add_zero] costs 2 GB
    const targetLHS = currentAST.children![0];
    const rwRes = tacticDefs.rw.execute(targetLHS, currentAST, lvl.hypotheses, "add_zero");
    expect(rwRes.success).toBe(true);
    expect(rwRes.ramConsumed).toBe(2);
    currentAST = rwRes.newAST!;
    expect(renderASTString(currentAST)).toBe("x = x");

    // Then rfl costs 1 GB (Total 3 GB <= 7 GB initial RAM -> Gold rating)
    const rflRes = tacticDefs.rfl.execute(currentAST, currentAST, lvl.hypotheses);
    expect(rflRes.success).toBe(true);
    expect(rflRes.ramConsumed).toBe(1);
    expect(isProofComplete(rflRes.newAST!)).toBe(true);
  });

  it("solves Level 4 (Concrete Reality) via decide", () => {
    const lvl = puzzleLevels[3];
    const decideRes = tacticDefs.decide.execute(lvl.goal, lvl.goal, lvl.hypotheses);
    expect(decideRes.success).toBe(true);
    expect(decideRes.ramConsumed).toBe(4);
    expect(isProofComplete(decideRes.newAST!)).toBe(true);
  });

  it("solves Level 5 (Odd Quasiperfect Candidate) via omega and linarith", () => {
    const lvl = puzzleLevels[4];
    const omegaRes = tacticDefs.omega.execute(lvl.goal, lvl.goal, lvl.hypotheses);
    expect(omegaRes.success).toBe(true);
    expect(omegaRes.ramConsumed).toBe(10);
    expect(isProofComplete(omegaRes.newAST!)).toBe(true);
  });

  it("handles sorry escape hatch with morality penalty", () => {
    const lvl = puzzleLevels[4];
    const sorryRes = tacticDefs.sorry.execute(lvl.goal, lvl.goal, lvl.hypotheses);
    expect(sorryRes.success).toBe(true);
    expect(sorryRes.ramConsumed).toBe(0);
    expect(sorryRes.message).toContain("Morality exception");
    expect(sorryRes.newAST?.metadata?.provedViaSorry).toBe(true);
    expect(isProofComplete(sorryRes.newAST!)).toBe(true);
  });
});
