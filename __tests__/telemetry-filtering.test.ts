import { describe, it, expect, vi, beforeEach } from "vitest";
import { GameEngineException } from "../lib/exceptions";

// Mock Sentry.init to intercept the config passed to it
const mockInit = vi.fn();
vi.mock("@sentry/nextjs", async (importOriginal) => {
  const original = await importOriginal<typeof import("@sentry/nextjs")>();
  return {
    ...original,
    init: (config: Parameters<typeof original.init>[0]) => {
      mockInit(config);
      return original.init(config);
    },
  };
});

describe("Sentry Telemetry Filtering for Game Engine Exceptions", () => {
  beforeEach(() => {
    mockInit.mockClear();
  });

  it("should filter out GameEngineException in Client config", async () => {
    // Dynamically require to ensure we trigger Sentry.init on clean mock
    await import("../sentry.client.config");
    expect(mockInit).toHaveBeenCalled();
    const config = mockInit.mock.calls[0][0];
    expect(config.beforeSend).toBeDefined();

    // Test beforeSend behavior
    const gameError = new GameEngineException("A mock game engine crash");
    const stdError = new Error("A standard runtime exception");

    const event = { event_id: "1" };
    
    // Should discard GameEngineException
    const resultForGame = config.beforeSend(event, { originalException: gameError });
    expect(resultForGame).toBeNull();

    // Should preserve standard errors
    const resultForStd = config.beforeSend(event, { originalException: stdError });
    expect(resultForStd).toEqual(event);
  });

  it("should filter out GameEngineException in Server config", async () => {
    await import("../sentry.server.config");
    expect(mockInit).toHaveBeenCalled();
    // Get the most recent call
    const config = mockInit.mock.calls[mockInit.mock.calls.length - 1][0];
    expect(config.beforeSend).toBeDefined();

    const gameError = new GameEngineException("A mock game engine crash");
    const stdError = new Error("A standard runtime exception");

    const event = { event_id: "2" };
    
    const resultForGame = config.beforeSend(event, { originalException: gameError });
    expect(resultForGame).toBeNull();

    const resultForStd = config.beforeSend(event, { originalException: stdError });
    expect(resultForStd).toEqual(event);
  });

  it("should filter out GameEngineException in Edge config", async () => {
    await import("../sentry.edge.config");
    expect(mockInit).toHaveBeenCalled();
    const config = mockInit.mock.calls[mockInit.mock.calls.length - 1][0];
    expect(config.beforeSend).toBeDefined();

    const gameError = new GameEngineException("A mock game engine crash");
    const stdError = new Error("A standard runtime exception");

    const event = { event_id: "3" };
    
    const resultForGame = config.beforeSend(event, { originalException: gameError });
    expect(resultForGame).toBeNull();

    const resultForStd = config.beforeSend(event, { originalException: stdError });
    expect(resultForStd).toEqual(event);
  });
});
