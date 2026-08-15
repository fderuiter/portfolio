import { AstCondition, EditCheckRule, CRFField, CRFForm, ClinicalDataType } from "./types";

/**
 * Tokenizer & Safe Recursive Descent Parser for Clinical Expressions
 * Avoids any use of `eval()` or `Function()` constructor.
 */
export type TokenType = "NUMBER" | "IDENTIFIER" | "OP" | "LPAREN" | "RPAREN" | "COMMA";
export type FormulaTokenType = TokenType | "FUNCTION" | "INVALID";

export interface Token {
  type: TokenType;
  value: string;
  start?: number;
  end?: number;
}

export interface HighlightToken {
  type: FormulaTokenType;
  value: string;
  start: number;
  end: number;
  depth?: number;
  unmatched?: boolean;
}

export interface FormulaDiagnostic {
  severity: "error" | "warning" | "info";
  message: string;
  start: number;
  end: number;
  code:
    | "UNMATCHED_LPAREN"
    | "UNMATCHED_RPAREN"
    | "UNEXPECTED_TOKEN"
    | "TRAILING_OPERATOR"
    | "CONSECUTIVE_OPERATORS"
    | "EMPTY_PARENTHESES"
    | "UNKNOWN_VARIABLE"
    | "NON_NUMERIC_VARIABLE"
    | "UNKNOWN_FUNCTION"
    | "INVALID_ARITY"
    | "CIRCULAR_REFERENCE"
    | "DIVISION_BY_ZERO"
    | "EMPTY_FORMULA";
}

export interface FormulaLintResult {
  isValid: boolean;
  tokens: HighlightToken[];
  diagnostics: FormulaDiagnostic[];
  unmatchedBracketIndices: number[];
  referencedVariables: {
    name: string;
    field?: CRFField;
    isNumeric: boolean;
    exists: boolean;
  }[];
}

export interface ClinicalFormulaPreset {
  id: string;
  name: string;
  category: "anthropometric" | "renal" | "cardiac" | "oncology" | "general";
  description: string;
  formula: string;
  standardVariables: {
    key: string;
    label: string;
    suggestedCdashNames: string[];
    suggestedUnits?: string;
  }[];
}

export const KNOWN_MATH_FUNCTIONS = new Set([
  "round",
  "sqrt",
  "abs",
  "max",
  "min",
  "floor",
  "ceil",
  "exp",
  "log",
]);

export const NUMERIC_DATA_TYPES: Set<ClinicalDataType> = new Set([
  "number",
  "integer",
  "calculated",
  "vas_scale",
  "nrs_scale",
]);

export const CLINICAL_FORMULA_PRESETS: ClinicalFormulaPreset[] = [
  {
    id: "bsa_mosteller",
    name: "Mosteller BSA (m²)",
    category: "anthropometric",
    description: "Standard Body Surface Area calculation for oncology dosing: sqrt((Height × Weight) / 3600)",
    formula: "round(sqrt((HEIGHT * WEIGHT) / 3600), 2)",
    standardVariables: [
      { key: "HEIGHT", label: "Height", suggestedCdashNames: ["HEIGHT", "HT", "VS_HT", "f_height"], suggestedUnits: "cm" },
      { key: "WEIGHT", label: "Weight", suggestedCdashNames: ["WEIGHT", "WT", "VS_WT", "f_weight"], suggestedUnits: "kg" },
    ],
  },
  {
    id: "bsa_dubois",
    name: "DuBois & DuBois BSA (m²)",
    category: "anthropometric",
    description: "Classic power-law Body Surface Area: 0.007184 × Height^0.725 × Weight^0.425",
    formula: "round(0.007184 * (HEIGHT ^ 0.725) * (WEIGHT ^ 0.425), 2)",
    standardVariables: [
      { key: "HEIGHT", label: "Height", suggestedCdashNames: ["HEIGHT", "HT", "VS_HT", "f_height"], suggestedUnits: "cm" },
      { key: "WEIGHT", label: "Weight", suggestedCdashNames: ["WEIGHT", "WT", "VS_WT", "f_weight"], suggestedUnits: "kg" },
    ],
  },
  {
    id: "bmi_quetelet",
    name: "Quetelet BMI (kg/m²)",
    category: "anthropometric",
    description: "Body Mass Index from height in cm and weight in kg: Weight / ((Height/100)²)",
    formula: "round(WEIGHT / ((HEIGHT / 100) * (HEIGHT / 100)), 1)",
    standardVariables: [
      { key: "HEIGHT", label: "Height", suggestedCdashNames: ["HEIGHT", "HT", "VS_HT", "f_height"], suggestedUnits: "cm" },
      { key: "WEIGHT", label: "Weight", suggestedCdashNames: ["WEIGHT", "WT", "VS_WT", "f_weight"], suggestedUnits: "kg" },
    ],
  },
  {
    id: "cockcroft_gault",
    name: "Cockcroft-Gault CrCl (mL/min)",
    category: "renal",
    description: "Estimated Creatinine Clearance for renal dose adjustments: ((140 - Age) × Weight) / (72 × Creatinine)",
    formula: "round(((140 - AGE) * WEIGHT) / (72 * CREAT), 1)",
    standardVariables: [
      { key: "AGE", label: "Age", suggestedCdashNames: ["AGE", "DM_AGE", "f_age"], suggestedUnits: "years" },
      { key: "WEIGHT", label: "Weight", suggestedCdashNames: ["WEIGHT", "WT", "VS_WT", "f_weight"], suggestedUnits: "kg" },
      { key: "CREAT", label: "Serum Creatinine", suggestedCdashNames: ["CREAT", "LB_CREAT", "SCREAT", "f_creat"], suggestedUnits: "mg/dL" },
    ],
  },
  {
    id: "recist_sld_change",
    name: "RECIST 1.1 % SLD Change",
    category: "oncology",
    description: "Sum of Longest Target Lesion Diameters percentage change from baseline",
    formula: "round(((TRL1 + TRL2 - TRSLDBAS) / TRSLDBAS) * 100, 1)",
    standardVariables: [
      { key: "TRL1", label: "Target Lesion 1", suggestedCdashNames: ["TRL1", "TR_L1", "LESION1", "f_trl1"], suggestedUnits: "mm" },
      { key: "TRL2", label: "Target Lesion 2", suggestedCdashNames: ["TRL2", "TR_L2", "LESION2", "f_trl2"], suggestedUnits: "mm" },
      { key: "TRSLDBAS", label: "Baseline SLD", suggestedCdashNames: ["TRSLDBAS", "SLDBASE", "BASE_SLD", "f_trsldbas"], suggestedUnits: "mm" },
    ],
  },
  {
    id: "bazett_qtc",
    name: "Bazett QTcB (ms)",
    category: "cardiac",
    description: "Heart-rate corrected QT interval via Bazett formula: QT / sqrt(RR in seconds)",
    formula: "round(EGQT / sqrt(EGRR / 1000), 0)",
    standardVariables: [
      { key: "EGQT", label: "Raw QT Interval", suggestedCdashNames: ["EGQT", "QT", "EG_QT", "f_egqt"], suggestedUnits: "ms" },
      { key: "EGRR", label: "RR Interval", suggestedCdashNames: ["EGRR", "RR", "EG_RR", "f_egrr"], suggestedUnits: "ms" },
    ],
  },
  {
    id: "fridericia_qtc",
    name: "Fridericia QTcF (ms)",
    category: "cardiac",
    description: "Heart-rate corrected QT interval via Fridericia cubic formula: QT / (RR in seconds)^(1/3)",
    formula: "round(EGQT / ((EGRR / 1000) ^ (1 / 3)), 0)",
    standardVariables: [
      { key: "EGQT", label: "Raw QT Interval", suggestedCdashNames: ["EGQT", "QT", "EG_QT", "f_egqt"], suggestedUnits: "ms" },
      { key: "EGRR", label: "RR Interval", suggestedCdashNames: ["EGRR", "RR", "EG_RR", "f_egrr"], suggestedUnits: "ms" },
    ],
  },
  {
    id: "map",
    name: "Mean Arterial Pressure (MAP)",
    category: "cardiac",
    description: "Average blood pressure during a single cardiac cycle: ((2 × DBP) + SBP) / 3",
    formula: "round(((2 * DIABP) + SYSBP) / 3, 1)",
    standardVariables: [
      { key: "DIABP", label: "Diastolic Blood Pressure", suggestedCdashNames: ["DIABP", "DBP", "VS_DIABP", "f_diabp"], suggestedUnits: "mmHg" },
      { key: "SYSBP", label: "Systolic Blood Pressure", suggestedCdashNames: ["SYSBP", "SBP", "VS_SYSBP", "f_sysbp"], suggestedUnits: "mmHg" },
    ],
  },
];

/**
 * Maps standard preset placeholder variables to available fields in the active CRF form.
 */
export function mapPresetToFormVariables(presetFormula: string, fields: CRFField[]): string {
  if (!presetFormula || !fields || fields.length === 0) return presetFormula;

  let mapped = presetFormula;
  const fieldLookup = new Map<string, string>();

  fields.forEach((f) => {
    fieldLookup.set(f.variableName.toUpperCase(), f.variableName);
    fieldLookup.set(f.id.toUpperCase(), f.variableName);
    if (f.cdashMetadata?.sdtmVariable) {
      fieldLookup.set(f.cdashMetadata.sdtmVariable.toUpperCase(), f.variableName);
    }
  });

  CLINICAL_FORMULA_PRESETS.forEach((preset) => {
    preset.standardVariables.forEach((stdVar) => {
      let matchedFieldName: string | undefined;

      for (const candidate of stdVar.suggestedCdashNames) {
        if (fieldLookup.has(candidate.toUpperCase())) {
          matchedFieldName = fieldLookup.get(candidate.toUpperCase());
          break;
        }
      }

      if (!matchedFieldName) {
        const match = fields.find((f) => {
          const varUpper = f.variableName.toUpperCase();
          const labelUpper = f.label.toUpperCase();
          return (
            varUpper.includes(stdVar.key.toUpperCase()) ||
            labelUpper.includes(stdVar.label.toUpperCase()) ||
            stdVar.suggestedCdashNames.some((c) => varUpper.includes(c.toUpperCase()))
          );
        });
        if (match) {
          matchedFieldName = match.variableName;
        }
      }

      if (matchedFieldName && matchedFieldName !== stdVar.key) {
        const regex = new RegExp(`\\b${stdVar.key}\\b`, "g");
        mapped = mapped.replace(regex, matchedFieldName);
      }
    });
  });

  return mapped;
}

/**
 * Enhanced Tokenizer with character start/end coordinates and bracket matching
 */
export function tokenizeWithSpans(input: string): HighlightToken[] {
  const rawTokens: HighlightToken[] = [];
  let i = 0;

  while (i < input.length) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    const start = i;

    if (ch === "(") {
      rawTokens.push({ type: "LPAREN", value: "(", start, end: start + 1 });
      i++;
      continue;
    }

    if (ch === ")") {
      rawTokens.push({ type: "RPAREN", value: ")", start, end: start + 1 });
      i++;
      continue;
    }

    if (ch === ",") {
      rawTokens.push({ type: "COMMA", value: ",", start, end: start + 1 });
      i++;
      continue;
    }

    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "%" || ch === "^") {
      rawTokens.push({ type: "OP", value: ch, start, end: start + 1 });
      i++;
      continue;
    }

    // Numbers (integers or decimals)
    if (/[0-9]/.test(ch) || (ch === "." && i + 1 < input.length && /[0-9]/.test(input[i + 1]))) {
      let numStr = "";
      while (i < input.length && (/[0-9]/.test(input[i]) || input[i] === ".")) {
        numStr += input[i];
        i++;
      }
      rawTokens.push({ type: "NUMBER", value: numStr, start, end: i });
      continue;
    }

    // Identifiers or function names
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < input.length && /[a-zA-Z0-9_]/.test(input[i])) {
        idStr += input[i];
        i++;
      }

      let lookAhead = i;
      while (lookAhead < input.length && /\s/.test(input[lookAhead])) {
        lookAhead++;
      }

      const isFunc =
        lookAhead < input.length &&
        input[lookAhead] === "(" &&
        KNOWN_MATH_FUNCTIONS.has(idStr.toLowerCase());

      rawTokens.push({
        type: isFunc ? "FUNCTION" : "IDENTIFIER",
        value: idStr,
        start,
        end: i,
      });
      continue;
    }

    // Invalid character
    rawTokens.push({ type: "INVALID", value: ch, start, end: start + 1 });
    i++;
  }

  // Calculate bracket depth and pair matching
  const parenStack: { tokenIndex: number; depth: number }[] = [];
  let currentDepth = 0;

  for (let idx = 0; idx < rawTokens.length; idx++) {
    const t = rawTokens[idx];
    if (t.type === "LPAREN") {
      t.depth = currentDepth;
      parenStack.push({ tokenIndex: idx, depth: currentDepth });
      currentDepth++;
    } else if (t.type === "RPAREN") {
      if (parenStack.length > 0) {
        const matching = parenStack.pop()!;
        t.depth = matching.depth;
        currentDepth = Math.max(0, currentDepth - 1);
      } else {
        t.depth = 0;
        t.unmatched = true;
      }
    }
  }

  while (parenStack.length > 0) {
    const unmatched = parenStack.pop()!;
    rawTokens[unmatched.tokenIndex].unmatched = true;
  }

  return rawTokens;
}

/**
 * Character-accurate AST Formula Linter & Static Type Validator
 */
export function lintFormula(
  formula: string,
  fields: CRFField[] = [],
  currentFieldId?: string
): FormulaLintResult {
  const trimmed = (formula || "").trim();
  const diagnostics: FormulaDiagnostic[] = [];
  const unmatchedBracketIndices: number[] = [];

  if (!trimmed) {
    return {
      isValid: true,
      tokens: [],
      diagnostics: [
        {
          severity: "info",
          message: "Formula is empty. Enter an arithmetic expression or choose a clinical preset.",
          start: 0,
          end: 0,
          code: "EMPTY_FORMULA",
        },
      ],
      unmatchedBracketIndices: [],
      referencedVariables: [],
    };
  }

  const tokens = tokenizeWithSpans(formula);
  const referencedVarsMap = new Map<
    string,
    { name: string; field?: CRFField; isNumeric: boolean; exists: boolean }
  >();

  const fieldLookup = new Map<string, CRFField>();
  fields.forEach((f) => {
    fieldLookup.set(f.id.toLowerCase(), f);
    fieldLookup.set(f.variableName.toLowerCase(), f);
  });

  for (let idx = 0; idx < tokens.length; idx++) {
    const token = tokens[idx];
    const nextToken: HighlightToken | undefined = tokens[idx + 1];

    if (token.type === "INVALID") {
      diagnostics.push({
        severity: "error",
        message: `Unexpected or invalid character "${token.value}"`,
        start: token.start,
        end: token.end,
        code: "UNEXPECTED_TOKEN",
      });
    }

    if (token.type === "LPAREN") {
      if (token.unmatched) {
        unmatchedBracketIndices.push(token.start);
        diagnostics.push({
          severity: "error",
          message: "Unclosed opening parenthesis '('",
          start: token.start,
          end: token.end,
          code: "UNMATCHED_LPAREN",
        });
      }

      if (nextToken && nextToken.type === "RPAREN") {
        diagnostics.push({
          severity: "error",
          message: "Empty parentheses '()' with no expression inside",
          start: token.start,
          end: nextToken.end,
          code: "EMPTY_PARENTHESES",
        });
      }
    }

    if (token.type === "RPAREN") {
      if (token.unmatched) {
        unmatchedBracketIndices.push(token.start);
        diagnostics.push({
          severity: "error",
          message: "Unexpected closing parenthesis ')' with no matching opening '('",
          start: token.start,
          end: token.end,
          code: "UNMATCHED_RPAREN",
        });
      }
    }

    if (token.type === "OP") {
      if (
        nextToken &&
        nextToken.type === "OP" &&
        nextToken.value !== "-"
      ) {
        diagnostics.push({
          severity: "error",
          message: `Consecutive operators "${token.value} ${nextToken.value}" are not permitted`,
          start: token.start,
          end: nextToken.end,
          code: "CONSECUTIVE_OPERATORS",
        });
      }

      if (token.value === "/" && nextToken && nextToken.type === "NUMBER" && parseFloat(nextToken.value) === 0) {
        diagnostics.push({
          severity: "error",
          message: "Static division by zero (/ 0)",
          start: token.start,
          end: nextToken.end,
          code: "DIVISION_BY_ZERO",
        });
      }
    }

    if (token.type === "IDENTIFIER") {
      const varKey = token.value.toLowerCase();
      const matchedField = fieldLookup.get(varKey);

      if (
        currentFieldId &&
        (varKey === currentFieldId.toLowerCase() ||
          (matchedField && matchedField.id.toLowerCase() === currentFieldId.toLowerCase()))
      ) {
        diagnostics.push({
          severity: "error",
          message: `Circular dependency: field cannot reference its own variable "${token.value}"`,
          start: token.start,
          end: token.end,
          code: "CIRCULAR_REFERENCE",
        });
      }

      if (!matchedField) {
        referencedVarsMap.set(token.value, {
          name: token.value,
          exists: false,
          isNumeric: false,
        });

        if (nextToken && nextToken.type === "LPAREN") {
          diagnostics.push({
            severity: "error",
            message: `Unknown mathematical function "${token.value}()". Supported functions: round, sqrt, abs, max, min, floor, ceil, exp, log`,
            start: token.start,
            end: token.end,
            code: "UNKNOWN_FUNCTION",
          });
        } else {
          diagnostics.push({
            severity: "warning",
            message: `Unknown variable "${token.value}" not found in current study form fields`,
            start: token.start,
            end: token.end,
            code: "UNKNOWN_VARIABLE",
          });
        }
      } else {
        const isNumeric = NUMERIC_DATA_TYPES.has(matchedField.dataType);
        referencedVarsMap.set(token.value, {
          name: token.value,
          field: matchedField,
          exists: true,
          isNumeric,
        });

        if (!isNumeric) {
          diagnostics.push({
            severity: "warning",
            message: `Field "${matchedField.label}" (${matchedField.variableName}) has non-numeric type "${matchedField.dataType}". Expected number, integer, or calculated.`,
            start: token.start,
            end: token.end,
            code: "NON_NUMERIC_VARIABLE",
          });
        }
      }
    }

    if (token.type === "FUNCTION") {
      const fnName = token.value.toLowerCase();
      if (nextToken && nextToken.type === "LPAREN") {
        let depth = 0;
        let argCount = 0;
        let hasContent = false;
        let endIdx = idx + 1;

        for (let j = idx + 1; j < tokens.length; j++) {
          const t = tokens[j];
          if (t.type === "LPAREN") {
            depth++;
          } else if (t.type === "RPAREN") {
            depth--;
            if (depth === 0) {
              if (hasContent) argCount++;
              endIdx = j;
              break;
            }
          } else if (t.type === "COMMA" && depth === 1) {
            argCount++;
            hasContent = false;
          } else if (depth === 1 && t.type !== "COMMA") {
            hasContent = true;
          }
        }

        if (depth === 0) {
          if (fnName === "sqrt" && argCount !== 1) {
            diagnostics.push({
              severity: "error",
              message: `Function "sqrt(x)" expects exactly 1 argument, but received ${argCount}`,
              start: token.start,
              end: tokens[endIdx]?.end ?? token.end,
              code: "INVALID_ARITY",
            });
          } else if (fnName === "round" && (argCount < 1 || argCount > 2)) {
            diagnostics.push({
              severity: "error",
              message: `Function "round(x, [decimals])" expects 1 or 2 arguments, but received ${argCount}`,
              start: token.start,
              end: tokens[endIdx]?.end ?? token.end,
              code: "INVALID_ARITY",
            });
          } else if ((fnName === "abs" || fnName === "floor" || fnName === "ceil" || fnName === "exp" || fnName === "log") && argCount !== 1) {
            diagnostics.push({
              severity: "error",
              message: `Function "${fnName}(x)" expects exactly 1 argument, but received ${argCount}`,
              start: token.start,
              end: tokens[endIdx]?.end ?? token.end,
              code: "INVALID_ARITY",
            });
          }
        }
      }
    }
  }

  const lastToken = tokens[tokens.length - 1];
  if (lastToken && (lastToken.type === "OP" || lastToken.type === "COMMA")) {
    diagnostics.push({
      severity: "error",
      message: `Expression ends unexpectedly with trailing "${lastToken.value}"`,
      start: lastToken.start,
      end: lastToken.end,
      code: "TRAILING_OPERATOR",
    });
  }

  const hasErrors = diagnostics.some((d) => d.severity === "error");

  return {
    isValid: !hasErrors,
    tokens,
    diagnostics,
    unmatchedBracketIndices,
    referencedVariables: Array.from(referencedVarsMap.values()),
  };
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
