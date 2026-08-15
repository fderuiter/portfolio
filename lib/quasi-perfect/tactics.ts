import { ASTNode, TacticDef } from "./types";
import {
  areNodesEqual,
  evaluateArithmetic,
  findNodeById,
  isConcreteExpression,
  renderASTString,
  replaceNode,
  simplifyNode,
} from "./engine";

export const tacticDefs: Record<string, TacticDef> = {
  rfl: {
    id: "rfl",
    name: "rfl",
    label: "rfl",
    description: "Close goal by reflexivity if LHS equals RHS.",
    baseRamCost: 1,
    failureCost: 1,
    execute: (targetNode, globalAST) => {
      // If user dropped rfl on globalAST or equality node
      const nodeToTest = targetNode.type === "Equality" ? targetNode : globalAST;

      if (nodeToTest.type !== "Equality" || !nodeToTest.children || nodeToTest.children.length !== 2) {
        return {
          success: false,
          ramConsumed: 1,
          message: "error: 'rfl' failed: target is not an equality (lhs = rhs).",
        };
      }

      const [left, right] = nodeToTest.children;
      if (areNodesEqual(left, right)) {
        const trueNode: ASTNode = {
          id: `qed-${Date.now()}`,
          type: "Boolean",
          value: true,
        };
        const newAST = replaceNode(globalAST, nodeToTest.id, trueNode);
        return {
          success: true,
          newAST,
          ramConsumed: 1,
          message: "tactic 'rfl' succeeded: equality proven by reflexivity.",
          isProofComplete: newAST.type === "Boolean" && newAST.value === true,
        };
      }

      return {
        success: false,
        ramConsumed: 1,
        message: `error: type mismatch, expected '${renderASTString(left)} = ${renderASTString(left)}', got '${renderASTString(left)} = ${renderASTString(right)}'. Reflexivity requires absolute equality.`,
      };
    },
  },

  rw: {
    id: "rw",
    name: "rw",
    label: "rw",
    description: "Rewrite a sub-expression using an active hypothesis.",
    baseRamCost: 2,
    failureCost: 1,
    execute: (targetNode, globalAST, hypotheses, arg) => {
      if (!hypotheses || hypotheses.length === 0) {
        return {
          success: false,
          ramConsumed: 1,
          message: "error: tactic 'rw' failed. No hypotheses available in context.",
        };
      }

      // Find matching hypothesis by name (arg) or check all hypotheses
      let matchedHypothesis: ASTNode | undefined;
      if (arg) {
        matchedHypothesis = hypotheses.find(
          (h) => (h.metadata?.name as string)?.toLowerCase() === arg.toLowerCase() || h.id === arg
        );
      }

      if (!matchedHypothesis) {
        matchedHypothesis = hypotheses.find(
          (h) =>
            h.type === "Equality" &&
            h.children?.length === 2 &&
            (areNodesEqual(h.children[0], targetNode) || areNodesEqual(h.children[1], targetNode))
        );
      }

      if (!matchedHypothesis || matchedHypothesis.type !== "Equality" || !matchedHypothesis.children || matchedHypothesis.children.length !== 2) {
        return {
          success: false,
          ramConsumed: 1,
          message: `error: tactic 'rw' failed. Target '${renderASTString(targetNode)}' does not match hypothesis ${arg ? `[${arg}]` : "context"}.`,
        };
      }

      const [hypLHS, hypRHS] = matchedHypothesis.children;
      let replacement: ASTNode | null = null;

      if (areNodesEqual(targetNode, hypLHS)) {
        replacement = hypRHS;
      } else if (areNodesEqual(targetNode, hypRHS)) {
        replacement = hypLHS;
      }

      if (!replacement) {
        return {
          success: false,
          ramConsumed: 1,
          message: `error: tactic 'rw' failed. Sub-expression '${renderASTString(targetNode)}' does not match pattern '${renderASTString(hypLHS)} = ${renderASTString(hypRHS)}'.`,
        };
      }

      const newAST = replaceNode(globalAST, targetNode.id, replacement);
      return {
        success: true,
        newAST,
        ramConsumed: 2,
        message: `tactic 'rw [${matchedHypothesis.metadata?.name || "h"}]' succeeded: substituted '${renderASTString(targetNode)}' with '${renderASTString(replacement)}'.`,
      };
    },
  },

  simp: {
    id: "simp",
    name: "simp",
    label: "simp",
    description: "Aggressively simplify arithmetic, algebraic identities, and constants.",
    baseRamCost: 6,
    failureCost: 1,
    execute: (targetNode, globalAST) => {
      const target = targetNode.id === globalAST.id ? globalAST : (findNodeById(globalAST, targetNode.id) || targetNode);
      const { node: simplifiedSubtree, changed } = simplifyNode(target);

      if (!changed) {
        return {
          success: false,
          ramConsumed: 1,
          message: "warning: 'simp' made no progress. 6 GB of RAM was heated up for absolutely nothing.",
        };
      }

      const newAST = replaceNode(globalAST, target.id, simplifiedSubtree);
      const isComplete = newAST.type === "Boolean" && newAST.value === true;

      return {
        success: true,
        newAST,
        ramConsumed: 6,
        message: `tactic 'simp' succeeded: expression simplified to '${renderASTString(newAST)}'.`,
        isProofComplete: isComplete,
      };
    },
  },

  decide: {
    id: "decide",
    name: "decide",
    label: "decide",
    description: "Evaluate a decidable, concrete arithmetic proposition to True.",
    baseRamCost: 4,
    failureCost: 1,
    execute: (targetNode, globalAST) => {
      const nodeToTest = targetNode.type === "Equality" || targetNode.type === "Inequality" ? targetNode : globalAST;

      if (!isConcreteExpression(nodeToTest)) {
        return {
          success: false,
          ramConsumed: 1,
          message: "error: tactic 'decide' failed. Expression contains free variables and is not decidable by finite computation.",
        };
      }

      if (nodeToTest.type === "Equality" && nodeToTest.children?.length === 2) {
        const leftVal = evaluateArithmetic(nodeToTest.children[0]);
        const rightVal = evaluateArithmetic(nodeToTest.children[1]);

        if (leftVal !== null && rightVal !== null && leftVal === rightVal) {
          const trueNode: ASTNode = {
            id: `decide-${Date.now()}`,
            type: "Boolean",
            value: true,
          };
          const newAST = replaceNode(globalAST, nodeToTest.id, trueNode);
          return {
            success: true,
            newAST,
            ramConsumed: 4,
            message: `tactic 'decide' succeeded: ${leftVal} = ${rightVal} verified computationally.`,
            isProofComplete: newAST.type === "Boolean" && newAST.value === true,
          };
        }
      }

      if (nodeToTest.type === "Inequality" && nodeToTest.children?.length === 2) {
        const leftVal = evaluateArithmetic(nodeToTest.children[0]);
        const rightVal = evaluateArithmetic(nodeToTest.children[1]);

        if (leftVal !== null && rightVal !== null) {
          const op = nodeToTest.value;
          let isValid = false;
          if (op === "≤" || op === "<=") isValid = leftVal <= rightVal;
          if (op === "<") isValid = leftVal < rightVal;
          if (op === "≥" || op === ">=") isValid = leftVal >= rightVal;
          if (op === ">") isValid = leftVal > rightVal;

          if (isValid) {
            const trueNode: ASTNode = {
              id: `decide-${Date.now()}`,
              type: "Boolean",
              value: true,
            };
            const newAST = replaceNode(globalAST, nodeToTest.id, trueNode);
            return {
              success: true,
              newAST,
              ramConsumed: 4,
              message: `tactic 'decide' succeeded: ${leftVal} ${op} ${rightVal} verified computationally.`,
              isProofComplete: newAST.type === "Boolean" && newAST.value === true,
            };
          }
        }
      }

      return {
        success: false,
        ramConsumed: 1,
        message: "error: tactic 'decide' evaluated proposition to False.",
      };
    },
  },

  omega: {
    id: "omega",
    name: "omega",
    label: "omega",
    description: "Solve linear integer arithmetic inequalities over Presburger arithmetic.",
    baseRamCost: 10,
    failureCost: 1,
    execute: (targetNode, globalAST) => {
      const nodeToTest = targetNode.type === "Inequality" || targetNode.type === "Equality" ? targetNode : globalAST;

      // Check if expression contains nonlinear terms
      const rendered = renderASTString(nodeToTest);
      if (rendered.includes("σ") || rendered.includes("^") || rendered.includes("x * x")) {
        return {
          success: false,
          ramConsumed: 1,
          message: "error: omega cannot evaluate non-linear arithmetic (e.g. x * x or σ(n)). This is a known limitation of the universe.",
        };
      }

      const trueNode: ASTNode = {
        id: `omega-${Date.now()}`,
        type: "Boolean",
        value: true,
      };
      const newAST = replaceNode(globalAST, nodeToTest.id, trueNode);
      return {
        success: true,
        newAST,
        ramConsumed: 10,
        message: "tactic 'omega' closed linear integer arithmetic goal via Presburger elimination.",
        isProofComplete: newAST.type === "Boolean" && newAST.value === true,
      };
    },
  },

  linarith: {
    id: "linarith",
    name: "linarith",
    label: "linarith",
    description: "Linear arithmetic solver for linear combinations of hypotheses.",
    baseRamCost: 8,
    failureCost: 1,
    execute: (targetNode, globalAST) => {
      const nodeToTest = targetNode.type === "Inequality" || targetNode.type === "Equality" ? targetNode : globalAST;
      const trueNode: ASTNode = {
        id: `linarith-${Date.now()}`,
        type: "Boolean",
        value: true,
      };
      const newAST = replaceNode(globalAST, nodeToTest.id, trueNode);
      return {
        success: true,
        newAST,
        ramConsumed: 8,
        message: "tactic 'linarith' found linear combination proving the goal.",
        isProofComplete: newAST.type === "Boolean" && newAST.value === true,
      };
    },
  },

  sorry: {
    id: "sorry",
    name: "sorry",
    label: "Use sorry",
    description: "Admit the theorem without proof. Warning: Causes catastrophic mathematical morality loss.",
    baseRamCost: 0,
    failureCost: 0,
    execute: () => {
      const qedNode: ASTNode = {
        id: `sorry-${Date.now()}`,
        type: "Boolean",
        value: true,
        metadata: { provedViaSorry: true },
      };
      return {
        success: true,
        newAST: qedNode,
        ramConsumed: 0,
        message: "WARNING: Morality exception. Proof accepted via 'sorry'. A single tear falls from the eye of a distant mathematician.",
        isProofComplete: true,
      };
    },
  },
};
