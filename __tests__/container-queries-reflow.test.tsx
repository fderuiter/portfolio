/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PlayCabinet } from "@/components/arcade/PlayCabinet";
import { NeuroReconClient } from "@/components/neuro/NeuroReconClient";
import { InspectorPanel } from "@/components/crf/RightInspector/InspectorPanel";
import { WidgetPalette } from "@/components/crf/LeftSidebar/WidgetPalette";

// Mock AudioProvider
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playClick: vi.fn(),
    playNote: vi.fn(),
    playSuccess: vi.fn(),
  }),
}));

// Mock Telemetry
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn(),
  }),
}));

// Mock Studio Hash Params
vi.mock("@/hooks/useStudioHashParams", () => ({
  useStudioHashParams: () => ({
    params: new URLSearchParams(),
    setParam: vi.fn(),
    setParams: vi.fn(),
  }),
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as any;

describe("Container-Query-Driven Adaptive Layouts & Mobile Reflow Suite", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.clearAllMocks();
  });

  describe("Requirement 1: Game Preview Standby Containers Aspect Ratio Adaptation", () => {
    it("conforms to Garmin Watch 1:1 square ratio in standby mode", async () => {
      await act(async () => {
        root.render(
          <PlayCabinet
            gameId="garmin-watch"
            aspectRatio="1/1"
            title="Garmin Simulator"
            accentColor="amber"
            icon={<div>Watch</div>}
            instructions="Memory constraint simulator"
            controls={[]}
            importComponent={async () => ({})}
          >
            <div>Garmin Active Canvas</div>
          </PlayCabinet>
        );
      });

      const standbyBox = container.querySelector('[class*="@container"]') as HTMLElement;
      expect(standbyBox).not.toBeNull();
      expect(standbyBox.className).toContain("aspect-square");
      expect(standbyBox.style.aspectRatio).toBe("1/1");
      expect(standbyBox.className).toContain("min-h-[280px]");
    });

    it("conforms to Working With Duck 16:9 video ratio in standby mode", async () => {
      await act(async () => {
        root.render(
          <PlayCabinet
            gameId="working-with-duck"
            aspectRatio="16/9"
            title="Working With Duck"
            accentColor="amber"
            icon={<div>Duck</div>}
            instructions="Pet companion simulator"
            controls={[]}
            importComponent={async () => ({})}
          >
            <div>Duck Active Canvas</div>
          </PlayCabinet>
        );
      });

      const standbyBox = container.querySelector('[class*="@container"]') as HTMLElement;
      expect(standbyBox).not.toBeNull();
      expect(standbyBox.className).toContain("aspect-video");
      expect(standbyBox.style.aspectRatio).toBe("16/9");
    });

    it("defaults to 16:10 ratio for Retro Labyrinth cabinet", async () => {
      await act(async () => {
        root.render(
          <PlayCabinet
            gameId="retro-labyrinth"
            title="Retro Labyrinth"
            accentColor="rose"
            icon={<div>Labyrinth</div>}
            instructions="Roguelike dungeon"
            controls={[]}
            importComponent={async () => ({})}
          >
            <div>Labyrinth Active Canvas</div>
          </PlayCabinet>
        );
      });

      const standbyBox = container.querySelector('[class*="@container"]') as HTMLElement;
      expect(standbyBox).not.toBeNull();
      expect(standbyBox.className).toContain("aspect-[16/10]");
      expect(standbyBox.style.aspectRatio).toBe("16/10");
    });
  });

  describe("Requirement 2: NeuroRecon Viewers Fluid Mobile Reflow", () => {
    it("declares container queries and unclamped mobile min-heights on 3D and 2D viewports", async () => {
      await act(async () => {
        root.render(<NeuroReconClient />);
      });

      const gridWrapper = container.querySelector('.grid[class*="@container"]');
      expect(gridWrapper).not.toBeNull();

      const viewportDividers = container.querySelectorAll(".h-auto.min-h-\\[320px\\]");
      expect(viewportDividers.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Requirement 3 & 4: Studio Panels & Widget Palette Container Query Alignment", () => {
    it("renders Widget Palette inside a container query wrapper with responsive grid columns", async () => {
      await act(async () => {
        root.render(<WidgetPalette onAddField={vi.fn()} />);
      });

      const paletteContainer = container.querySelector('[class*="@container"]');
      expect(paletteContainer).not.toBeNull();

      const itemGrids = container.querySelectorAll(".grid");
      expect(itemGrids.length).toBeGreaterThan(0);
      itemGrids.forEach((grid) => {
        expect(grid.className).toContain("@[320px]:grid-cols-2");
      });
    });

    it("renders InspectorPanel inside a container query boundary", async () => {
      const mockForm: any = {
        id: "form_1",
        name: "Vital Signs",
        domain: "VS",
        sections: [
          {
            id: "sec_1",
            title: "Vital Signs Section",
            fields: [
              {
                id: "f_1",
                variableName: "SYSBP",
                label: "Systolic Blood Pressure",
                dataType: "number",
                columnSpan: 6,
                required: true,
              },
            ],
          },
        ],
      };

      await act(async () => {
        root.render(
          <InspectorPanel
            form={mockForm}
            selectedField={mockForm.sections[0].fields[0]}
            codelists={[]}
            onClose={vi.fn()}
            onUpdateField={vi.fn()}
            onUpdateFormMeta={vi.fn()}
            onUpdateRules={vi.fn()}
          />
        );
      });

      const inspectorRoot = container.querySelector('[class*="@container"]');
      expect(inspectorRoot).not.toBeNull();
    });
  });
});
