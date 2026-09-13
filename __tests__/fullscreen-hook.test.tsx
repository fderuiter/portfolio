/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { useFullscreen } from "@/hooks/useFullscreen";
import { useFocusTrap } from "@/hooks/useFocusTrap";

function renderHookHelper<T>(useHook: () => T) {
  const result: { current: T } = { current: null as any };
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestComponent() {
    result.current = useHook();
    return null;
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    result,
    unmount: () => {
      act(() => {
        root.unmount();
      });
      if (container.parentNode) {
        document.body.removeChild(container);
      }
    },
  };
}

describe("useFullscreen Hook - Unit & Edge Matrix Suite", () => {
  let mockElement: HTMLElement;
  let elementRef: React.RefObject<HTMLElement | null>;
  let unmountCurrent: (() => void) | null = null;

  beforeEach(() => {
    mockElement = document.createElement("div");
    document.body.appendChild(mockElement);
    elementRef = { current: mockElement };

    // Default mock implementation
    mockElement.requestFullscreen = vi.fn().mockResolvedValue(undefined);
    document.exitFullscreen = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (unmountCurrent) {
      unmountCurrent();
      unmountCurrent = null;
    }
    if (mockElement && mockElement.parentNode) {
      mockElement.parentNode.removeChild(mockElement);
    }
    vi.restoreAllMocks();
  });

  it("1. initializes with isFullscreen false and isSupported true by default", () => {
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef)
    );
    unmountCurrent = unmount;

    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isPseudoFullscreen).toBe(false);
    expect(result.current.isSupported).toBe(true);
  });

  it("2. calls native requestFullscreen when enterFullscreen is invoked", async () => {
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef)
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("3. handles WebKit vendor-prefixed webkitRequestFullscreen fallback", async () => {
    // Delete standard method and define WebKit method
    delete (mockElement as any).requestFullscreen;
    const webkitMock = vi.fn().mockResolvedValue(undefined);
    (mockElement as any).webkitRequestFullscreen = webkitMock;

    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef)
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(webkitMock).toHaveBeenCalledTimes(1);
  });

  it("4. falls back to pseudo-fullscreen when native requestFullscreen throws error", async () => {
    mockElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error("SecurityError: Permissions check failed"));
    const onFullscreenChange = vi.fn();

    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef, { onFullscreenChange })
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.enterFullscreen();
    });

    expect(result.current.isFullscreen).toBe(true);
    expect(result.current.isPseudoFullscreen).toBe(true);
    expect(onFullscreenChange).toHaveBeenCalledWith(true);
  });

  it("5. exits pseudo-fullscreen cleanly when exitFullscreen is invoked", async () => {
    mockElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error("Native fullscreen denied"));
    const onFullscreenChange = vi.fn();
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef, { onFullscreenChange })
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.enterFullscreen();
    });
    expect(result.current.isFullscreen).toBe(true);
    expect(result.current.isPseudoFullscreen).toBe(true);

    await act(async () => {
      await result.current.exitFullscreen();
    });
    expect(result.current.isFullscreen).toBe(false);
    expect(result.current.isPseudoFullscreen).toBe(false);
    expect(onFullscreenChange).toHaveBeenLastCalledWith(false);
  });

  it("6. toggles fullscreen with toggleFullscreen method", async () => {
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef)
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.toggleFullscreen();
    });
    expect(mockElement.requestFullscreen).toHaveBeenCalledTimes(1);
  });

  it("7. responds to 'f' keydown event when focused on target element", async () => {
    mockElement.tabIndex = 0;
    mockElement.focus();
    const { unmount } = renderHookHelper(() => useFullscreen(elementRef));
    unmountCurrent = unmount;

    await act(async () => {
      mockElement.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "f",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(mockElement.requestFullscreen).toHaveBeenCalled();
  });

  it("8. suppresses 'f' keyboard shortcut when user is typing in an input element", async () => {
    const input = document.createElement("input");
    mockElement.appendChild(input);
    input.focus();

    const { unmount } = renderHookHelper(() => useFullscreen(elementRef));
    unmountCurrent = unmount;

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "f",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(mockElement.requestFullscreen).not.toHaveBeenCalled();
  });

  it("9. exits pseudo-fullscreen when Escape key is pressed", async () => {
    mockElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error("Native fullscreen denied"));
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef)
    );
    unmountCurrent = unmount;

    await act(async () => {
      await result.current.enterFullscreen();
    });
    expect(result.current.isPseudoFullscreen).toBe(true);

    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        })
      );
    });

    expect(result.current.isPseudoFullscreen).toBe(false);
    expect(result.current.isFullscreen).toBe(false);
  });

  it("10. handles WebKit webkitfullscreenchange events cleanly", async () => {
    const onFullscreenChange = vi.fn();
    const { result, unmount } = renderHookHelper(() =>
      useFullscreen(elementRef, { onFullscreenChange })
    );
    unmountCurrent = unmount;

    // Simulate WebKit document state
    Object.defineProperty(document, "webkitFullscreenElement", {
      value: mockElement,
      writable: true,
      configurable: true,
    });

    await act(async () => {
      document.dispatchEvent(new Event("webkitfullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(true);
    expect(onFullscreenChange).toHaveBeenCalledWith(true);

    // Simulate exit
    Object.defineProperty(document, "webkitFullscreenElement", {
      value: null,
      writable: true,
      configurable: true,
    });

    await act(async () => {
      document.dispatchEvent(new Event("webkitfullscreenchange"));
    });

    expect(result.current.isFullscreen).toBe(false);
    expect(onFullscreenChange).toHaveBeenLastCalledWith(false);
  });

  it("11. does not exit pseudo-fullscreen on Escape while a dialog's focus trap is active, but does on a later Escape once it closes (#601)", async () => {
    mockElement.requestFullscreen = vi
      .fn()
      .mockRejectedValue(new Error("Native fullscreen denied"));

    const fsResult: { current: ReturnType<typeof useFullscreen> | null } = {
      current: null,
    };
    let setTrapActive: ((active: boolean) => void) | null = null;

    function Harness() {
      const [trapActive, setActive] = React.useState(true);
      setTrapActive = setActive;
      fsResult.current = useFullscreen(elementRef);
      useFocusTrap(trapActive);
      return null;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(<Harness />);
    });

    await act(async () => {
      await fsResult.current!.enterFullscreen();
    });
    expect(fsResult.current!.isPseudoFullscreen).toBe(true);

    // A dialog is open (its focus trap is active): Escape belongs to it,
    // not to the fullscreen shortcut, so the cabinet must stay fullscreen.
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        })
      );
    });
    expect(fsResult.current!.isPseudoFullscreen).toBe(true);

    // The dialog dismisses (its own Escape handler would do this in real
    // usage); its trap deactivates.
    act(() => {
      setTrapActive!(false);
    });

    // With no dialog open, a subsequent Escape now exits fullscreen.
    await act(async () => {
      window.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Escape",
          bubbles: true,
          cancelable: true,
        })
      );
    });
    expect(fsResult.current!.isPseudoFullscreen).toBe(false);

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
