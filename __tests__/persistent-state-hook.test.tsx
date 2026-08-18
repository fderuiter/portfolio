/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { usePersistentState } from "@/hooks/usePersistentState";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

class MockStorage {
  private store: Record<string, string> = {};
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
  get length() {
    return Object.keys(this.store).length;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
}

describe("usePersistentState Hook", () => {
  let container: HTMLDivElement;
  let root: Root;
  let mockStorage: MockStorage;

  beforeEach(() => {
    mockStorage = new MockStorage();
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  function TestComponent({
    storageKey,
    initialVal,
  }: {
    storageKey: string;
    initialVal: string;
  }) {
    const [val, setVal] = usePersistentState(storageKey, initialVal);
    return (
      <div>
        <span data-testid="val">{val}</span>
        <button
          data-testid="set-direct"
          onClick={() => setVal("updated_direct")}
        />
        <button
          data-testid="set-fn"
          onClick={() => setVal((prev) => `${prev}_fn`)}
        />
      </div>
    );
  }

  it("hydrates from localStorage and supports direct and functional updates", async () => {
    mockStorage.setItem("my_key", JSON.stringify("hydrated_value"));

    await act(async () => {
      root.render(<TestComponent storageKey="my_key" initialVal="default" />);
    });

    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe(
      "hydrated_value"
    );

    // Direct update
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="set-direct"]')
        ?.click();
    });

    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe(
      "updated_direct"
    );
    expect(JSON.parse(mockStorage.getItem("my_key")!).value).toBe("updated_direct");

    // Functional update
    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="set-fn"]')
        ?.click();
    });

    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe(
      "updated_direct_fn"
    );
    expect(JSON.parse(mockStorage.getItem("my_key")!).value).toBe("updated_direct_fn");
  });

  it("handles localStorage read and write exceptions gracefully", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: () => {
          throw new Error("Quota/Security error");
        },
        setItem: () => {
          throw new Error("Write blocked");
        },
      },
      writable: true,
      configurable: true,
    });

    await act(async () => {
      root.render(<TestComponent storageKey="err_key" initialVal="fallback" />);
    });

    expect(container.querySelector('[data-testid="val"]')?.textContent).toBe(
      "fallback"
    );

    await act(async () => {
      container
        .querySelector<HTMLButtonElement>('[data-testid="set-direct"]')
        ?.click();
    });

    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
