import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { DevOverflowHud } from "@/components/ui/DevOverflowHud";

describe("Interactive Visual Dev Overflow HUD", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("renders null in production mode when forceEnable is false", () => {
    vi.stubEnv("NODE_ENV", "production");

    const { container } = render(<DevOverflowHud forceEnable={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders HUD toolbar when forceEnable is true or in development mode", () => {
    const { getByTestId } = render(<DevOverflowHud forceEnable={true} scanDebounceMs={10} />);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(screen.getByText("Layout Overflow HUD")).not.toBeNull();
    expect(getByTestId("hud-toggle-btn")).not.toBeNull();
    expect(getByTestId("hud-rescan-btn")).not.toBeNull();
  });

  it("detects DOM elements where scrollWidth exceeds clientWidth and displays visual highlight overlay", () => {
    const overflowEl = document.createElement("div");
    overflowEl.id = "test-overflow-element";
    overflowEl.className = "test-class-name";
    Object.defineProperty(overflowEl, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(overflowEl, "scrollWidth", { value: 250, configurable: true });
    overflowEl.getBoundingClientRect = () => ({
      top: 20,
      left: 20,
      width: 100,
      height: 40,
      bottom: 60,
      right: 120,
      x: 20,
      y: 20,
      toJSON: () => {},
    });
    document.body.appendChild(overflowEl);

    try {
      const { container } = render(<DevOverflowHud forceEnable={true} scanDebounceMs={10} />);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      expect(screen.getByText(/1 Overflow Element/i)).not.toBeNull();

      const overlay = container.querySelector('[data-dev-hud="overlay"]');
      expect(overlay).not.toBeNull();
      expect(screen.getByText(/<div/i)).not.toBeNull();
      expect(screen.getByText(/\+150px overflow/i)).not.toBeNull();
    } finally {
      document.body.removeChild(overflowEl);
    }
  });

  it("permits toggling visual overflow highlights ON and OFF", () => {
    const overflowEl = document.createElement("div");
    overflowEl.id = "test-overflow-toggle";
    Object.defineProperty(overflowEl, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(overflowEl, "scrollWidth", { value: 200, configurable: true });
    overflowEl.getBoundingClientRect = () => ({
      top: 10,
      left: 10,
      width: 100,
      height: 30,
      bottom: 40,
      right: 110,
      x: 10,
      y: 10,
      toJSON: () => {},
    });
    document.body.appendChild(overflowEl);

    try {
      const { container, getByTestId } = render(<DevOverflowHud forceEnable={true} scanDebounceMs={10} />);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      const toggleBtn = getByTestId("hud-toggle-btn");
      expect(toggleBtn.textContent).toContain("Highlights ON");
      expect(container.querySelector('[data-dev-hud="overlay"]')).not.toBeNull();

      fireEvent.click(toggleBtn);
      expect(toggleBtn.textContent).toContain("Highlights OFF");
      expect(container.querySelector('[data-dev-hud="overlay"]')).toBeNull();

      fireEvent.click(toggleBtn);
      expect(toggleBtn.textContent).toContain("Highlights ON");
      expect(container.querySelector('[data-dev-hud="overlay"]')).not.toBeNull();
    } finally {
      document.body.removeChild(overflowEl);
    }
  });

  it("supports minimizing and expanding the floating toolbar", () => {
    const { getByTestId } = render(<DevOverflowHud forceEnable={true} scanDebounceMs={10} />);

    act(() => {
      vi.advanceTimersByTime(50);
    });

    const minimizeBtn = getByTestId("hud-minimize-btn");
    fireEvent.click(minimizeBtn);

    const expandBtn = getByTestId("hud-expand-btn");
    expect(expandBtn).not.toBeNull();
    expect(screen.queryByText("Layout Overflow HUD")).toBeNull();

    fireEvent.click(expandBtn);
    expect(screen.getByText("Layout Overflow HUD")).not.toBeNull();
  });

  it("navigates overflowing elements using next/prev inspect controls", () => {
    const el1 = document.createElement("div");
    el1.id = "overflow-1";
    el1.scrollIntoView = vi.fn();
    Object.defineProperty(el1, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(el1, "scrollWidth", { value: 180, configurable: true });
    el1.getBoundingClientRect = () => ({
      top: 10,
      left: 10,
      width: 100,
      height: 20,
      bottom: 30,
      right: 110,
      x: 10,
      y: 10,
      toJSON: () => {},
    });

    const el2 = document.createElement("div");
    el2.id = "overflow-2";
    el2.scrollIntoView = vi.fn();
    Object.defineProperty(el2, "clientWidth", { value: 100, configurable: true });
    Object.defineProperty(el2, "scrollWidth", { value: 220, configurable: true });
    el2.getBoundingClientRect = () => ({
      top: 50,
      left: 10,
      width: 100,
      height: 20,
      bottom: 70,
      right: 110,
      x: 10,
      y: 50,
      toJSON: () => {},
    });

    document.body.appendChild(el1);
    document.body.appendChild(el2);

    try {
      const { getByTestId } = render(<DevOverflowHud forceEnable={true} scanDebounceMs={10} />);

      act(() => {
        vi.advanceTimersByTime(50);
      });

      const nextBtn = getByTestId("hud-next-btn");
      fireEvent.click(nextBtn);

      expect(el1.scrollIntoView).toHaveBeenCalled();

      fireEvent.click(nextBtn);
      expect(el2.scrollIntoView).toHaveBeenCalled();
    } finally {
      document.body.removeChild(el1);
      document.body.removeChild(el2);
    }
  });
});
