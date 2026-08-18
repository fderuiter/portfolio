import { describe, it, expect } from "vitest";
import React from "react";
import { render } from "@testing-library/react";
import { CommandPalette } from "@/components/CommandPalette";
import { SearchProvider } from "@/components/providers/SearchProvider";
import { RAMGauge } from "@/components/QuasiPerfectPuzzler/RAMGauge";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import { NeuroMetricsPanel } from "@/components/neuro/NeuroMetricsPanel";
import { ClinicalTrialChaos } from "@/components/ClinicalTrialChaos";
import { LaserLoon } from "@/components/LaserLoon";

describe("CSS Transition Property Scoping & Motion Invariants", () => {
  it("Requirement 1: Active overlay backdrops render opacity transitions without blanket transition-all", () => {
    const { container } = render(
      <SearchProvider>
        <CommandPalette isOpen={true} onClose={() => {}} />
      </SearchProvider>
    );

    // Backdrop element is motion.div with transition-opacity
    const backdrop = container.querySelector('[className*="fixed inset-0"]');
    if (backdrop) {
      expect(backdrop.className).toContain("transition-opacity");
      expect(backdrop.className).not.toContain("transition-all");
    }
  });

  it("Requirement 2: Progress indicators use scoped transitions rather than blanket transition-all", () => {
    // 1. RAMGauge
    const { container: ramContainer } = render(
      <RAMGauge currentRam={8} initialRam={16} isOOM={false} isLowMemory={false} />
    );
    const ramBar = ramContainer.querySelector(".h-2\\.5 > div");
    if (ramBar) {
      expect(ramBar.className).not.toContain("transition-all");
    }

    // 2. PlayCabinet boot bar
    const mockCabinetProps = {
      title: "Test Game",
      accentColor: "emerald" as const,
      icon: <span>Icon</span>,
      instructions: "Controls instructions",
      controls: [{ key: "SPACE", action: "Jump" }],
      importComponent: async () => ({ default: () => <div /> }),
      children: <div>Game Content</div>,
    };

    const { container: cabinetContainer } = render(
      <PlayCabinet {...mockCabinetProps} />
    );
    const bootProgressTrack = cabinetContainer.querySelector(".h-full.bg-emerald-500");
    if (bootProgressTrack) {
      expect(bootProgressTrack.className).toContain("transition-[width]");
      expect(bootProgressTrack.className).not.toContain("transition-all");
    }

    // 3. NeuroMetricsPanel
    const { container: neuroContainer } = render(
      <NeuroMetricsPanel
        scenario={{
          id: "test",
          title: "Test",
          subtitle: "",
          initialDefects: 10,
          description: "",
          regions: [],
        }}
        metrics={{ defectCount: 5, totalVolume: 100, meanIntensity: 50, confidence: 0.9, meanCorticalThicknessMm: 2.5 }}
        scoreState={{ score: 100, multiplier: 1, streak: 0 }}
      />
    );
    const defectBar = neuroContainer.querySelector(".bg-brand-cyan.h-full");
    expect(defectBar).not.toBeNull();
    expect(defectBar?.className).toContain("transition-[width]");
    expect(defectBar?.className).not.toContain("transition-all");
  });

  it("Requirement 3: Surface components and progress bars do not intercept inline width/transform with transition-all", () => {
    const { container: chaosContainer } = render(<ClinicalTrialChaos />);
    const suspicionBar = chaosContainer.querySelector('[style*="width"]');
    if (suspicionBar) {
      expect(suspicionBar.className).not.toContain("transition-all");
      expect(suspicionBar.className).toContain("transition-[width,background-color]");
    }

    const { container: laserContainer } = render(<LaserLoon />);
    const laserChassis = laserContainer.querySelector('[data-keyboard-boundary="true"]');
    if (laserChassis) {
      expect(laserChassis.className).not.toContain("transition-all");
      expect(laserChassis.className).toContain("transition-colors");
    }
  });

  it("Requirement 4: Hover/focus visual states remain active across surfaces", () => {
    const mockCabinetProps = {
      title: "Test Game",
      accentColor: "emerald" as const,
      icon: <span>Icon</span>,
      instructions: "Controls instructions",
      controls: [{ key: "SPACE", action: "Jump" }],
      importComponent: async () => ({ default: () => <div /> }),
      children: <div>Game Content</div>,
    };

    const { container: cabinetContainer } = render(
      <PlayCabinet {...mockCabinetProps} />
    );
    const button = cabinetContainer.querySelector("button");
    if (button) {
      expect(button.className).toMatch(/hover:|focus:|active:/);
    }
  });
});
