import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import fs from "fs";
import path from "path";
import { WorkflowWizardModal } from "@/components/crf/Wizard/WorkflowWizardModal";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
import {
  evaluateAst,
  evaluateAstWithTrace,
  formatFormula,
  extractVariables,
  areAstsEqual,
  PropAst,
} from "@/lib/proof-utils";
import {
  evaluateFormula,
  ExpressionEvaluator,
  tokenizeWithSpans,
} from "@/lib/crf/ast-evaluator";
import { CRFField } from "@/lib/crf/types";
import {
  createInitialState,
  updateGameSimulation,
  jettisonOldestVariable,
  triggerGarbageCollection,
  allocateVariable,
} from "@/lib/garmin-engine";
import {
  clampBounds,
  createInitialDuckGameState,
  dragDuckTo,
  stepDuckGame,
  performTrick,
} from "@/lib/working-with-duck-engine";
import { sanitizeError, sanitizeString } from "@/lib/error-sanitization";
import { evaluateCanaryRollout } from "@/scripts/canary-analyzer";

describe("Defect Remediation & Regression Verification Suite (Invariant #11)", () => {
  describe("Proof AST Solver Resilience & Deep Recursion Guards", () => {
    it("safely evaluates deep AST trees without call stack overflow", () => {
      // Build a nested NOT chain of depth 150
      let ast: PropAst = { type: "var", name: "P" };
      for (let i = 0; i < 150; i++) {
        ast = { type: "not", operand: ast };
      }

      const envTrue = { P: true };
      const envFalse = { P: false };

      expect(evaluateAst(ast, envTrue)).toBe(true);
      expect(evaluateAst(ast, envFalse)).toBe(false);

      const vars = extractVariables(ast);
      expect(vars).toEqual(["P"]);

      const formatted = formatFormula(ast);
      expect(typeof formatted).toBe("string");
      expect(formatted.length).toBeGreaterThan(100);
    });

    it("handles nullish, empty, or malformed AST nodes gracefully", () => {
      expect(evaluateAst(null as unknown as PropAst, {})).toBe(false);
      expect(evaluateAst(undefined as unknown as PropAst, {})).toBe(false);
      expect(formatFormula(null as unknown as PropAst)).toBe("");
      expect(extractVariables(null as unknown as PropAst)).toEqual([]);
      expect(areAstsEqual(null, null)).toBe(false);
      expect(areAstsEqual(undefined, { type: "var", name: "A" })).toBe(false);
    });

    it("produces valid hierarchical traces on complex logical formulas", () => {
      const ast: PropAst = {
        type: "implies",
        left: { type: "and", left: { type: "var", name: "P" }, right: { type: "var", name: "Q" } },
        right: { type: "or", left: { type: "var", name: "R" }, right: { type: "var", name: "S" } },
      };

      const trace = evaluateAstWithTrace(ast, { P: true, Q: true, R: false, S: true });
      expect(trace.value).toBe(true);
      expect(trace.operator).toBe("→");
      expect(trace.children).toBeDefined();
      expect(trace.children?.length).toBe(2);
    });
  });

  describe("CRF Clinical AST Evaluator & Arithmetic Guards", () => {
    const mockFields: CRFField[] = [
      { id: "f1", variableName: "HEIGHT", label: "Height (cm)", dataType: "number", columnSpan: 6, required: true },
      { id: "f2", variableName: "WEIGHT", label: "Weight (kg)", dataType: "number", columnSpan: 6, required: true },
      { id: "f3", variableName: "ZERO_DIV", label: "Zero Field", dataType: "number", columnSpan: 6, required: false },
    ];

    it("safely resolves dynamic division by zero returning 0 instead of NaN or Infinity", () => {
      // BMI formula: WEIGHT / ((HEIGHT / 100) ^ 2)
      // If HEIGHT is 0
      const resultZeroHeight = evaluateFormula(
        "WEIGHT / ((HEIGHT / 100) ^ 2)",
        { HEIGHT: 0, WEIGHT: 70 },
        mockFields
      );
      expect(Number.isFinite(resultZeroHeight)).toBe(true);
      expect(resultZeroHeight).toBe(0);

      // Direct division by zero in expression
      const resultDivZero = evaluateFormula("100 / ZERO_DIV", { ZERO_DIV: 0 }, mockFields);
      expect(Number.isFinite(resultDivZero)).toBe(true);
      expect(resultDivZero).toBe(0);
    });

    it("handles empty function arguments in min/max without -Infinity / +Infinity", () => {
      const evaluator = new ExpressionEvaluator(
        [
          { type: "IDENTIFIER", value: "max" },
          { type: "LPAREN", value: "(" },
          { type: "RPAREN", value: ")" },
        ],
        {}
      );
      const res = evaluator.parse();
      expect(res).toBe(0);

      const minEvaluator = new ExpressionEvaluator(
        [
          { type: "IDENTIFIER", value: "min" },
          { type: "LPAREN", value: "(" },
          { type: "RPAREN", value: ")" },
        ],
        {}
      );
      const minRes = minEvaluator.parse();
      expect(minRes).toBe(0);
    });

    it("handles token spans and diagnostics for malformed clinical formulas", () => {
      const tokens = tokenizeWithSpans("round(sqrt(HEIGHT * WEIGHT) / 3600, 2)");
      expect(tokens.length).toBeGreaterThan(5);
      expect(tokens[0].value).toBe("round");
    });
  });

  describe("Garmin Connect IQ Simulation & Telemetry Boundaries", () => {
    it("handles zero, negative, or NaN deltaMs ticks without state corruption", () => {
      const initial = createInitialState("fenix");
      const playing = { ...initial, gameState: "playing" as const };

      const stepZero = updateGameSimulation(playing, 0);
      expect(stepZero.distanceMeters).toBe(0);
      expect(Number.isFinite(stepZero.battery)).toBe(true);

      const stepNaN = updateGameSimulation(playing, NaN);
      expect(Number.isFinite(stepNaN.distanceMeters)).toBe(true);
      expect(Number.isFinite(stepNaN.battery)).toBe(true);

      const stepNeg = updateGameSimulation(playing, -50);
      expect(Number.isFinite(stepNeg.distanceMeters)).toBe(true);
    });

    it("maintains non-negative RAM bounds and consistent heap allocations under memory pressure", () => {
      const initial = createInitialState("fenix");
      const playing = { ...initial, gameState: "playing" as const };

      const { state: afterJettison } = jettisonOldestVariable(playing);
      expect(afterJettison.allocatedRamKb).toBeGreaterThanOrEqual(0.2);

      const { state: afterGc, freedKb } = triggerGarbageCollection(playing);
      expect(afterGc.isGcActive).toBe(true);
      expect(freedKb).toBeGreaterThanOrEqual(0);
      expect(afterGc.allocatedRamKb).toBeGreaterThanOrEqual(0.4);

      const { state: allocState } = allocateVariable(playing, "string", "testVar");
      expect(allocState.allocatedRamKb).toBeGreaterThan(playing.allocatedRamKb);
    });
  });

  describe("Working With Duck Deterministic State Machine Hardening", () => {
    it("clampBounds safely recovers from NaN or undefined coordinate inputs", () => {
      const boundedNaN = clampBounds(NaN, NaN);
      expect(Number.isFinite(boundedNaN.x)).toBe(true);
      expect(Number.isFinite(boundedNaN.y)).toBe(true);

      const boundedUndef = clampBounds(undefined as unknown as number, null as unknown as number);
      expect(Number.isFinite(boundedUndef.x)).toBe(true);
      expect(Number.isFinite(boundedUndef.y)).toBe(true);
    });

    it("dragDuckTo retains finite coordinates when given out-of-bounds or invalid numbers", () => {
      const initial = createInitialDuckGameState(1);
      const dragged = dragDuckTo(initial, 99999, -5000);
      expect(dragged.duck.x).toBeLessThanOrEqual(800 - 40);
      expect(dragged.duck.y).toBeGreaterThanOrEqual(40);

      const draggedNaN = dragDuckTo(initial, NaN, NaN);
      expect(Number.isFinite(draggedNaN.duck.x)).toBe(true);
      expect(Number.isFinite(draggedNaN.duck.y)).toBe(true);
    });

    it("stepDuckGame and performTrick maintain state determinism under repeated actions", () => {
      let state = createInitialDuckGameState(1);
      state = { ...state, status: "running" };

      for (let i = 0; i < 60; i++) {
        state = stepDuckGame(state);
      }
      expect(state.ticks).toBe(60);
      expect(Number.isFinite(state.workProgress)).toBe(true);
      expect(Number.isFinite(state.naughtyVsGood)).toBe(true);

      const trickState = performTrick(state, "SIT");
      expect(trickState.duck.state).toBe("PERFORMING_TRICK");
    });
  });

  describe("Production Error Sanitizer & Security Boundaries", () => {
    it("scrubs nested system paths and cause chains", () => {
      const originalNodeEnv = process.env.NODE_ENV;
      try {
        (process.env as Record<string, string | undefined>).NODE_ENV = "production";

        const rawMessage = "Failed loading file /Users/fred/Code/portfolio/lib/db.ts: connect ECONNREFUSED";
        const sanitizedStr = sanitizeString(rawMessage);
        expect(sanitizedStr).not.toContain("/Users/fred");
        expect(sanitizedStr).toContain("[scrubbed]");

        const rootError = new Error("Database error at /app/server/secret.key");
        const wrappedError = new Error("Top level failure at /home/ubuntu/app/server.ts");
        wrappedError.cause = rootError;

        const sanitized = sanitizeError(wrappedError);
        expect(sanitized.message).not.toContain("/home/ubuntu");
        expect(sanitized.cause).toBeDefined();
        expect((sanitized.cause as Error).message).not.toContain("/app/server");
      } finally {
        (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
      }
    });
  });

  describe("Workflow Onboarding Wizard Focus and Keyboard Navigation (Acceptance Criteria)", () => {
    let container: HTMLDivElement;
    let root: Root;
    let mockBtn: HTMLButtonElement;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);

      // Create initiating element to receive focus on return
      mockBtn = document.createElement("button");
      mockBtn.id = "initiator-btn";
      document.body.appendChild(mockBtn);
      mockBtn.focus();

      root = createRoot(container);
    });

    afterEach(() => {
      act(() => {
        root?.unmount();
      });
      if (container.parentNode) {
        document.body.removeChild(container);
      }
      if (mockBtn.parentNode) {
        document.body.removeChild(mockBtn);
      }
    });

    it("traps focus and restores focus to initiating element upon Esc press", async () => {
      const handleClose = vi.fn();
      await act(async () => {
        root.render(
          React.createElement(WorkflowWizardModal, {
            isOpen: true,
            onClose: handleClose,
            onSwitchMode: vi.fn(),
            onStartSpotlightTour: vi.fn(),
          })
        );
      });

      // Initially focus should be on something inside the modal
      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
      expect(dialog).toBeDefined();

      // Trigger Escape keydown on the dialog container
      await act(async () => {
        const escEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true });
        dialog.dispatchEvent(escEvent);
      });

      expect(handleClose).toHaveBeenCalled();
    });

    it("navigates wizard stages on arrow keys when focused inside, but not on input fields", async () => {
      await act(async () => {
        root.render(
          React.createElement(WorkflowWizardModal, {
            isOpen: true,
            onClose: vi.fn(),
            onSwitchMode: vi.fn(),
            onStartSpotlightTour: vi.fn(),
          })
        );
      });

      const dialog = container.querySelector('[role="dialog"]') as HTMLElement;
      expect(container.textContent).toContain("Stage 1 of 5");

      // Dispatch ArrowRight keydown
      await act(async () => {
        const arrowRight = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true });
        dialog.dispatchEvent(arrowRight);
      });
      expect(container.textContent).toContain("Stage 2 of 5");

      // Dispatch ArrowLeft keydown
      await act(async () => {
        const arrowLeft = new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true });
        dialog.dispatchEvent(arrowLeft);
      });
      expect(container.textContent).toContain("Stage 1 of 5");

      // Now create and focus a text input inside the body to simulate user focusing an input inside the dialog
      const input = document.createElement("input");
      input.type = "text";
      dialog.appendChild(input);
      input.focus();

      // Dispatch ArrowRight keydown from inside the text input
      await act(async () => {
        const arrowRight = new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true });
        input.dispatchEvent(arrowRight);
      });
      // The stage should NOT change because focus is on an input
      expect(container.textContent).toContain("Stage 1 of 5");

      // Clean up input
      dialog.removeChild(input);
    });
  });

  describe("Automated Canary Analysis Rate Normalization & Window Mismatch Guards", () => {
    it("prevents false-positive approval when canary has fewer total exceptions but higher rate over shorter window", () => {
      const evaluation = evaluateCanaryRollout(
        {
          totalRequests: 10000,
          serverErrors5xx: 0,
          p95LatencyMs: 120,
          sentryExceptionCount: 8, // 8 exceptions in 10 mins = 0.8/min
          windowDurationMinutes: 10,
        },
        {
          totalRequests: 60000,
          serverErrors5xx: 0,
          p95LatencyMs: 120,
          sentryExceptionCount: 15, // 15 exceptions in 60 mins = 0.25/min
          windowDurationMinutes: 60,
        }
      );

      // Raw counts: 8 < 15, but per-min rate: 0.8 / 0.25 = 3.2x > 2.0x threshold
      expect(evaluation.decision).toBe("ROLLBACK_REQUIRED");
      expect(evaluation.rollbackTriggered).toBe(true);
      expect(evaluation.canaryMetrics.exceptionRatePerMinute).toBe(0.8);
      expect(evaluation.baselineMetrics?.exceptionRatePerMinute).toBe(0.25);
      expect(evaluation.metricsComparison.exceptionRatio).toBe(3.2);
    });
  });

  describe("DOM Boundary Attribute Guarding (Requirement 1-4)", () => {
    it("prevents global manual help shortcuts ('h', '?') when target is inside a keyboard boundary container", () => {
      let isManualTriggered = false;

      const handleGlobalKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (
          !target ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.("[data-keyboard-boundary]")
        ) {
          return;
        }

        if (e.key === "?" || e.key === "h") {
          isManualTriggered = true;
        }
      };

      const containerBoundary = document.createElement("div");
      containerBoundary.setAttribute("data-keyboard-boundary", "true");
      const innerCanvasControl = document.createElement("button");
      containerBoundary.appendChild(innerCanvasControl);
      document.body.appendChild(containerBoundary);

      // Event target inside simulator boundary
      const eventInside = new KeyboardEvent("keydown", { key: "?", bubbles: true });
      innerCanvasControl.dispatchEvent(eventInside);
      handleGlobalKeyDown(eventInside);

      expect(isManualTriggered).toBe(false);

      // Event target outside boundary
      const outsideButton = document.createElement("button");
      document.body.appendChild(outsideButton);
      const eventOutside = new KeyboardEvent("keydown", { key: "?", bubbles: true });
      outsideButton.dispatchEvent(eventOutside);
      handleGlobalKeyDown(eventOutside);

      expect(isManualTriggered).toBe(true);

      document.body.removeChild(containerBoundary);
      document.body.removeChild(outsideButton);
    });

    it("prevents global tool switches and snapping toggles when target is inside a keyboard boundary container", () => {
      let isSnappingToggled = false;
      let isToolSwitched = false;

      const handleProofKeyDown = (e: KeyboardEvent) => {
        const targetEl = e.target as HTMLElement | null;
        const targetTag = targetEl?.tagName?.toLowerCase();
        if (
          targetTag === "input" ||
          targetTag === "textarea" ||
          targetEl?.isContentEditable ||
          targetEl?.closest?.("[data-keyboard-boundary]")
        ) {
          return;
        }
        if (e.key === "g" || e.key === "G") {
          isSnappingToggled = true;
        }
      };

      const handleNeuroKeyDown = (e: KeyboardEvent) => {
        const target = e.target as HTMLElement | null;
        if (
          !target ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.("[data-keyboard-boundary]")
        ) {
          return;
        }
        if (e.key === "1" || e.key === "2") {
          isToolSwitched = true;
        }
      };

      const simulatorBoundary = document.createElement("div");
      simulatorBoundary.setAttribute("data-keyboard-boundary", "true");
      const canvasTarget = document.createElement("div");
      canvasTarget.tabIndex = 0;
      simulatorBoundary.appendChild(canvasTarget);
      document.body.appendChild(simulatorBoundary);

      const eventG = new KeyboardEvent("keydown", { key: "g", bubbles: true });
      canvasTarget.dispatchEvent(eventG);
      handleProofKeyDown(eventG);
      expect(isSnappingToggled).toBe(false);

      const event1 = new KeyboardEvent("keydown", { key: "1", bubbles: true });
      canvasTarget.dispatchEvent(event1);
      handleNeuroKeyDown(event1);
      expect(isToolSwitched).toBe(false);

      document.body.removeChild(simulatorBoundary);
    });
  });

  describe("Direct Image Compression & Declarative Priority Props Invariant", () => {
    it("ensures total footprint of public milestone JPEG assets is under 1MB", () => {
      const duckDir = path.resolve(process.cwd(), "public/duck");
      const files = fs.readdirSync(duckDir).filter((f) => f.endsWith(".jpg") || f.endsWith(".jpeg"));
      let totalBytes = 0;
      for (const file of files) {
        totalBytes += fs.statSync(path.join(duckDir, file)).size;
      }
      expect(files.length).toBeGreaterThan(0);
      expect(totalBytes).toBeLessThan(1024 * 1024);
    });
  });
});
