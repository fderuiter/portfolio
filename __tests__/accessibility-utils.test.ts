import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PDFEngine, FocusBridge } from "@/lib/accessibility-utils";

describe("Accessibility Utilities", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  describe("PDFEngine", () => {
    it("returns a placeholder Buffer containing the 1099 export string when taxData is provided", () => {
      const taxData = { recipient: "John Doe", amount: 5000, taxYear: 2026 };
      const result = PDFEngine.generate1099(taxData);

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString("utf-8")).toBe(
        "PDF/UA (ISO 14289) Valid Document: 1099 Export"
      );
    });

    it("returns the placeholder Buffer for empty taxData payloads", () => {
      const result = PDFEngine.generate1099({});

      expect(Buffer.isBuffer(result)).toBe(true);
      expect(result.toString("utf-8")).toBe(
        "PDF/UA (ISO 14289) Valid Document: 1099 Export"
      );
    });
  });

  describe("FocusBridge", () => {
    describe("restoreHostFocus", () => {
      it("restores keyboard focus to host element when element exists in document", () => {
        const button = document.createElement("button");
        button.id = "host-element-1";
        document.body.appendChild(button);

        const focusSpy = vi.spyOn(button, "focus");

        FocusBridge.restoreHostFocus("host-element-1");

        expect(focusSpy).toHaveBeenCalledTimes(1);
        expect(document.activeElement).toBe(button);
      });

      it("handles missing target element gracefully without throwing error", () => {
        expect(() => {
          FocusBridge.restoreHostFocus("non-existent-id");
        }).not.toThrow();
      });

      it("safely handles execution when document is undefined", () => {
        vi.stubGlobal("document", undefined);
        expect(() => {
          FocusBridge.restoreHostFocus("host-element-1");
        }).not.toThrow();
      });
    });

    describe("attachOnboardingListener", () => {
      it("restores host focus when receiving IFRAME_ONBOARDING_COMPLETE message event", () => {
        const input = document.createElement("input");
        input.id = "host-input";
        document.body.appendChild(input);

        const focusSpy = vi.spyOn(input, "focus");

        FocusBridge.attachOnboardingListener(window, "host-input");

        const event = new MessageEvent("message", {
          data: { type: "IFRAME_ONBOARDING_COMPLETE" },
        });
        window.dispatchEvent(event);

        expect(focusSpy).toHaveBeenCalledTimes(1);
      });

      it("ignores message events with different event types or invalid data format", () => {
        const button = document.createElement("button");
        button.id = "host-button";
        document.body.appendChild(button);

        const focusSpy = vi.spyOn(button, "focus");

        FocusBridge.attachOnboardingListener(window, "host-button");

        // Event with non-matching type
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { type: "OTHER_EVENT" },
          })
        );

        // Event with null data
        window.dispatchEvent(
          new MessageEvent("message", {
            data: null,
          })
        );

        // Event with primitive string data
        window.dispatchEvent(
          new MessageEvent("message", {
            data: "plain-text-message",
          })
        );

        // Event with missing type property
        window.dispatchEvent(
          new MessageEvent("message", {
            data: { payload: "test" },
          })
        );

        expect(focusSpy).not.toHaveBeenCalled();
      });

      it("safely handles execution when window is undefined", () => {
        vi.stubGlobal("window", undefined);
        expect(() => {
          FocusBridge.attachOnboardingListener({} as Window, "host-input");
        }).not.toThrow();
      });
    });
  });
});
