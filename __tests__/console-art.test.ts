/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";

// Since Vitest hoists vi.mock(), variables accessed inside must start with 'mock'
let mockEffectCallback: (() => void) | null = null;

vi.mock("react", async (importOriginal) => {
  const original = await importOriginal<typeof import("react")>();
  return {
    ...original,
    useEffect: vi.fn((cb: any) => {
      mockEffectCallback = cb;
    }),
  };
});

// Define global.window to prevent environment checks from throwing
(global as any).window = {
  requestIdleCallback: vi.fn((cb: any) => {
    cb();
    return 123;
  }),
  cancelIdleCallback: vi.fn(),
};

import { useConsoleArt } from "@/hooks/useConsoleArt";

describe("useConsoleArt Hook", () => {
  const originalFetch = global.fetch;
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  let consoleLogMock: ReturnType<typeof vi.fn>;
  let consoleErrorMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockEffectCallback = null;
    (window as any).requestIdleCallback = vi.fn((cb: any) => {
      cb();
      return 123;
    });
    (window as any).cancelIdleCallback = vi.fn();

    consoleLogMock = vi.fn();
    consoleErrorMock = vi.fn();
    console.log = consoleLogMock as any;
    console.error = consoleErrorMock as any;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
    vi.clearAllMocks();
  });

  it("should schedule fetching and log on idle success", async () => {
    const mockAscii = "  _______  ";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockAscii),
    } as Response);

    // Call the hook to register the effect callback
    useConsoleArt();

    // Verify useEffect was called and we captured the callback
    expect(mockEffectCallback).toBeTypeOf("function");

    // Manually trigger the effect callback
    mockEffectCallback!();

    expect(window.requestIdleCallback).toHaveBeenCalled();
    
    // Wait for the final log assertion to be true as subsequent promises resolve
    await vi.waitFor(() => {
      expect(consoleLogMock).toHaveBeenCalledWith(mockAscii);
    });

    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it("should fail silently on network fetch failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network Error"));

    useConsoleArt();
    expect(mockEffectCallback).toBeTypeOf("function");
    mockEffectCallback!();

    expect(window.requestIdleCallback).toHaveBeenCalled();

    // Wait until fetch is called to ensure the async chain has completed
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/ascii-art.txt");
    });

    expect(consoleLogMock).not.toHaveBeenCalled();
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it("should fail silently on non-2xx response status", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    } as Response);

    useConsoleArt();
    expect(mockEffectCallback).toBeTypeOf("function");
    mockEffectCallback!();

    expect(window.requestIdleCallback).toHaveBeenCalled();

    // Wait until fetch is called to ensure the async chain has completed
    await vi.waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/ascii-art.txt");
    });

    expect(consoleLogMock).not.toHaveBeenCalled();
    expect(consoleErrorMock).not.toHaveBeenCalled();
  });

  it("should fall back to setTimeout if requestIdleCallback is not available in window", async () => {
    // Temporarily delete requestIdleCallback from window
    delete (window as any).requestIdleCallback;
    
    vi.useFakeTimers();

    const mockAscii = "  _______  ";
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: () => Promise.resolve(mockAscii),
    } as Response);

    useConsoleArt();
    expect(mockEffectCallback).toBeTypeOf("function");
    mockEffectCallback!();

    // Fast-forward timers
    vi.advanceTimersByTime(1);
    vi.useRealTimers();

    // Wait for the final log assertion to be true as subsequent promises resolve
    await vi.waitFor(() => {
      expect(consoleLogMock).toHaveBeenCalledWith(mockAscii);
    });

    expect(consoleErrorMock).not.toHaveBeenCalled();
  });
});
