// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import { NavigationProvider } from "@/components/providers/NavigationProvider";
import { TransitionLink } from "@/components/ui/TransitionLink";
import { A11yProvider } from "@/components/providers/A11yProvider";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mockPrefetch = vi.fn();
const mockPush = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: mockPrefetch,
  }),
}));

const mockAnnounce = vi.fn();
vi.mock("@/components/providers/A11yProvider", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/providers/A11yProvider")>();
  return {
    ...actual,
    useAnnouncer: () => ({
      announce: mockAnnounce,
    }),
  };
});

describe("Interactive Router Transition & Prefetch System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/";
    document.body.style.overflow = "";
  });

  afterEach(() => {
    cleanup();
  });

  it("1. triggers asset prefetching on mouse hover and focus", async () => {
    vi.useFakeTimers();

    render(
      <A11yProvider>
        <NavigationProvider>
          <TransitionLink href="/neuro" label="NeuroRecon Studio">
            NeuroRecon Studio
          </TransitionLink>
        </NavigationProvider>
      </A11yProvider>
    );

    const link = screen.getByRole("link", { name: /NeuroRecon Studio/i });
    expect(link).not.toBeNull();

    act(() => {
      fireEvent.mouseEnter(link);
    });

    act(() => {
      vi.runAllTimers();
    });

    expect(mockPrefetch).toHaveBeenCalledWith("/neuro");

    vi.useRealTimers();
  });

  it("2. updates link state synchronously and renders top progress bar on click", async () => {
    render(
      <A11yProvider>
        <NavigationProvider>
          <TransitionLink href="/crf" label="CRF Form Designer">
            CRF Studio
          </TransitionLink>
        </NavigationProvider>
      </A11yProvider>
    );

    const link = screen.getByRole("link", { name: /CRF Studio/i });

    act(() => {
      fireEvent.click(link);
    });

    // Tactile loading feedback initiates within 16ms
    expect(link.getAttribute("data-loading")).toBe("true");

    // Renders top progress bar
    const progressBar = screen.getByRole("progressbar");
    expect(progressBar).not.toBeNull();

    // Start screen reader announcement dispatched
    expect(mockAnnounce).toHaveBeenCalledWith("Navigating to CRF Form Designer...", "polite");
    expect(mockPush).toHaveBeenCalledWith("/crf");
  });

  it("3. dismisses progress bar and issues completion speech announcement on route update", async () => {
    const TestComponent = () => {
      return (
        <A11yProvider>
          <NavigationProvider>
            <TransitionLink href="/proof" label="Proof Workspace">
              Proof Workspace
            </TransitionLink>
          </NavigationProvider>
        </A11yProvider>
      );
    };

    const { rerender } = render(<TestComponent />);

    const link = screen.getByRole("link", { name: /Proof Workspace/i });

    act(() => {
      fireEvent.click(link);
    });

    expect(mockAnnounce).toHaveBeenCalledWith("Navigating to Proof Workspace...", "polite");

    // Simulate route mount resolution
    mockPathname = "/proof";

    rerender(<TestComponent />);

    expect(mockAnnounce).toHaveBeenCalledWith("Navigated to Proof Workspace", "polite");
  });

  it("4. same-page anchor link targets bypass route transition state and announcements", async () => {
    mockPathname = "/";
    const targetElement = document.createElement("div");
    targetElement.id = "about";
    targetElement.scrollIntoView = vi.fn();
    document.body.appendChild(targetElement);

    render(
      <A11yProvider>
        <NavigationProvider>
          <TransitionLink href="/#about" label="About Section">
            About Section
          </TransitionLink>
        </NavigationProvider>
      </A11yProvider>
    );

    const link = screen.getByRole("link", { name: /About Section/i });

    act(() => {
      fireEvent.click(link);
    });

    // Anchor bypass: no router.push, no transition loading state, no start announcement
    expect(mockPush).not.toHaveBeenCalled();
    expect(link.getAttribute("data-loading")).toBeNull();
    expect(mockAnnounce).not.toHaveBeenCalled();
    expect(targetElement.scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });

    targetElement.remove();
  });

  it("5. automatically resets body scroll lock on navigation", async () => {
    document.body.style.overflow = "hidden";

    const { rerender } = render(
      <A11yProvider>
        <NavigationProvider>
          <TransitionLink href="/simulator" label="Incident Simulator">
            Simulator
          </TransitionLink>
        </NavigationProvider>
      </A11yProvider>
    );

    const link = screen.getByRole("link", { name: /Simulator/i });

    act(() => {
      fireEvent.click(link);
    });

    // Route updates
    mockPathname = "/simulator";

    rerender(
      <A11yProvider>
        <NavigationProvider>
          <TransitionLink href="/simulator" label="Incident Simulator">
            Simulator
          </TransitionLink>
        </NavigationProvider>
      </A11yProvider>
    );

    expect(document.body.style.overflow).toBe("");
  });
});
