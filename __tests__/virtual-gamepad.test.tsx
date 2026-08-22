/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  VirtualGamepad,
  VirtualDPad,
} from "@/components/arcade/VirtualGamepad";

describe("VirtualGamepad & VirtualDPad Component Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    // Ensure clean non-touch environment by default
    delete (window as any).ontouchstart;

    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("1. renders VirtualGamepad with forceVisible=true and matches direction triggers", async () => {
    const onDirectionPress = vi.fn();
    const onDirectionRelease = vi.fn();
    const onActionAPress = vi.fn();
    const onActionARelease = vi.fn();
    const onActionBPress = vi.fn();
    const onActionBRelease = vi.fn();

    await act(async () => {
      root.render(
        <VirtualGamepad
          forceVisible={true}
          onDirectionPress={onDirectionPress}
          onDirectionRelease={onDirectionRelease}
          onActionAPress={onActionAPress}
          onActionARelease={onActionARelease}
          onActionBPress={onActionBPress}
          onActionBRelease={onActionBRelease}
        />
      );
    });

    // Find Up D-Pad button
    const upBtn = container.querySelector('button[aria-label="Move Up"]');
    expect(upBtn).not.toBeNull();

    // Trigger pointer down and pointer up
    await act(async () => {
      upBtn?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true })
      );
    });
    expect(onDirectionPress).toHaveBeenCalledWith("up");

    await act(async () => {
      upBtn?.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, cancelable: true })
      );
    });
    expect(onDirectionRelease).toHaveBeenCalledWith("up");

    // Trigger Action A (Attack)
    const actionABtn = container.querySelector('button[aria-label="Attack"]');
    expect(actionABtn).not.toBeNull();

    await act(async () => {
      actionABtn?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true })
      );
    });
    expect(onActionAPress).toHaveBeenCalled();

    await act(async () => {
      actionABtn?.dispatchEvent(
        new PointerEvent("pointerup", { bubbles: true, cancelable: true })
      );
    });
    expect(onActionARelease).toHaveBeenCalled();
  });

  it("2. releases direction on pointerleave or pointercancel", async () => {
    const onDirectionPress = vi.fn();
    const onDirectionRelease = vi.fn();

    await act(async () => {
      root.render(
        <VirtualDPad
          onDirectionPress={onDirectionPress}
          onDirectionRelease={onDirectionRelease}
        />
      );
    });

    const downBtn = container.querySelector('button[aria-label="Move Down"]');
    expect(downBtn).not.toBeNull();

    await act(async () => {
      downBtn?.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, cancelable: true })
      );
    });
    expect(onDirectionPress).toHaveBeenCalledWith("down");

    // Simulate pointer cancellation (e.g. system gesture interrupt or finger moving off screen)
    await act(async () => {
      downBtn?.dispatchEvent(
        new PointerEvent("pointercancel", { bubbles: true, cancelable: true })
      );
    });
    expect(onDirectionRelease).toHaveBeenCalledWith("down");
  });

  it("3. handles weapon switcher clicks and calls onWeaponSelect", async () => {
    const onWeaponSelect = vi.fn();
    const weaponLabels = ["Blaster", "Plasma", "EMP"];

    await act(async () => {
      root.render(
        <VirtualGamepad
          forceVisible={true}
          selectedWeapon={0}
          weaponLabels={weaponLabels}
          onWeaponSelect={onWeaponSelect}
        />
      );
    });

    const plasmaBtn = Array.from(container.querySelectorAll("button")).find(
      (btn) => btn.textContent?.includes("2: Plasma")
    );
    expect(plasmaBtn).toBeDefined();

    await act(async () => {
      plasmaBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onWeaponSelect).toHaveBeenCalledWith(1);
  });

  it("4. hides VirtualGamepad on non-touch desktop devices when forceVisible is false", async () => {
    await act(async () => {
      root.render(<VirtualGamepad forceVisible={false} />);
    });

    // On standard JSDOM desktop without touch, component returns null
    expect(container.children.length).toBe(0);
  });
});
