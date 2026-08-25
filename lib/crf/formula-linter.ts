import { CRFField, ClinicalDataType } from "./types";
import { TokenType } from "./expression-evaluator";

export type FormulaTokenType = TokenType | "FUNCTION" | "INVALID";

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

export const KNOWN_MATH_FUNCTIONS = new Set([
  "round",
  "sqrt",
  "cbrt",
  "clamp",
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

export const LOGICAL_KEYWORDS = new Set(["and", "or", "not"]);
export const RELATIONAL_KEYWORDS = new Set([
  "eq",
  "neq",
  "gt",
  "gte",
  "lt",
  "lte",
  "in",
  "contains",
]);

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

    if (
      ch === "+" ||
      ch === "-" ||
      ch === "*" ||
      ch === "/" ||
      ch === "%" ||
      ch === "^"
    ) {
      rawTokens.push({ type: "OP", value: ch, start, end: start + 1 });
      i++;
      continue;
    }

    // 1. Double character relational / logical operators
    if (i + 1 < input.length) {
      const two = input.substring(i, i + 2);
      if (
        two === "==" ||
        two === "!=" ||
        two === "<=" ||
        two === ">=" ||
        two === "<>"
      ) {
        rawTokens.push({
          type: "RELATIONAL_OP",
          value: two,
          start,
          end: start + 2,
        });
        i += 2;
        continue;
      }
      if (two === "&&" || two === "||") {
        rawTokens.push({
          type: "LOGICAL_OP",
          value: two,
          start,
          end: start + 2,
        });
        i += 2;
        continue;
      }
    }

    // 2. Single character relational / logical operators
    if (ch === "=" || ch === "<" || ch === ">") {
      rawTokens.push({
        type: "RELATIONAL_OP",
        value: ch,
        start,
        end: start + 1,
      });
      i++;
      continue;
    }

    if (ch === "!") {
      rawTokens.push({ type: "LOGICAL_OP", value: ch, start, end: start + 1 });
      i++;
      continue;
    }

    // 3. String literals (single or double quotes)
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let strVal = quote;
      i++;
      while (i < input.length && input[i] !== quote) {
        if (input[i] === "\\") {
          strVal += input[i];
          i++;
        }
        if (i < input.length) {
          strVal += input[i];
          i++;
        }
      }
      if (i < input.length && input[i] === quote) {
        strVal += quote;
        i++;
      }
      rawTokens.push({ type: "STRING", value: strVal, start, end: i });
      continue;
    }

    // 4. Square Brackets
    if (ch === "[" || ch === "]") {
      rawTokens.push({ type: "BRACKET", value: ch, start, end: start + 1 });
      i++;
      continue;
    }

    // Numbers (integers or decimals)
    if (
      /[0-9]/.test(ch) ||
      (ch === "." && i + 1 < input.length && /[0-9]/.test(input[i + 1]))
    ) {
      let numStr = "";
      while (i < input.length && (/[0-9]/.test(input[i]) || input[i] === ".")) {
        numStr += input[i];
        i++;
      }
      rawTokens.push({ type: "NUMBER", value: numStr, start, end: i });
      continue;
    }

    // Identifiers, function names, domain-qualified variables, or keyword operators
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < input.length) {
        const char = input[i];
        if (/[a-zA-Z0-9_]/.test(char)) {
          idStr += char;
          i++;
        } else if (
          char === "." &&
          i + 1 < input.length &&
          /[a-zA-Z0-9_]/.test(input[i + 1])
        ) {
          idStr += char;
          i++;
        } else {
          break;
        }
      }

      let lookAhead = i;
      while (lookAhead < input.length && /\s/.test(input[lookAhead])) {
        lookAhead++;
      }

      const idLower = idStr.toLowerCase();

      if (LOGICAL_KEYWORDS.has(idLower)) {
        rawTokens.push({ type: "LOGICAL_OP", value: idStr, start, end: i });
      } else if (RELATIONAL_KEYWORDS.has(idLower)) {
        rawTokens.push({ type: "RELATIONAL_OP", value: idStr, start, end: i });
      } else {
        const isFunc =
          lookAhead < input.length &&
          input[lookAhead] === "(" &&
          KNOWN_MATH_FUNCTIONS.has(idLower);

        rawTokens.push({
          type: isFunc ? "FUNCTION" : "IDENTIFIER",
          value: idStr,
          start,
          end: i,
        });
      }
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
          message:
            "Formula is empty. Enter an arithmetic expression or choose a clinical preset.",
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
    if (f.id) fieldLookup.set(f.id.toLowerCase(), f);
    if (f.variableName) fieldLookup.set(f.variableName.toLowerCase(), f);
    if (f.cdashMetadata?.domain && f.variableName) {
      fieldLookup.set(
        `${f.cdashMetadata.domain}.${f.variableName}`.toLowerCase(),
        f
      );
    }
  });

  const hasRelationalOrLogical = tokens.some(
    (t) =>
      t.type === "RELATIONAL_OP" ||
      t.type === "LOGICAL_OP" ||
      t.type === "STRING"
  );

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
          message:
            "Unexpected closing parenthesis ')' with no matching opening '('",
          start: token.start,
          end: token.end,
          code: "UNMATCHED_RPAREN",
        });
      }
    }

    if (
      token.type === "OP" ||
      token.type === "RELATIONAL_OP" ||
      token.type === "LOGICAL_OP"
    ) {
      if (
        nextToken &&
        (nextToken.type === "OP" ||
          nextToken.type === "RELATIONAL_OP" ||
          nextToken.type === "LOGICAL_OP") &&
        nextToken.value !== "-" &&
        nextToken.value.toLowerCase() !== "not" &&
        nextToken.value !== "!"
      ) {
        diagnostics.push({
          severity: "error",
          message: `Consecutive operators "${token.value} ${nextToken.value}" are not permitted`,
          start: token.start,
          end: nextToken.end,
          code: "CONSECUTIVE_OPERATORS",
        });
      }

      if (
        token.value === "/" &&
        nextToken &&
        nextToken.type === "NUMBER" &&
        parseFloat(nextToken.value) === 0
      ) {
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
      let matchedField = fieldLookup.get(varKey);

      if (!matchedField && varKey.includes(".")) {
        const parts = varKey.split(".");
        const varPart = parts[parts.length - 1];
        matchedField = fieldLookup.get(varPart);
      }

      if (
        currentFieldId &&
        (varKey === currentFieldId.toLowerCase() ||
          (matchedField &&
            matchedField.id.toLowerCase() === currentFieldId.toLowerCase()))
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

        if (!isNumeric && !hasRelationalOrLogical) {
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
          if ((fnName === "sqrt" || fnName === "cbrt") && argCount !== 1) {
            diagnostics.push({
              severity: "error",
              message: `Function "${fnName}(x)" expects exactly 1 argument, but received ${argCount}`,
              start: token.start,
              end: tokens[endIdx]?.end ?? token.end,
              code: "INVALID_ARITY",
            });
          } else if (fnName === "clamp" && argCount !== 3) {
            diagnostics.push({
              severity: "error",
              message: `Function "clamp(val, min, max)" expects exactly 3 arguments, but received ${argCount}`,
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
          } else if (
            (fnName === "abs" ||
              fnName === "floor" ||
              fnName === "ceil" ||
              fnName === "exp" ||
              fnName === "log") &&
            argCount !== 1
          ) {
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
