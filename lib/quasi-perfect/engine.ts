import { ASTNode } from "./types";

/**
 * Creates a deep clone of an AST node tree.
 */
export function cloneAST(node: ASTNode): ASTNode {
  return {
    ...node,
    metadata: node.metadata ? { ...node.metadata } : undefined,
    children: node.children ? node.children.map(cloneAST) : undefined,
  };
}

/**
 * Searches for a node by its unique ID in the AST.
 */
export function findNodeById(root: ASTNode, id: string): ASTNode | null {
  if (root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Replaces a target node matching targetId with replacementNode.
 */
export function replaceNode(root: ASTNode, targetId: string, replacementNode: ASTNode): ASTNode {
  if (root.id === targetId) {
    return cloneAST(replacementNode);
  }
  if (!root.children || root.children.length === 0) {
    return { ...root };
  }
  return {
    ...root,
    children: root.children.map((child) => replaceNode(child, targetId, replacementNode)),
  };
}

/**
 * Deep structural equality check for two AST subtrees (ignoring node ID differences).
 */
export function areNodesEqual(a: ASTNode, b: ASTNode): boolean {
  if (a.type !== b.type || a.value !== b.value) {
    return false;
  }
  const aChildren = a.children || [];
  const bChildren = b.children || [];
  if (aChildren.length !== bChildren.length) {
    return false;
  }
  for (let i = 0; i < aChildren.length; i++) {
    if (!areNodesEqual(aChildren[i], bChildren[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Formats an AST node to human-readable mathematical notation string.
 */
export function renderASTString(node: ASTNode): string {
  switch (node.type) {
    case "Constant":
    case "Variable":
    case "Boolean":
      return String(node.value);

    case "Function":
      if (node.children && node.children.length > 0) {
        return `${node.value}(${node.children.map(renderASTString).join(", ")})`;
      }
      return String(node.value);

    case "Operator":
    case "Equality":
    case "Inequality":
    case "Implication":
      if (!node.children || node.children.length === 0) {
        return String(node.value);
      }
      if (node.children.length === 1) {
        return `${node.value} ${renderASTString(node.children[0])}`;
      }
      if (node.children.length === 2) {
        const left = renderASTString(node.children[0]);
        const right = renderASTString(node.children[1]);
        return `${left} ${node.value} ${right}`;
      }
      return node.children.map(renderASTString).join(` ${node.value} `);

    default:
      return String(node.value);
  }
}

/**
 * Recursively attempts to evaluate constant arithmetic expressions.
 */
export function evaluateArithmetic(node: ASTNode): number | null {
  if (node.type === "Constant") {
    const num = Number(node.value);
    return isNaN(num) ? null : num;
  }

  if (node.type === "Operator" && node.children && node.children.length === 2) {
    const leftVal = evaluateArithmetic(node.children[0]);
    const rightVal = evaluateArithmetic(node.children[1]);
    if (leftVal === null || rightVal === null) return null;

    switch (node.value) {
      case "+":
        return leftVal + rightVal;
      case "-":
        return leftVal - rightVal;
      case "*":
      case "×":
        return leftVal * rightVal;
      case "/":
      case "÷":
        return rightVal !== 0 ? Math.floor(leftVal / rightVal) : null;
      default:
        return null;
    }
  }

  return null;
}

/**
 * Checks whether an entire sub-tree contains only constants and operators (no free variables).
 */
export function isConcreteExpression(node: ASTNode): boolean {
  if (node.type === "Variable") return false;
  if (node.type === "Constant" || node.type === "Boolean") return true;
  if (node.children) {
    return node.children.every(isConcreteExpression);
  }
  return true;
}

/**
 * Recursively simplifies algebraic and arithmetic expressions.
 */
export function simplifyNode(node: ASTNode): { node: ASTNode; changed: boolean } {
  let changed = false;

  // 1. Simplify children first
  let currentChildren: ASTNode[] = [];
  if (node.children && node.children.length > 0) {
    currentChildren = node.children.map((child) => {
      const res = simplifyNode(child);
      if (res.changed) changed = true;
      return res.node;
    });
  }

  const updatedNode: ASTNode = {
    ...node,
    children: currentChildren.length > 0 ? currentChildren : node.children,
  };

  // 2. Try constant folding if it's an operator with 2 children
  if (updatedNode.type === "Operator" && updatedNode.children?.length === 2) {
    const constResult = evaluateArithmetic(updatedNode);
    if (constResult !== null) {
      return {
        node: {
          id: `const-${Math.random().toString(36).substring(2, 8)}`,
          type: "Constant",
          value: constResult,
        },
        changed: true,
      };
    }

    const [left, right] = updatedNode.children;

    // Algebraic identities for addition: x + 0 -> x, 0 + x -> x
    if (updatedNode.value === "+") {
      if (right.type === "Constant" && right.value === 0) {
        return { node: left, changed: true };
      }
      if (left.type === "Constant" && left.value === 0) {
        return { node: right, changed: true };
      }
    }

    // Algebraic identities for multiplication: x * 1 -> x, 1 * x -> x, x * 0 -> 0, 0 * x -> 0
    if (updatedNode.value === "*" || updatedNode.value === "×") {
      if (right.type === "Constant" && right.value === 1) return { node: left, changed: true };
      if (left.type === "Constant" && left.value === 1) return { node: right, changed: true };
      if (right.type === "Constant" && right.value === 0) return { node: right, changed: true };
      if (left.type === "Constant" && left.value === 0) return { node: left, changed: true };
    }

    // Algebraic identities for subtraction: x - 0 -> x, x - x -> 0
    if (updatedNode.value === "-") {
      if (right.type === "Constant" && right.value === 0) return { node: left, changed: true };
      if (areNodesEqual(left, right)) {
        return {
          node: {
            id: `const-${Math.random().toString(36).substring(2, 8)}`,
            type: "Constant",
            value: 0,
          },
          changed: true,
        };
      }
    }
  }

  // 3. Equality simplification
  if (updatedNode.type === "Equality" && updatedNode.children?.length === 2) {
    const [left, right] = updatedNode.children;
    if (areNodesEqual(left, right)) {
      return {
        node: {
          id: `bool-${Math.random().toString(36).substring(2, 8)}`,
          type: "Boolean",
          value: true,
        },
        changed: true,
      };
    }
  }

  return { node: updatedNode, changed };
}

/**
 * Checks if the AST represents a fully solved/closed proof state.
 */
export function isProofComplete(ast: ASTNode): boolean {
  if (ast.type === "Boolean" && ast.value === true) {
    return true;
  }
  if (ast.type === "Equality" && ast.children?.length === 2) {
    return areNodesEqual(ast.children[0], ast.children[1]);
  }
  return false;
}
