// @vitest-environment jsdom
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { RouterTransitionProvider, useInteractiveRouter } from "@/hooks/useInteractiveRouter";
import { TransitionLink } from "@/components/TransitionLink";
import { A11yProvider } from "@/components/providers/A11yProvider";
import { Navbar } from "@/components/Navbar";
import { getRouteTitle, isSamePageAnchor } from "@/lib/router-transition-utils";

// Mock next/navigation
const mockPrefetch = vi.fn();
const mockPush = vi.fn();
let currentPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    prefetch: mockPrefetch,
    push: mockPush,
    replace: vi.fn(),
  }),
  usePathname: () => currentPathname,
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
    playAutocomplete: vi.fn(),
  }),
}));

vi.mock("@/components/providers/SearchProvider", () => ({
  useSearch: () => ({
    openSearch: vi.fn(),
    closeSearch: vi.fn(),
  }),
}));

vi.mock("@/components/providers/PersonaProvider", () => ({
  usePersona: () => ({
    persona: "recruiter",
    setPersona: vi.fn(),
  }),
}));

describe("Interactive Router Transition & Prefetch System", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    currentPathname = "/";
    vi.clearAllMocks();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.style.overflow = "";
  });

  describe("1. Route Utility & Title Resolution", () => {
    it("resolves clean, human-readable titles for known app routes", () => {
      expect(getRouteTitle("/arcade/laser-loon")).toBe("Laser Loon");
      expect(getRouteTitle("/crf")).toBe("CRF Studio");
      expect(getRouteTitle("/proof")).toBe("Proof Workspace");
      expect(getRouteTitle("/neuro")).toBe("NeuroRecon Studio");
      expect(getRouteTitle("/stack")).toBe("Under the Hood (Stack)");
      expect(getRouteTitle("/case-studies")).toBe("Engineering Case Studies");
      expect(getRouteTitle("/")).toBe("Homepage");
    });

    it("identifies same-page anchor links correctly", () => {
      expect(isSamePageAnchor("#about", "/")).toBe(true);
      expect(isSamePageAnchor("/#case-studies", "/")).toBe(true);
      expect(isSamePageAnchor("/arcade/laser-loon", "/")).toBe(false);
    });
  });

  describe("2. Link Hover Prefetching & Transition Link Primitive", () => {
    it("prefetches route assets asynchronously on mouse enter or focus", async () => {
      await act(async () => {
        root.render(
          <A11yProvider>
            <RouterTransitionProvider>
              <TransitionLink href="/neuro" title="NeuroRecon Studio">
                NeuroRecon Studio
              </TransitionLink>
            </RouterTransitionProvider>
          </A11yProvider>
        );
      });

      const link = container.querySelector("a");
      expect(link).not.toBeNull();

      act(() => {
        link?.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
        link?.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
      });

      expect(mockPrefetch).toHaveBeenCalledWith("/neuro");
    });

    it("executes transition navigation and triggers start announcement on click", async () => {
      const announcedMessages: string[] = [];

      const TestComponent = () => {
        return (
          <button
            onClick={() => {
              announcedMessages.push("Clicked");
            }}
          >
            Test
          </button>
        );
      };

      await act(async () => {
        root.render(
          <A11yProvider>
            <RouterTransitionProvider>
              <TransitionLink href="/crf" title="CRF Studio">
                CRF Studio
              </TransitionLink>
              <TestComponent />
            </RouterTransitionProvider>
          </A11yProvider>
        );
      });

      const link = container.querySelector("a");
      expect(link).not.toBeNull();

      await act(async () => {
        link?.click();
      });

      expect(mockPush).toHaveBeenCalledWith("/crf");

      const politeLive = container.querySelector('[aria-live="polite"]');
      expect(politeLive?.textContent).toContain("Navigating to CRF Studio...");
    });
  });

  describe("3. Top-Bar Progress Indicator & Tactile Loading States", () => {
    it("renders top-of-viewport progress indicator during route transition", async () => {
      const TestConsumer = () => {
        const { navigate, isPending } = useInteractiveRouter();
        return (
          <div>
            <button onClick={(e) => navigate("/arcade/laser-loon", "Laser Loon", e)}>
              Navigate Laser Loon
            </button>
            <span data-testid="is-pending">{isPending ? "Pending" : "Idle"}</span>
          </div>
        );
      };

      await act(async () => {
        root.render(
          <A11yProvider>
            <RouterTransitionProvider>
              <TestConsumer />
            </RouterTransitionProvider>
          </A11yProvider>
        );
      });

      const btn = container.querySelector("button");

      await act(async () => {
        btn?.click();
      });

      const progressBar = container.querySelector('.fixed.top-0.left-0.right-0');
      expect(progressBar).not.toBeNull();
    });
  });

  describe("4. Mobile Overlay & Scroll Lock Auto-Reset", () => {
    it("clears body scroll lock and dismisses mobile drawer when route transition executes", async () => {
      await act(async () => {
        root.render(
          <A11yProvider>
            <RouterTransitionProvider>
              <Navbar />
            </RouterTransitionProvider>
          </A11yProvider>
        );
      });

      // Open mobile drawer
      const hamburger = container.querySelector('button[aria-controls="mobile-navigation"]');
      expect(hamburger).not.toBeNull();

      await act(async () => {
        (hamburger as HTMLButtonElement).click();
      });

      expect(document.body.style.overflow).toBe("hidden");

      // Click a mobile navigation link inside drawer
      const crfLink = Array.from(container.querySelectorAll("a")).find((el) =>
        el.getAttribute("href") === "/crf"
      );
      expect(crfLink).not.toBeUndefined();

      await act(async () => {
        crfLink?.click();
      });

      expect(document.body.style.overflow).toBe("");
      expect(mockPush).toHaveBeenCalledWith("/crf");
    });
  });

  describe("5. Same-Page Anchor Target Bypassing", () => {
    it("bypasses transition navigation and uses smooth scrolling for same-page anchors", async () => {
      const scrollIntoViewMock = vi.fn();
      const mockElement = document.createElement("div");
      mockElement.id = "about";
      mockElement.scrollIntoView = scrollIntoViewMock;
      document.body.appendChild(mockElement);

      await act(async () => {
        root.render(
          <A11yProvider>
            <RouterTransitionProvider>
              <Navbar />
            </RouterTransitionProvider>
          </A11yProvider>
        );
      });

      const aboutLink = Array.from(container.querySelectorAll("a")).find(
        (el) => el.getAttribute("href") === "/#about"
      );
      expect(aboutLink).not.toBeUndefined();

      await act(async () => {
        aboutLink?.click();
      });

      expect(scrollIntoViewMock).toHaveBeenCalledWith({ behavior: "smooth" });
      expect(mockPush).not.toHaveBeenCalled();

      mockElement.remove();
    });
  });
});
