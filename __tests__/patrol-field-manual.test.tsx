import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { GAME_MANUALS } from "@/lib/game-manuals";
import {
  patrolSoundFrequencies,
  playPatrolCue,
  type PatrolSoundName,
} from "@/lib/game-audio";
import { getSoundEngine } from "@/lib/audio/sound-engine";
import { PatrolShiftContainer } from "@/components/patrol/PatrolShiftContainer";
import { safeStorage } from "@/lib/safe-storage";

/**
 * Suite for the M9 field manual and optional audio layer (Issue #755).
 * The manual must describe the mechanics that actually shipped in M4–M8, be
 * reachable from the shift container at any time, and any audio must be
 * suppressible and never required to understand radio traffic.
 */

describe("Patrol Shift — M9 field manual content", () => {
  const manual = GAME_MANUALS.patrol;

  it("registers a patrol manual pointing at the live route", () => {
    expect(manual).toBeDefined();
    expect(manual.id).toBe("patrol");
    expect(manual.route).toBe("/patrol");
    expect(manual.title).toBe("Patrol Shift");
  });

  it("no longer describes itself as an unbuilt foundation scaffold", () => {
    const serialized = JSON.stringify(manual);
    expect(serialized).not.toMatch(/Foundation Scaffold/i);
    expect(serialized).not.toMatch(/under development/i);
    expect(serialized).not.toMatch(/future scenario and debrief engines/i);
  });

  it("documents every control surface M9 requires", () => {
    const actions = manual.controls.map((c) => c.action).join(" | ");

    expect(actions).toMatch(/Start a Shift/i);
    expect(actions).toMatch(/Mountain Map/i);
    expect(actions).toMatch(/Dispatch/i);
    expect(actions).toMatch(/Scene \(OEC\)/i);
    expect(actions).toMatch(/Toboggan \(OET\)/i);
    expect(actions).toMatch(/Dialogue|Talk to People/i);
    expect(actions).toMatch(/Touch|Step-Through/i);
  });

  it("states OET key bindings that match the ones OetCanvas actually listens for", () => {
    const keys = manual.controls.map((c) => c.key).join(" | ");

    // OetCanvas handles ArrowLeft/KeyA, ArrowRight/KeyD, ArrowDown/KeyS,
    // Space/KeyB (chain brake), KeyT (tail rope), KeyP (pause).
    expect(keys).toMatch(/A \/ D/);
    expect(keys).toMatch(/← \/ →/);
    expect(keys).toMatch(/S \/ ↓/);
    expect(keys).toMatch(/Space or B/);
    expect(keys).toMatch(/\bT\b/);
    expect(keys.split("|").some((k) => k.trim() === "P")).toBe(true);
  });

  it("keeps the non-clinical disclaimer prominent in the rules", () => {
    const disclaimer = manual.rules?.find((r) =>
      /Not Medical Training/i.test(r.title)
    );
    expect(disclaimer).toBeDefined();
    expect(disclaimer?.detail).toMatch(/does not provide clinical protocols/i);
    expect(disclaimer?.detail).toMatch(/certification/i);
  });

  it("carries the unofficial-tribute notice rather than implying endorsement", () => {
    const notice = manual.rules?.find((r) => /Tribute/i.test(r.title));
    expect(notice).toBeDefined();
    expect(notice?.detail).toMatch(/[Nn]ot affiliated with/);
  });

  it("names the five debrief dimensions the M7 engine scores", () => {
    const serialized = JSON.stringify(manual);
    for (const dimension of [
      "Scene Management",
      "Patient Care",
      "Communication",
      "Transportation",
      "Operational Judgment",
    ]) {
      expect(serialized).toContain(dimension);
    }
  });

  it("tells the player audio is optional and radio traffic is text-first", () => {
    expect(manual.proTips?.join(" ")).toMatch(
      /muted by default[\s\S]*text-first|text-first[\s\S]*muted by default/i
    );
  });
});

describe("Patrol Shift — M9 field manual reachability", () => {
  beforeEach(() => {
    window.localStorage.clear();
    safeStorage.clearCache?.();
  });

  afterEach(() => {
    cleanup();
    window.localStorage.clear();
    safeStorage.clearCache?.();
  });

  it("exposes the manual trigger from the shift container header", () => {
    render(<PatrolShiftContainer />);

    const trigger = screen.getByRole("button", {
      name: /Open Field Manual for Patrol Shift/i,
    });
    expect(trigger).toBeDefined();
  });

  it("opens and closes the manual without leaving the shift", () => {
    render(<PatrolShiftContainer />);

    const trigger = screen.getByRole("button", {
      name: /Open Field Manual for Patrol Shift/i,
    });
    fireEvent.click(trigger);

    expect(screen.getByRole("dialog")).toBeDefined();
    expect(screen.getAllByText(/Patrol Shift/i).length).toBeGreaterThan(0);

    fireEvent.keyDown(document, { key: "Escape", code: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();

    // The shift itself is untouched by opening the manual.
    expect(screen.getByTestId("patrol-shift-container")).toBeDefined();
  });
});

describe("Patrol Shift — M9 optional audio layer", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const cues: PatrolSoundName[] = [
    "radioChirp",
    "radioStatic",
    "chairliftHum",
    "skiOnSnow",
    "sledMovement",
    "patrolRoomAmbience",
  ];

  it("defines a positive carrier frequency for every patrol cue", () => {
    for (const cue of cues) {
      expect(patrolSoundFrequencies[cue]).toBeGreaterThan(0);
      expect(Number.isFinite(patrolSoundFrequencies[cue])).toBe(true);
    }
  });

  it("suppresses every cue when the shared SoundEngine disallows sound", () => {
    const engine = getSoundEngine();
    vi.spyOn(engine, "isSoundAllowed").mockReturnValue(false);
    const playTone = vi.spyOn(engine, "playTone");

    for (const cue of cues) {
      expect(playPatrolCue(cue)).toBe(false);
    }
    expect(playTone).not.toHaveBeenCalled();
  });

  it("delegates to the shared SoundEngine rather than opening its own AudioContext", () => {
    const engine = getSoundEngine();
    vi.spyOn(engine, "isSoundAllowed").mockReturnValue(true);
    const playTone = vi.spyOn(engine, "playTone").mockImplementation(() => {});

    expect(playPatrolCue("radioChirp")).toBe(true);

    expect(playTone).toHaveBeenCalledTimes(1);
    const options = playTone.mock.calls[0][0] as unknown as {
      frequency: number;
    };
    expect(options.frequency).toBe(patrolSoundFrequencies.radioChirp);
  });

  it("keeps cue gain low so effects sit under the dispatch text", () => {
    const engine = getSoundEngine();
    vi.spyOn(engine, "isSoundAllowed").mockReturnValue(true);
    const playTone = vi.spyOn(engine, "playTone").mockImplementation(() => {});

    for (const cue of cues) {
      playPatrolCue(cue);
    }

    for (const call of playTone.mock.calls) {
      const { volume } = call[0] as unknown as { volume: number };
      expect(volume).toBeGreaterThan(0);
      expect(volume).toBeLessThanOrEqual(0.15);
    }
  });

  it("never propagates a Web Audio failure to the caller", () => {
    const engine = getSoundEngine();
    vi.spyOn(engine, "isSoundAllowed").mockReturnValue(true);
    vi.spyOn(engine, "playTone").mockImplementation(() => {
      throw new Error("AudioContext unavailable");
    });

    expect(() => playPatrolCue("radioChirp")).not.toThrow();
    expect(playPatrolCue("radioChirp")).toBe(false);
  });

  it("renders the shift container without requiring audio to be available", () => {
    expect(() => render(<PatrolShiftContainer />)).not.toThrow();
    cleanup();
  });
});
