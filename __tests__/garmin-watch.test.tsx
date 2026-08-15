import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";
import {
  DEVICE_PROFILES,
  VARIABLE_RAM_COSTS,
  createInitialState,
  startGame,
  allocateVariable,
  jettisonOldestVariable,
  triggerGarbageCollection,
  wipeScreenFog,
  updateGameSimulation,
  renderCanvasFrame,
  GROUND_Y,
  PLAYER_HEIGHT,
  JUMP_FORCE,
} from "@/lib/garmin-engine";

describe("GarminWatchSimulator Architecture & Feature Completeness", () => {
  const componentPath = path.resolve(__dirname, "../components/GarminWatchSimulator.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("exports a function or component named GarminWatchSimulator", () => {
    expect(typeof GarminWatchSimulator).toBe("function");
  });

  it("should implement keyboard boundary data-keyboard-boundary='true'", () => {
    expect(content).toContain('data-keyboard-boundary="true"');
    expect(content).toContain("tabIndex={0}");
  });

  it("should support Connect IQ device target profiles: fenix, forerunner, edge", () => {
    expect(content).toContain("deviceTarget");
    expect(content).toContain("fenix");
    expect(content).toContain("forerunner");
    expect(content).toContain("edge");
  });

  it("should support backlight toggling with battery & overheat management", () => {
    expect(content).toContain("handleToggleLight");
    expect(content).toContain("isLightOn");
    expect(content).toContain("battery");
    expect(content).toContain("fogLevel");
  });

  it("should integrate with AudioProvider for authentic Garmin piezo beeps", () => {
    expect(content).toContain("useAudio");
    expect(content).toContain("playButtonTone");
    expect(content).toContain("playBeep");
  });

  it("should render on a 280x280 circular Canvas with pointer swipe wiping", () => {
    expect(content).toContain("canvasRef");
    expect(content).toContain("CANVAS_SIZE");
    expect(content).toContain("handleCanvasPointerMove");
    expect(content).toContain("handleWipeFog");
  });
});

describe("Garmin Connect IQ Simulation Engine (lib/garmin-engine.ts)", () => {
  it("should enforce strict RAM limits per device profile", () => {
    expect(DEVICE_PROFILES.fenix.ramLimitKb).toBe(32.0);
    expect(DEVICE_PROFILES.forerunner.ramLimitKb).toBe(64.0);
    expect(DEVICE_PROFILES.edge.ramLimitKb).toBe(128.0);
  });

  it("should match authentic variable memory footprint formulas", () => {
    expect(VARIABLE_RAM_COSTS.int).toBe(0.2);
    expect(VARIABLE_RAM_COSTS.float).toBe(0.4);
    expect(VARIABLE_RAM_COSTS.string).toBe(0.8);
    expect(VARIABLE_RAM_COSTS.array).toBe(1.6);
  });

  it("should initialize default state correctly", () => {
    const state = createInitialState("fenix");
    expect(state.gameState).toBe("idle");
    expect(state.device).toBe("fenix");
    expect(state.allocatedRamKb).toBe(1.8);
    expect(state.battery).toBe(100);
    expect(state.fogLevel).toBe(0);
  });

  it("should transition from idle to playing on startGame", () => {
    const initial = createInitialState("fenix");
    const started = startGame(initial, "fenix");
    expect(started.gameState).toBe("playing");
    expect(started.isGrounded).toBe(true);
    expect(started.score).toBe(0);
  });

  it("should allocate variables and increase allocated RAM", () => {
    const state = startGame(createInitialState("fenix"));
    const initialRam = state.allocatedRamKb;

    const result = allocateVariable(state, "array", "testArr");
    expect(result.crashed).toBe(false);
    expect(result.state.allocatedRamKb).toBeCloseTo(initialRam + 1.6, 1);
    expect(result.state.variables.length).toBe(state.variables.length + 1);
  });

  it("should trigger Out Of Memory crash when exceeding device RAM limit", () => {
    const state = startGame(createInitialState("fenix"));
    // Set RAM right near 32KB
    state.allocatedRamKb = 31.5;

    const result = allocateVariable(state, "array"); // +1.6KB -> 33.1KB > 32.0KB
    expect(result.crashed).toBe(true);
    expect(result.state.gameState).toBe("crashed");
    expect(result.state.crashReport).toBeDefined();
    expect(result.state.crashReport?.errorType).toBe("Out Of Memory");
    expect(result.state.crashReport?.file).toContain("MonkeyC_Alloc.mc");
  });

  it("should jettison oldest variable and reclaim memory with DOWN button", () => {
    const state = startGame(createInitialState("fenix"));
    const beforeCount = state.variables.length;
    const beforeRam = state.allocatedRamKb;

    const { state: nextState, popped } = jettisonOldestVariable(state);
    expect(popped).toBeDefined();
    expect(nextState.variables.length).toBe(beforeCount - 1);
    expect(nextState.allocatedRamKb).toBeLessThan(beforeRam);
  });

  it("should trigger Garbage Collection with 500ms freeze and heap reclamation", () => {
    let state = startGame(createInitialState("fenix"));
    // Add extra variables
    state = allocateVariable(state, "string").state;
    state = allocateVariable(state, "array").state;
    state = allocateVariable(state, "float").state;

    const beforeRam = state.allocatedRamKb;
    const { state: gcState, freedKb } = triggerGarbageCollection(state);

    expect(gcState.isGcActive).toBe(true);
    expect(gcState.gcTimerMs).toBe(500);
    expect(gcState.allocatedRamKb).toBeLessThan(beforeRam);
    expect(freedKb).toBeGreaterThan(0);

    // Progress time during GC freeze
    const afterFreeze = updateGameSimulation(gcState, 500);
    expect(afterFreeze.isGcActive).toBe(false);
    expect(afterFreeze.gcTimerMs).toBe(0);
  });

  it("should handle jumping physics and gravity update", () => {
    const state = startGame(createInitialState("fenix"));
    state.playerVy = JUMP_FORCE;
    state.isGrounded = false;

    const updated = updateGameSimulation(state, 16.6);
    expect(updated.playerY).toBeLessThan(GROUND_Y - PLAYER_HEIGHT);
    expect(updated.isGrounded).toBe(false);
  });

  it("should drain battery faster when backlight is active and create overheat fog", () => {
    const state = startGame(createInitialState("fenix"));
    state.isLightOn = true;
    state.lightActiveDurationMs = 7000; // > 6000ms overheat threshold

    const updated = updateGameSimulation(state, 1000);
    expect(updated.battery).toBeLessThan(100);
    expect(updated.fogLevel).toBeGreaterThan(0);
  });

  it("should wipe condensation fog when wipeScreenFog is invoked", () => {
    const state = startGame(createInitialState("fenix"));
    state.fogLevel = 0.8;

    const wiped = wipeScreenFog(state, 140, 140, 30);
    expect(wiped.fogLevel).toBeLessThan(0.8);
    expect(wiped.fogWipes.length).toBe(1);
  });

  it("should handle obstacle collision crashes (watchdog, null pointer, stack overflow)", () => {
    const state = startGame(createInitialState("fenix"));
    state.playerY = GROUND_Y - PLAYER_HEIGHT;

    // Test watchdog collision
    const watchdogState = {
      ...state,
      obstacles: [
        {
          id: 101,
          x: 52,
          y: GROUND_Y - 28,
          width: 20,
          height: 28,
          type: "watchdog" as const,
          label: "DOG",
          speed: 2.2,
        },
      ],
    };

    const crashedWatchdog = updateGameSimulation(watchdogState, 16.6);
    expect(crashedWatchdog.gameState).toBe("crashed");
    expect(crashedWatchdog.crashReport?.errorType).toBe("Watchdog Tripped");

    // Test null pointer collision
    const nullState = {
      ...state,
      obstacles: [
        {
          id: 102,
          x: 52,
          y: GROUND_Y - 20,
          width: 16,
          height: 20,
          type: "null_pointer" as const,
          label: "NULL",
          speed: 2.2,
        },
      ],
    };
    const crashedNull = updateGameSimulation(nullState, 16.6);
    expect(crashedNull.gameState).toBe("crashed");
    expect(crashedNull.crashReport?.errorType).toBe("Null Pointer");

    // Test stack overflow collision
    const stkState = {
      ...state,
      obstacles: [
        {
          id: 103,
          x: 52,
          y: GROUND_Y - 24,
          width: 18,
          height: 24,
          type: "stack_overflow" as const,
          label: "STK",
          speed: 2.2,
        },
      ],
    };
    const crashedStk = updateGameSimulation(stkState, 16.6);
    expect(crashedStk.gameState).toBe("crashed");
    expect(crashedStk.crashReport?.errorType).toBe("Symbol Not Found");

    // Test mem_token collection
    const memState = {
      ...state,
      lastObstacleTime: Date.now(),
      obstacles: [
        {
          id: 104,
          x: 52,
          y: GROUND_Y - 24,
          width: 14,
          height: 14,
          type: "mem_token" as const,
          label: "INT",
          speed: 2.2,
          variablePayload: "int" as const,
        },
      ],
    };
    const collectedMem = updateGameSimulation(memState, 16.6);
    expect(collectedMem.gameState).toBe("playing");
    expect(collectedMem.obstacles.length).toBe(0);
  });

  it("should spawn new obstacles when intervals elapse", () => {
    const state = startGame(createInitialState("fenix"));
    state.lastObstacleTime = 0; // Trigger spawn immediately
    state.obstacles = [];

    const updated = updateGameSimulation(state, 16.6);
    expect(updated.obstacles.length).toBe(1);
    expect(updated.obstacles[0].x).toBeGreaterThan(280);
  });

  it("should render canvas frames for active, frozen, foggy, and crashed states", () => {
    const mockCtx = {
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      closePath: () => {},
      arc: () => {},
      clip: () => {},
      clearRect: () => {},
      fillRect: () => {},
      strokeRect: () => {},
      stroke: () => {},
      fill: () => {},
      moveTo: () => {},
      lineTo: () => {},
      fillText: () => {},
      quadraticCurveTo: () => {},
      bezierCurveTo: () => {},
      arcTo: () => {},
      roundRect: () => {},
      measureText: () => ({ width: 40 }),
      translate: () => {},
      createRadialGradient: () => ({
        addColorStop: () => {},
      }),
      fillStyle: "",
      strokeStyle: "",
      lineWidth: 1,
      font: "",
      textAlign: "",
      globalCompositeOperation: "",
    } as unknown as CanvasRenderingContext2D;

    // 1. Normal playing state with light on and obstacles
    const playingState = {
      ...startGame(createInitialState("fenix")),
      isLightOn: true,
      fogLevel: 0.5,
      fogWipes: [{ x: 140, y: 140, radius: 25 }],
      obstacles: [
        { id: 1, x: 100, y: 180, width: 16, height: 20, type: "null_pointer" as const, label: "NULL", speed: 2 },
        { id: 2, x: 150, y: 180, width: 20, height: 28, type: "watchdog" as const, label: "DOG", speed: 2 },
        { id: 3, x: 200, y: 150, width: 14, height: 14, type: "mem_token" as const, label: "FLT", speed: 2, variablePayload: "float" as const },
        { id: 4, x: 250, y: 180, width: 18, height: 24, type: "stack_overflow" as const, label: "STK", speed: 2 },
      ],
    };
    expect(() => renderCanvasFrame(mockCtx, playingState)).not.toThrow();

    // 2. Frozen GC state
    const gcState = {
      ...playingState,
      isGcActive: true,
    };
    expect(() => renderCanvasFrame(mockCtx, gcState)).not.toThrow();

    // 3. Crashed state with BSOD report
    const crashedState = {
      ...playingState,
      gameState: "crashed" as const,
      crashReport: {
        errorType: "Out Of Memory" as const,
        file: "MonkeyC_Alloc.mc",
        line: 12,
        stackTrace: ["Heap Out of Memory", "at Rez.draw()"],
        heapUsedKb: 32.5,
        heapLimitKb: 32.0,
      },
    };
    expect(() => renderCanvasFrame(mockCtx, crashedState)).not.toThrow();
  });
});
