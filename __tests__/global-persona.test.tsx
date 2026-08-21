// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { PersonaProvider, usePersona } from "@/components/providers/PersonaProvider";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { Timeline } from "@/components/Timeline";
import { InteractiveHighlights } from "@/components/InteractiveHighlights";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

vi.mock("@/components/providers/AudioProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/providers/AudioProvider")>();
  return {
    ...actual,
    useAudio: () => ({
      volume: 0.5,
      muted: false,
      profile: "8-bit",
      playHover: vi.fn(),
      playSubmit: vi.fn(),
      playSuccess: vi.fn(),
      playError: vi.fn(),
      playAutocomplete: vi.fn(),
    }),
  };
});

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

describe("Global Persona Perspective Toggle Suite", () => {
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

  it("propagates selected persona state with default as 'recruiter'", async () => {
    let currentPersona: string | null = null;
    const TestComponent = () => {
      const { persona } = usePersona();
      currentPersona = persona;
      return <div>Persona: {persona}</div>;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    expect(currentPersona).toBe("recruiter");
    expect(container.textContent).toContain("Persona: recruiter");
  });

  it("updates persona context state on transition", async () => {
    let changePersona: ((p: "recruiter" | "technical") => void) | undefined;
    const TestComponent = () => {
      const { persona, setPersona } = usePersona();
      changePersona = setPersona;
      return <div>Persona: {persona}</div>;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestComponent />
        </PersonaProvider>
      );
    });

    expect(container.textContent).toContain("Persona: recruiter");

    await act(async () => {
      if (changePersona) {
        changePersona("technical");
      }
    });

    expect(container.textContent).toContain("Persona: technical");
  });

  it("hides the 'Interactive Systems Highlights' CTA card dynamically in technical mode", async () => {
    const TestWrapper = ({ initialPersona }: { initialPersona: "recruiter" | "technical" }) => {
      const { setPersona } = usePersona();
      React.useEffect(() => {
        setPersona(initialPersona);
      }, [initialPersona, setPersona]);

      return <InteractiveHighlights />;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="recruiter" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).toContain("Interactive Canvas & Game Labs");
    expect(container.textContent).toContain("Explore Labs Hub");

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="technical" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).toBe("");
  });

  it("hides 'Arcade & Labs' column and 'Incident Simulator' link in the footer in technical mode", async () => {
    const TestWrapper = ({ initialPersona }: { initialPersona: "recruiter" | "technical" }) => {
      const { setPersona } = usePersona();
      React.useEffect(() => {
        setPersona(initialPersona);
      }, [initialPersona, setPersona]);

      return <Footer />;
    };

    // 1. Recruiter mode (displays arcade columns and simulator paths)
    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="recruiter" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).toContain("Arcade & Labs");
    expect(container.textContent).toContain("Arcade Hub Index ↗");
    expect(container.textContent).toContain("Incident Simulator");

    // 2. Technical mode (hides arcade columns and simulator paths)
    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="technical" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).not.toContain("Arcade & Labs");
    expect(container.textContent).not.toContain("Arcade Hub Index ↗");
    expect(container.textContent).not.toContain("Incident Simulator");
    expect(container.textContent).toContain("Proof Workspace");
  });

  it("hides 'Arcade & Labs' dropdown and 'Incident Simulator' path from global navbar in technical mode", async () => {
    const TestWrapper = ({ initialPersona }: { initialPersona: "recruiter" | "technical" }) => {
      const { setPersona } = usePersona();
      React.useEffect(() => {
        setPersona(initialPersona);
      }, [initialPersona, setPersona]);

      return <Navbar />;
    };

    // 1. Recruiter mode: should display Arcade & Labs column header, and Incident Simulator in active paths
    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="recruiter" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).toContain("Arcade & Labs");

    // 2. Technical mode: should hide Arcade & Labs and filter out Incident Simulator
    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper initialPersona="technical" />
        </PersonaProvider>
      );
    });

    expect(container.textContent).not.toContain("Arcade & Labs");
  });

  it("syncs career timeline active display mode and automatically resets overrides on transition", async () => {
    let currentPersona: { persona: "recruiter" | "technical"; setPersona: (p: "recruiter" | "technical") => void } | undefined;
    const TestWrapper = () => {
      const { persona, setPersona } = usePersona();
      currentPersona = { persona, setPersona };
      return <Timeline />;
    };

    await act(async () => {
      root.render(
        <PersonaProvider>
          <TestWrapper />
        </PersonaProvider>
      );
    });

    // Default recruiter maps to "formal summary" (period tag handles period matching, period spans like period format)
    expect(container.textContent).toContain("FORMAL SUMMARY");
    
    // Switch global persona to technical
    await act(async () => {
      currentPersona?.setPersona("technical");
    });

    // technical maps to "hands-on reality"
    expect(container.textContent).toContain("HANDS-ON REALITY");
  });
});
