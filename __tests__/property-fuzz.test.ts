import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  parseFormula,
  formatFormula,
  extractVariables,
  evaluateAst,
  areAstsEqual,
  type PropAst,
} from "@/lib/proof-utils";
import {
  calculateColumnCount,
  calculateColumnWidth,
  distributeItemsGreedily,
} from "@/lib/graphics-engine";
import { sanitizeString, sanitizeError } from "@/lib/error-sanitization";
import { validateSyncRequest } from "@/lib/security";
import { NextRequest } from "next/server";
import {
  DEMOGRAPHICS_SCENARIO,
  advanceDesk,
  advanceTable,
  createDeskState,
  createTableState,
  evaluateHand,
  roundRatio,
  scoreTimeline,
  type DeskAction,
  type TableAction,
  type RoundingMode,
} from "@/lib/trial-and-error";

// Arbitrary generator for Propositional Logic ASTs
const varNames = ["P", "Q", "R", "S", "A", "B", "C"];
const leafAstArbitrary: fc.Arbitrary<PropAst> = fc
  .constantFrom(...varNames)
  .map((name) => ({
    type: "var" as const,
    name,
  }));

const astArbitrary: fc.Arbitrary<PropAst> = fc.letrec((tie) => ({
  tree: fc.oneof(
    { depthSize: "small" },
    leafAstArbitrary,
    fc.constant<PropAst>({ type: "bottom" }),
    fc.record({
      type: fc.constant("not" as const),
      operand: tie("tree") as fc.Arbitrary<PropAst>,
    }),
    fc.record({
      type: fc.constantFrom(
        "and" as const,
        "or" as const,
        "implies" as const,
        "iff" as const
      ),
      left: tie("tree") as fc.Arbitrary<PropAst>,
      right: tie("tree") as fc.Arbitrary<PropAst>,
    })
  ),
})).tree;

describe("Shift-Left Fuzz & Property-Based Verification", () => {
  describe("Formal Logic AST & Proof Engine Invariants", () => {
    it("never throws unhandled exceptions when parsing arbitrary fuzzed string inputs", () => {
      fc.assert(
        fc.property(fc.string({ maxLength: 200 }), (rawString) => {
          expect(() => {
            const ast = parseFormula(rawString);
            if (ast) {
              const formatted = formatFormula(ast);
              expect(typeof formatted).toBe("string");
            }
          }).not.toThrow();
        }),
        { numRuns: 200 }
      );
    });

    it("satisfies double-negation evaluation equivalence for any generated AST and valuation", () => {
      fc.assert(
        fc.property(
          astArbitrary,
          fc.dictionary(fc.constantFrom(...varNames), fc.boolean()),
          (ast, env) => {
            const notNotAst: PropAst = {
              type: "not",
              operand: {
                type: "not",
                operand: ast,
              },
            };

            const directVal = evaluateAst(ast, env);
            const doubleNotVal = evaluateAst(notNotAst, env);
            expect(doubleNotVal).toBe(directVal);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("satisfies De Morgan's Law: not(A and B) <=> (not A or not B)", () => {
      fc.assert(
        fc.property(
          astArbitrary,
          astArbitrary,
          fc.dictionary(fc.constantFrom(...varNames), fc.boolean()),
          (astA, astB, env) => {
            const notAAndB: PropAst = {
              type: "not",
              operand: { type: "and", left: astA, right: astB },
            };
            const notAOrNotB: PropAst = {
              type: "or",
              left: { type: "not", operand: astA },
              right: { type: "not", operand: astB },
            };

            expect(evaluateAst(notAAndB, env)).toBe(
              evaluateAst(notAOrNotB, env)
            );
          }
        ),
        { numRuns: 100 }
      );
    });

    it("extractVariables returns a unique list of variable names", () => {
      fc.assert(
        fc.property(astArbitrary, (ast) => {
          const vars = extractVariables(ast);
          const uniqueSet = new Set(vars);
          expect(vars.length).toBe(uniqueSet.size);
        }),
        { numRuns: 100 }
      );
    });

    it("areAstsEqual is reflexive and symmetric", () => {
      fc.assert(
        fc.property(astArbitrary, astArbitrary, (ast1, ast2) => {
          expect(areAstsEqual(ast1, ast1)).toBe(true);
          expect(areAstsEqual(ast1, ast2)).toBe(areAstsEqual(ast2, ast1));
        }),
        { numRuns: 100 }
      );
    });
  });

  describe("Masonry Graphics & Layout Invariants", () => {
    const breakpoints = { MD: 768, LG: 1024 };
    const cols = { SM: 1, MD: 2, LG: 3 };

    it("calculateColumnCount is monotonic with container width", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100, max: 3000 }),
          fc.integer({ min: 100, max: 3000 }),
          (w1, w2) => {
            const minW = Math.min(w1, w2);
            const maxW = Math.max(w1, w2);

            const colsMin = calculateColumnCount(minW, breakpoints, cols);
            const colsMax = calculateColumnCount(maxW, breakpoints, cols);

            expect(colsMin).toBeLessThanOrEqual(colsMax);
            expect([cols.SM, cols.MD, cols.LG]).toContain(colsMin);
            expect([cols.SM, cols.MD, cols.LG]).toContain(colsMax);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("calculateColumnWidth preserves exact total container width across gaps", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 400, max: 2500 }),
          fc.integer({ min: 1, max: 4 }),
          fc.integer({ min: 0, max: 48 }),
          (containerWidth, colCount, gap) => {
            const colWidth = calculateColumnWidth(
              containerWidth,
              colCount,
              gap
            );
            const reconstructed = colWidth * colCount + gap * (colCount - 1);
            expect(Math.abs(reconstructed - containerWidth)).toBeLessThan(1e-6);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("distributeItemsGreedily places every item into columns with non-negative heights", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.string({ minLength: 1 }),
              height: fc.integer({ min: 10, max: 1000 }),
            }),
            { maxLength: 50 }
          ),
          fc.integer({ min: 1, max: 6 }),
          fc.integer({ min: 0, max: 32 }),
          (items, colCount, gap) => {
            const { columns, columnHeights } = distributeItemsGreedily(
              items,
              colCount,
              gap
            );

            expect(columns.length).toBe(colCount);
            expect(columnHeights.length).toBe(colCount);

            const totalItemsPlaced = columns.reduce(
              (acc, col) => acc + col.length,
              0
            );
            expect(totalItemsPlaced).toBe(items.length);

            for (const h of columnHeights) {
              expect(h).toBeGreaterThanOrEqual(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe("Security & Error Sanitization Invariants", () => {
    it("scrubs any arbitrary system paths in strings without throwing", () => {
      fc.assert(
        fc.property(
          fc.string(),
          fc.constantFrom(
            "/Users/fred/Code/secret.ts",
            "/home/ubuntu/app/server.js",
            "C:\\Users\\admin\\file.txt"
          ),
          (prefix, pathSample) => {
            const raw = `${prefix} ${pathSample} debug trace`;
            const sanitized = sanitizeString(raw);
            expect(sanitized).not.toContain(pathSample);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("sanitizeError is idempotent in production", () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          "production";

        fc.assert(
          fc.property(fc.string({ minLength: 1 }), (msg) => {
            const err = new Error(`/Users/admin/app/file.ts: ${msg}`);
            const pass1 = sanitizeError(err) as Error;
            const pass2 = sanitizeError(pass1) as Error;

            expect(pass1.message).toBe(pass2.message);
            expect(pass1.name).toBe(pass2.name);
          }),
          { numRuns: 50 }
        );
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          originalEnv;
      }
    });

    it("validateSyncRequest strictly fails closed on mismatched authorization headers", () => {
      const originalEnv = process.env.NODE_ENV;
      const originalSecret = process.env.CRON_SECRET;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          "production";
        process.env.CRON_SECRET = "production-super-secret-token";

        fc.assert(
          fc.property(
            fc
              .string()
              .filter((s) => s !== "Bearer production-super-secret-token"),
            (invalidAuthHeader) => {
              const req = new NextRequest(
                "https://example.com/api/telemetry/sync",
                {
                  headers: { authorization: invalidAuthHeader },
                }
              );

              const result = validateSyncRequest(req);
              expect(result.isValid).toBe(false);
              expect(result.errorResponse?.status).toBe(401);
            }
          ),
          { numRuns: 50 }
        );
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV =
          originalEnv;
        process.env.CRON_SECRET = originalSecret;
      }
    });
  });
  describe("Trial & Error Scoring, Rounding & Replay Invariants", () => {
    const modeArbitrary = fc.constantFrom<RoundingMode>(
      "HALF_EVEN",
      "HALF_AWAY_FROM_ZERO",
      "TRUNCATE"
    );

    it("rounds every ratio to within one unit of the last displayed place", () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1_000_000, max: 1_000_000 }),
          fc.integer({ min: 1, max: 10_000 }),
          fc.integer({ min: 0, max: 4 }),
          modeArbitrary,
          (numerator, denominator, precision, mode) => {
            const rounded = roundRatio(numerator, denominator, precision, mode);
            expect(rounded).not.toBeNull();
            const error = Math.abs(Number(rounded) - numerator / denominator);
            expect(error).toBeLessThanOrEqual(10 ** -precision + 1e-9);
            if (mode === "TRUNCATE") {
              expect(Math.abs(Number(rounded))).toBeLessThanOrEqual(
                Math.abs(numerator / denominator) + 1e-9
              );
            }
          }
        )
      );
    });

    it("never scores a hand below zero, and zeroes any hand carrying a ×0 rule", () => {
      const ruleArbitrary = fc.record({
        ruleId: fc.constantFrom("R1", "R2", "R3"),
        passed: fc.boolean(),
        chipsDelta: fc.integer({ min: -200, max: 200 }),
        multDelta: fc.integer({ min: -20, max: 20 }),
        multMultiplier: fc.option(fc.constantFrom(0, 0.5, 1, 1.5, 2), {
          nil: undefined,
        }),
        evidence: fc.constant("fuzz"),
      });
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.constant("card"),
              chips: fc.nat(300),
              mult: fc.nat(20),
            }),
            {
              minLength: 1,
              maxLength: 5,
            }
          ),
          fc.array(ruleArbitrary, { maxLength: 8 }),
          (cards, ruleResults) => {
            const input = {
              handType: "HIGH_TABLE" as const,
              cards,
              ruleResults,
            };
            const result = evaluateHand(input);
            expect(Number.isInteger(result.score)).toBe(true);
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(evaluateHand(input)).toEqual(result);
            if (ruleResults.some((r) => r.multMultiplier === 0)) {
              expect(result.score).toBe(0);
              expect(result.zeroRule.triggered).toBe(true);
            }
          }
        )
      );
    });

    it("replays any QC Desk move sequence to an identical state with conserved CPU", () => {
      const actionArbitrary: fc.Arbitrary<DeskAction> = fc.oneof(
        fc.record({
          type: fc.constant("INSPECT_CELL" as const),
          row: fc.integer({ min: -1, max: 5 }),
          col: fc.integer({ min: -1, max: 3 }),
        }),
        fc.record({
          type: fc.constant("CORRECT_FINDING" as const),
          findingId: fc.constantFrom(
            "SAP-DM-01@r2c2",
            "SAP-DM-02@r2c1",
            "SAP-DM-03@r1c2",
            "SAP-DM-02@r2c0",
            "missing"
          ),
        }),
        fc.constant<DeskAction>({ type: "PLAY_HAND" }),
        fc.constant<DeskAction>({ type: "DISCARD" })
      );
      fc.assert(
        fc.property(fc.array(actionArbitrary, { maxLength: 40 }), (actions) => {
          const replay = () =>
            actions.reduce(
              (state, action) =>
                advanceDesk(DEMOGRAPHICS_SCENARIO, state, action),
              createDeskState(DEMOGRAPHICS_SCENARIO)
            );
          const first = replay();
          expect(replay()).toEqual(first);
          expect(first.cpu.available).toBeGreaterThanOrEqual(0);
          expect(first.cpu.available + first.cpu.spent).toBe(
            DEMOGRAPHICS_SCENARIO.startingCpu
          );
          expect(first.cpu.spent).toBe(first.handsPlayed * 2 + first.discards);
        })
      );
    });

    it("replays any Card Table move sequence identically, conserving CPU and bounding hand and selection", () => {
      const cardIds = DEMOGRAPHICS_SCENARIO.deck.map((card) => card.id);
      const tableAction: fc.Arbitrary<TableAction> = fc.oneof(
        fc.record({
          type: fc.constant("TOGGLE_SELECT" as const),
          cardId: fc.constantFrom(...cardIds, "missing"),
        }),
        fc.record({
          type: fc.constant("INSPECT_CARD" as const),
          cardId: fc.constantFrom(...cardIds),
        }),
        fc.record({
          type: fc.constant("INSPECT_CELL" as const),
          row: fc.integer({ min: -1, max: 5 }),
          col: fc.integer({ min: -1, max: 3 }),
        }),
        fc.record({
          type: fc.constant("CORRECT_FINDING" as const),
          findingId: fc.constantFrom(
            "SAP-DM-01@r2c2",
            "SAP-DM-02@r2c1",
            "SAP-DM-03@r1c2",
            "SAP-DM-02@r2c0",
            "missing"
          ),
        }),
        fc.constant<TableAction>({ type: "CLOSE_INSPECT" }),
        fc.constant<TableAction>({ type: "PLAY_HAND" }),
        fc.constant<TableAction>({ type: "DISCARD" })
      );
      const { table } = DEMOGRAPHICS_SCENARIO;
      fc.assert(
        fc.property(fc.array(tableAction, { maxLength: 60 }), (actions) => {
          const replay = () =>
            actions.reduce(
              (state, action) =>
                advanceTable(DEMOGRAPHICS_SCENARIO, state, action),
              createTableState(DEMOGRAPHICS_SCENARIO)
            );
          const first = replay();
          expect(replay()).toEqual(first);
          expect(first.cpu.available).toBeGreaterThanOrEqual(0);
          expect(first.cpu.available + first.cpu.spent).toBe(table.startingCpu);
          expect(first.hand.length).toBeLessThanOrEqual(table.handSize);
          expect(first.selected.length).toBeLessThanOrEqual(table.maxSelection);
          expect(first.selected.every((id) => first.hand.includes(id))).toBe(
            true
          );
          expect(new Set(first.hand).size).toBe(first.hand.length);
        })
      );
    });

    it("sums every score timeline back to evaluateHand exactly", () => {
      const rule = fc.record({
        ruleId: fc.constantFrom("R1", "R2", "R3"),
        passed: fc.boolean(),
        chipsDelta: fc.integer({ min: -50, max: 50 }),
        multDelta: fc.integer({ min: -5, max: 5 }),
        multMultiplier: fc.option(fc.constantFrom(0, 0.5, 1, 2), {
          nil: undefined,
        }),
        evidence: fc.constant("fuzz"),
      });
      const relic = fc.record({
        sourceId: fc.constantFrom("RELIC-A", "RELIC-B"),
        label: fc.constant("relic"),
        chips: fc.integer({ min: 0, max: 50 }),
        plusMult: fc.integer({ min: 0, max: 5 }),
        xMult: fc.constantFrom(1, 1.5, 2),
      });
      fc.assert(
        fc.property(
          fc.constantFrom(
            "HIGH_TABLE" as const,
            "TLF_PAIR" as const,
            "CSR_STRAIGHT" as const
          ),
          fc.uniqueArray(
            fc.record({
              id: fc.constantFrom("A", "B", "C", "D", "E"),
              chips: fc.nat(60),
              mult: fc.nat(3),
            }),
            { minLength: 1, maxLength: 5, selector: (c) => c.id }
          ),
          fc.array(rule, { maxLength: 6 }),
          fc.uniqueArray(relic, { maxLength: 2, selector: (r) => r.sourceId }),
          fc.nat(1000),
          (handType, cards, ruleResults, modifiers, before) => {
            const evaluation = evaluateHand({
              handType,
              cards,
              ruleResults,
              modifiers,
            });
            const steps = scoreTimeline(evaluation, {
              roundScoreBefore: before,
              target: 500,
            });
            const total = steps.find((s) => s.kind === "TOTAL");
            const progress = steps[steps.length - 1];
            expect(total?.kind === "TOTAL" && total.score).toBe(
              evaluation.score
            );
            expect(Math.max(0, total!.running.chips)).toBe(
              evaluation.chips.total
            );
            expect(Math.max(0, total!.running.mult)).toBe(
              evaluation.mult.total
            );
            expect(total!.running.xMult).toBeCloseTo(
              evaluation.xMult.product,
              9
            );
            expect(progress.kind === "BLIND_PROGRESS" && progress.after).toBe(
              before + evaluation.score
            );
            expect(steps.filter((s) => s.kind === "ZERO_RULE")).toHaveLength(
              evaluation.zeroRule.triggered ? 1 : 0
            );
            expect(
              scoreTimeline(evaluation, {
                roundScoreBefore: before,
                target: 500,
              })
            ).toEqual(steps);
          }
        )
      );
    });
  });
});
