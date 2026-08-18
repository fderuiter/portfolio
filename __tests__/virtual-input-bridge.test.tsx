import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";
import {
  useVirtualInputBridge,
  triggerHapticFeedback,
  triggerAudioFeedback,
  isolateGesture,
} from "@/lib/arcade/virtual-input-bridge";
import { VirtualDPad, VirtualGamepad } from "@/components/arcade/VirtualGamepad";

describe("Virtual Input Bridge & Floating HUD", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("provides active direction state and callback triggers via useVirtualInputBridge", () => {
    const onDirPress = vi.fn();
    const onActionAPress = vi.fn();

    const { result } = renderHook(() =>
      useVirtualInputBridge({
        onDirectionPress: onDirPress,
        onActionAPress: onActionAPress,
      })
    );

    expect(result.current.inputState.directions.up).toBe(false);
    expect(result.current.inputState.actions.actionA).toBe(false);

    act(() => {
      result.current.handleDirectionPress("up");
    });

    expect(result.current.inputState.directions.up).toBe(true);
    expect(onDirPress).toHaveBeenCalledWith("up");

    act(() => {
      result.current.handleActionPress("actionA");
    });

    expect(result.current.inputState.actions.actionA).toBe(true);
    expect(onActionAPress).toHaveBeenCalled();

    act(() => {
      result.current.handleDirectionRelease("up");
      result.current.handleActionRelease("actionA");
    });

    expect(result.current.inputState.directions.up).toBe(false);
    expect(result.current.inputState.actions.actionA).toBe(false);
  });

  it("safely invokes triggerHapticFeedback without throwing errors when navigator.vibrate is unavailable or available", () => {
    // Unsupported case
    expect(() => triggerHapticFeedback(20)).not.toThrow();

    // Supported case
    const vibrateMock = vi.fn();
    Object.defineProperty(navigator, "vibrate", {
      value: vibrateMock,
      writable: true,
      configurable: true,
    });

    triggerHapticFeedback([10, 20, 10]);
    expect(vibrateMock).toHaveBeenCalledWith([10, 20, 10]);
  });

  it("safely synthesizes Web Audio sound feedback via triggerAudioFeedback", () => {
    expect(() => triggerAudioFeedback(880, 0.05, "sine")).not.toThrow();
  });

  it("prevents default scroll/zoom gestures via isolateGesture", () => {
    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();

    const mockEvent = {
      cancelable: true,
      preventDefault,
      stopPropagation,
    } as unknown as React.SyntheticEvent;

    isolateGesture(mockEvent);

    expect(preventDefault).toHaveBeenCalled();
    expect(stopPropagation).toHaveBeenCalled();
  });

  it("renders VirtualDPad with minimum 44px touch targets for WCAG 2.1", () => {
    render(<VirtualDPad />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(4);

    buttons.forEach((btn) => {
      expect(btn.className).toContain("min-w-[44px]");
      expect(btn.className).toContain("min-h-[44px]");
    });
  });

  it("renders VirtualGamepad HUD overlay with translucency opacity <= 70%", () => {
    const { container } = render(
      <VirtualGamepad forceVisible actionALabel="ATTACK" onActionAPress={() => {}} />
    );

    const hudGroup = container.querySelector('[role="group"]');
    expect(hudGroup).not.toBeNull();
    // bg-gradient-to-t from-black/60 via-black/30 to-transparent gives background opacity <= 60%
    expect(hudGroup?.className).toContain("bg-gradient-to-t");
    expect(hudGroup?.className).toContain("from-black/60");
  });
});
