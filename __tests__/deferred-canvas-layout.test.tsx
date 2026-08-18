// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { usePretextLayout } from "@/hooks/usePretextLayout";
import { scheduleIdleTask } from "@/lib/idle-scheduler";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const TestLayoutComponent: React.FC<{ text: string }> = ({ text }) => {
  const { isReady, height } = usePretextLayout({
    text,
    lineHeight: 20,
    fontSize: 16,
  });

  return (
    <div data-testid="pretext-container">
      <span data-testid="is-ready">{isReady ? "ready" : "pending"}</span>
      <span data-testid="height">{height}</span>
    </div>
  );
};

describe("Deferred Offscreen Canvas Layout Pre-measurements Suite", () => {
  it("executes scheduleIdleTask without blocking main thread frame rendering", async () => {
    vi.useFakeTimers();
    const idleSpy = vi.fn();

    act(() => {
      scheduleIdleTask(idleSpy);
      vi.advanceTimersByTime(100);
    });

    expect(idleSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("defers offscreen canvas layout calculation until idle window without crashing", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestLayoutComponent text="Sample text for offscreen pretext layout pre-measurement" />);
    });

    const isReadyEl = container.querySelector('[data-testid="is-ready"]');
    expect(isReadyEl).not.toBeNull();
    expect(isReadyEl?.textContent).toBe("ready");

    act(() => {
      root.unmount();
    });
    document.body.removeChild(container);
  });
});
