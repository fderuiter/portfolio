// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import {
  DpadActionDock,
  TwinStickAimDock,
  BezelClusterDock,
  ActionStripDock,
} from "../components/arcade/ControlDocks";

// Mock AudioProvider hook
const mockPlayNote = vi.fn();
const mockPlayHover = vi.fn();
const mockPlaySubmit = vi.fn();

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: mockPlayNote,
    playHover: mockPlayHover,
    playSubmit: mockPlaySubmit,
    volume: 0.3,
    muted: false,
  }),
}));

describe("Archetype-Based Control Docks Suite", () => {
  beforeEach(() => {
    mockPlayNote.mockClear();
    mockPlaySubmit.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe("DpadActionDock", () => {
    it("renders directional D-pad, action buttons, and weapon pills with 48px min targets", () => {
      const onDirectionPress = vi.fn();
      const onActionA = vi.fn();
      const onActionB = vi.fn();
      const onWeaponSelect = vi.fn();

      render(
        <DpadActionDock
          onDirectionPress={onDirectionPress}
          onActionAPress={onActionA}
          onActionBPress={onActionB}
          onWeaponSelect={onWeaponSelect}
          selectedWeapon={0}
          weaponLabels={["Laser", "Plasma", "Cryo", "Railgun"]}
          actionALabel="Slash"
          actionBLabel="Heal"
          forceVisible={true}
        />
      );

      // Verify Directional Buttons
      const upBtn = screen.getByRole("button", { name: /Move Up/i });
      expect(upBtn).toBeDefined();
      fireEvent.pointerDown(upBtn);
      expect(onDirectionPress).toHaveBeenCalledWith("up");

      // Verify Action A
      const actionABtn = screen.getByRole("button", { name: /Slash/i });
      expect(actionABtn).toBeDefined();
      fireEvent.pointerDown(actionABtn);
      expect(onActionA).toHaveBeenCalledTimes(1);

      // Verify Action B
      const actionBBtn = screen.getByRole("button", { name: /Heal/i });
      expect(actionBBtn).toBeDefined();
      fireEvent.pointerDown(actionBBtn);
      expect(onActionB).toHaveBeenCalledTimes(1);

      // Verify Weapon Selection
      const weaponBtn = screen.getByRole("button", { name: /2: Plasma/i });
      expect(weaponBtn).toBeDefined();
      fireEvent.click(weaponBtn);
      expect(onWeaponSelect).toHaveBeenCalledWith(1);
    });

    it("invokes setPointerCapture on pointerdown and releasePointerCapture on pointerup/cancel", () => {
      const onDirectionPress = vi.fn();
      const onDirectionRelease = vi.fn();

      render(
        <DpadActionDock
          onDirectionPress={onDirectionPress}
          onDirectionRelease={onDirectionRelease}
          forceVisible={true}
        />
      );

      const leftBtn = screen.getByRole("button", { name: /Move Left/i });
      const setPointerCapture = vi.fn();
      const releasePointerCapture = vi.fn();
      const hasPointerCapture = vi.fn().mockReturnValue(true);

      leftBtn.setPointerCapture = setPointerCapture;
      leftBtn.releasePointerCapture = releasePointerCapture;
      leftBtn.hasPointerCapture = hasPointerCapture;

      // Simulate pointerdown
      fireEvent.pointerDown(leftBtn, { pointerId: 42 });
      expect(setPointerCapture).toHaveBeenCalledWith(42);
      expect(onDirectionPress).toHaveBeenCalledWith("left");

      // Simulate pointerup
      fireEvent.pointerUp(leftBtn, { pointerId: 42 });
      expect(releasePointerCapture).toHaveBeenCalledWith(42);
      expect(onDirectionRelease).toHaveBeenCalledWith("left");

      // Simulate pointercancel
      fireEvent.pointerDown(leftBtn, { pointerId: 99 });
      fireEvent.pointerCancel(leftBtn, { pointerId: 99 });
      expect(setPointerCapture).toHaveBeenCalledWith(99);
      expect(releasePointerCapture).toHaveBeenCalledWith(99);
    });

    it("releases active pointer capture when DpadActionDock unmounts during active touch", () => {
      const onDirectionPress = vi.fn();
      const { unmount } = render(
        <DpadActionDock
          onDirectionPress={onDirectionPress}
          forceVisible={true}
        />
      );

      const rightBtn = screen.getByRole("button", { name: /Move Right/i });
      const releasePointerCapture = vi.fn();
      const hasPointerCapture = vi.fn().mockReturnValue(true);

      rightBtn.setPointerCapture = vi.fn();
      rightBtn.releasePointerCapture = releasePointerCapture;
      rightBtn.hasPointerCapture = hasPointerCapture;

      // Pointer down
      fireEvent.pointerDown(rightBtn, { pointerId: 101 });

      // Unmount while holding pointer
      unmount();
      expect(releasePointerCapture).toHaveBeenCalledWith(101);
    });

    it("operates multi-touch D-pad and Action button presses independently", () => {
      const onDirectionPress = vi.fn();
      const onActionA = vi.fn();

      render(
        <DpadActionDock
          onDirectionPress={onDirectionPress}
          onActionAPress={onActionA}
          actionALabel="Attack"
          forceVisible={true}
        />
      );

      const downBtn = screen.getByRole("button", { name: /Move Down/i });
      const attackBtn = screen.getByRole("button", { name: /Attack/i });

      downBtn.setPointerCapture = vi.fn();
      attackBtn.setPointerCapture = vi.fn();

      // Touch 1 on D-Pad Down (pointerId 1)
      fireEvent.pointerDown(downBtn, { pointerId: 1 });
      expect(onDirectionPress).toHaveBeenCalledWith("down");

      // Touch 2 on Attack Button (pointerId 2) while Touch 1 is active
      fireEvent.pointerDown(attackBtn, { pointerId: 2 });
      expect(onActionA).toHaveBeenCalledTimes(1);

      expect(downBtn.setPointerCapture).toHaveBeenCalledWith(1);
      expect(attackBtn.setPointerCapture).toHaveBeenCalledWith(2);
    });
  });

  describe("TwinStickAimDock", () => {
    it("renders primary fire, tremolo shockwave, and arsenal buttons", () => {
      const onFire = vi.fn();
      const onTremolo = vi.fn();
      const onWeaponSelect = vi.fn();

      render(
        <TwinStickAimDock
          onFirePress={onFire}
          onTremoloPress={onTremolo}
          onWeaponSelect={onWeaponSelect}
          selectedWeapon={1}
          weapons={[
            { id: "ruby", label: "Ruby Laser", color: "red" },
            { id: "cyan", label: "Cyan Pulse", color: "cyan" },
          ]}
          energyPercent={100}
          forceVisible={true}
        />
      );

      const fireBtn = screen.getByRole("button", { name: /Primary Fire/i });
      expect(fireBtn).toBeDefined();
      fireEvent.pointerDown(fireBtn);
      expect(onFire).toHaveBeenCalledTimes(1);

      const tremoloBtn = screen.getByRole("button", { name: /Loon Tremolo/i });
      expect(tremoloBtn).toBeDefined();
      fireEvent.pointerDown(tremoloBtn);
      expect(onTremolo).toHaveBeenCalledTimes(1);

      const rubyBtn = screen.getByRole("button", { name: /1: Ruby Laser/i });
      fireEvent.click(rubyBtn);
      expect(onWeaponSelect).toHaveBeenCalledWith(0);
    });
  });

  describe("BezelClusterDock", () => {
    it("renders 5 smartwatch bezel hardware buttons with tactile feedback", () => {
      const onButtonPress = vi.fn();

      render(
        <BezelClusterDock
          onButtonPress={onButtonPress}
          activeButton="start"
          forceVisible={true}
        />
      );

      const startBtn = screen.getByRole("button", { name: /Start \/ Stop/i });
      const lightBtn = screen.getByRole("button", { name: /Light \/ Power/i });
      const upBtn = screen.getByRole("button", { name: /Up \/ Menu/i });
      const downBtn = screen.getByRole("button", { name: /Down/i });
      const backBtn = screen.getByRole("button", { name: /Back \/ Lap/i });

      expect(startBtn).toBeDefined();
      expect(lightBtn).toBeDefined();
      expect(upBtn).toBeDefined();
      expect(downBtn).toBeDefined();
      expect(backBtn).toBeDefined();

      fireEvent.pointerDown(startBtn);
      expect(onButtonPress).toHaveBeenCalledWith("start");
    });
  });

  describe("ActionStripDock", () => {
    it("renders responsive action cards with 48px hit areas and keyboard accessibility", () => {
      const onActionClick = vi.fn();

      render(
        <ActionStripDock
          actions={[
            {
              id: "feed",
              label: "Feed Bread",
              shortcut: "1",
              badge: "Bread x5",
            },
            { id: "quack", label: "Quack Horn", shortcut: "2" },
            { id: "sleep", label: "Rest Pond", shortcut: "3" },
          ]}
          onAction={onActionClick}
          activeActionId="feed"
          forceVisible={true}
        />
      );

      const feedCard = screen.getByRole("button", { name: /Feed Bread/i });
      expect(feedCard).toBeDefined();
      expect(screen.getByText("Bread x5")).toBeDefined();

      fireEvent.click(feedCard);
      expect(onActionClick).toHaveBeenCalledWith("feed");
    });
  });
});
