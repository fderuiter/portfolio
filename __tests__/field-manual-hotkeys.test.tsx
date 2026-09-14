/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act, StrictMode, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FieldManualButton } from "@/components/FieldManualButton";

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: vi.fn(),
    playSuccess: vi.fn(),
    playHover: vi.fn(),
    playAutocomplete: vi.fn(),
    volume: 0.8,
    muted: true,
    profile: "8-bit",
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setProfile: vi.fn(),
  }),
  AudioProvider: ({ children }: any) => <>{children}</>,
}));

describe("FieldManualButton - Hotkey & Ownership Safety (DUCK-02)", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    container.remove();
    consoleErrorSpy.mockRestore();
  });

  it("toggles without updating parent state during functional state updates in StrictMode", async () => {
    // Parent component that updates its own state when onOpenChange is called
    function ParentWithState() {
      const [parentState, setParentState] = useState(false);
      return (
        <div>
          <div data-testid="parent-status">
            {parentState ? "OPEN" : "CLOSED"}
          </div>
          <FieldManualButton
            manualId="working-with-duck"
            onOpenChange={(isOpen) => {
              setParentState(isOpen);
            }}
          />
        </div>
      );
    }

    await act(async () => {
      root.render(
        <StrictMode>
          <ParentWithState />
        </StrictMode>
      );
    });

    expect(
      container.querySelector('[data-testid="parent-status"]')?.textContent
    ).toBe("CLOSED");

    // Press '?' to toggle open
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });

    // Verify React 19 warning did not fire:
    // "Cannot update a component (`ParentWithState`) while rendering a different component (`FieldManualButton`)"
    const badSetStateWarnings = consoleErrorSpy.mock.calls.filter(
      (call: unknown[]) =>
        call.some(
          (arg: unknown) =>
            typeof arg === "string" && arg.includes("Cannot update a component")
        )
    );
    expect(badSetStateWarnings).toHaveLength(0);

    expect(
      container.querySelector('[data-testid="parent-status"]')?.textContent
    ).toBe("OPEN");
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    // Press '?' again to toggle closed
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });

    expect(
      container.querySelector('[data-testid="parent-status"]')?.textContent
    ).toBe("CLOSED");
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
  });

  it("opens exactly one dialog when duplicate responsive controls are mounted", async () => {
    const onOpenChangeDesktop = vi.fn();
    const onOpenChangeMobile = vi.fn();

    function ResponsiveControls() {
      return (
        <StrictMode>
          <div>
            {/* Simulated Desktop Header Control */}
            <div data-testid="desktop-wrapper">
              <FieldManualButton
                manualId="working-with-duck"
                label="Manual Desktop"
                onOpenChange={onOpenChangeDesktop}
                isHotkeyOwner={true}
              />
            </div>
            {/* Simulated Mobile Hotbar Control */}
            <div data-testid="mobile-wrapper">
              <FieldManualButton
                manualId="working-with-duck"
                label="Manual Mobile"
                onOpenChange={onOpenChangeMobile}
                isHotkeyOwner={false}
              />
            </div>
          </div>
        </StrictMode>
      );
    }

    await act(async () => {
      root.render(<ResponsiveControls />);
    });

    // Press 'h' shortcut
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });

    // Exactly one dialog should be open in the DOM, not two competing dialogs
    const openDialogs = container.querySelectorAll('[role="dialog"]');
    expect(openDialogs).toHaveLength(1);

    // Desktop owner was notified, mobile non-owner was not falsely triggered
    expect(onOpenChangeDesktop).toHaveBeenCalledWith(true);
    expect(onOpenChangeMobile).not.toHaveBeenCalled();

    // Repeated hotkey toggle closes the single open dialog
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChangeDesktop).toHaveBeenCalledWith(false);
  });

  it("deterministically picks single owner even when no isHotkeyOwner prop is specified", async () => {
    const onOpen1 = vi.fn();
    const onOpen2 = vi.fn();

    await act(async () => {
      root.render(
        <StrictMode>
          <div>
            <FieldManualButton
              manualId="working-with-duck"
              onOpenChange={onOpen1}
            />
            <FieldManualButton
              manualId="working-with-duck"
              onOpenChange={onOpen2}
            />
          </div>
        </StrictMode>
      );
    });

    // Press '?' shortcut
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });

    // Exactly one dialog opens
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(onOpen1.mock.calls.length + onOpen2.mock.calls.length).toBe(1);

    // Press '?' to close
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
  });

  it("ignores hotkey when typing in editable or protected contexts", async () => {
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <StrictMode>
          <div>
            <input data-testid="test-input" type="text" />
            <textarea data-testid="test-textarea" />
            <div data-testid="test-editable" contentEditable />
            <div data-keyboard-boundary data-testid="test-boundary">
              <button type="button">Inside boundary</button>
            </div>
            <FieldManualButton
              manualId="working-with-duck"
              onOpenChange={onOpenChange}
            />
          </div>
        </StrictMode>
      );
    });

    const input = container.querySelector<HTMLInputElement>(
      '[data-testid="test-input"]'
    )!;
    const textarea = container.querySelector<HTMLTextAreaElement>(
      '[data-testid="test-textarea"]'
    )!;
    const editable = container.querySelector<HTMLDivElement>(
      '[data-testid="test-editable"]'
    )!;
    const boundaryBtn = container.querySelector<HTMLButtonElement>(
      '[data-testid="test-boundary"] button'
    )!;

    // 1. Inside Input
    input.focus();
    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
      input.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChange).not.toHaveBeenCalled();

    // 2. Inside Textarea
    textarea.focus();
    await act(async () => {
      textarea.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);

    // 3. Inside contentEditable
    editable.focus();
    await act(async () => {
      editable.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);

    // 4. Inside keyboard boundary
    boundaryBtn.focus();
    await act(async () => {
      boundaryBtn.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("does not trigger hotkey for card variant buttons by default", async () => {
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <StrictMode>
          <FieldManualButton
            manualId="working-with-duck"
            variant="card"
            onOpenChange={onOpenChange}
          />
        </StrictMode>
      );
    });

    // Press '?' or 'h'
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });

    // Card variant buttons should ignore global hotkeys by default
    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("supports opening via mouse click and closing via hotkey", async () => {
    const onOpenChange = vi.fn();

    await act(async () => {
      root.render(
        <StrictMode>
          <FieldManualButton
            manualId="working-with-duck"
            onOpenChange={onOpenChange}
          />
        </StrictMode>
      );
    });

    const button = container.querySelector("button")!;
    expect(button).not.toBeNull();

    // Open via mouse click
    await act(async () => {
      button.click();
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);
    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Close via 'h' hotkey
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "h", bubbles: true })
      );
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Re-open via '?' hotkey
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "?", bubbles: true })
      );
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(1);

    // Dismiss via Escape
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
      );
    });

    expect(container.querySelectorAll('[role="dialog"]')).toHaveLength(0);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });
});
