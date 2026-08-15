import { AstCondition, EditCheckRule, CRFField, CRFForm } from "./types";

/**
 * Tokenizer & Safe Recursive Descent Parser for Clinical Expressions
 * Avoids any use of `eval()` or `Function()` constructor.
 */
export type TokenType = "NUMBER" | "IDENTIFIER" | "OP" | "LPAREN" | "RPAREN" | "COMMA";

export interface Token {
  type: TokenType;
  value: string;
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
  private context: Record<string, number>;

  constructor(tokens: Token[], context: Record<string, number>) {
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

  public parse(): number {
    if (this.tokens.length === 0) return 0;
    const res = this.parseAdd();
    return Number.isFinite(res) ? res : 0;
  }

  private parseAdd(): number {
    let left = this.parseMul();

    while (this.pos < this.tokens.length) {
      const next = this.peek();
      if (next && next.type === "OP" && (next.value === "+" || next.value === "-")) {
        const op = this.consume().value;
        const right = this.parseMul();
        if (op === "+") left += right;
        else left -= right;
      } else {
        break;
      }
    }
    return left;
  }

  private parseMul(): number {
    let left = this.parsePow();

    while (this.pos < this.tokens.length) {
      const next = this.peek();
      if (next && next.type === "OP" && (next.value === "*" || next.value === "/" || next.value === "%")) {
        const op = this.consume().value;
        const right = this.parsePow();
        if (op === "*") left *= right;
        else if (op === "/") left = right === 0 ? 0 : left / right;
        else left = right === 0 ? 0 : left % right;
      } else {
        break;
      }
    }
    return left;
  }

  private parsePow(): number {
    const base = this.parsePrimary();

    const next = this.peek();
    if (next && next.type === "OP" && next.value === "^") {
      this.consume();
      const exponent = this.parsePow();
      return Math.pow(base, exponent);
    }
    return base;
  }

  private parsePrimary(): number {
    const token = this.peek();
    if (!token) throw new Error("Unexpected end of expression in primary");

    // Unary minus
    if (token.type === "OP" && token.value === "-") {
      this.consume();
      return -this.parsePrimary();
    }

    if (token.type === "NUMBER") {
      this.consume();
      return parseFloat(token.value);
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
        const args: number[] = [];
        if (this.peek()?.type !== "RPAREN") {
          args.push(this.parseAdd());
          while (this.peek()?.type === "COMMA") {
            this.consume("COMMA");
            args.push(this.parseAdd());
          }
        }
        this.consume("RPAREN");

        const fnName = idToken.value.toLowerCase();
        switch (fnName) {
          case "round":
            if (args.length >= 2) {
              const factor = Math.pow(10, args[1]);
              return Math.round(args[0] * factor) / factor;
            }
            return Math.round(args[0] ?? 0);
          case "sqrt":
            return Math.sqrt(Math.max(0, args[0] ?? 0));
          case "abs":
            return Math.abs(args[0] ?? 0);
          case "max":
            return Math.max(...args);
          case "min":
            return Math.min(...args);
          case "floor":
            return Math.floor(args[0] ?? 0);
          case "ceil":
            return Math.ceil(args[0] ?? 0);
          case "exp":
            return Math.exp(args[0] ?? 0);
          case "log":
            return Math.log(Math.max(0.0001, args[0] ?? 1));
          default:
            return args[0] ?? 0;
        }
      }

      // Variable reference lookup
      const varKey = idToken.value.toLowerCase();
      if (varKey in this.context) {
        return this.context[varKey];
      }
      return 0;
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
 * @returns Evaluated numeric result
 */
export function evaluateFormula(
  formula: string,
  fieldValues: Record<string, string | number | boolean | null | undefined>,
  fieldsList: CRFField[]
): number {
  if (!formula || typeof formula !== "string") return 0;

  // Build lookup mapping lowercase variable names and field IDs to numeric values
  const context: Record<string, number> = {};

  Object.entries(fieldValues).forEach(([k, rawVal]) => {
    const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal ?? "0"));
    const safeNum = Number.isFinite(num) ? num : 0;
    context[k.toLowerCase()] = safeNum;
  });

  fieldsList.forEach((f) => {
    const rawVal = fieldValues[f.id] ?? fieldValues[f.variableName];
    if (rawVal !== undefined && rawVal !== null) {
      const num = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal));
      const safeNum = Number.isFinite(num) ? num : 0;
      context[f.id.toLowerCase()] = safeNum;
      context[f.variableName.toLowerCase()] = safeNum;
    }
  });

  try {
    const tokens = tokenize(formula);
    const evaluator = new ExpressionEvaluator(tokens, context);
    return evaluator.parse();
  } catch {
    return 0;
  }
}

/**
 * Calculates Body Mass Index (BMI) in kg/m^2.
 *
 * @param weightKg - Weight in kilograms
 * @param heightCm - Height in centimeters
 * @returns Calculated BMI rounded to 1 decimal place
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (!weightKg || !heightCm || heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Calculates Mosteller Body Surface Area (BSA) in m^2.
 *
 * @param heightCm - Height in centimeters
 * @param weightKg - Weight in kilograms
 * @returns Calculated BSA rounded to 2 decimal places
 */
export function calculateMostellerBSA(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
  return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
}

/**
 * Calculates DuBois & DuBois Body Surface Area (BSA) in m^2.
 *
 * @param heightCm - Height in centimeters
 * @param weightKg - Weight in kilograms
 * @returns Calculated BSA rounded to 2 decimal places
 */
export function calculateDuboisBSA(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return 0;
  const bsa = 0.007184 * Math.pow(heightCm, 0.725) * Math.pow(weightKg, 0.425);
  return Math.round(bsa * 100) / 100;
}

/**
 * Calculates Cockcroft-Gault Creatinine Clearance (CrCl) in mL/min.
 *
 * @param age - Patient age in years
 * @param weightKg - Patient weight in kilograms
 * @param serumCrMgDl - Serum creatinine in mg/dL
 * @param isFemale - True if female
 * @returns Estimated Creatinine Clearance in mL/min
 */
export function calculateCockcroftGaultCrCl(
  age: number,
  weightKg: number,
  serumCrMgDl: number,
  isFemale: boolean
): number {
  if (!age || !weightKg || !serumCrMgDl || serumCrMgDl <= 0) return 0;
  const base = ((140 - age) * weightKg) / (72 * serumCrMgDl);
  const factor = isFemale ? 0.85 : 1.0;
  return Math.round(base * factor * 10) / 10;
}

/**
 * Calculates Bazett Corrected QT interval (QTcB) in milliseconds.
 *
 * @param qtMs - Raw QT interval in ms
 * @param rrSec - RR interval in seconds (or 60 / heartRate)
 * @returns Corrected QTc in ms
 */
export function calculateBazettQTc(qtMs: number, rrSec: number): number {
  if (!qtMs || !rrSec || rrSec <= 0) return 0;
  return Math.round(qtMs / Math.sqrt(rrSec));
}

/**
 * Calculates Fridericia Corrected QT interval (QTcF) in milliseconds.
 *
 * @param qtMs - Raw QT interval in ms
 * @param rrSec - RR interval in seconds
 * @returns Corrected QTc in ms
 */
export function calculateFridericiaQTc(qtMs: number, rrSec: number): number {
  if (!qtMs || !rrSec || rrSec <= 0) return 0;
  return Math.round(qtMs / Math.cbrt(rrSec));
}

/**
 * Calculates RECIST 1.1 Sum of Longest Diameters percentage change from baseline.
 *
 * @param baselineSldMm - Baseline Sum of Longest Diameters (mm)
 * @param currentSldMm - Current visit Sum of Longest Diameters (mm)
 * @returns Percentage change from baseline rounded to 1 decimal place
 */
export function calculateRecistSldChange(baselineSldMm: number, currentSldMm: number): number {
  if (!baselineSldMm || baselineSldMm <= 0) return 0;
  const diff = currentSldMm - baselineSldMm;
  return Math.round((diff / baselineSldMm) * 1000) / 10;
}

/**
 * Evaluate single AST condition
 *
 * @param condition - The condition to evaluate
 * @param fieldValues - Map of all field IDs and variable names to values
 * @param fieldsList - Array of fields
 * @param visitContext - Optional visit ID to resolve cross-visit variables
 * @returns Boolean result of condition
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

  // Check cross-visit lookup key if present
  let actualVal: string | number | boolean | null | undefined;
  if (condition.crossVisitId) {
    const crossKey = `${condition.crossVisitId}_${condition.fieldId}`;
    const crossVarKey = targetField ? `${condition.crossVisitId}_${targetField.id}` : crossKey;
    actualVal = fieldValues[crossKey] ?? fieldValues[crossVarKey] ?? fieldValues[condition.fieldId];
  } else if (visitContext) {
    const scopedKey = `${visitContext}_${condition.fieldId}`;
    const scopedVarKey = targetField ? `${visitContext}_${targetField.id}` : scopedKey;
    actualVal = fieldValues[scopedKey] ?? fieldValues[scopedVarKey] ?? fieldValues[condition.fieldId] ?? (targetField ? fieldValues[targetField.id] : undefined);
  } else {
    actualVal = fieldValues[condition.fieldId] ?? (targetField ? fieldValues[targetField.id] : undefined);
  }

  switch (condition.operator) {
    case "is_empty":
      return actualVal === undefined || actualVal === null || actualVal === "";
    case "is_not_empty":
      return actualVal !== undefined && actualVal !== null && actualVal !== "";
    case "eq":
      return String(actualVal ?? "").toLowerCase() === String(condition.value).toLowerCase();
    case "neq":
      return String(actualVal ?? "").toLowerCase() !== String(condition.value).toLowerCase();
    case "gt": {
      const numAct = parseFloat(String(actualVal ?? 0));
      const numCond = parseFloat(String(condition.value ?? 0));
      return !isNaN(numAct) && numAct > numCond;
    }
    case "gte": {
      const numAct = parseFloat(String(actualVal ?? 0));
      const numCond = parseFloat(String(condition.value ?? 0));
      return !isNaN(numAct) && numAct >= numCond;
    }
    case "lt": {
      const numAct = parseFloat(String(actualVal ?? 0));
      const numCond = parseFloat(String(condition.value ?? 0));
      return !isNaN(numAct) && numAct < numCond;
    }
    case "lte": {
      const numAct = parseFloat(String(actualVal ?? 0));
      const numCond = parseFloat(String(condition.value ?? 0));
      return !isNaN(numAct) && numAct <= numCond;
    }
    case "contains":
      return String(actualVal ?? "").toLowerCase().includes(String(condition.value).toLowerCase());
    case "in": {
      if (Array.isArray(condition.value)) {
        return condition.value.some((v) => String(v).toLowerCase() === String(actualVal ?? "").toLowerCase());
      }
      return false;
    }
    default:
      return false;
  }
}

/**
 * Evaluate full edit check rule conditions
 *
 * @param rule - The rule to evaluate
 * @param fieldValues - Map of field values
 * @param fieldsList - Array of fields
 * @param visitContext - Optional visit identifier
 * @returns Boolean result indicating if rule conditions are satisfied
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

/**
 * Lint CRF forms to identify dead rules, duplicate variables, broken references
 */
export interface DiagnosticItem {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  location: string;
}

export function lintForm(form: CRFForm): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const fieldMap = new Map<string, CRFField>();
  const varNames = new Set<string>();

  // 1. Check all fields
  form.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // Check ID uniqueness
      if (fieldMap.has(field.id)) {
        diagnostics.push({
          id: `dup_id_${field.id}`,
          severity: "error",
          message: `Duplicate field ID detected: "${field.id}"`,
          location: `Section "${section.title}"`,
        });
      }
      fieldMap.set(field.id, field);

      // Check Variable Name
      if (!field.variableName || field.variableName.trim() === "") {
        diagnostics.push({
          id: `missing_var_${field.id}`,
          severity: "error",
          message: `Field "${field.label}" is missing a CDASH/SDTM Variable Name`,
          location: `Section "${section.title}"`,
        });
      } else {
        const vName = field.variableName.toUpperCase();
        if (varNames.has(vName)) {
          diagnostics.push({
            id: `dup_var_${field.id}`,
            severity: "warning",
            message: `Duplicate variable name "${vName}" across fields`,
            location: `Field "${field.label}"`,
          });
        }
        varNames.add(vName);
      }

      // Check Calculated Fields
      if (field.dataType === "calculated" && (!field.calculationFormula || field.calculationFormula.trim() === "")) {
        diagnostics.push({
          id: `empty_formula_${field.id}`,
          severity: "warning",
          message: `Calculated field "${field.label}" has no arithmetic formula defined`,
          location: `Field "${field.label}"`,
        });
      }
    });
  });

  // 2. Check Rules
  form.rules.forEach((rule) => {
    rule.triggerFieldIds.forEach((tfId) => {
      if (!fieldMap.has(tfId)) {
        diagnostics.push({
          id: `broken_rule_ref_${rule.id}_${tfId}`,
          severity: "error",
          message: `Rule "${rule.name}" references non-existent trigger field "${tfId}"`,
          location: `Edit Check Rule "${rule.name}"`,
        });
      }
    });

    if (rule.targetFieldId && !fieldMap.has(rule.targetFieldId)) {
      diagnostics.push({
        id: `broken_rule_target_${rule.id}`,
        severity: "warning",
        message: `Rule "${rule.name}" targets non-existent field "${rule.targetFieldId}"`,
        location: `Edit Check Rule "${rule.name}"`,
      });
    }
  });

  return diagnostics;
}
