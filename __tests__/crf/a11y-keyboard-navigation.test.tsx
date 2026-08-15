/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { BrandingConfigModal } from "@/components/crf/Branding/BrandingConfigModal";
import { ExportDocumentModal } from "@/components/crf/Modes/ExportDocumentModal";
import { DEFAULT_STUDY_BRANDING } from "@/lib/crf/branding-defaults";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";

describe("CRF Studio - Modal Accessibility (A11y) & Keyboard Navigation", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    window.URL.revokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = window.URL.createObjectURL;
    globalThis.URL.revokeObjectURL = window.URL.revokeObjectURL;
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

  describe("BrandingConfigModal A11y & Keyboard Navigation", () => {
    it("should include proper ARIA modal dialog roles and labelledby references", async () => {
      const handleClose = vi.fn();
      const handleSave = vi.fn();

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

      const dialogEl = container.querySelector('[role="dialog"]');
      expect(dialogEl).not.toBeNull();
      expect(dialogEl?.getAttribute("aria-modal")).toBe("true");
      expect(dialogEl?.getAttribute("aria-labelledby")).toBe("branding-modal-title");

      const titleEl = container.querySelector("#branding-modal-title");
      expect(titleEl).not.toBeNull();
      expect(titleEl?.textContent).toContain("Branding Configurator");
    });

    it("should dismiss the Branding modal when pressing the Escape key", async () => {
      const handleClose = vi.fn();
      const handleSave = vi.fn();

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

      // Dispatch Escape keydown event
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("ExportDocumentModal A11y & Keyboard Navigation", () => {
    it("should include proper ARIA modal dialog roles and labelledby references", async () => {
      const handleClose = vi.fn();
      const handleOpenBranding = vi.fn();

      await act(async () => {
        root = createRoot(container);
        root.render(
          <ExportDocumentModal
            study={ONCOLOGY_RECIST_PRESET}
            activeFormId={ONCOLOGY_RECIST_PRESET.forms[0].id}
            onClose={handleClose}
            onOpenBranding={handleOpenBranding}
          />
        );
      });

      const dialogEl = container.querySelector('[role="dialog"]');
      expect(dialogEl).not.toBeNull();
      expect(dialogEl?.getAttribute("aria-modal")).toBe("true");
      expect(dialogEl?.getAttribute("aria-labelledby")).toBe("export-modal-title");

      const titleEl = container.querySelector("#export-modal-title");
      expect(titleEl).not.toBeNull();
      expect(titleEl?.textContent).toContain("Clinical Word (.docx) & PDF Exporter");
    });

    it("should dismiss the Export modal when pressing the Escape key", async () => {
      const handleClose = vi.fn();
      const handleOpenBranding = vi.fn();

      await act(async () => {
        root = createRoot(container);
        root.render(
          <ExportDocumentModal
            study={ONCOLOGY_RECIST_PRESET}
            activeFormId={ONCOLOGY_RECIST_PRESET.forms[0].id}
            onClose={handleClose}
            onOpenBranding={handleOpenBranding}
          />
        );
      });

      // Dispatch Escape keydown event
      await act(async () => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      });

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
