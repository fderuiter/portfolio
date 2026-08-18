/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, act, cleanup } from "@testing-library/react";
import RecruiterSimulator from "@/app/simulator/page";

const mockRecordEvent = vi.fn();
const mockPlayNote = vi.fn();
const mockPlaySuccess = vi.fn();
const mockAnnounce = vi.fn();

vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: mockRecordEvent,
  }),
}));

vi.mock("@/components/providers/AudioProvider", () => ({
  useAudio: () => ({
    playNote: mockPlayNote,
    playSuccess: mockPlaySuccess,
  }),
}));

vi.mock("@/hooks/useAnnouncer", () => ({
  useAnnouncer: () => ({
    announce: mockAnnounce,
  }),
}));

// Mock framer-motion with full proxy and hooks support to prevent transition freezes in jsdom tests
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  const Component = ({ children, className, style, onClick, ...props }: any) => {
    const { initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...rest } = props;
    return (
      <div className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </div>
    );
  };
  const Button = ({ children, className, style, onClick, type, ...props }: any) => {
    const { initial: _initial, animate: _animate, exit: _exit, transition: _transition, ...rest } = props;
    return (
      <button type={type || "button"} className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </button>
    );
  };

  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === "button") return Button;
          return Component;
        },
      }
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
    useInView: () => true,
  };
});

describe("RecruiterSimulator - Ecosystem-Aligned Accessibility Integration", () => {
  beforeEach(() => {
    window.location.hash = "";
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
    window.location.hash = "";
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("exports a function as default", () => {
    expect(typeof RecruiterSimulator).toBe("function");
  });

  it("delays and assigns focus to the active question card container on mount and step transitions", () => {
    const { container } = render(<RecruiterSimulator />);
    
    // On mount, cardRef should focus after 400ms
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    // Find the focused element
    const activeCard = container.querySelector('[tabindex="-1"]');
    expect(activeCard).not.toBeNull();
    expect(document.activeElement).toBe(activeCard);
    
    // Click an option to transition
    const optionBtn = screen.getAllByText("Raw Systems & Performance Maverick")[0];
    fireEvent.click(optionBtn);
    
    // Advancing timers should trigger the next delayed focus redirection
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    // After transition completes, activeCard should be focused again
    const newActiveCard = container.querySelector('[tabindex="-1"]');
    expect(document.activeElement).toBe(newActiveCard);
  });

  it("announces progress changes politely on step transitions", () => {
    render(<RecruiterSimulator />);
    
    // Click an option to trigger transition
    const optionBtn = screen.getAllByText("Raw Systems & Performance Maverick")[0];
    fireEvent.click(optionBtn);
    
    // Verify polite announcement
    expect(mockAnnounce).toHaveBeenCalledWith("Step completed", "polite");
  });

  it("triggers assertive audio announcement with score and title, and provides accessible circular gauge description on completion", () => {
    render(<RecruiterSimulator />);
    
    // Step 1
    fireEvent.click(screen.getAllByText("Raw Systems & Performance Maverick")[0]);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    // Step 2
    fireEvent.click(screen.getAllByText("Engage Distributed Circuit Breaker & Fallback Queue")[0]);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    // Step 3
    fireEvent.click(screen.getAllByText("Enforce Exhaustive Idempotency Keys & Deduplication Window")[0]);
    act(() => {
      vi.advanceTimersByTime(400);
    });
    
    // Assertive announcement
    expect(mockAnnounce).toHaveBeenCalledWith(
      expect.stringContaining("Alignment complete. Result: Principal Systems Engineer & Distributed Architect"),
      "assertive"
    );
    expect(mockAnnounce).toHaveBeenCalledWith(
      expect.stringContaining("Match"),
      "assertive"
    );
    
    // Visual gauge replacement label
    const gaugeContainer = screen.getByRole("img", { name: /Candidate alignment score/i });
    expect(gaugeContainer).toBeDefined();
    expect(gaugeContainer.getAttribute("aria-label")).toContain("Candidate alignment score:");
  });

  it("hides decorative vector graphics and raw symbol arrows using aria-hidden", () => {
    const { container } = render(<RecruiterSimulator />);
    
    // Check option arrows are wrapped and hidden
    const arrowSpans = container.querySelectorAll('span[aria-hidden="true"]');
    expect(arrowSpans.length).toBeGreaterThan(0);
    let foundArrow = false;
    arrowSpans.forEach(span => {
      if (span.textContent?.trim() === "→") {
        foundArrow = true;
      }
    });
    expect(foundArrow).toBe(true);
  });

  it("synchronizes option selections to URL hash parameters and supports direct deep link state restoration", () => {
    window.location.hash = "#step=final_eval&ans=0,1,0";

    render(<RecruiterSimulator />);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Verify completed evaluation is restored directly from hash parameters
    expect(screen.getByText("Principal Systems Engineer & Distributed Architect")).toBeDefined();
    const gaugeContainer = screen.getByRole("img", { name: /Candidate alignment score/i });
    expect(gaugeContainer).toBeDefined();
  });

  it("updates hash parameters on option selection and supports back button state recovery", () => {
    render(<RecruiterSimulator />);

    act(() => {
      vi.advanceTimersByTime(400);
    });

    // Click step 1 option
    const optionBtn = screen.getAllByText("Raw Systems & Performance Maverick")[0];
    fireEvent.click(optionBtn);

    expect(window.location.hash).toBe("#step=incident_triage&ans=0");

    // Click back button in simulator
    const backBtn = screen.getByRole("button", { name: "Back" });
    fireEvent.click(backBtn);

    expect(window.location.hash).toBe("");
  });
});
