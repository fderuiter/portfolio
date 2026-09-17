import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import {
  render,
  screen,
  fireEvent,
  act,
  cleanup,
} from "@testing-library/react";
import { CopyButton } from "@/components/ui/CopyButton";
import { A11yProvider } from "@/components/providers/A11yProvider";

describe("CopyButton Component Primitive", () => {
  let originalWriteText: unknown;
  let originalExecCommand: unknown;

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });

    originalWriteText = navigator.clipboard?.writeText;
    originalExecCommand = document.execCommand;

    if (!navigator.clipboard) {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn() },
        configurable: true,
        writable: true,
      });
    }
    navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
    document.execCommand = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();

    if (navigator.clipboard && originalWriteText) {
      navigator.clipboard.writeText = originalWriteText as (
        data: string
      ) => Promise<void>;
    }
    if (originalExecCommand) {
      document.execCommand = originalExecCommand as (
        command: string,
        showUI?: boolean,
        value?: string
      ) => boolean;
    }
  });

  it("renders with default props and accessibility attributes", () => {
    render(
      <A11yProvider>
        <CopyButton text="https://example.com/share" label="Copy Link" />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Link" });
    expect(button).toBeDefined();
    expect(button.textContent).toContain("Copy Link");
  });

  it("copies text and updates visual state to copiedLabel on click", async () => {
    render(
      <A11yProvider>
        <CopyButton
          text="npm run build"
          label="Copy Command"
          copiedLabel="Copied Command!"
        />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Command" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("npm run build");
    expect(button.textContent).toContain("Copied Command!");

    // Timer resets copied state after timeout
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(button.textContent).toContain("Copy Command");
  });

  it("supports function-based text provider callback", async () => {
    const textProvider = vi.fn().mockReturnValue("dynamic-content-123");

    render(
      <A11yProvider>
        <CopyButton text={textProvider} label="Copy Dynamic" />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Dynamic" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(textProvider).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "dynamic-content-123"
    );
  });

  it("executes custom onCopy and onCopySuccess callbacks", async () => {
    const onCopy = vi.fn();
    const onCopySuccess = vi.fn();

    render(
      <A11yProvider>
        <CopyButton
          text="test snippet"
          label="Copy Snippet"
          onCopy={onCopy}
          onCopySuccess={onCopySuccess}
        />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Snippet" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onCopy).toHaveBeenCalled();
    expect(onCopySuccess).toHaveBeenCalled();
  });

  it("supports custom children render function", async () => {
    render(
      <A11yProvider>
        <CopyButton text="hello world">
          {({ copied }) => <span>{copied ? "DONE!" : "CLICK_ME"}</span>}
        </CopyButton>
      </A11yProvider>
    );

    const button = screen.getByRole("button");
    expect(button.textContent).toBe("CLICK_ME");

    await act(async () => {
      fireEvent.click(button);
    });

    expect(button.textContent).toBe("DONE!");
  });

  it("falls back to document.execCommand when navigator.clipboard fails", async () => {
    navigator.clipboard.writeText = vi
      .fn()
      .mockRejectedValue(new Error("Permissions denied"));

    render(
      <A11yProvider>
        <CopyButton text="fallback-code" label="Copy Code" />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Code" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(document.execCommand).toHaveBeenCalledWith("copy");
    expect(button.textContent).toContain("Copied!");
  });

  it("handles errors gracefully and invokes onCopyError when copy fails completely", async () => {
    navigator.clipboard.writeText = vi
      .fn()
      .mockRejectedValue(new Error("Clipboard blocked"));
    document.execCommand = vi.fn().mockImplementation(() => {
      throw new Error("execCommand prohibited");
    });

    const onCopyError = vi.fn();

    render(
      <A11yProvider>
        <CopyButton
          text="blocked content"
          label="Copy Blocked"
          onCopyError={onCopyError}
        />
      </A11yProvider>
    );

    const button = screen.getByRole("button", { name: "Copy Blocked" });

    await act(async () => {
      fireEvent.click(button);
    });

    expect(onCopyError).toHaveBeenCalled();
  });
});
