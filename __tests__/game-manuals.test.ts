import { describe, it, expect } from "vitest";
import { GAME_MANUALS } from "../lib/game-manuals";

describe("Game Manuals Registry", () => {
  const expectedModules = [
    "proof",
    "working-with-duck",
    "laser-loon",
    "quasi-puzzler",
    "garmin-watch",
    "clinical-chaos",
    "retro-labyrinth",
    "simulator",
  ];

  it("registers all 8 required interactive games and modules", () => {
    expectedModules.forEach((modId) => {
      expect(GAME_MANUALS[modId]).toBeDefined();
      expect(GAME_MANUALS[modId].id).toBe(modId);
    });
  });

  it("contains rich structure with objectives, controls, rules, and engineering lore for each manual", () => {
    Object.values(GAME_MANUALS).forEach((manual) => {
      expect(manual.title).toBeTruthy();
      expect(manual.objective).toBeTruthy();
      expect(manual.quickSummary).toBeTruthy();
      expect(manual.controls.length).toBeGreaterThan(0);
      expect(manual.rules.length).toBeGreaterThan(0);
      expect(manual.lore.title).toBeTruthy();
      expect(manual.lore.story).toBeTruthy();
      expect(manual.lore.realWorldTech.length).toBeGreaterThan(0);
    });
  });
});
