/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FloatingHUDOverlay } from "@/components/arcade/FloatingHUDOverlay";
import {
  sharedInputBridge,
  VirtualInputBridge,
  isolateTouchGestures,
  playSynthesizedAudio,
  triggerHapticFeedback,
} from "@/lib/virtual-input-bridge";

// Mock Navigator vibrate
const mockVibrate = vi.fn();
Object.defineProperty(globalThis.navigator, "vibrate", {
  value: mockVibrate,
  writable: true,
  configurable: true,
});

describe("Shared Virtual Input Bridge & Floating HUD Overlay Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    mockVibrate.mockClear();
    sharedInputBridge.clear();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.restoreAllMocks();
  });

  describe("VirtualInputBridge Pub-Sub & Feedback Invariants", () => {
    it("dispatches directional and action events to subscribers with haptic and audio triggers", () => {
      const dirListener = vi.fn();
      const actionListener = vi.fn();

      const bridge = new VirtualInputBridge();
      const unsubDir = bridge.onDirectionPress(dirListener);
      const unsubAct = bridge.onActionPress(actionListener);

      bridge.emitDirectionPress("up");
      expect(dirListener).toHaveBeenCalledWith("up");
      expect(mockVibrate).toHaveBeenCalledWith(15);

      bridge.emitActionPress("fire");
      expect(actionListener).toHaveBeenCalledWith("fire");
      expect(mockVibrate).toHaveBeenCalledWith(20);

      unsubDir();
      unsubAct();
      bridge.emitDirectionPress("down");
      expect(dirListener).toHaveBeenCalledTimes(1);
    });

    it("isolateTouchGestures applies touch-action none and prevents default scrolling on touch events", () => {
      const dummyEl = document.createElement("div");
      document.body.appendChild(dummyEl);

      const cleanup = isolateTouchGestures(dummyEl);
      expect(dummyEl.style.touchAction).toBe("none");

      const touchStartEvent = new Event("touchstart", { bubbles: true, cancelable: true });
      const preventDefaultSpy = vi.spyOn(touchStartEvent, "preventDefault");

      dummyEl.dispatchEvent(touchStartEvent);
      expect(preventDefaultSpy).toHaveBeenCalled();

      cleanup();
      dummyEl.remove();
    });

    it("synthesizes haptics and audio feedback gracefully without throwing exceptions", () => {
      expect(() => triggerHapticFeedback(10)).not.toThrow();
      expect(() => playSynthesizedAudio(440, 0.02, "sine")).not.toThrow();
    });
  });

  describe("FloatingHUDOverlay Component Standards", () => {
    it("renders translucent floating overlay directly over canvas with min 44px touch targets", async () => {
      const onDirPress = vi.fn();
      const onActionAPress = vi.fn();
      const onActionBPress = vi.fn();

      await act(async () => {
        root.render(
          <div className="relative w-[400px] h-[300px]">
            <canvas width={400} height={300} />
            <FloatingHUDOverlay
              forceVisible={true}
              onDirectionPress={onDirPress}
              onActionAPress={onActionAPress}
              onActionBPress={onActionBPress}
              actionALabel="ATTACK"
              actionBLabel="DEFEND"
            />
          </div>
        );
      });

      const overlay = container.querySelector('[aria-label="Floating Touch HUD Overlay"]');
      expect(overlay).not.toBeNull();
      expect((overlay as HTMLElement).className).toContain("absolute inset-0");

      // Verify interactive buttons have min 44px dimensions
      const buttons = container.querySelectorAll("button");
      expect(buttons.length).toBeGreaterThan(0);

      buttons.forEach((btn) => {
        expect(btn.className).toMatch(/min-w-\[44px\]|min-w-\[48px\]|min-w-\[52px\]|min-w-\[56px\]/);
        expect(btn.className).toMatch(/min-h-\[44px\]|min-h-\[48px\]|min-h-\[52px\]|min-h-\[56px\]/);
      });

      // Trigger Direction Press
      const upBtn = container.querySelector('button[aria-label="Move Up"]');
      expect(upBtn).not.toBeNull();

      act(() => {
        upBtn?.dispatchEvent(new Event("touchstart", { bubbles: true }));
      });
      expect(onDirPress).toHaveBeenCalledWith("up");

      // Trigger Action A Press
      const attackBtn = container.querySelector('button[aria-label="ATTACK"]');
      expect(attackBtn).not.toBeNull();

      act(() => {
        attackBtn?.dispatchEvent(new Event("touchstart", { bubbles: true }));
      });
      expect(onActionAPress).toHaveBeenCalled();
    });

    it("renders weapon selector bar when weaponLabels and onWeaponSelect are provided", async () => {
      const onWeaponSelect = vi.fn();

      await act(async () => {
        root.render(
          <FloatingHUDOverlay
            forceVisible={true}
            weaponLabels={["Laser", "Plasma", "Rockets"]}
            selectedWeapon={1}
            onWeaponSelect={onWeaponSelect}
          />
        );
      });

      const plasmaBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("2: Plasma")
      );
      expect(plasmaBtn).toBeDefined();

      act(() => {
        plasmaBtn?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      });
      expect(onWeaponSelect).toHaveBeenCalledWith(1);
    });
  });
});
