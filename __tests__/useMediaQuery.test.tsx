// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  useMediaQuery,
  usePrefersReducedMotion,
  getMatchMediaMatches,
} from "@/hooks/useMediaQuery";

type Listener = (e?: unknown) => void;

function installMatchMediaMock(initialMatches: Record<string, boolean> = {}) {
  const matchesMap = { ...initialMatches };
  const listenersMap = new Map<string, Set<Listener>>();

  const matchMedia = vi.fn((query: string) => {
    if (!listenersMap.has(query)) {
      listenersMap.set(query, new Set());
    }
    return {
      get matches() {
        return matchesMap[query] ?? false;
      },
      media: query,
      addEventListener: (_event: string, cb: Listener) => {
        listenersMap.get(query)?.add(cb);
      },
      removeEventListener: (_event: string, cb: Listener) => {
        listenersMap.get(query)?.delete(cb);
      },
      addListener: (cb: Listener) => {
        listenersMap.get(query)?.add(cb);
      },
      removeListener: (cb: Listener) => {
        listenersMap.get(query)?.delete(cb);
      },
      dispatchEvent: vi.fn(),
    };
  });

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMedia,
  });

  return {
    setMatch(query: string, matches: boolean) {
      matchesMap[query] = matches;
      listenersMap.get(query)?.forEach((cb) => cb());
    },
    listenersMap,
  };
}

describe("useMediaQuery & usePrefersReducedMotion hooks", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      writable: true,
      value: originalMatchMedia,
    });
    vi.restoreAllMocks();
  });

  describe("getMatchMediaMatches", () => {
    it("returns false when window.matchMedia is undefined", () => {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: undefined,
      });
      expect(getMatchMediaMatches("(max-width: 767px)")).toBe(false);
    });

    it("returns true when matchMedia query matches", () => {
      installMatchMediaMock({ "(max-width: 767px)": true });
      expect(getMatchMediaMatches("(max-width: 767px)")).toBe(true);
    });
  });

  describe("useMediaQuery", () => {
    it("returns false gracefully if matchMedia is unavailable", () => {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: undefined,
      });
      const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
      expect(result.current).toBe(false);
    });

    it("reflects matchMedia matching state", () => {
      installMatchMediaMock({ "(max-width: 767px)": true });
      const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
      expect(result.current).toBe(true);
    });

    it("updates reactively when query match state changes", () => {
      const mock = installMatchMediaMock({ "(max-width: 767px)": false });
      const { result } = renderHook(() => useMediaQuery("(max-width: 767px)"));
      expect(result.current).toBe(false);

      act(() => {
        mock.setMatch("(max-width: 767px)", true);
      });

      expect(result.current).toBe(true);
    });
  });

  describe("usePrefersReducedMotion", () => {
    it("returns true when prefers-reduced-motion is active", () => {
      installMatchMediaMock({ "(prefers-reduced-motion: reduce)": true });
      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(true);
    });

    it("returns false when prefers-reduced-motion is inactive", () => {
      installMatchMediaMock({ "(prefers-reduced-motion: reduce)": false });
      const { result } = renderHook(() => usePrefersReducedMotion());
      expect(result.current).toBe(false);
    });

    it("uses true as server snapshot for conservative reduced motion during SSR", () => {
      function TestComponent() {
        const reducedMotion = usePrefersReducedMotion();
        return <div data-testid="reduced-motion">{String(reducedMotion)}</div>;
      }
      const html = renderToString(<TestComponent />);
      expect(html).toContain('data-testid="reduced-motion">true</div>');
    });

    it("distinguishes server snapshots: usePrefersReducedMotion defaults true while generic useMediaQuery defaults false during SSR", () => {
      function TestComponent() {
        const reducedMotion = usePrefersReducedMotion();
        const isMobile = useMediaQuery("(max-width: 767px)");
        return (
          <div>
            <span data-testid="reduced">{String(reducedMotion)}</span>
            <span data-testid="mobile">{String(isMobile)}</span>
          </div>
        );
      }
      const html = renderToString(<TestComponent />);
      expect(html).toContain('data-testid="reduced">true</span>');
      expect(html).toContain('data-testid="mobile">false</span>');
    });
  });
});
