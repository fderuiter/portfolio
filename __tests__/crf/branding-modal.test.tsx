/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrandingConfigModal } from "@/components/crf/Branding/BrandingConfigModal";
import { DEFAULT_STUDY_BRANDING } from "@/lib/crf/branding-defaults";

describe("BrandingConfigModal Component", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
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

  it("renders the branding configurator with presets and live preview", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <BrandingConfigModal
          initialBranding={DEFAULT_STUDY_BRANDING}
          onSave={handleSave}
          onClose={handleClose}
        />
      );
    });

    expect(container.textContent).toContain("Organization & Sponsor Branding Configurator");
    expect(container.textContent).toContain("Clinical Palette Presets");
    expect(container.textContent).toContain("Biotech Cyan");
    expect(container.textContent).toContain("Clinical Navy");
    expect(container.textContent).toContain("Live Document Simulation");
  });

  it("applies a clinical palette preset when clicked and invokes onSave", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <BrandingConfigModal
          initialBranding={DEFAULT_STUDY_BRANDING}
          onSave={handleSave}
          onClose={handleClose}
        />
      );
    });

    // Find and click the Clinical Navy preset
    const buttons = Array.from(container.querySelectorAll("button"));
    const navyPresetBtn = buttons.find((b) => b.textContent?.includes("Clinical Navy"));
    expect(navyPresetBtn).toBeDefined();

    await act(async () => {
      navyPresetBtn?.click();
    });

    // Click Apply Branding
    const applyBtn = buttons.find((b) => b.textContent?.includes("Apply Branding"));
    expect(applyBtn).toBeDefined();

    await act(async () => {
      applyBtn?.click();
    });

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(handleClose).toHaveBeenCalledTimes(1);
    const savedBrand = handleSave.mock.calls[0][0];
    expect(savedBrand.primaryColor).toBe("#1e3a8a");
  });

  it("saves default company template to localStorage without crashing", async () => {
    const handleSave = vi.fn();
    const handleClose = vi.fn();

    await act(async () => {
      root = createRoot(container);
      root.render(
        <BrandingConfigModal
          initialBranding={DEFAULT_STUDY_BRANDING}
          onSave={handleSave}
          onClose={handleClose}
        />
      );
    });

    const mockSetItem = vi.fn();
    const originalLocalStorage = globalThis.localStorage;
    Object.defineProperty(globalThis, "localStorage", {
      value: {
        getItem: vi.fn(),
        setItem: mockSetItem,
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    const defaultBtn = Array.from(container.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Set as Default Company Profile")
    );
    expect(defaultBtn).toBeDefined();

    await act(async () => {
      defaultBtn?.click();
    });

    expect(mockSetItem).toHaveBeenCalledWith(
      "crf_studio_default_branding",
      expect.stringContaining(DEFAULT_STUDY_BRANDING.primaryColor)
    );

    Object.defineProperty(globalThis, "localStorage", {
      value: originalLocalStorage,
      writable: true,
      configurable: true,
    });
  });
});
