/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock HTMLCanvasElement getContext safely
if (globalThis.HTMLCanvasElement && globalThis.HTMLCanvasElement.prototype) {
  globalThis.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
    measureText: vi.fn().mockReturnValue({ width: 100 }),
    font: "",
  } as any);
}

// Configure React 19 act environment
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";

// Mock useMasonryLayout to remain in standard hydration mode (isReady: false) for isolated state test
vi.mock("@/hooks/useMasonryLayout", () => ({
  useMasonryLayout: (allItems: any[], filteredItems: any[]) => ({
    containerRef: React.createRef<HTMLDivElement>(),
    layoutState: {
      isReady: false,
      columns: [],
      colCount: 3,
    },
  }),
}));

// Mock child CaseStudyBentoCard to isolate Showcase state checks and prevent JSDOM measuring loops
vi.mock("@/components/ui/CaseStudyBentoCard", () => ({
  CaseStudyBentoCard: ({ study }: any) => (
    <div data-testid="bento-card">
      {study.title} ({study.classification})
    </div>
  ),
}));

// Mock BentoLayoutProvider to simplify rendering context
vi.mock("@/components/providers/BentoLayoutContext", () => ({
  useBentoLayout: () => ({
    heightOverrides: {},
    registerHeightOverride: vi.fn(),
    clearHeightOverride: vi.fn(),
    setTransitioning: vi.fn(),
  }),
  BentoLayoutProvider: ({ children }: any) => <div>{children}</div>,
}));

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = MockResizeObserver as any;

// Mock telemetry hook
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    telemetry: {},
    syncFailed: false,
    recordEvent: vi.fn(),
  }),
}));

// Mock announcer hook
vi.mock("@/components/providers/A11yProvider", () => ({
  useAnnouncer: () => ({
    announce: vi.fn(),
  }),
}));

const MOCK_CASE_STUDIES: any[] = [
  {
    id: "mock-1",
    slug: "schemaflow",
    title: "SchemaFlow: Reactive Node Engine",
    primary_language: "TypeScript",
    github_url: "https://github.com/fderuiter/SchemaFlow",
    published: true,
    simulated_telemetry: false,
    tags: "TypeScript, React",
    classification: "MAINSTREAM",
    editorial_content: "A reactive, visual graph editor built in TypeScript.",
    architectural_narrative: "Mock narrative",
    created_at: new Date(),
    updated_at: new Date(),
    githubStats: null,
  },
  {
    id: "mock-4",
    slug: "proofchain-lean4",
    title: "ProofChain: Lean4-Verified Micro-Consensus Protocol",
    primary_language: "Lean4",
    github_url: "https://github.com/fderuiter/proofchain-lean4",
    published: true,
    simulated_telemetry: true,
    tags: "Lean4, Consensus",
    classification: "EXPERIMENTAL",
    editorial_content: "A formally-verified micro-consensus protocol written in Lean4.",
    architectural_narrative: "Mock Lean4 proofchain narrative.",
    the_pitch: "distributed systems often rely on probabilistic consensus.",
    the_reality: "Lean4 has an extremely steep learning curve.",
    lessons_learned: "Formal verification is incredible for core state machine logic but overkill for I/O bounds.",
    summary_html: "<div>Lean4 metrics summary</div>",
    created_at: new Date(),
    updated_at: new Date(),
    githubStats: null,
  },
];

describe("CaseStudyShowcase Tab segregation & Schema Extension Tests", () => {
  let container: HTMLDivElement;
  let root: Root;
  let CaseStudyShowcase: any;

  beforeEach(async () => {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Dynamically import CaseStudyShowcase after global mocks are executed
    const mod = await import("@/components/CaseStudyShowcase");
    CaseStudyShowcase = mod.CaseStudyShowcase;
  });

  afterEach(() => {
    act(() => {
      root?.unmount();
    });
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it("should default to rendering only MAINSTREAM projects during first load / hydration fallback", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CaseStudyShowcase caseStudies={MOCK_CASE_STUDIES} />);
    });

    // Check that SchemaFlow (Mainstream) is rendered
    expect(container.textContent).toContain("SchemaFlow: Reactive Node Engine");
    
    // Check that ProofChain (Experimental) is NOT rendered on load
    expect(container.textContent).not.toContain("ProofChain: Lean4-Verified Micro-Consensus Protocol");
  });

  it("should switch views to EXPERIMENTAL projects when clicking the Hall of Fame tab", async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(<CaseStudyShowcase caseStudies={MOCK_CASE_STUDIES} />);
    });

    // Find the toggle button containing "HALL OF FAME & GRAVEYARD"
    const buttons = Array.from(container.querySelectorAll("button"));
    const hallOfFameButton = buttons.find(b => b.textContent?.includes("HALL OF FAME & GRAVEYARD"));
    expect(hallOfFameButton).toBeDefined();

    // Click it
    await act(async () => {
      hallOfFameButton!.click();
    });

    // Check that ProofChain (Experimental) is now visible
    expect(container.textContent).toContain("ProofChain: Lean4-Verified Micro-Consensus Protocol");
    
    // Check that SchemaFlow (Mainstream) is no longer visible
    expect(container.textContent).not.toContain("SchemaFlow: Reactive Node Engine");
  });
});
