import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import {
  A11yProvider,
  useAnnouncer,
  announcerReducer,
  initialAnnouncerState,
  AnnouncerState,
} from "@/components/providers/A11yProvider";

function TestAnnouncerComponent() {
  const { announce } = useAnnouncer();
  return (
    <div>
      <button
        onClick={() => announce("Proof discharged successfully: Modus Ponens verified", "polite")}
      >
        Announce Polite
      </button>
      <button
        onClick={() => announce("Critical Error: Circular dependency detected in CRF rule DAG", "assertive")}
      >
        Announce Assertive
      </button>
      <button
        onClick={() => announce("Sensitive record with SSN 123-45-6789 processed", "polite")}
      >
        Announce SPI
      </button>
    </div>
  );
}

describe("A11yProvider & useAnnouncer Dynamic Screen Reader Engine", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders polite and assertive aria-live regions in the DOM", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const politeRegion = document.querySelector('[aria-live="polite"]');
    const assertiveRegion = document.querySelector('[aria-live="assertive"]');

    expect(politeRegion).not.toBeNull();
    expect(assertiveRegion).not.toBeNull();
    expect(politeRegion?.getAttribute("aria-atomic")).toBe("true");
    expect(assertiveRegion?.getAttribute("aria-atomic")).toBe("true");
  });

  it("dispatches polite announcements to aria-live polite region", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const politeBtn = screen.getByRole("button", { name: "Announce Polite" });
    act(() => {
      politeBtn.click();
    });

    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toContain("Proof discharged successfully: Modus Ponens verified");
  });

  it("dispatches assertive announcements with high priority to aria-live assertive region", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const assertiveBtn = screen.getByRole("button", { name: "Announce Assertive" });
    act(() => {
      assertiveBtn.click();
    });

    const assertiveRegion = document.querySelector('[aria-live="assertive"]');
    expect(assertiveRegion?.textContent).toContain("Critical Error: Circular dependency detected in CRF rule DAG");
  });

  it("redacts sensitive personal information (SPI) from screen reader announcements", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const spiBtn = screen.getByRole("button", { name: "Announce SPI" });
    act(() => {
      spiBtn.click();
    });

    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toContain("***-**-****");
    expect(politeRegion?.textContent).not.toContain("123-45-6789");
  });

  it("plays rapid, sequential status messages sequentially without resetting active timer", () => {
    function SequentialTester() {
      const { announce } = useAnnouncer();
      return (
        <div>
          <button onClick={() => announce("Message 1", "polite")}>Msg1</button>
          <button onClick={() => announce("Message 2", "polite")}>Msg2</button>
          <button onClick={() => announce("Message 3", "polite")}>Msg3</button>
        </div>
      );
    }

    render(
      <A11yProvider>
        <SequentialTester />
      </A11yProvider>
    );

    const politeRegion = document.querySelector('[aria-live="polite"]');

    act(() => {
      screen.getByRole("button", { name: "Msg1" }).click();
    });
    expect(politeRegion?.textContent).toBe("Message 1");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    act(() => {
      screen.getByRole("button", { name: "Msg2" }).click();
    });
    expect(politeRegion?.textContent).toBe("Message 1");

    act(() => {
      vi.advanceTimersByTime(500);
      screen.getByRole("button", { name: "Msg3" }).click();
    });
    expect(politeRegion?.textContent).toBe("Message 1");

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(politeRegion?.textContent).toBe("Message 2");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(politeRegion?.textContent).toBe("Message 3");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(politeRegion?.textContent).toBe("");
  });

  it("assertive alerts immediately supersede active polite announcements without repeating interrupted message", () => {
    function PreemptionTester() {
      const { announce } = useAnnouncer();
      return (
        <div>
          <button onClick={() => announce("Polite Update 1", "polite")}>Polite1</button>
          <button onClick={() => announce("Polite Update 2", "polite")}>Polite2</button>
          <button onClick={() => announce("Critical Alert", "assertive")}>Assertive1</button>
        </div>
      );
    }

    render(
      <A11yProvider>
        <PreemptionTester />
      </A11yProvider>
    );

    const politeRegion = document.querySelector('[aria-live="polite"]');
    const assertiveRegion = document.querySelector('[aria-live="assertive"]');

    act(() => {
      screen.getByRole("button", { name: "Polite1" }).click();
    });
    expect(politeRegion?.textContent).toBe("Polite Update 1");

    act(() => {
      vi.advanceTimersByTime(1000);
      screen.getByRole("button", { name: "Polite2" }).click();
    });
    expect(politeRegion?.textContent).toBe("Polite Update 1");

    act(() => {
      vi.advanceTimersByTime(500);
      screen.getByRole("button", { name: "Assertive1" }).click();
    });

    expect(assertiveRegion?.textContent).toBe("Critical Alert");
    expect(politeRegion?.textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(assertiveRegion?.textContent).toBe("");
    expect(politeRegion?.textContent).toBe("Polite Update 2");

    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(politeRegion?.textContent).toBe("");
  });

  it("preserves stable reference identity for the announce callback to prevent render loops", () => {
    const announceRef = { current: null as unknown };

    function StabilityComponent() {
      const { announce } = useAnnouncer();
      React.useEffect(() => {
        announceRef.current = announce;
      }, [announce]);
      return <button onClick={() => announce("Test")}>Test</button>;
    }

    const { rerender } = render(
      <A11yProvider>
        <StabilityComponent />
      </A11yProvider>
    );

    const initialRef = announceRef.current;
    expect(initialRef).toBeTypeOf("function");

    rerender(
      <A11yProvider>
        <StabilityComponent />
      </A11yProvider>
    );

    expect(announceRef.current).toBe(initialRef);
  });

  describe("announcerReducer state machine unit logic", () => {
    it("handles ANNOUNCE for polite messages when idle vs when busy", () => {
      const state0 = initialAnnouncerState;

      const item1 = { id: "1", text: "P1", priority: "polite" as const };
      const state1 = announcerReducer(state0, { type: "ANNOUNCE", item: item1 });
      expect(state1.activePolite).toEqual(item1);
      expect(state1.politeQueue).toEqual([]);

      const item2 = { id: "2", text: "P2", priority: "polite" as const };
      const state2 = announcerReducer(state1, { type: "ANNOUNCE", item: item2 });
      expect(state2.activePolite).toEqual(item1);
      expect(state2.politeQueue).toEqual([item2]);
    });

    it("handles ANNOUNCE for assertive messages preempting active polite message", () => {
      const item1 = { id: "1", text: "P1", priority: "polite" as const };
      const state1 = announcerReducer(initialAnnouncerState, { type: "ANNOUNCE", item: item1 });

      const itemAssertive = { id: "a1", text: "A1", priority: "assertive" as const };
      const state2 = announcerReducer(state1, { type: "ANNOUNCE", item: itemAssertive });

      expect(state2.activePolite).toBeNull();
      expect(state2.activeAssertive).toEqual(itemAssertive);
    });

    it("dequeues correctly on TIMER_EXPIRED from assertive queue to polite queue", () => {
      const p1 = { id: "p1", text: "P1", priority: "polite" as const };
      const p2 = { id: "p2", text: "P2", priority: "polite" as const };
      const a1 = { id: "a1", text: "A1", priority: "assertive" as const };
      const a2 = { id: "a2", text: "A2", priority: "assertive" as const };

      let state: AnnouncerState = initialAnnouncerState;
      // p1 starts playing
      state = announcerReducer(state, { type: "ANNOUNCE", item: p1 });
      // p2 is added to politeQueue because p1 is active
      state = announcerReducer(state, { type: "ANNOUNCE", item: p2 });
      // a1 preempts p1 (p1 discarded), a1 becomes activeAssertive, p2 stays in politeQueue
      state = announcerReducer(state, { type: "ANNOUNCE", item: a1 });
      // a2 added to assertiveQueue
      state = announcerReducer(state, { type: "ANNOUNCE", item: a2 });

      expect(state.activeAssertive).toEqual(a1);
      expect(state.assertiveQueue).toEqual([a2]);
      expect(state.activePolite).toBeNull();
      expect(state.politeQueue).toEqual([p2]);

      // Timer expires for A1 -> A2 becomes active
      state = announcerReducer(state, { type: "TIMER_EXPIRED" });
      expect(state.activeAssertive).toEqual(a2);
      expect(state.assertiveQueue).toEqual([]);
      expect(state.activePolite).toBeNull();
      expect(state.politeQueue).toEqual([p2]);

      // Timer expires for A2 -> P2 becomes active
      state = announcerReducer(state, { type: "TIMER_EXPIRED" });
      expect(state.activeAssertive).toBeNull();
      expect(state.activePolite).toEqual(p2);
      expect(state.politeQueue).toEqual([]);

      // Timer expires for P2 -> state becomes empty
      state = announcerReducer(state, { type: "TIMER_EXPIRED" });
      expect(state.activeAssertive).toBeNull();
      expect(state.activePolite).toBeNull();
    });
  });
});

