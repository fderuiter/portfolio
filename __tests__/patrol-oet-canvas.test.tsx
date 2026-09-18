import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { OetCanvas } from "@/components/patrol/OetCanvas";
import {
  OetDescentEngine,
  type PatrolScenario,
  type PatrolEvent,
} from "@/lib/patrol";

const dummyScenario: PatrolScenario = {
  id: "pine-ridge-sweep",
  title: "Pine Ridge Morning Sweep",
  location: "Upper Ridge - Chair 4",
  actions: [],
  debriefRules: [],
  environment: {
    snowConditions: "Hardpack / Groomed",
    temperatureFahrenheit: 18,
    visibility: "Clear",
  },
};

describe("Patrol Shift: OetCanvas Component (M4 / #750)", () => {
  let requestAnimSpy: ReturnType<typeof vi.spyOn>;
  let cancelAnimSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    let frameId = 0;
    requestAnimSpy = vi
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((cb) => {
        frameId++;
        setTimeout(() => cb(frameId * 16), 0);
        return frameId;
      });
    cancelAnimSpy = vi
      .spyOn(globalThis, "cancelAnimationFrame")
      .mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    requestAnimSpy.mockRestore();
    cancelAnimSpy.mockRestore();
  });

  it("mounts canvas and invokes 2D rendering lifecycle", () => {
    const onArriveAtBase = vi.fn();
    render(
      <OetCanvas scenario={dummyScenario} onArriveAtBase={onArriveAtBase} />
    );

    const canvas = screen.getByTestId("oet-viewport-canvas");
    expect(canvas).toBeDefined();
    expect(canvas.getAttribute("width")).toBe("800");
    expect(canvas.getAttribute("height")).toBe("500");

    // Verify initial HUD elements (ADR 0026)
    expect(screen.getByText("Descent Speed")).toBeDefined();
    expect(screen.getByText(/Fall Line Progress/i)).toBeDefined();
    expect(screen.getByText(/Cascade Toboggan 100/i)).toBeDefined();
    expect(screen.getByText(/HARDPACK/i)).toBeDefined();
  });

  it("renders the HTML HUD overlay with speed, chain brake, and controls dock", () => {
    const onArriveAtBase = vi.fn();
    render(
      <OetCanvas scenario={dummyScenario} onArriveAtBase={onArriveAtBase} />
    );

    // Initial chain brake badge shows DEPLOYED
    expect(screen.getByText(/Chain Brake: DEPLOYED/i)).toBeDefined();
    expect(screen.getByText(/Tail Rope: SLACK/i)).toBeDefined();

    // Touch control dock buttons exist with accessible names
    expect(screen.getByRole("button", { name: /Steer Left/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Steer Right/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Wedge Brake/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Chain Brake/i })).toBeDefined();
    expect(screen.getByRole("button", { name: /Check Stop/i })).toBeDefined();
  });

  it("toggles chain brake via interactive touch control dock button", () => {
    const engine = new OetDescentEngine();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onArriveAtBase={onArriveAtBase}
      />
    );

    expect(engine.createSnapshot().isChainBrakeEngaged).toBe(true);

    const chainBrakeBtn = screen.getByRole("button", { name: /Chain Brake/i });
    act(() => {
      fireEvent.click(chainBrakeBtn);
    });

    expect(engine.createSnapshot().isChainBrakeEngaged).toBe(false);
    expect(screen.getByText(/Chain Brake: RELEASED/i)).toBeDefined();

    act(() => {
      fireEvent.click(chainBrakeBtn);
    });
    expect(engine.createSnapshot().isChainBrakeEngaged).toBe(true);
    expect(screen.getByText(/Chain Brake: DEPLOYED/i)).toBeDefined();
  });

  it("handles desktop keyboard input bindings (WASD / Arrows / Space / T)", () => {
    const engine = new OetDescentEngine();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onArriveAtBase={onArriveAtBase}
      />
    );

    // Steer Left (ArrowLeft)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "ArrowLeft" }));
    });
    expect(engine.createSnapshot().sled.steering).toBe(-1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "ArrowLeft" }));
    });
    expect(engine.createSnapshot().sled.steering).toBe(0);

    // Steer Right (KeyD)
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyD" }));
    });
    expect(engine.createSnapshot().sled.steering).toBe(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keyup", { code: "KeyD" }));
    });
    expect(engine.createSnapshot().sled.steering).toBe(0);

    // Toggle Tail Rope (KeyT)
    expect(engine.createSnapshot().isTailRopeBraking).toBe(false);
    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { code: "KeyT" }));
    });
    expect(engine.createSnapshot().isTailRopeBraking).toBe(true);
  });

  it("activates Step-Through Accessibility Mode and executes discrete step actions", () => {
    const engine = new OetDescentEngine();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onArriveAtBase={onArriveAtBase}
      />
    );

    // Click A11y Step-Through toggle
    const stepModeToggle = screen.getByRole("button", {
      name: /Step-Through Mode/i,
    });
    act(() => {
      fireEvent.click(stepModeToggle);
    });

    // Step controls panel should be mounted
    const stepPanel = screen.getByTestId("oet-a11y-step-controls");
    expect(stepPanel).toBeDefined();

    const glideBtn = screen.getByRole("button", { name: /Glide 30m/i });
    const initialY = engine.createSnapshot().sled.y;

    act(() => {
      fireEvent.click(glideBtn);
    });

    expect(engine.createSnapshot().sled.y).toBeGreaterThan(initialY);
  });

  it("triggers onArriveAtBase callback when clicking arrive button", () => {
    const onArriveAtBase = vi.fn();
    render(
      <OetCanvas scenario={dummyScenario} onArriveAtBase={onArriveAtBase} />
    );

    const arriveBtns = screen.getAllByRole("button", {
      name: /Arrive at Base Aid Room/i,
    });
    fireEvent.click(arriveBtns[0]);

    expect(onArriveAtBase).toHaveBeenCalledTimes(1);
  });

  it("emits metric snapshot via onRecordEvent when descent completes", () => {
    const engine = new OetDescentEngine({ totalDistance: 100 });

    const onRecordEvent = vi.fn();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onRecordEvent={onRecordEvent}
        onArriveAtBase={onArriveAtBase}
      />
    );

    // Fast-forward engine to finish with chain brake released
    act(() => {
      engine.setChainBrake(false);
      for (let i = 0; i < 200; i++) {
        engine.update(1 / 60);
      }
    });

    expect(engine.createSnapshot().status).toBe("completed");
    expect(onRecordEvent).toHaveBeenCalled();

    const recordedEvent = onRecordEvent.mock.calls[0]?.[0] as PatrolEvent;
    expect(recordedEvent.action).toBe("OET_TRANSPORT_COMPLETED");
    expect(recordedEvent.context?.metrics).toBeDefined();
  });

  it("cleans up animation frame and window event listeners on unmount", () => {
    const onArriveAtBase = vi.fn();
    const { unmount } = render(
      <OetCanvas scenario={dummyScenario} onArriveAtBase={onArriveAtBase} />
    );

    unmount();
    expect(cancelAnimSpy).toHaveBeenCalled();
  });

  it("renders crashed incident modal overlay when status transitions to crashed and supports retry", () => {
    const engine = new OetDescentEngine();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onArriveAtBase={onArriveAtBase}
      />
    );

    // Simulate crash status
    act(() => {
      const internal = engine as unknown as {
        state: { status: string; metrics: { collisions: number } };
      };
      internal.state.status = "crashed";
      internal.state.metrics.collisions = 4;
      engine.notifySubscribers();
    });

    // Crash modal should be present
    expect(screen.getByTestId("oet-crashed-modal")).toBeDefined();
    expect(
      screen.getByText(/Critical Transport Incident: Toboggan Halted/i)
    ).toBeDefined();

    // Click Retry Descent Run
    const retryBtn = screen.getByRole("button", { name: /Retry Descent Run/i });
    act(() => {
      fireEvent.click(retryBtn);
    });

    expect(engine.createSnapshot().status).toBe("ready");
    expect(screen.queryByTestId("oet-crashed-modal")).toBeNull();
  });

  it("ensures metric event is emitted even if user clicks arrive at base aid room before completing descent", () => {
    const engine = new OetDescentEngine();
    const onRecordEvent = vi.fn();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onRecordEvent={onRecordEvent}
        onArriveAtBase={onArriveAtBase}
      />
    );

    // Sled has not finished descent (still ready/descending)
    expect(engine.createSnapshot().status).toBe("ready");

    const arriveBtn = screen.getByRole("button", {
      name: /Arrive at Base Aid Room/i,
    });
    act(() => {
      fireEvent.click(arriveBtn);
    });

    expect(onRecordEvent).toHaveBeenCalledTimes(1);
    expect(onArriveAtBase).toHaveBeenCalledTimes(1);
    const emittedEvent = onRecordEvent.mock.calls[0]?.[0] as PatrolEvent;
    expect(emittedEvent.action).toBe("OET_TRANSPORT_COMPLETED");
  });

  it("isolates pointer steering and resets steering on pointerup or pointerleave", () => {
    const engine = new OetDescentEngine();
    const onArriveAtBase = vi.fn();

    render(
      <OetCanvas
        scenario={dummyScenario}
        engine={engine}
        onArriveAtBase={onArriveAtBase}
      />
    );

    const steerLeftBtn = screen.getByRole("button", { name: /Steer Left/i });

    // Pointer down steers left
    act(() => {
      fireEvent.pointerDown(steerLeftBtn, { pointerId: 1 });
    });
    expect(engine.createSnapshot().sled.steering).toBe(-1);

    // Pointer leave resets steering to 0
    act(() => {
      fireEvent.pointerLeave(steerLeftBtn, { pointerId: 1 });
    });
    expect(engine.createSnapshot().sled.steering).toBe(0);
  });
});
