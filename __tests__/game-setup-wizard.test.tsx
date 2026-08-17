import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup, fireEvent } from "@testing-library/react";
import { GameSetupWizard } from "@/components/arcade/GameSetupWizard";

// Mock the useAudio hook to prevent audio errors or actual WebAudio triggering in tests
vi.mock("@/components/providers/AudioProvider", () => {
  return {
    useAudio: () => ({
      playHover: vi.fn(),
      playSubmit: vi.fn(),
      playSuccess: vi.fn(),
    }),
  };
});

describe("GameSetupWizard Integration", () => {
  const onSkipMock = vi.fn();
  const onCompleteMock = vi.fn();

  beforeEach(() => {
    onSkipMock.mockClear();
    onCompleteMock.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it("renders correctly with Stage 1 content and total stages indicator", () => {
    render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    // Header title or indicator - search safely without regex bracket class match
    expect(screen.getByText(/STAGE 1 OF 3/i)).not.toBeNull();
    // First stage title
    expect(screen.getByText("Tactical Difficulty")).not.toBeNull();
    // First stage options should be visible
    expect(screen.getByText("Recruit (Easy)")).not.toBeNull();
    expect(screen.getByText("Specialist (Normal)")).not.toBeNull();
    expect(screen.getByText("Hardcore (Expert)")).not.toBeNull();
  });

  it("prominently features a highly visible 'Skip Setup' button that triggers onSkip callback", () => {
    render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    const skipBtn = screen.getByRole("button", { name: /Skip Setup/i });
    expect(skipBtn).not.toBeNull();

    act(() => {
      skipBtn.click();
    });

    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });

  it("supports sequential progressive stages navigation using Back/Next controls", () => {
    render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    // Initial Stage 1
    expect(screen.getByText("Tactical Difficulty")).not.toBeNull();

    // Click Next to go to Stage 2
    const nextBtn = screen.getByRole("button", { name: /Next/i });
    act(() => {
      nextBtn.click();
    });

    // Stage 2 check
    expect(screen.getByText(/STAGE 2 OF 3/i)).not.toBeNull();
    expect(screen.getByText("Visual Theme & Scanlines")).not.toBeNull();
    expect(screen.getByText("Retro CRT Mode")).not.toBeNull();

    // Click Back to go to Stage 1
    const backBtn = screen.getByRole("button", { name: /Back/i });
    act(() => {
      backBtn.click();
    });

    // Verify back to Stage 1
    expect(screen.getByText("Tactical Difficulty")).not.toBeNull();
  });

  it("completes setup and passes configurations upon reaching and submitting the final stage", () => {
    render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    // Step 1 -> Next
    act(() => {
      screen.getByRole("button", { name: /Next/i }).click();
    });

    // Step 2 -> Next
    act(() => {
      screen.getByRole("button", { name: /Next/i }).click();
    });

    // Verify Stage 3
    expect(screen.getByText(/STAGE 3 OF 3/i)).not.toBeNull();
    expect(screen.getByText("Audio Feedback Cues")).not.toBeNull();

    // Launch Game button on last step
    const launchBtn = screen.getByRole("button", { name: /Launch Game/i });
    expect(launchBtn).not.toBeNull();

    act(() => {
      launchBtn.click();
    });

    expect(onCompleteMock).toHaveBeenCalledTimes(1);
    expect(onCompleteMock).toHaveBeenCalledWith({
      difficulty: "specialist",
      theme: "crt",
      audioEnabled: true,
    });
  });

  it("allows selecting options and updates selection indicator states accordingly", () => {
    render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    // Click Hardcore (Expert)
    const expertOption = screen.getByText("Hardcore (Expert)");
    act(() => {
      expertOption.click();
    });

    // Complete setup steps to verify options payload
    act(() => {
      screen.getByRole("button", { name: /Next/i }).click();
    });

    // Click Vintage Amber in Stage 2
    const amberOption = screen.getByText("Vintage Amber");
    act(() => {
      amberOption.click();
    });

    act(() => {
      screen.getByRole("button", { name: /Next/i }).click();
    });

    // Click Silent Protocol in Stage 3
    const silentOption = screen.getByText("Silent Protocol (Off)");
    act(() => {
      silentOption.click();
    });

    act(() => {
      screen.getByRole("button", { name: /Launch Game/i }).click();
    });

    expect(onCompleteMock).toHaveBeenCalledWith({
      difficulty: "hardcore",
      theme: "amber",
      audioEnabled: false,
    });
  });

  it("supports escaping immediate setup via Escape keyboard trigger", () => {
    const { container } = render(
      <GameSetupWizard onSkip={onSkipMock} onComplete={onCompleteMock} />
    );

    // Dispatch Escape key event
    fireEvent.keyDown(container.firstChild as HTMLElement, { key: "Escape" });

    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });
});
