// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LaserLoon } from "@/components/LaserLoon";

// Mocks
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playHover: vi.fn(),
    playSubmit: vi.fn(),
    playSuccess: vi.fn(),
    playLaser: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn().mockResolvedValue(true),
  }),
}));

describe("Laser Loon Pause & Reduced Motion Invariants", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("toggles pause overlay via 'P' key when game is playing", async () => {
    render(<LaserLoon />);

    // Start game
    const startBtns = screen.getAllByRole("button", {
      name: /START CAMPAIGN/i,
    });
    fireEvent.click(startBtns[0]);

    // Skip act intro
    const engageBtn = screen.getByRole("button", { name: /ENGAGE STAGE/i });
    fireEvent.click(engageBtn);

    const playfield = screen.getByRole("application", {
      name: /Laser Loon Arcade Game/i,
    }).parentElement;
    expect(playfield).not.toBeNull();

    if (playfield) {
      // Press 'p' key
      fireEvent.keyDown(playfield, { key: "p" });
    }

    expect(screen.getByText(/GAME PAUSED/i)).toBeDefined();
    const resumeBtns = screen.getAllByRole("button", { name: /Resume/i });
    expect(resumeBtns.length).toBeGreaterThan(0);

    // Press 'p' key again to resume
    if (playfield) {
      fireEvent.keyDown(playfield, { key: "p" });
    }

    expect(screen.queryByText(/GAME PAUSED/i)).toBeNull();
  });

  it("resumes game when Resume button is clicked in Pause overlay", () => {
    render(<LaserLoon />);

    // Start game & engage stage
    const startBtns = screen.getAllByRole("button", {
      name: /START CAMPAIGN/i,
    });
    fireEvent.click(startBtns[0]);
    fireEvent.click(screen.getByRole("button", { name: /ENGAGE STAGE/i }));

    // Click HUD pause button
    const pauseBtns = screen.getAllByRole("button", { name: /Pause Game/i });
    fireEvent.click(pauseBtns[0]);

    expect(screen.getByText(/GAME PAUSED/i)).toBeDefined();

    // Click Resume button
    const resumeBtns = screen.getAllByRole("button", { name: /Resume/i });
    fireEvent.click(resumeBtns[0]);

    expect(screen.queryByText(/GAME PAUSED/i)).toBeNull();
  });

  it("exits to cabinet menu from Pause overlay when Exit button is clicked", () => {
    render(<LaserLoon />);

    // Start & engage
    const startBtns = screen.getAllByRole("button", {
      name: /START CAMPAIGN/i,
    });
    fireEvent.click(startBtns[0]);
    fireEvent.click(screen.getByRole("button", { name: /ENGAGE STAGE/i }));

    // Pause
    const pauseBtns = screen.getAllByRole("button", { name: /Pause Game/i });
    fireEvent.click(pauseBtns[0]);

    // Exit to cabinet menu
    const exitBtn = screen.getByRole("button", {
      name: /EXIT TO CABINET MENU/i,
    });
    fireEvent.click(exitBtn);

    // Should return to idle screen with START CAMPAIGN button
    const startBtnsAfterExit = screen.getAllByRole("button", {
      name: /START CAMPAIGN/i,
    });
    expect(startBtnsAfterExit.length).toBeGreaterThan(0);
  });

  it("disables screen shake by default if prefers-reduced-motion is active", () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<LaserLoon />);

    expect(screen.getByText(/Screen Shake: OFF/i)).toBeDefined();
  });
});
