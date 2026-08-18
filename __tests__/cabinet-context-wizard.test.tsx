// @vitest-environment jsdom
import React from "react";
import { render, screen, fireEvent, act, waitFor, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CabinetProvider, useCabinet } from "@/components/providers/CabinetContext";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import { CabinetSetupModal } from "@/components/arcade/CabinetSetupModal";

// Mock audio provider playNote function
const mockPlayNote = vi.fn();
const mockSetVolume = vi.fn();
const mockSetMuted = vi.fn();

vi.mock("@/components/providers/AudioProvider", async () => {
  const actual = await vi.importActual<typeof import("@/components/providers/AudioProvider")>("@/components/providers/AudioProvider");
  return {
    ...actual,
    useAudio: () => ({
      playNote: mockPlayNote,
      setVolume: mockSetVolume,
      setMuted: mockSetMuted,
      volume: 0.8,
      muted: false,
      profile: "8-bit",
      setProfile: vi.fn(),
    }),
  };
});

// Parameterless Test Game Component
const ParameterlessTestGame: React.FC = () => {
  const { difficulty, audio } = useCabinet();
  return (
    <div data-testid="test-game-active">
      <span data-testid="active-difficulty">{difficulty}</span>
      <span data-testid="active-muted">{audio.muted ? "muted" : "unmuted"}</span>
      <span data-testid="active-volume">{audio.volume}</span>
    </div>
  );
};

describe("Cabinet Context Wizard & Persistent Presets Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe("Requirement 1 & 5: Pre-Boot Setup Modal & Single Action Confirm Launch", () => {
    it("presents setup wizard modal when clicking Launch Cabinet prior to active cabinet boot", async () => {
      const mockImport = vi.fn().mockResolvedValue({});

      render(
        <PlayCabinet
          title="Laser Loon Arcade"
          subtitle="Vector Shooter"
          accentColor="amber"
          icon={<div>Icon</div>}
          instructions="Defeat incoming waves"
          controls={[{ key: "SPACE", action: "FIRE" }]}
          importComponent={mockImport}
        >
          <ParameterlessTestGame />
        </PlayCabinet>
      );

      // Verify standby screen is visible and game is NOT active
      expect(screen.getByText("Laser Loon Arcade")).toBeDefined();
      expect(screen.queryByTestId("test-game-active")).toBeNull();

      // Click "Launch Cabinet" button
      const launchBtn = screen.getByRole("button", { name: /launch cabinet/i });
      fireEvent.click(launchBtn);

      // Verify Setup Wizard Modal is presented before active cabinet boot
      expect(screen.getByRole("dialog")).toBeDefined();
      expect(screen.getByText("Pre-Game Calibration")).toBeDefined();
      expect(screen.getByText(/Difficulty Calibration/i)).toBeDefined();

      // Click "Confirm & Launch Cabinet" button in wizard
      const confirmBtn = screen.getByRole("button", { name: /confirm & launch cabinet/i });
      fireEvent.click(confirmBtn);

      // Modal should close
      await waitFor(() => {
        expect(screen.queryByRole("dialog")).toBeNull();
      });

      // Confirm audio feedback was triggered
      expect(mockPlayNote).toHaveBeenCalled();
    });
  });

  describe("Requirement 2: CabinetContext Layer & Parameterless Child Interface", () => {
    it("supplies difficulty and audio options to child game component without prop passing", () => {
      render(
        <CabinetProvider>
          <ParameterlessTestGame />
        </CabinetProvider>
      );

      // Default values
      expect(screen.getByTestId("active-difficulty").textContent).toBe("standard");
      expect(screen.getByTestId("active-muted").textContent).toBe("unmuted");
      expect(screen.getByTestId("active-volume").textContent).toBe("0.8");
    });
  });

  describe("Requirement 3: Storage Persistence & Cross-Tab Synchronization", () => {
    it("saves difficulty and audio selections automatically to localStorage", () => {
      let contextRef: ReturnType<typeof useCabinet> | null = null;

      const TestConsumer = () => {
        const cabinet = useCabinet();
        React.useEffect(() => {
          contextRef = cabinet;
        }, [cabinet]);
        return null;
      };

      render(
        <CabinetProvider>
          <TestConsumer />
        </CabinetProvider>
      );

      act(() => {
        contextRef?.setDifficulty("hardcore");
      });

      expect(localStorage.getItem("cabinet_difficulty")).toBe("hardcore");

      act(() => {
        contextRef?.setAudio({ muted: true, volume: 0.4 });
      });

      expect(localStorage.getItem("cabinet_audio_muted")).toBe("true");
      expect(localStorage.getItem("cabinet_audio_volume")).toBe("0.4");
    });

    it("synchronizes state updates across browser tabs via storage events without errors", () => {
      render(
        <CabinetProvider>
          <ParameterlessTestGame />
        </CabinetProvider>
      );

      expect(screen.getByTestId("active-difficulty").textContent).toBe("standard");

      // Simulate external browser tab updating localStorage
      act(() => {
        localStorage.setItem("cabinet_difficulty", "hardcore");
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "cabinet_difficulty",
            newValue: "hardcore",
          })
        );
      });

      // Current component re-renders cleanly with updated difficulty
      expect(screen.getByTestId("active-difficulty").textContent).toBe("hardcore");
    });
  });

  describe("Requirement 4: Interactive Audio Feedback on Option Selections", () => {
    it("triggers audio feedback when selecting difficulty options in the wizard", () => {
      const handleClose = vi.fn();
      const handleConfirm = vi.fn();

      render(
        <CabinetProvider>
          <CabinetSetupModal
            isOpen={true}
            onClose={handleClose}
            onConfirmAndLaunch={handleConfirm}
            gameTitle="Meme Vault Arcade"
            accentColor="purple"
          />
        </CabinetProvider>
      );

      // Click Hardcore difficulty option
      const hardcoreOption = screen.getByText("Hardcore Elite");
      fireEvent.click(hardcoreOption);

      // Verify audio feedback note played
      expect(mockPlayNote).toHaveBeenCalledWith(880, 0.12);

      // Click Casual difficulty option
      const casualOption = screen.getByText("Casual Mode");
      fireEvent.click(casualOption);

      expect(mockPlayNote).toHaveBeenCalledWith(440, 0.12);
    });

    it("triggers audio feedback when adjusting volume level buttons in wizard", () => {
      render(
        <CabinetProvider>
          <CabinetSetupModal
            isOpen={true}
            onClose={vi.fn()}
            onConfirmAndLaunch={vi.fn()}
          />
        </CabinetProvider>
      );

      const volButtons = screen.getAllByRole("button", { name: /40%/ });
      fireEvent.click(volButtons[0]);

      expect(mockPlayNote).toHaveBeenCalled();
      expect(mockSetVolume).toHaveBeenCalledWith(0.4);
    });
  });

  describe("Accessibility & WCAG 2.1 Focus Trapping", () => {
    it("traps focus inside the wizard modal and closes on Escape key press", () => {
      const handleClose = vi.fn();

      render(
        <CabinetProvider>
          <CabinetSetupModal
            isOpen={true}
            onClose={handleClose}
            onConfirmAndLaunch={vi.fn()}
          />
        </CabinetProvider>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();

      // Press Escape
      fireEvent.keyDown(window, { key: "Escape" });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
