// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useTeMotion } from "@/components/trial-and-error/useTeMotion";

type Listener = () => void;

/** A controllable matchMedia: each query's `matches` can be flipped at runtime. */
function installMatchMedia(initial: Record<string, boolean>) {
  const state = { ...initial };
  const listeners = new Map<string, Set<Listener>>();
  const matchMedia = vi.fn((query: string) => ({
    get matches() {
      return state[query] ?? false;
    },
    media: query,
    addEventListener: (_: string, cb: Listener) => {
      if (!listeners.has(query)) listeners.set(query, new Set());
      listeners.get(query)!.add(cb);
    },
    removeEventListener: (_: string, cb: Listener) =>
      listeners.get(query)?.delete(cb),
  }));
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });
  return {
    set(query: string, matches: boolean) {
      state[query] = matches;
      listeners.get(query)?.forEach((cb) => cb());
    },
  };
}

const REDUCED = "(prefers-reduced-motion: reduce)";
const COMPACT = "(max-width: 767px)";

describe("useTeMotion", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("defaults to 1× with loud effects on at desktop width without reduced motion", () => {
    installMatchMedia({});
    const { result } = renderHook(() => useTeMotion());
    expect(result.current).toMatchObject({
      reducedMotion: false,
      speed: 1,
      isCompactViewport: false,
      loudEffectsEnabled: true,
    });
  });

  it("disables loud effects under reduced motion and reacts to the preference changing", () => {
    const media = installMatchMedia({ [REDUCED]: true });
    const { result } = renderHook(() => useTeMotion());
    expect(result.current.reducedMotion).toBe(true);
    expect(result.current.loudEffectsEnabled).toBe(false);
    act(() => media.set(REDUCED, false));
    expect(result.current.loudEffectsEnabled).toBe(true);
  });

  it("disables loud effects below 768px", () => {
    const media = installMatchMedia({ [COMPACT]: true });
    const { result } = renderHook(() => useTeMotion());
    expect(result.current.isCompactViewport).toBe(true);
    expect(result.current.loudEffectsEnabled).toBe(false);
    act(() => media.set(COMPACT, false));
    expect(result.current.loudEffectsEnabled).toBe(true);
  });

  it("persists the game speed and shares it across mounted hooks", () => {
    installMatchMedia({});
    const first = renderHook(() => useTeMotion());
    const second = renderHook(() => useTeMotion());
    act(() => first.result.current.setSpeed(4));
    expect(window.localStorage.getItem("te:game-speed")).toBe("4");
    expect(first.result.current.speed).toBe(4);
    expect(second.result.current.speed).toBe(4);
  });

  it("follows speed changes made in another tab", () => {
    installMatchMedia({});
    const { result } = renderHook(() => useTeMotion());
    act(() => {
      window.localStorage.setItem("te:game-speed", "2");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "te:game-speed" })
      );
    });
    expect(result.current.speed).toBe(2);
  });

  it("ignores invalid stored and requested speeds", () => {
    installMatchMedia({});
    window.localStorage.setItem("te:game-speed", "3");
    const { result } = renderHook(() => useTeMotion());
    expect(result.current.speed).toBe(1);
    // @ts-expect-error — 8× is not a supported speed.
    act(() => result.current.setSpeed(8));
    expect(window.localStorage.getItem("te:game-speed")).toBe("3");
    expect(result.current.speed).toBe(1);
  });

  it("falls back to 1× without crashing when storage is unavailable", () => {
    installMatchMedia({});
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    const { result } = renderHook(() => useTeMotion());
    expect(result.current.speed).toBe(1);
    expect(() => act(() => result.current.setSpeed(2))).not.toThrow();
    expect(result.current.speed).toBe(1);
  });

  it("treats a browser without matchMedia as desktop with motion allowed", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: undefined,
    });
    const { result } = renderHook(() => useTeMotion());
    expect(result.current.reducedMotion).toBe(false);
    expect(result.current.isCompactViewport).toBe(false);
  });
});
