// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { FooterStatusTicker } from "@/components/FooterStatusTicker";
import { STATUS_TICKER_ITEMS } from "@/lib/meme-data";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Reduced motion makes the swap instant, so the rendered line is the state.
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return { ...actual, useReducedMotion: () => true };
});

describe("FooterStatusTicker rotation (#952)", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    global.ResizeObserver = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    } as unknown as typeof ResizeObserver;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    vi.useRealTimers();
  });

  const line = () =>
    container.querySelector('[data-testid="footer-status-ticker"] span.block')
      ?.textContent;

  it("rotates every 4.5s and holds its line while data-ticker-paused is set", async () => {
    await act(async () => root.render(<FooterStatusTicker />));
    expect(line()).toBe(STATUS_TICKER_ITEMS[0]);

    await act(async () => {
      vi.advanceTimersByTime(4500);
    });
    expect(line()).toBe(STATUS_TICKER_ITEMS[1]);

    container
      .querySelector('[data-testid="footer-status-ticker"]')!
      .setAttribute("data-ticker-paused", "true");
    await act(async () => {
      vi.advanceTimersByTime(4500 * 3);
    });
    expect(line()).toBe(STATUS_TICKER_ITEMS[1]);

    container
      .querySelector('[data-testid="footer-status-ticker"]')!
      .removeAttribute("data-ticker-paused");
    await act(async () => {
      vi.advanceTimersByTime(4500);
    });
    expect(line()).toBe(STATUS_TICKER_ITEMS[2]);
  });
});
