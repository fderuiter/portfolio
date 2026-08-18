import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import { parseSeed, getSeededRng, getGamePreflightFields } from "@/lib/arcade-config";
import { WorkingWithDuck } from "@/components/WorkingWithDuck";
import { LaserLoon } from "@/components/LaserLoon";
import { QuasiPerfectPuzzler } from "@/components/QuasiPerfectPuzzler/QuasiPerfectPuzzler";
import { GarminWatchSimulator } from "@/components/GarminWatchSimulator";
import { ClinicalTrialChaos } from "@/components/ClinicalTrialChaos";
import { RetroLabyrinth } from "@/components/RetroLabyrinth";

// Mock Audio & Telemetry hooks to prevent DOM sound errors during tests
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
    muted: false,
    setMuted: vi.fn(),
  }),
}));

vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn(),
  }),
}));

describe("Component Prop Interfaces & Pre-flight Cabinet Setup", () => {
  describe("Deterministic Seed Utility & Helpers", () => {
    it("parseSeed produces deterministic positive integers for strings and numbers", () => {
      const seedNum = parseSeed(12345);
      expect(seedNum).toBe(12345);

      const seedStr1 = parseSeed("arcade-test-seed");
      const seedStr2 = parseSeed("arcade-test-seed");
      expect(seedStr1).toBe(seedStr2);
      expect(typeof seedStr1).toBe("number");
      expect(seedStr1).toBeGreaterThan(0);
    });

    it("getSeededRng generates identical pseudo-random sequences for identical seeds", () => {
      const rng1 = getSeededRng("test-seed-42");
      const rng2 = getSeededRng("test-seed-42");

      const sequence1 = [rng1(), rng1(), rng1()];
      const sequence2 = [rng2(), rng2(), rng2()];

      expect(sequence1).toEqual(sequence2);
    });

    it("getGamePreflightFields returns game-specific configuration schemas", () => {
      const duckFields = getGamePreflightFields("working-with-duck");
      expect(duckFields.some((f) => f.id === "difficulty")).toBe(true);
      expect(duckFields.some((f) => f.id === "gameMode")).toBe(true);
      expect(duckFields.some((f) => f.id === "seed")).toBe(true);

      const laserFields = getGamePreflightFields("laser-loon");
      expect(laserFields.some((f) => f.id === "laserType")).toBe(true);

      const garminFields = getGamePreflightFields("garmin-watch");
      expect(garminFields.some((f) => f.id === "deviceTarget")).toBe(true);

      const retroFields = getGamePreflightFields("retro-labyrinth");
      expect(retroFields.some((f) => f.id === "cyberdeckClass")).toBe(true);
    });
  });

  describe("PlayCabinet Standby Screen & Pre-flight Controls", () => {
    it("renders pre-flight parameter selectors on the standby screen", () => {
      render(
        <PlayCabinet
          gameId="working-with-duck"
          title="Working With Duck"
          subtitle="Pet Simulation"
          accentColor="amber"
          icon={<span>🦆</span>}
          instructions="Balance shipping code against Duck."
          controls={[{ key: "1", action: "Toys" }]}
          importComponent={async () => {}}
        >
          <div data-testid="game-mounted">Game Content</div>
        </PlayCabinet>
      );

      expect(screen.getByText(/Pre-Flight Launch Configuration/i)).toBeDefined();
      expect(screen.getByText(/Deterministic Random Seed/i)).toBeDefined();
      expect(screen.getAllByDisplayValue("12345")[0]).toBeDefined();
    });

    it("allows randomizing seed via button click in pre-flight UI", () => {
      render(
        <PlayCabinet
          gameId="working-with-duck"
          title="Working With Duck"
          subtitle="Pet Simulation"
          accentColor="amber"
          icon={<span>🦆</span>}
          instructions="Balance shipping code against Duck."
          controls={[{ key: "1", action: "Toys" }]}
          importComponent={async () => {}}
        >
          <div data-testid="game-mounted">Game Content</div>
        </PlayCabinet>
      );

      const seedInput = screen.getAllByDisplayValue("12345")[0] as HTMLInputElement;
      const randButton = screen.getAllByRole("button", { name: /Rand/i })[0];

      fireEvent.click(randButton);
      expect(seedInput.value).not.toBe("12345");
    });
  });

  describe("Game Component Prop Exposure & Default Fallbacks", () => {
    it("WorkingWithDuck mounts without props using default fallbacks", () => {
      const { container } = render(<WorkingWithDuck />);
      expect(container).toBeDefined();
    });

    it("WorkingWithDuck accepts custom configuration props", () => {
      const { container } = render(
        <WorkingWithDuck
          initialLevel={2}
          difficulty="chaos"
          seed="test-duck-seed"
          speedMultiplier={1.5}
        />
      );
      expect(container).toBeDefined();
    });

    it("LaserLoon mounts without props and accepts custom props", () => {
      const { container: defaultC } = render(<LaserLoon />);
      expect(defaultC).toBeDefined();

      const { container: customC } = render(
        <LaserLoon
          startingAct={2}
          difficulty="hard"
          laserType="ruby-laser"
          seed={9999}
        />
      );
      expect(customC).toBeDefined();
    });

    it("QuasiPerfectPuzzler mounts without props and accepts custom props", () => {
      const { container: defaultC } = render(<QuasiPerfectPuzzler />);
      expect(defaultC).toBeDefined();

      const { container: customC } = render(
        <QuasiPerfectPuzzler
          gameMode="hacker"
          ramLimit={64}
          seed="quasi-seed"
        />
      );
      expect(customC).toBeDefined();
    });

    it("GarminWatchSimulator mounts without props and accepts custom props", () => {
      const { container: defaultC } = render(<GarminWatchSimulator />);
      expect(defaultC).toBeDefined();

      const { container: customC } = render(
        <GarminWatchSimulator
          deviceTarget="forerunner"
          bezelTheme="solar"
          difficulty="strict"
          seed={8888}
        />
      );
      expect(customC).toBeDefined();
    });

    it("ClinicalTrialChaos mounts without props and accepts custom props", () => {
      const { container: defaultC } = render(<ClinicalTrialChaos />);
      expect(defaultC).toBeDefined();

      const { container: customC } = render(
        <ClinicalTrialChaos
          gameMode="campaign"
          startingStress={25}
          seed="chaos-seed"
        />
      );
      expect(customC).toBeDefined();
    });

    it("RetroLabyrinth mounts without props and accepts custom props", () => {
      const { container: defaultC } = render(<RetroLabyrinth isMounted={true} />);
      expect(defaultC).toBeDefined();

      const { container: customC } = render(
        <RetroLabyrinth
          difficulty="nightmare"
          cyberdeckClass="script_kiddie"
          startingWeapon="npm_install"
          seed={7777}
          isMounted={true}
        />
      );
      expect(customC).toBeDefined();
    });
  });
});
