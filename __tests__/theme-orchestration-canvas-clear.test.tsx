import React from "react";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { PreparedText } from "@chenglou/pretext";
import type { PreparedRichInline } from "@chenglou/pretext/rich-inline";
import { ThemeProvider, useTheme } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import {
  clearGraphicsEngineCaches,
  textPrepareCache,
  textLayoutCache,
  richItemsCache,
  richPrepareCache,
  richLayoutCache,
  cssPropertyCache,
  fontConfigCache,
} from "@/lib/graphics-engine";

// Mocks for Audio, Search, Persona providers used inside Navbar
vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    volume: 0.8,
    muted: false,
    profile: "8-bit",
    setVolume: vi.fn(),
    setMuted: vi.fn(),
    setProfile: vi.fn(),
    playHover: vi.fn(),
  }),
}));

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    openSearch: vi.fn(),
  }),
}));

vi.mock("@/components/providers/PersonaProvider", () => ({
  usePersona: () => ({
    persona: "technical",
    setPersona: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

function TestConsumer() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="resolved">{resolvedTheme}</span>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("system")}>Set System</button>
    </div>
  );
}

describe("Theme Orchestration & Canvas Cache Clearing", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("flushes all graphics engine LRU caches when clearGraphicsEngineCaches is invoked", () => {
    // Populate caches with dummy items
    textPrepareCache.set("key1", {} as unknown as PreparedText);
    textLayoutCache.set("key2", { height: 10, lineCount: 1 });
    richItemsCache.set("key3", []);
    richPrepareCache.set("key4", {} as unknown as PreparedRichInline);
    richLayoutCache.set("key5", { height: 20, lines: [] });
    cssPropertyCache.set("key6", "val");
    fontConfigCache.set("key7", {});

    expect(textPrepareCache.get("key1")).toBeDefined();
    expect(textLayoutCache.get("key2")).toBeDefined();
    expect(richItemsCache.get("key3")).toBeDefined();

    // Invoke clear
    clearGraphicsEngineCaches();

    // Verify all caches flushed
    expect(textPrepareCache.get("key1")).toBeUndefined();
    expect(textLayoutCache.get("key2")).toBeUndefined();
    expect(richItemsCache.get("key3")).toBeUndefined();
    expect(richPrepareCache.get("key4")).toBeUndefined();
    expect(richLayoutCache.get("key5")).toBeUndefined();
    expect(cssPropertyCache.get("key6")).toBeUndefined();
    expect(fontConfigCache.get("key7")).toBeUndefined();
  });

  it("persists theme preference to localStorage and updates document data-theme attribute", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme").textContent).toBe("system");

    // Switch to Light
    fireEvent.click(screen.getByText("Set Light"));
    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(localStorage.getItem("portfolio-theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");

    // Switch to Dark
    fireEvent.click(screen.getByText("Set Dark"));
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("renders Navbar segmented theme toggle and updates theme synchronously on click", () => {
    render(
      <ThemeProvider>
        <Navbar />
      </ThemeProvider>
    );

    const lightBtns = screen.getAllByRole("button", { name: /light/i });
    const darkBtns = screen.getAllByRole("button", { name: /dark/i });
    const systemBtns = screen.getAllByRole("button", { name: /system/i });

    expect(lightBtns.length).toBeGreaterThan(0);
    expect(darkBtns.length).toBeGreaterThan(0);
    expect(systemBtns.length).toBeGreaterThan(0);

    // Click Light button
    fireEvent.click(lightBtns[0]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(localStorage.getItem("portfolio-theme")).toBe("light");

    // Click Dark button
    fireEvent.click(darkBtns[0]);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("portfolio-theme")).toBe("dark");
  });

  it("synchronizes theme changes across active browser tabs via storage event listener", () => {
    render(
      <ThemeProvider>
        <TestConsumer />
      </ThemeProvider>
    );

    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "portfolio-theme",
          newValue: "light",
        })
      );
    });

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
