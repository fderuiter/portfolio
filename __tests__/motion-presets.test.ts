import { describe, it, expect } from "vitest";
import { designManifest, resolveMotionPreset } from "@/lib/design-manifest";

describe("Motion Tokens and Centralized Presets", () => {
  it("should export standard duration scales and easing curves in designManifest", () => {
    expect(designManifest.motion.durations).toBeDefined();
    expect(designManifest.motion.durations.instant).toBe(50);
    expect(designManifest.motion.durations.fast).toBe(150);
    expect(designManifest.motion.durations.normal).toBe(250);
    expect(designManifest.motion.durations.slow).toBe(350);
    expect(designManifest.motion.durations.deliberate).toBe(500);

    expect(designManifest.motion.easings).toBeDefined();
    expect(designManifest.motion.easings.default).toContain("cubic-bezier");
    expect(designManifest.motion.easings.in).toContain("cubic-bezier");
    expect(designManifest.motion.easings.out).toContain("cubic-bezier");
  });

  it("should enforce strict separation between springs and duration curves", () => {
    const springs = designManifest.motion.springs;
    const durations = designManifest.motion.durations;

    // Springs have physics properties
    expect(springs.snappy.type).toBe("spring");
    expect(typeof springs.snappy.stiffness).toBe("number");
    expect(typeof springs.snappy.damping).toBe("number");

    // Durations are plain numeric values in milliseconds
    for (const [, val] of Object.entries(durations)) {
      expect(typeof val).toBe("number");
      expect((val as number)).toBeGreaterThan(0);
    }
  });

  it("should export reusable motion presets in designManifest", () => {
    const presets = designManifest.motion.presets;
    expect(presets.fadeIn).toBeDefined();
    expect(presets.modal).toBeDefined();
    expect(presets.commandPalette).toBeDefined();
    expect(presets.backdrop).toBeDefined();
    expect(presets.heroHeadline).toBeDefined();
    expect(presets.heroText).toBeDefined();
    expect(presets.timelineNode).toBeDefined();
    expect(presets.timelineCard).toBeDefined();
  });

  it("should apply non-animating fallbacks when reduced motion is preferred", () => {
    const modalPreset = designManifest.motion.presets.modal;
    expect(modalPreset.initial).toHaveProperty("y");
    expect(modalPreset.initial).toHaveProperty("scale");

    const reducedModal = resolveMotionPreset(modalPreset, true);
    expect(reducedModal.initial).not.toHaveProperty("y");
    expect(reducedModal.initial).not.toHaveProperty("scale");
    expect(reducedModal.transition).toEqual({ duration: 0.01 });

    const normalModal = resolveMotionPreset(modalPreset, false);
    expect(normalModal).toEqual(modalPreset);
  });

  it("should import primary interactive components using central presets", async () => {
    const { Hero, HeroHeadline, HeroText } = await import("@/components/Hero");
    const { CommandPalette } = await import("@/components/CommandPalette");
    const { Timeline } = await import("@/components/Timeline");
    const { FieldManualModal } = await import("@/components/FieldManualModal");
    const { VictoryModal } = await import("@/components/QuasiPerfectPuzzler/VictoryModal");

    expect(Hero).toBeDefined();
    expect(HeroHeadline).toBeDefined();
    expect(HeroText).toBeDefined();
    expect(CommandPalette).toBeDefined();
    expect(Timeline).toBeDefined();
    expect(FieldManualModal).toBeDefined();
    expect(VictoryModal).toBeDefined();
  });
});
