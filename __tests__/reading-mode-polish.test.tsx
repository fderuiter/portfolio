// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { safeStorage } from "@/lib/safe-storage";

(
  globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  PersonaProvider,
  usePersona,
} from "@/components/providers/PersonaProvider";
import { Navbar } from "@/components/Navbar";
import { Timeline } from "@/components/Timeline";
import { A11yProvider } from "@/components/providers/A11yProvider";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    volume: 0.5,
    muted: false,
    profile: "8-bit",
    playHover: vi.fn(),
    playSubmit: vi.fn(),
    playSuccess: vi.fn(),
    playError: vi.fn(),
  }),
}));

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    isOpen: false,
    setIsOpen: vi.fn(),
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
  }),
}));

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

describe("Reading Mode Polish (#634) Visitor Journey Suite", () => {
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
    vi.clearAllMocks();
    global.IntersectionObserver = class {
      constructor() {}
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    mockStorage.clear();
  });

  it("provides clear visible labels and accessible help for reading mode controls in Navbar", async () => {
    await act(async () => {
      root.render(
        <A11yProvider>
          <PersonaProvider>
            <Navbar />
          </PersonaProvider>
        </A11yProvider>
      );
    });

    // Check desktop header buttons
    const techBtn = container.querySelector(
      'button[aria-label*="Technical Reading Mode"]'
    ) as HTMLButtonElement;
    const recruiterBtn = container.querySelector(
      'button[aria-label*="Recruiter Reading Mode"]'
    ) as HTMLButtonElement;

    expect(techBtn).toBeTruthy();
    expect(recruiterBtn).toBeTruthy();
    expect(techBtn.getAttribute("aria-pressed")).toBe("false");
    expect(recruiterBtn.getAttribute("aria-pressed")).toBe("true");

    // Click technical mode button
    await act(async () => {
      techBtn.click();
    });

    expect(techBtn.getAttribute("aria-pressed")).toBe("true");
    expect(recruiterBtn.getAttribute("aria-pressed")).toBe("false");
  });

  it("exposes detailed reading mode descriptions in preferences and mobile drawer", async () => {
    await act(async () => {
      root.render(
        <A11yProvider>
          <PersonaProvider>
            <Navbar />
          </PersonaProvider>
        </A11yProvider>
      );
    });

    // Open mobile menu
    const hamburgerBtn = container.querySelector(
      'button[aria-controls="mobile-navigation"]'
    ) as HTMLButtonElement;
    await act(async () => {
      hamburgerBtn.click();
    });

    const mobileDesc = document.getElementById("mobile-reading-mode-desc");
    expect(mobileDesc).toBeTruthy();
    expect(mobileDesc?.textContent).toContain("Recruiter Mode");

    // Toggle to technical mode in mobile drawer
    const mobileTechBtn = container.querySelector(
      '#mobile-navigation button[aria-label*="Technical Reading Mode"]'
    ) as HTMLButtonElement;
    expect(mobileTechBtn).toBeTruthy();

    await act(async () => {
      mobileTechBtn.click();
    });

    expect(mobileDesc?.textContent).toContain("Technical Mode");
  });

  it("maintains focus on the active button when toggling reading mode", async () => {
    await act(async () => {
      root.render(
        <A11yProvider>
          <PersonaProvider>
            <Navbar />
          </PersonaProvider>
        </A11yProvider>
      );
    });

    const techBtn = container.querySelector(
      'button[aria-label*="Technical Reading Mode"]'
    ) as HTMLButtonElement;

    techBtn.focus();
    expect(document.activeElement).toBe(techBtn);

    await act(async () => {
      techBtn.click();
    });

    // Focus must remain on the technical button and not drop to body
    expect(document.activeElement).toBe(techBtn);
  });

  it("persists selection to storage and respects default state", async () => {
    let activePersona: string = "";

    const TestComponent = () => {
      const { persona } = usePersona();
      activePersona = persona;
      return <div id="persona-val">{persona}</div>;
    };

    // Default state when storage is empty
    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    expect(activePersona).toBe("recruiter");

    // Pre-set stored preference
    mockStorage.setItem("global-persona", "technical");

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    expect(activePersona).toBe("technical");
  });

  it("falls back safely to recruiter mode when storage throws an error", async () => {
    safeStorage.clear();
    vi.spyOn(mockStorage, "getItem").mockImplementation(() => {
      throw new Error("SecurityError: Access is denied");
    });

    let activePersona: string = "";
    const TestComponent = () => {
      const { persona } = usePersona();
      activePersona = persona;
      return <div>{persona}</div>;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    expect(activePersona).toBe("recruiter");
  });

  it("preserves scroll position during reading mode transitions", async () => {
    const scrollToSpy = vi.fn();
    window.scrollTo = scrollToSpy;
    Object.defineProperty(window, "scrollY", {
      value: 450,
      configurable: true,
      writable: true,
    });

    let triggerSetPersona: (p: "recruiter" | "technical") => void = () => {};

    const TestComponent = () => {
      const { persona, setPersona } = usePersona();
      triggerSetPersona = setPersona;
      return <div>Mode: {persona}</div>;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    await act(async () => {
      triggerSetPersona("technical");
      // Execute any pending animation frames
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 450 })
    );
  });

  it("announces perspective mode changes in the career Timeline", async () => {
    await act(async () => {
      root.render(
        <A11yProvider>
          <PersonaProvider>
            <Timeline />
          </PersonaProvider>
        </A11yProvider>
      );
    });

    const realityBtn = container.querySelector(
      'button[aria-label*="Hands-On Reality Mode"]'
    ) as HTMLButtonElement;
    expect(realityBtn).toBeTruthy();

    await act(async () => {
      realityBtn.click();
    });

    expect(realityBtn.getAttribute("aria-pressed")).toBe("true");

    const liveRegion = container.querySelector('div[aria-live="assertive"]');
    expect(liveRegion?.textContent).toContain("Technical");
  });
});
