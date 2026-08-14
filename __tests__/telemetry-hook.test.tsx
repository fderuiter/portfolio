/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Configure React 19 act environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

class LocalStorageMock {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  get length(): number {
    return Object.keys(this.store).length;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("useTelemetry Hook Integration & Isolation", () => {
  let container: HTMLDivElement;
  let root: Root;
  let useTelemetry: any;
  let fetchMock: any;
  let mockStorage: LocalStorageMock;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.resetModules();

    mockStorage = new LocalStorageMock();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });

    // Dynamically import to ensure clean isolated module state
    const importedModule = await import("@/hooks/useTelemetry");
    useTelemetry = importedModule.useTelemetry;

    container = document.createElement("div");
    document.body.appendChild(container);

    // Mock global fetch
    fetchMock = vi.fn().mockImplementation(async (url: string, init?: any) => {
      if (init?.method === "POST") {
        return {
          ok: true,
          status: 201,
          json: async () => ({ success: true }),
        };
      }
      // GET response (default)
      return {
        ok: true,
        status: 200,
        json: async () => ({
          "project-abc": { views: 5, clicks: 10 },
        }),
      };
    });
    globalThis.fetch = fetchMock;

    // Clear localStorage
    mockStorage.clear();
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    document.body.removeChild(container);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  // Helper test component
  const TelemetryTestComponent = ({ onHookValue }: { onHookValue: (val: any) => void }) => {
    const hookData = useTelemetry();
    onHookValue(hookData);
    return (
      <div>
        <div data-testid="views">{hookData.telemetry["project-abc"]?.views ?? 0}</div>
        <div data-testid="sync-status">{hookData.syncFailed ? "failed" : "ok"}</div>
        <button data-testid="record-btn" onClick={() => hookData.recordEvent("project-abc", "page_view")}>
          Record View
        </button>
      </div>
    );
  };

  it("should hydrate state correctly from localstorage cache first", async () => {
    // Populate local cache beforehand
    localStorage.setItem(
      "portfolio_telemetry_cache",
      JSON.stringify({
        "project-abc": { views: 42, clicks: 84 },
      })
    );

    // Controlled background GET promise
    let resolveGet: any;
    const getPromise = new Promise((resolve) => {
      resolveGet = resolve;
    });
    fetchMock.mockImplementationOnce(async (url: string, init?: any) => {
      await getPromise;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          "project-abc": { views: 5, clicks: 10 },
        }),
      };
    });

    let hookResult: any;
    await act(async () => {
      root = createRoot(container);
      root.render(
        <TelemetryTestComponent
          onHookValue={(val) => {
            hookResult = val;
          }}
        />
      );
    });

    // Check immediate hydration from localStorage
    const viewsEl = container.querySelector('[data-testid="views"]');
    expect(viewsEl?.textContent).toBe("42");

    // Let background fetch resolve and verify update
    await act(async () => {
      resolveGet();
    });

    // Run pending timers/microtasks
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // Fetch returns 5 views, which merges/updates globalTelemetryData
    expect(viewsEl?.textContent).toBe("5");
    expect(localStorage.getItem("portfolio_telemetry_cache")).toContain('"views":5');
  });

  it("should trigger optimistic UI updates immediately before server POST completes", async () => {
    let hookResult: any;
    await act(async () => {
      root = createRoot(container);
      root.render(
        <TelemetryTestComponent
          onHookValue={(val) => {
            hookResult = val;
          }}
        />
      );
    });

    const viewsEl = container.querySelector('[data-testid="views"]');
    // Before click, wait for background fetch to resolve
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(viewsEl?.textContent).toBe("5");

    // Setup fetch mock to take longer so we can check optimistic state
    let resolvePost: any;
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });
    fetchMock.mockImplementationOnce(async (url: string, init?: any) => {
      if (init?.method === "POST") {
        await postPromise;
        return { ok: true, status: 201, json: async () => ({ success: true }) };
      }
      return { ok: true, json: async () => ({}) };
    });

    // Trigger record event
    const recordBtn = container.querySelector('[data-testid="record-btn"]') as HTMLButtonElement;
    await act(async () => {
      recordBtn.click();
    });

    // Optimistic update: Views should IMMEDIATELY increment to 6 before POST resolves
    expect(viewsEl?.textContent).toBe("6");
    expect(JSON.parse(localStorage.getItem("portfolio_telemetry_cache")!))
      .toEqual({ "project-abc": { views: 6, clicks: 10 } });

    // Now resolve the POST promise
    await act(async () => {
      resolvePost();
    });
  });

  it("should fall back gracefully and not crash when localStorage throws errors", async () => {
    // Mock localStorage to throw error on setItem
    vi.spyOn(window.localStorage, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    vi.spyOn(window.localStorage, "getItem").mockImplementation(() => {
      throw new Error("AccessDenied");
    });

    let hookResult: any;
    await act(async () => {
      root = createRoot(container);
      root.render(
        <TelemetryTestComponent
          onHookValue={(val) => {
            hookResult = val;
          }}
        />
      );
    });

    const viewsEl = container.querySelector('[data-testid="views"]');
    await act(async () => {
      vi.advanceTimersByTime(0);
    });
    expect(viewsEl?.textContent).toBe("5");

    // Click record event
    const recordBtn = container.querySelector('[data-testid="record-btn"]') as HTMLButtonElement;
    await act(async () => {
      recordBtn.click();
    });

    // State still updates to 6 optimistically, despite localStorage throwing
    expect(viewsEl?.textContent).toBe("6");
  });

  it("should handle project_click events, rate limits, and network errors in recordEvent", async () => {
    let hookResult: any;
    await act(async () => {
      root = createRoot(container);
      root.render(
        <TelemetryTestComponent
          onHookValue={(val) => {
            hookResult = val;
          }}
        />
      );
    });

    // Resolve initial fetch GET
    await act(async () => {
      vi.advanceTimersByTime(0);
    });

    // 1. Test project_click
    await act(async () => {
      await hookResult.recordEvent("project-abc", "project_click");
    });
    expect(hookResult.telemetry["project-abc"].clicks).toBe(11);

    // 2. Test rate limit (429) branch
    fetchMock.mockImplementationOnce(async () => {
      return { ok: false, status: 429 };
    });
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    await act(async () => {
      await hookResult.recordEvent("project-abc", "page_view");
    });
    expect(warnSpy).toHaveBeenCalledWith("Telemetry record rate limited by API.");
    warnSpy.mockRestore();

    // 3. Test generic fetch error (500) branch
    fetchMock.mockImplementationOnce(async () => {
      return { ok: false, status: 500 };
    });
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    await act(async () => {
      await hookResult.recordEvent("project-abc", "page_view");
    });
    expect(hookResult.syncFailed).toBe(true);
    errorSpy.mockRestore();
  });
});
