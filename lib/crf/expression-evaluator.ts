import { AstCondition, EditCheckRule, CRFField } from "./types";
import { isCdiscNullFlavor } from "./precision-date";

/**
 * Unified Missing Value & CDISC Null Flavor Guard
 * Returns true if a value is null, undefined, empty string, or a valid CDISC null flavor code (e.g. ND, NA, UNK, ASKU, NASK, MSK).
 */
export function isMissingOrNullFlavor(val: unknown): boolean {
  if (val === null || val === undefined) return true;
  if (typeof val === "string") {
    const trimmed = val.trim();
    if (trimmed === "") return true;
    if (isCdiscNullFlavor(trimmed)) return true;
  }
  return false;
}

/**
 * Tokenizer & Safe Recursive Descent Parser for Clinical Expressions
 * Avoids any use of `eval()` or `Function()` constructor.
 */
export type TokenType = "NUMBER" | "IDENTIFIER" | "OP" | "LPAREN" | "RPAREN" | "COMMA";

export interface Token {
  type: TokenType;
  value: string;
  start?: number;
  end?: number;
}

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    const ch = s[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (ch === "(") {
      tokens.push({ type: "LPAREN", value: "(" });
      i++;
      continue;
    }

    if (ch === ")") {
      tokens.push({ type: "RPAREN", value: ")" });
      i++;
      continue;
    }

    if (ch === ",") {
      tokens.push({ type: "COMMA", value: "," });
      i++;
      continue;
    }

    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^") {
      tokens.push({ type: "OP", value: ch });
      i++;
      continue;
    }

    // Numbers (integers or decimals)
    if (/[0-9]/.test(ch) || (ch === "." && i + 1 < s.length && /[0-9]/.test(s[i + 1]))) {
      let numStr = "";
      while (i < s.length && (/[0-9]/.test(s[i]) || s[i] === ".")) {
        numStr += s[i];
        i++;
      }
      tokens.push({ type: "NUMBER", value: numStr });
      continue;
    }

    // Identifiers or function names (e.g. weight, height, round, sqrt, max, min)
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
        idStr += s[i];
        i++;
      }
      tokens.push({ type: "IDENTIFIER", value: idStr });
      continue;
    }

    // Unexpected character
    i++;
  }

  return tokens;
}

export class ExpressionEvaluator {
  private tokens: Token[];
  private pos: number;
  private context: Record<string, number | null>;

  constructor(tokens: Token[], context: Record<string, number | null>) {
    this.tokens = tokens;
    this.pos = 0;
    this.context = context;
  }

  private peek(): Token | undefined {
    return this.tokens[this.pos];
  }

  private consume(expectedType?: TokenType): Token {
    const token = this.tokens[this.pos++];
    if (!token) {
      throw new Error("Unexpected end of expression");
    }
    if (expectedType && token.type !== expectedType) {
      throw new Error(`Expected token ${expectedType} but got ${token.type} (${token.value})`);
    }
    return token;
  }

  // Grammar:
  // Expr   ::= AddExpr
  // AddExpr::= MulExpr (('+' | '-') MulExpr)*
  // MulExpr::= PowExpr (('*' | '/' | '%') PowExpr)*
  // PowExpr::= Primary ('^' PowExpr)?
  // Primary::= NUMBER | IDENTIFIER | FunctionCall | '(' Expr ')' | '-' Primary

  public parse(): number | null {
    if (this.tokens.length === 0) return null;
    try {
      const res = this.parseAdd();
      if (res === null || !Number.isFinite(res)) return null;
      return res;
    } catch {
      return null;
    }
  }

  private parseAdd(): number | null {
    let left = this.parseMul();

    while (this.pos < this.tokens.length) {
      const next = this.peek();
      if (next && next.type === "OP" && (next.value === "+" || next.value === "-")) {
        const op = this.consume().value;
        const right = this.parseMul();
        if (left === null || right === null) {
          left = null;
        } else if (op === "+") {
          left = left + right;
        } else {
          left = left - right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  private parseMul(): number | null {
    let left = this.parsePow();

    while (this.pos < this.tokens.length) {
      const next = this.peek();
      if (next && next.type === "OP" && (next.value === "*" || next.value === "/" || next.value === "%")) {
        const op = this.consume().value;
        const right = this.parsePow();
        if (left === null || right === null) {
          left = null;
        } else if (op === "*") {
          left = left * right;
        } else if (op === "/") {
          if (right === 0) {
            left = null;
          } else {
            left = left / right;
          }
        } else if (op === "%") {
          if (right === 0) {
            left = null;
          } else {
            left = left % right;
          }
        }
      } else {
        break;
      }
    }
    return left;
  }

  private parsePow(): number | null {
    const base = this.parsePrimary();

    const next = this.peek();
    if (next && next.type === "OP" && next.value === "^") {
      this.consume();
      const exponent = this.parsePow();
      if (base === null || exponent === null) return null;
      return Math.pow(base, exponent);
    }
    return base;
  }

  private parsePrimary(): number | null {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression in primary");

    // Unary minus
    if (token.type === "OP" && token.value === "-") {
      this.consume();
      const val = this.parsePrimary();
      return val === null ? null : -val;
    }

    if (token.type === "NUMBER") {
      this.consume();
      const val = parseFloat(token.value);
      return Number.isFinite(val) ? val : null;
    }

    if (token.type === "LPAREN") {
      this.consume("LPAREN");
      const result = this.parseAdd();
      this.consume("RPAREN");
      return result;
    }

    if (token.type === "IDENTIFIER") {
      const idToken = this.consume("IDENTIFIER");
      const next = this.peek();

      // Function Call (e.g. round(x, 1), sqrt(x), abs(x), max(a,b), min(a,b))
      if (next && next.type === "LPAREN") {
        this.consume("LPAREN");
        const args: (number | null)[] = [];
        if (this.peek()?.type !== "RPAREN") {
          args.push(this.parseAdd());
          while (this.peek()?.type === "COMMA") {
            this.consume("COMMA");
            args.push(this.parseAdd());
          }
        }
        this.consume("RPAREN");

        if (args.some((a) => a === null)) {
          return null;
        }
        const numArgs = args as number[];

        const fnName = idToken.value.toLowerCase();
        switch (fnName) {
          case "round":
            if (numArgs.length === 0) return null;
            if (numArgs.length >= 2) {
              const factor = Math.pow(10, numArgs[1]);
              return Math.round(numArgs[0] * factor) / factor;
            }
            return Math.round(numArgs[0]);
          case "sqrt":
            if (numArgs.length === 0 || numArgs[0] < 0) return null;
            return Math.sqrt(numArgs[0]);
          case "cbrt":
            if (numArgs.length === 0) return null;
            return Math.cbrt(numArgs[0]);
          case "clamp":
            if (numArgs.length < 3) return null;
            return Math.min(Math.max(numArgs[0], numArgs[1]), numArgs[2]);
          case "abs":
            if (numArgs.length === 0) return null;
            return Math.abs(numArgs[0]);
          case "max":
            if (numArgs.length === 0) return null;
            return Math.max(...numArgs);
          case "min":
            if (numArgs.length === 0) return null;
            return Math.min(...numArgs);
          case "floor":
            if (numArgs.length === 0) return null;
            return Math.floor(numArgs[0]);
          case "ceil":
            if (numArgs.length === 0) return null;
            return Math.ceil(numArgs[0]);
          case "exp":
            if (numArgs.length === 0) return null;
            return Math.exp(numArgs[0]);
          case "log":
            if (numArgs.length === 0 || numArgs[0] <= 0) return null;
            return Math.log(numArgs[0]);
          default:
            return numArgs[0] ?? null;
        }
      }

      // Variable reference lookup
      const varKey = idToken.value.toLowerCase();
      if (varKey in this.context) {
        return this.context[varKey];
      }
      return null;
    }

    throw new Error(`Unexpected token ${token.type} (${token.value})`);
  }
}

/**
 * Safely evaluates a math formula with dynamic field variables
 *
 * @param formula - Arithmetic string expression
 * @param fieldValues - Map of variable names and field IDs to values
 * @param fieldsList - Array of form fields for identifier resolution
 * @returns Evaluated numeric result or null when uncalculated / zero denominator
 */
export function evaluateFormula(
  formula: string,
  fieldValues: Record<string, string | number | boolean | null | undefined>,
  fieldsList: CRFField[]
): number | null {
  if (!formula || typeof formula !== "string") return null;

  // Build lookup mapping lowercase variable names and field IDs to numeric values or null
  const context: Record<string, number | null> = {};

  Object.entries(fieldValues).forEach(([k, rawVal]) => {
    if (isMissingOrNullFlavor(rawVal)) {
      context[k.toLowerCase()] = null;
    } else {
      const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
      context[k.toLowerCase()] = Number.isFinite(num) ? num : null;
    }
  });

  fieldsList.forEach((f) => {
    const rawVal =
      fieldValues[f.id] ??
      fieldValues[f.id.toLowerCase()] ??
      fieldValues[f.variableName] ??
      fieldValues[f.variableName.toLowerCase()] ??
      f.nullFlavorValue;

    const idKey = f.id.toLowerCase();
    const varKey = f.variableName.toLowerCase();

    if (!isMissingOrNullFlavor(rawVal)) {
      const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
      const safeNum = Number.isFinite(num) ? num : null;
      context[idKey] = safeNum;
      context[varKey] = safeNum;
    } else {
      context[idKey] = null;
      context[varKey] = null;
    }
  });

  try {
    const tokens = tokenize(formula);
    const evaluator = new ExpressionEvaluator(tokens, context);
    return evaluator.parse();
  } catch {
    return null;
  }
}

/**
 * Calculates Body Mass Index (BMI) in kg/m^2.
 */
export function calculateBMI(weightKg: number, heightCm: number): number | null {
  if (heightCm <= 0) return null;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculates Mosteller Body Surface Area (BSA) in m^2.
 */
export function calculateMostellerBSA(heightCm: number, weightKg: number): number | null {
  if (heightCm <= 0 || weightKg < 0) return null;
  return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
}

/**
 * Calculates DuBois & DuBois Body Surface Area (BSA) in m^2.
 */
export function calculateDuboisBSA(heightCm: number, weightKg: number): number | null {
  if (heightCm <= 0 || weightKg < 0) return null;
  const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
  return Math.round(bsa * 100) / 100;
}

/**
 * Calculates Cockcroft-Gault Creatinine Clearance (CrCl) in mL/min.
 */
export function calculateCockcroftGaultCrCl(
  age: number,
  weightKg: number,
  serumCrMgDl: number,
  isFemale: boolean
): number | null {
  if (serumCrMgDl <= 0) return null;
  const base = ((140 - age) * weightKg) / (72 * serumCrMgDl);
  const factor = isFemale ? 0.85 : 1.0;
  return Math.round(base * factor * 10) / 10;
}

/**
 * Calculates Bazett Corrected QT interval (QTcB) in milliseconds.
 */
export function calculateBazettQTc(qtMs: number, rrSec: number): number | null {
  if (rrSec <= 0) return null;
  return Math.round(qtMs / Math.sqrt(rrSec));
}

/**
 * Calculates Fridericia Corrected QT interval (QTcF) in milliseconds.
 */
export function calculateFridericiaQTc(qtMs: number, rrSec: number): number | null {
  if (rrSec <= 0) return null;
  return Math.round(qtMs / Math.cbrt(rrSec));
}

/**
 * Calculates RECIST 1.1 Sum of Longest Diameters percentage change from baseline.
 */
export function calculateRecistSldChange(baselineSldMm: number, currentSldMm: number): number | null {
  if (baselineSldMm <= 0) return null;
  const diff = currentSldMm - baselineSldMm;
  return Math.round((diff / baselineSldMm) * 1000) / 10;
}

/**
 * Evaluate single AST condition
 */
export function evaluateCondition(
  condition: AstCondition,
  fieldValues: Record<string, string | number | boolean | null | undefined>,
  fieldsList: CRFField[],
  visitContext?: string
): boolean {
  const targetField = fieldsList.find(
    (f) => f.id === condition.fieldId || f.variableName === condition.fieldId
  );

  // Check cross-visit / visit-level lookup key if present
  let actualVal: string | number | boolean | null | undefined;
  if (condition.crossVisitId) {
    const crossKey = `${condition.crossVisitId}_${condition.fieldId}`;
    const crossVarKey = targetField ? `${condition.crossVisitId}_${targetField.id}` : crossKey;
    const crossNameKey = targetField ? `${condition.crossVisitId}_${targetField.variableName}` : crossKey;
    actualVal =
      fieldValues[crossKey] ??
      fieldValues[crossVarKey] ??
      fieldValues[crossNameKey] ??
      fieldValues[condition.fieldId] ??
      (targetField ? (fieldValues[targetField.id] ?? fieldValues[targetField.variableName]) : undefined);
  } else if (visitContext) {
    const scopedKey = `${visitContext}_${condition.fieldId}`;
    const scopedVarKey = targetField ? `${visitContext}_${targetField.id}` : scopedKey;
    const scopedNameKey = targetField ? `${visitContext}_${targetField.variableName}` : scopedKey;
    actualVal =
      fieldValues[scopedKey] ??
      fieldValues[scopedVarKey] ??
      fieldValues[scopedNameKey] ??
      fieldValues[condition.fieldId] ??
      (targetField ? (fieldValues[targetField.id] ?? fieldValues[targetField.variableName]) : undefined);
  } else {
    actualVal =
      fieldValues[condition.fieldId] ??
      (targetField ? (fieldValues[targetField.id] ?? fieldValues[targetField.variableName]) : undefined);
  }

  // Fallback to field's active nullFlavorValue if actualVal is missing
  if ((actualVal === undefined || actualVal === null || actualVal === "") && targetField?.nullFlavorValue) {
    actualVal = targetField.nullFlavorValue;
  }

  const actMissing = isMissingOrNullFlavor(actualVal);

  switch (condition.operator) {
    case "is_empty":
      return actMissing;
    case "is_not_empty":
      return !actMissing;
    case "eq": {
      const condMissing = isMissingOrNullFlavor(condition.value);
      if (actMissing && condMissing) return true;
      if (actMissing || condMissing) return false;
      return String(actualVal).toLowerCase() === String(condition.value).toLowerCase();
    }
    case "neq": {
      const condMissing = isMissingOrNullFlavor(condition.value);
      if (actMissing && condMissing) return false;
      if (actMissing || condMissing) return true;
      return String(actualVal).toLowerCase() !== String(condition.value).toLowerCase();
    }
    case "gt": {
      if (actMissing || isMissingOrNullFlavor(condition.value)) return false;
      const numAct = typeof actualVal === "number" ? actualVal : parseFloat(String(actualVal));
      const numCond = typeof condition.value === "number" ? condition.value : parseFloat(String(condition.value));
      return Number.isFinite(numAct) && Number.isFinite(numCond) && numAct > numCond;
    }
    case "gte": {
      if (actMissing || isMissingOrNullFlavor(condition.value)) return false;
      const numAct = typeof actualVal === "number" ? actualVal : parseFloat(String(actualVal));
      const numCond = typeof condition.value === "number" ? condition.value : parseFloat(String(condition.value));
      return Number.isFinite(numAct) && Number.isFinite(numCond) && numAct >= numCond;
    }
    case "lt": {
      if (actMissing || isMissingOrNullFlavor(condition.value)) return false;
      const numAct = typeof actualVal === "number" ? actualVal : parseFloat(String(actualVal));
      const numCond = typeof condition.value === "number" ? condition.value : parseFloat(String(condition.value));
      return Number.isFinite(numAct) && Number.isFinite(numCond) && numAct < numCond;
    }
    case "lte": {
      if (actMissing || isMissingOrNullFlavor(condition.value)) return false;
      const numAct = typeof actualVal === "number" ? actualVal : parseFloat(String(actualVal));
      const numCond = typeof condition.value === "number" ? condition.value : parseFloat(String(condition.value));
      return Number.isFinite(numAct) && Number.isFinite(numCond) && numAct <= numCond;
    }
    case "contains": {
      if (actMissing || isMissingOrNullFlavor(condition.value)) return false;
      return String(actualVal).toLowerCase().includes(String(condition.value).toLowerCase());
    }
    case "in": {
      if (actMissing) return false;
      if (Array.isArray(condition.value)) {
        return condition.value.some((v) => !isMissingOrNullFlavor(v) && String(v).toLowerCase() === String(actualVal).toLowerCase());
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Evaluate full edit check rule conditions
 */
export function evaluateRule(
  rule: EditCheckRule,
  fieldValues: Record<string, string | number | boolean | null | undefined>,
  fieldsList: CRFField[],
  visitContext?: string
): boolean {
  if (!rule.conditions || rule.conditions.length === 0) return true;

  if (rule.logicalOperator === "OR") {
    return rule.conditions.some((cond) => evaluateCondition(cond, fieldValues, fieldsList, visitContext));
  } else {
    return rule.conditions.every((cond) => evaluateCondition(cond, fieldValues, fieldsList, visitContext));
  }
}
