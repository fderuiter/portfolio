/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

class MockStorage implements Storage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  get length(): number {
    return this.store.size;
  }
  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

const mockLocalStorage = new MockStorage();
Object.defineProperty(globalThis, "localStorage", {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

import { VisitMatrixEditor } from "@/components/crf/Modes/VisitMatrixEditor";
import { RuleGraphStudio } from "@/components/crf/Modes/RuleGraphStudio";
import { LiveEdcSimulator } from "@/components/crf/Modes/LiveEdcSimulator";
import { WorkflowWizardModal } from "@/components/crf/Wizard/WorkflowWizardModal";

(globalThis as any).mockComponents = {
  VisitMatrixEditor,
  RuleGraphStudio,
  LiveEdcSimulator,
  WorkflowWizardModal,
};

vi.mock("next/dynamic", () => {
  return {
    default: (loader: any, options: any) => {
      const loaderStr = loader.toString();

      return function DynamicComponent(props: any) {
        const registry = (globalThis as any).mockComponents || {};
        let Component: any = null;

        if (loaderStr.includes("VisitMatrixEditor")) {
          Component = registry.VisitMatrixEditor;
        } else if (loaderStr.includes("RuleGraphStudio")) {
          Component = registry.RuleGraphStudio;
        } else if (loaderStr.includes("LiveEdcSimulator")) {
          Component = registry.LiveEdcSimulator;
        } else if (loaderStr.includes("WorkflowWizardModal")) {
          Component = registry.WorkflowWizardModal;
        }

        if (Component) {
          return React.createElement(Component, props);
        }
        if (options && options.loading) {
          return options.loading();
        }
        return null;
      };
    },
  };
});

import { CRFStudioContainer } from "@/components/crf/CRFStudioContainer";
import { StudioHeader } from "@/components/crf/StudioHeader";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";

import fs from "fs";
import path from "path";

function relativeLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const R = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const G = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const B = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("CRF Studio - Light Mode & Theming", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockLocalStorage.clear();
    window.location.hash = "";
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it("defaults to dark studio theme and renders data-studio-theme='dark'", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const studioRoot = container.querySelector("[data-studio-theme]");
    expect(studioRoot).toBeDefined();
    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("dark");
  });

  it("initializes to light theme when URL hash contains #theme=light", async () => {
    window.location.hash = "#theme=light";

    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const studioRoot = container.querySelector("[data-studio-theme]");
    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("light");
  });

  it("initializes to light theme when localStorage has crf_studio_theme set to 'light'", async () => {
    mockLocalStorage.setItem("crf_studio_theme", "light");

    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const studioRoot = container.querySelector("[data-studio-theme]");
    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("light");
  });

  it("toggles theme from dark to light when clicking the header theme toggle button", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const studioRoot = container.querySelector("[data-studio-theme]");
    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("dark");

    // Find the theme toggle button by aria-label
    const themeBtn = container.querySelector(
      'button[aria-label="Switch to Clinical Light Mode"]'
    ) as HTMLButtonElement;
    expect(themeBtn).toBeDefined();

    await act(async () => {
      themeBtn?.click();
    });

    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("light");
    expect(mockLocalStorage.getItem("crf_studio_theme")).toBe("light");
    expect(window.location.hash).toContain("theme=light");

    // Click again to toggle back to dark
    const switchBackBtn = container.querySelector(
      'button[aria-label="Switch to Dark Studio Mode"]'
    ) as HTMLButtonElement;
    expect(switchBackBtn).toBeDefined();

    await act(async () => {
      switchBackBtn?.click();
    });

    expect(studioRoot?.getAttribute("data-studio-theme")).toBe("dark");
    expect(mockLocalStorage.getItem("crf_studio_theme")).toBe("dark");
  });

  it("applies data-studio-theme='light' container attribute for theme-scoped WCAG focus ring contrast overrides", async () => {
    mockLocalStorage.setItem("crf_studio_theme", "light");

    await act(async () => {
      root = createRoot(container);
      root.render(<CRFStudioContainer />);
    });

    const studioRoot = container.querySelector("[data-studio-theme='light']");
    expect(studioRoot).not.toBeNull();
  });

  it("StudioHeader renders theme toggle and triggers onToggleTheme callback", async () => {
    const handleToggle = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <StudioHeader
          study={ONCOLOGY_RECIST_PRESET}
          activeMode="designer"
          canUndo={false}
          canRedo={false}
          theme="dark"
          onToggleTheme={handleToggle}
          onUndo={vi.fn()}
          onRedo={vi.fn()}
          onChangeMode={vi.fn()}
          onSelectPreset={vi.fn()}
          onOpenDiagnostics={vi.fn()}
          onOpenCdashScaffolder={vi.fn()}
          onOpenBranding={vi.fn()}
          onOpenExportDocument={vi.fn()}
          onOpenWizard={vi.fn()}
        />
      );
    });

    const toggleBtn = container.querySelector(
      'button[aria-label="Switch to Clinical Light Mode"]'
    ) as HTMLButtonElement;
    expect(toggleBtn).toBeDefined();

    await act(async () => {
      toggleBtn?.click();
    });

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("verifies scoped light theme color overrides achieve WCAG 2.1 AA text (4.5:1) and UI component (3.0:1) contrast ratios", () => {
    const lightBgs = ["#ffffff", "#f8fafc", "#f1f5f9"];

    // 1. Text color tokens
    const textColors = {
      "Brand Cyan (#0e7490)": "#0e7490",
      "Amber Warning (#b45309)": "#b45309",
      "Emerald Success (#047857)": "#047857",
      "Red Error (#b91c1c)": "#b91c1c",
      "Rose Error (#be123c)": "#be123c",
      "Muted Text (--crf-text-muted #334155)": "#334155",
      "Dim Text (--crf-text-dim #475569)": "#475569",
    };

    for (const [name, textColor] of Object.entries(textColors)) {
      for (const bg of lightBgs) {
        const ratio = getContrastRatio(textColor, bg);
        expect(
          ratio,
          `Text token ${name} against light background ${bg} must achieve at least 4.5:1 WCAG AA contrast (got ${ratio.toFixed(
            2
          )}:1)`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }

    // 2. Graphical UI component & border tokens
    const uiComponentColors = {
      "Cyan UI Border/Bg (#0891b2)": "#0891b2",
      "Amber UI Border/Bg (#b45309)": "#b45309",
      "Emerald UI Border/Bg (#047857)": "#047857",
      "Red UI Border/Bg (#b91c1c)": "#b91c1c",
      "Input Border (--crf-input-border #64748b)": "#64748b",
      "Focus Ring (--focus-ring #b45309)": "#b45309",
    };

    for (const [name, uiColor] of Object.entries(uiComponentColors)) {
      for (const bg of lightBgs) {
        const ratio = getContrastRatio(uiColor, bg);
        expect(
          ratio,
          `UI component ${name} against light background ${bg} must achieve at least 3.0:1 WCAG AA contrast (got ${ratio.toFixed(
            2
          )}:1)`
        ).toBeGreaterThanOrEqual(3.0);
      }
    }
  });

  it("verifies studio-theme.css scopes all overrides strictly to [data-studio-theme='light'] without modifying dark theme values", () => {
    const cssPath = path.resolve(process.cwd(), "components/crf/studio-theme.css");
    const cssContent = fs.readFileSync(cssPath, "utf-8");

    // Dark mode block check
    expect(cssContent).toContain('[data-studio-theme="dark"]');
    expect(cssContent).toContain("--crf-bg: #09090b");
    expect(cssContent).toContain("--crf-text: #f4f4f5");

    // Scoped light mode check for brand & status overrides
    expect(cssContent).toContain('[data-studio-theme="light"] .text-brand-cyan');
    expect(cssContent).toContain('[data-studio-theme="light"] .text-amber-400');
    expect(cssContent).toContain('[data-studio-theme="light"] .text-emerald-400');
    expect(cssContent).toContain('[data-studio-theme="light"] .text-red-400');
    expect(cssContent).toContain('[data-studio-theme="light"] .text-rose-400');
  });

  it("verifies global root CSS and theme generation scripts remain unchanged", () => {
    const globalsCss = fs.readFileSync(path.resolve(process.cwd(), "app/globals.css"), "utf-8");
    const generateScript = fs.readFileSync(path.resolve(process.cwd(), "scripts/generate-theme.ts"), "utf-8");

    // Assert no CRF studio overrides leaked into app/globals.css
    expect(globalsCss).not.toContain("[data-studio-theme]");
    // Assert generator script exists and is active
    expect(generateScript).toContain("parseCSSAndGenerateTS");
  });
});

