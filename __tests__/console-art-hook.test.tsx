/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useConsoleArt } from "@/hooks/useConsoleArt";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe("useConsoleArt Hook", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    vi.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function TestComponent() {
    useConsoleArt();
    return <div>Console Art Test</div>;
  }

  it("logs ASCII art to console directly when requestIdleCallback is supported", async () => {
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    (window as any).requestIdleCallback = (cb: () => void) => {
      cb();
      return 123;
    };
    (window as any).cancelIdleCallback = vi.fn();

    await act(async () => {
      root.render(<TestComponent />);
    });

    await vi.runAllTimersAsync();
    expect(logSpy).toHaveBeenCalled();
    const printedArt = logSpy.mock.calls[0][0];
    expect(printedArt).toContain("_______");
    expect(printedArt).toContain("Welcome, Developer!");
  });

  it("falls back to setTimeout when requestIdleCallback is unavailable and prints console art", async () => {
    delete (window as any).requestIdleCallback;
    delete (window as any).cancelIdleCallback;

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    await act(async () => {
      root.render(<TestComponent />);
    });

    await vi.runAllTimersAsync();
    expect(logSpy).toHaveBeenCalled();
    const printedArt = logSpy.mock.calls[0][0];
    expect(printedArt).toContain("_______");
    expect(printedArt).toContain("Welcome, Developer!");
  });
});
