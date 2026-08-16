// @vitest-environment jsdom
import { describe, it, expect } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useTimelineState } from "@/hooks/useTimelineState";

function renderHookHelper<T>(useHook: () => T) {
  const result = { current: null as unknown as T };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestComponent() {
    result.current = useHook();
    return null;
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    },
  };
}

describe("useTimelineState Hook - Complete Unit & Coverage Suite", () => {
  it("1. should initialize with default state", () => {
    const { result, unmount } = renderHookHelper(() => useTimelineState());
    
    expect(result.current.globalMode).toBe("reality");
    expect(result.current.cardOverrides).toEqual({});
    expect(result.current.getCardMode(0)).toBe("reality");
    expect(result.current.getCardMode(1)).toBe("reality");

    unmount();
  });

  it("2. should update global mode and clear all card overrides", () => {
    const { result, unmount } = renderHookHelper(() => useTimelineState());

    // Toggle card 1
    act(() => {
      result.current.handleCardToggle(1);
    });
    expect(result.current.cardOverrides).toEqual({ 1: "recruiter" });
    expect(result.current.getCardMode(1)).toBe("recruiter");

    // Toggle global mode to recruiter
    act(() => {
      result.current.handleGlobalToggle("recruiter");
    });
    expect(result.current.globalMode).toBe("recruiter");
    expect(result.current.cardOverrides).toEqual({});
    expect(result.current.getCardMode(1)).toBe("recruiter"); // Falls back to global recruiter because overrides are empty

    unmount();
  });

  it("3. should correctly toggle card-level override", () => {
    const { result, unmount } = renderHookHelper(() => useTimelineState());

    // Initially global mode is reality, card 2 is reality (fallback)
    expect(result.current.getCardMode(2)).toBe("reality");

    // Toggle card 2 -> overrides to recruiter
    act(() => {
      result.current.handleCardToggle(2);
    });
    expect(result.current.getCardMode(2)).toBe("recruiter");
    expect(result.current.cardOverrides[2]).toBe("recruiter");

    // Toggle card 2 again -> overrides to reality (opposite of previous override recruiter)
    act(() => {
      result.current.handleCardToggle(2);
    });
    expect(result.current.getCardMode(2)).toBe("reality");
    expect(result.current.cardOverrides[2]).toBe("reality");

    // Verify un-overridden card still falls back to global
    expect(result.current.getCardMode(5)).toBe("reality");

    unmount();
  });

  it("4. should fallback correctly to recruiter when global is recruiter and card toggle transitions are active", () => {
    const { result, unmount } = renderHookHelper(() => useTimelineState());

    act(() => {
      result.current.handleGlobalToggle("recruiter");
    });
    expect(result.current.getCardMode(3)).toBe("recruiter");

    // Toggle card 3 -> override to reality (opposite of global recruiter)
    act(() => {
      result.current.handleCardToggle(3);
    });
    expect(result.current.getCardMode(3)).toBe("reality");
    expect(result.current.cardOverrides[3]).toBe("reality");

    // Toggle card 3 again -> opposite of override reality is recruiter
    act(() => {
      result.current.handleCardToggle(3);
    });
    expect(result.current.getCardMode(3)).toBe("recruiter");
    expect(result.current.cardOverrides[3]).toBe("recruiter");

    unmount();
  });
});
