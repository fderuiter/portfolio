import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { getActiveHostUrl, copyToClipboard } from "@/lib/clipboard";
import { useClipboard } from "@/hooks/useClipboard";
import { A11yProvider } from "@/components/providers/A11yProvider";

// Test component to execute useClipboard hook within the context of A11yProvider
function TestClipboardComponent({ textToCopy }: { textToCopy: string }) {
  const { copy, copied, error } = useClipboard({
    successMessage: "Custom success",
    errorMessage: "Custom error",
  });

  return (
    <div>
      <button onClick={() => copy(textToCopy)}>Copy Text</button>
      <div data-testid="copied-status">{copied ? "COPIED" : "NOT_COPIED"}</div>
      <div data-testid="error-status">{error || "NO_ERROR"}</div>
    </div>
  );
}

describe("Unified Clipboard Utility & Hook", () => {
  let originalWriteText: unknown;
  let originalExecCommand: unknown;
  let originalLocation: unknown;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    
    // Save original properties
    originalWriteText = navigator.clipboard?.writeText;
    originalExecCommand = document.execCommand;
    originalLocation = window.location;

    // Define mock on navigator.clipboard
    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn() },
        configurable: true,
        writable: true,
      });
    }
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);

    // Define mock on document.execCommand
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    
    // Restore original properties
    if (navigator.clipboard && originalWriteText) {
      navigator.clipboard.writeText = originalWriteText as (data: string) => Promise<void>;
    }
    if (originalExecCommand) {
      document.execCommand = originalExecCommand as (command: string, showUI?: boolean, value?: string) => boolean;
    }
    
    // Reset window.location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      configurable: true,
      writable: true,
    });
  });

  describe("getActiveHostUrl", () => {
    it("returns active window origin when window and window.location are defined", () => {
      Object.defineProperty(window, "location", {
        value: {
          origin: "https://staging-preview.vercel.app",
        },
        configurable: true,
        writable: true,
      });
      expect(getActiveHostUrl()).toBe("https://staging-preview.vercel.app");
    });

    it("falls back to default production domain when window is simulated as undefined", () => {
      // Temporarily mock window location by deleting or modifying it to trigger the fallback
      const originalWin = global.window;
      try {
        // @ts-expect-error - simulating environment where window is deleted
        delete global.window;
        expect(getActiveHostUrl()).toBe("https://fderuiter-portfolio.vercel.app");
      } finally {
        global.window = originalWin;
      }
    });
  });

  describe("copyToClipboard", () => {
    it("tries modern navigator.clipboard first on success", async () => {
      const text = "Assessment Report";
      await copyToClipboard(text);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it("falls back to document.execCommand when navigator.clipboard fails", async () => {
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("Permission denied"));

      const appendSpy = vi.spyOn(document.body, "appendChild");
      const removeSpy = vi.spyOn(document.body, "removeChild");

      const text = "Assessment Fallback Report";
      await copyToClipboard(text);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
      expect(document.execCommand).toHaveBeenCalledWith("copy");
      expect(appendSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalled();
    });

    it("falls back to document.execCommand when navigator.clipboard.writeText is missing", async () => {
      // Simulate missing writeText
      const originalClip = navigator.clipboard;
      Object.defineProperty(navigator, "clipboard", {
        value: {},
        configurable: true,
        writable: true,
      });

      try {
        const text = "Assessment Fallback Report";
        await copyToClipboard(text);
        expect(document.execCommand).toHaveBeenCalledWith("copy");
      } finally {
        Object.defineProperty(navigator, "clipboard", {
          value: originalClip,
          configurable: true,
          writable: true,
        });
      }
    });

    it("throws a user-friendly error if both modern and fallback mechanisms fail", async () => {
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("Modern clipboard failed"));
      document.execCommand = vi.fn().mockReturnValue(false); // Fallback returned false

      await expect(copyToClipboard("Failing Copy")).rejects.toThrow(
        /Clipboard copy failed in this environment/
      );
    });
  });

  describe("useClipboard Hook", () => {
    it("updates status on successful copy and dispatches dynamic announcements", async () => {
      render(
        <A11yProvider>
          <TestClipboardComponent textToCopy="Success Text" />
        </A11yProvider>
      );

      const button = screen.getByRole("button", { name: "Copy Text" });
      const copiedStatus = screen.getByTestId("copied-status");
      const errorStatus = screen.getByTestId("error-status");

      expect(copiedStatus.textContent).toBe("NOT_COPIED");
      expect(errorStatus.textContent).toBe("NO_ERROR");

      await act(async () => {
        button.click();
      });

      expect(copiedStatus.textContent).toBe("COPIED");
      expect(errorStatus.textContent).toBe("NO_ERROR");

      // Verify screen reader polite region has dynamic announcement
      const politeRegion = document.querySelector('[aria-live="polite"]');
      expect(politeRegion?.textContent).toBe("Custom success");

      // Fast-forward 2 seconds to see if copied state is cleared
      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(copiedStatus.textContent).toBe("NOT_COPIED");
    });

    it("handles errors smoothly and dispatches assertive warning announcements on failure", async () => {
      // Mock copyToClipboard to fail
      navigator.clipboard.writeText = vi.fn().mockRejectedValue(new Error("API blocked"));
      document.execCommand = vi.fn().mockReturnValue(false);

      render(
        <A11yProvider>
          <TestClipboardComponent textToCopy="Failing Text" />
        </A11yProvider>
      );

      const button = screen.getByRole("button", { name: "Copy Text" });
      const copiedStatus = screen.getByTestId("copied-status");
      const errorStatus = screen.getByTestId("error-status");

      await act(async () => {
        button.click();
      });

      expect(copiedStatus.textContent).toBe("NOT_COPIED");
      expect(errorStatus.textContent).toContain("Clipboard copy failed in this environment");

      // Verify screen reader assertive region has dynamic announcement
      const assertiveRegion = document.querySelector('[aria-live="assertive"]');
      expect(assertiveRegion?.textContent).toContain("Custom error");

      // Fast-forward 4 seconds to see if error state is cleared
      act(() => {
        vi.advanceTimersByTime(4000);
      });

      expect(errorStatus.textContent).toBe("NO_ERROR");
    });
  });
});
