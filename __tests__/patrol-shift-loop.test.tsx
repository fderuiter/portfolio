import { describe, it, expect, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { PatrolShiftContainer } from "@/components/patrol/PatrolShiftContainer";
import { createPatrolShiftEngine, PATROL_SCENARIOS } from "@/lib/patrol";
import { safeStorage } from "@/lib/safe-storage";

describe("Patrol Shift — M3 Mountain Map Hub & Vertical Slice Integration Loop", () => {
  // The intro persists a "seen" flag (M9, #755), so each case must start from a
  // first-visit state rather than inheriting the previous test's storage.
  beforeEach(() => {
    window.localStorage.clear();
    safeStorage.clearCache?.();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    safeStorage.clearCache?.();
  });

  it("drives the complete happy-path shift loop from INTRO to SHIFT_COMPLETE", () => {
    render(<PatrolShiftContainer />);

    // 1. INTRO Screen
    expect(screen.getByTestId("patrol-intro-screen")).toBeDefined();
    expect(
      screen.getByText(/Welch Village Ski Patrol: Shift Studio/i)
    ).toBeDefined();

    const beginBriefingBtn = screen.getByRole("button", {
      name: /Begin Shift Briefing/i,
    });
    expect(beginBriefingBtn).toBeDefined();
    fireEvent.click(beginBriefingBtn);

    // 2. BRIEFING Screen
    expect(screen.getByTestId("patrol-briefing-screen")).toBeDefined();
    expect(screen.getByText(/Operational Shift Briefing/i)).toBeDefined();

    const departBaseBtn = screen.getByRole("button", {
      name: /Depart Base \/ Open Mountain/i,
    });
    expect(departBaseBtn).toBeDefined();
    fireEvent.click(departBaseBtn);

    // 3. MOUNTAIN MAP Hub (Incident Count: 0)
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();
    expect(screen.getByText(/Mountain Patrol Hub & Trail Map/i)).toBeDefined();
    expect(screen.getByText(/Incidents Resolved:/i)).toBeDefined();

    // Final sweep button should not be rendered when 0 incidents completed
    expect(
      screen.queryByRole("button", {
        name: /Call Final Sweep \/ Complete Shift/i,
      })
    ).toBeNull();

    const standbyDispatchBtn = screen.getByRole("button", {
      name: /Standby on Hill \/ Await Dispatch/i,
    });
    expect(standbyDispatchBtn).toBeDefined();
    fireEvent.click(standbyDispatchBtn);

    // 4. DISPATCH Overlay
    expect(screen.getByTestId("patrol-dispatch-overlay")).toBeDefined();
    expect(screen.getByText(/Incoming Dispatch Callout/i)).toBeDefined();

    const acknowledgeBtn = screen.getByRole("button", {
      name: /Acknowledge & Respond/i,
    });
    expect(acknowledgeBtn).toBeDefined();
    fireEvent.click(acknowledgeBtn);

    // 5. SCENE Interaction
    expect(screen.getByTestId("patrol-scene-interaction")).toBeDefined();
    expect(
      screen.getByText(/On Scene • OEC Clinical Evaluation/i)
    ).toBeDefined();

    // Execute an action on scene
    const firstActionBtn = screen.getByText(
      PATROL_SCENARIOS[0].actions[0].label
    );
    expect(firstActionBtn).toBeDefined();
    fireEvent.click(firstActionBtn);

    const prepTobogganBtn = screen.getByRole("button", {
      name: /Stabilize & Prepare Toboggan/i,
    });
    expect(prepTobogganBtn).toBeDefined();
    fireEvent.click(prepTobogganBtn);

    // 6. OET Toboggan Transport
    expect(screen.getByTestId("patrol-oet-placeholder")).toBeDefined();
    expect(screen.getByText(/OET Fall-Line Transport/i)).toBeDefined();

    const arriveBaseBtn = screen.getByRole("button", {
      name: /Arrive at Base Aid Room/i,
    });
    expect(arriveBaseBtn).toBeDefined();
    fireEvent.click(arriveBaseBtn);

    // 7. HANDOFF Screen
    expect(screen.getByTestId("patrol-handoff-screen")).toBeDefined();
    expect(screen.getByText(/Transfer of Care:/i)).toBeDefined();

    const completeHandoffBtn = screen.getByRole("button", {
      name: /Transfer Care & Complete Log/i,
    });
    expect(completeHandoffBtn).toBeDefined();
    fireEvent.click(completeHandoffBtn);

    // 8. DEBRIEF Review
    expect(screen.getByTestId("patrol-debrief-screen")).toBeDefined();
    expect(screen.getByText(/Incident Performance Review/i)).toBeDefined();

    const returnToHubBtn = screen.getByRole("button", {
      name: /Return to Mountain Patrol Hub/i,
    });
    expect(returnToHubBtn).toBeDefined();
    fireEvent.click(returnToHubBtn);

    // 9. Returned to MOUNTAIN MAP Hub (Incident Count incremented to 1)
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();
    const finalSweepBtn = screen.getByRole("button", {
      name: /Call Final Sweep \/ Complete Shift/i,
    });
    expect(finalSweepBtn).toBeDefined();

    // Conclude shift via Final Sweep
    fireEvent.click(finalSweepBtn);

    // 10. SHIFT_COMPLETE Summary
    expect(screen.getByTestId("patrol-shift-summary")).toBeDefined();
    expect(
      screen.getByText(/Patrol Shift Complete: Daily Operational Summary/i)
    ).toBeDefined();

    const startNewShiftBtn = screen.getByRole("button", {
      name: /Start New Shift/i,
    });
    expect(startNewShiftBtn).toBeDefined();

    // 11. Reset returns to INTRO
    fireEvent.click(startNewShiftBtn);
    expect(screen.getByTestId("patrol-intro-screen")).toBeDefined();
  });

  it("supports skipping intro directly to the Mountain Map Hub", () => {
    render(<PatrolShiftContainer />);

    const skipIntroBtn = screen.getByRole("button", {
      name: /Skip Intro/i,
    });
    expect(skipIntroBtn).toBeDefined();
    fireEvent.click(skipIntroBtn);

    // Should immediately land on Mountain Map Hub
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();
  });

  it("supports multiple incident dispatch cycles before shift completion", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "PATROL_MAP",
    });

    render(<PatrolShiftContainer engine={engine} />);

    // Cycle 1
    fireEvent.click(
      screen.getByRole("button", { name: /Standby on Hill \/ Await Dispatch/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Acknowledge & Respond/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Stabilize & Prepare Toboggan/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Arrive at Base Aid Room/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Transfer Care & Complete Log/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Return to Mountain Patrol Hub/i })
    );

    // Back to map hub with 1 incident completed
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();
    expect(engine.getState().incidentsCompleted).toBe(1);

    // Cycle 2
    fireEvent.click(
      screen.getByRole("button", { name: /Standby on Hill \/ Await Dispatch/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Acknowledge & Respond/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Stabilize & Prepare Toboggan/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Arrive at Base Aid Room/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Transfer Care & Complete Log/i })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Return to Mountain Patrol Hub/i })
    );

    // Back to map hub with 2 incidents completed
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();
    expect(engine.getState().incidentsCompleted).toBe(2);

    // Conclude shift
    fireEvent.click(
      screen.getByRole("button", {
        name: /Call Final Sweep \/ Complete Shift/i,
      })
    );
    expect(screen.getByTestId("patrol-shift-summary")).toBeDefined();
    expect(engine.getEventHistory().length).toBeGreaterThanOrEqual(10);
  });

  it("verifies keyboard accessibility and focusability across all major phase actions", () => {
    render(<PatrolShiftContainer />);

    // Check Begin Shift button is focusable
    const beginBtn = screen.getByRole("button", {
      name: /Begin Shift Briefing/i,
    });
    beginBtn.focus();
    expect(document.activeElement).toBe(beginBtn);

    // Trigger with Enter key
    fireEvent.keyDown(beginBtn, { key: "Enter", code: "Enter" });
    fireEvent.click(beginBtn);

    // In briefing, check depart button
    const departBtn = screen.getByRole("button", {
      name: /Depart Base \/ Open Mountain/i,
    });
    departBtn.focus();
    expect(document.activeElement).toBe(departBtn);

    fireEvent.keyDown(departBtn, { key: " ", code: "Space" });
    fireEvent.click(departBtn);

    // On mountain map, check dispatch button
    const dispatchBtn = screen.getByRole("button", {
      name: /Standby on Hill \/ Await Dispatch/i,
    });
    dispatchBtn.focus();
    expect(document.activeElement).toBe(dispatchBtn);
  });

  it("resets the shift state cleanly when top bar Reset button is clicked", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "PATROL_MAP",
    });

    render(<PatrolShiftContainer engine={engine} />);

    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();

    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(screen.getByTestId("patrol-intro-screen")).toBeDefined();
    expect(engine.getState().phase).toBe("INTRO");
  });

  it("maintains layout integrity when rendered inside a 320px mobile squeeze container", () => {
    const { container } = render(
      <div style={{ width: "320px", maxWidth: "320px", overflowX: "hidden" }}>
        <PatrolShiftContainer />
      </div>
    );

    const root = container.querySelector(
      '[data-testid="patrol-shift-container"]'
    );
    expect(root).toBeDefined();
    expect(root).not.toBeNull();

    // Verify all primary action buttons have min 44px touch target classes
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/min-h-\[44px\]/);
    });
  });

  it("includes prefers-reduced-motion CSS styles for MountainMap animations", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "PATROL_MAP",
    });

    const { container } = render(<PatrolShiftContainer engine={engine} />);
    const styleTag = container.querySelector("style");
    expect(styleTag).not.toBeNull();
    expect(styleTag?.textContent).toContain("prefers-reduced-motion: reduce");
    expect(styleTag?.textContent).toContain("animation: none !important");
  });

  it("seamlessly handles legacy phase names for backward compatibility", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "briefing",
    });

    const { rerender } = render(<PatrolShiftContainer engine={engine} />);
    expect(screen.getByTestId("patrol-briefing-screen")).toBeDefined();

    // Legacy "patrol" phase routes to MountainMap
    const patrolEngine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "patrol",
    });
    rerender(<PatrolShiftContainer engine={patrolEngine} />);
    expect(screen.getByTestId("patrol-mountain-map")).toBeDefined();

    // Legacy "incident" phase routes to SceneInteractionPlaceholder
    const incidentEngine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "incident",
    });
    rerender(<PatrolShiftContainer engine={incidentEngine} />);
    expect(screen.getByTestId("patrol-scene-interaction")).toBeDefined();

    // Legacy "debrief" phase routes to DebriefScreen
    const debriefEngine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "debrief",
    });
    rerender(<PatrolShiftContainer engine={debriefEngine} />);
    expect(screen.getByTestId("patrol-debrief-screen")).toBeDefined();

    // Legacy "completed" phase routes to ShiftSummary
    const completedEngine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "completed",
    });
    rerender(<PatrolShiftContainer engine={completedEngine} />);
    expect(screen.getByTestId("patrol-shift-summary")).toBeDefined();
  });

  it("drives the M7 dimension-based debrief screen from actual event history, not static scenario defaults", () => {
    const customScenario = {
      ...PATROL_SCENARIOS[0],
      id: "custom-debrief-scenario",
      actions: [
        {
          id: "splint-without-clearing-scene",
          label: "Splint Without Clearing the Scene",
          category: "treatment" as const,
          costMinutes: 5,
        },
      ],
      // Scenario-level debriefRules describe a rosy default; the M7 debrief
      // engine must ignore them entirely and score only from what actually
      // happened on scene.
      debriefRules: [
        {
          id: "rule-comms",
          title: "Dispatch Communication",
          category: "protocol",
          passed: true,
          score: 50,
          feedback: "Radio contact established.",
        },
      ],
    };

    const engine = createPatrolShiftEngine([customScenario], {
      initialPhase: "SCENE",
    });
    engine.dispatch({
      type: "RECORD_ACTION",
      action: customScenario.actions[0],
    });
    engine.dispatch({ type: "COMPLETE_SCENE" });
    engine.dispatch({ type: "BEGIN_TRANSPORT" });
    engine.dispatch({ type: "ARRIVE_AT_BASE" });
    engine.dispatch({ type: "COMPLETE_HANDOFF" });

    render(<PatrolShiftContainer engine={engine} />);

    expect(screen.getByTestId("patrol-debrief-screen")).toBeDefined();
    // The old rule-based text/points UI is gone entirely.
    expect(screen.queryByText(/Dispatch Communication/i)).toBeNull();
    expect(screen.queryByText(/\+50 pts/i)).toBeNull();

    // Splinting before the scene was ever secured trips a real HAZARD_ALERT;
    // Scene Management must reflect that near-miss rather than the
    // scenario's rosy static debriefRules default.
    const sceneMeter = screen.getByTestId("dimension-meter-sceneManagement");
    expect(sceneMeter.textContent).toMatch(/Needs Attention/i);
  });

  it("prevents duplicate action execution on scene and protects against rapid double clicking", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "SCENE",
    });

    render(<PatrolShiftContainer engine={engine} />);

    const actionBtn = screen.getByText(PATROL_SCENARIOS[0].actions[0].label);
    expect(actionBtn).toBeDefined();

    // Click once
    fireEvent.click(actionBtn);
    const initialElapsed = engine.getState().timeElapsedMinutes;
    expect(engine.getState().actionHistory).toHaveLength(1);

    // Rapid double click or click after already executed
    fireEvent.click(actionBtn);
    fireEvent.click(actionBtn);

    // Should not record duplicates or inflate time
    expect(engine.getState().actionHistory).toHaveLength(1);
    expect(engine.getState().timeElapsedMinutes).toBe(initialElapsed);
  });

  it("provides accessible screen reader live region and checkbox semantics in briefing checklist", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "BRIEFING",
    });

    const { container } = render(<PatrolShiftContainer engine={engine} />);

    // Live region exists with polite role
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).not.toBeNull();
    expect(liveRegion?.textContent).toContain("Current shift phase: BRIEFING");

    // Checklist items have role="checkbox" and aria-checked
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes.length).toBe(4);
    expect(checkboxes[0].getAttribute("aria-checked")).toBe("true");

    // Toggle checkbox
    fireEvent.click(checkboxes[0]);
    expect(checkboxes[0].getAttribute("aria-checked")).toBe("false");
  });

  it("clears event history completely upon shift reset so new shift starts fresh", () => {
    const engine = createPatrolShiftEngine(PATROL_SCENARIOS, {
      initialPhase: "PATROL_MAP",
    });

    render(<PatrolShiftContainer engine={engine} />);

    // Drive an event to populate history
    fireEvent.click(
      screen.getByRole("button", { name: /Standby on Hill \/ Await Dispatch/i })
    );
    expect(engine.getEventHistory().length).toBeGreaterThan(0);

    // Reset shift
    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    fireEvent.click(resetBtn);

    // State is INTRO and event history is completely reset
    expect(engine.getState().phase).toBe("INTRO");
    expect(engine.getEventHistory()).toHaveLength(0);
  });

  it("dispatches scenarios from custom engine instead of falling back to hardcoded PATROL_SCENARIOS", () => {
    const customAlpha = {
      ...PATROL_SCENARIOS[0],
      id: "custom-alpha-scenario",
      title: "Custom Alpha Scenario",
    };
    const customBeta = {
      ...PATROL_SCENARIOS[0],
      id: "custom-beta-scenario",
      title: "Custom Beta Scenario",
    };

    const engine = createPatrolShiftEngine([customAlpha, customBeta], {
      initialPhase: "PATROL_MAP",
    });

    render(<PatrolShiftContainer engine={engine} />);

    // Await dispatch should dispatch customAlpha
    fireEvent.click(
      screen.getByRole("button", { name: /Standby on Hill \/ Await Dispatch/i })
    );

    expect(screen.getByTestId("patrol-dispatch-overlay")).toBeDefined();
    expect(screen.getByText(/Custom Alpha Scenario/i)).toBeDefined();
    expect(engine.getState().currentScenarioId).toBe("custom-alpha-scenario");
  });
});
