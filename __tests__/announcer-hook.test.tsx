import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import React from "react";
import { render, screen, act, cleanup } from "@testing-library/react";
import { A11yProvider, useAnnouncer } from "@/components/providers/A11yProvider";

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
        onClick={() => announce("Polite Announcement 1", "polite")}
      >
        Announce Polite 1
      </button>
      <button
        onClick={() => announce("Polite Announcement 2", "polite")}
      >
        Announce Polite 2
      </button>
      <button
        onClick={() => announce("Critical Error: Circular dependency detected in CRF rule DAG", "assertive")}
      >
        Announce Assertive
      </button>
      <button
        onClick={() => announce("Assertive Alert 1", "assertive")}
      >
        Announce Assertive 1
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

  it("does not cancel active speech timer when new polite announcement enters queue", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const polite1Btn = screen.getByRole("button", { name: "Announce Polite 1" });
    const polite2Btn = screen.getByRole("button", { name: "Announce Polite 2" });

    // Announce Polite 1
    act(() => {
      polite1Btn.click();
    });

    const politeRegion = document.querySelector('[aria-live="polite"]');
    expect(politeRegion?.textContent).toBe("Polite Announcement 1");

    // Advance 1000ms (1 second into 3 second timer)
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(politeRegion?.textContent).toBe("Polite Announcement 1");

    // Announce Polite 2 while Polite 1 is playing
    act(() => {
      polite2Btn.click();
    });

    // Polite 1 should STILL be playing (not reset or replaced immediately)
    expect(politeRegion?.textContent).toBe("Polite Announcement 1");

    // Advance 2000ms (total 3000ms from start of Polite 1)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now Polite 1's timer has completed, so Polite 2 should start playing
    expect(politeRegion?.textContent).toBe("Polite Announcement 2");

    // Advance 3000ms (total 6000ms from start)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Polite 2 finishes, polite region becomes empty
    expect(politeRegion?.textContent).toBe("");
  });

  it("immediately interrupts ongoing polite announcements when an assertive alert arrives and finishes playing later", () => {
    render(
      <A11yProvider>
        <TestAnnouncerComponent />
      </A11yProvider>
    );

    const polite1Btn = screen.getByRole("button", { name: "Announce Polite 1" });
    const assertive1Btn = screen.getByRole("button", { name: "Announce Assertive 1" });

    // Announce Polite 1
    act(() => {
      polite1Btn.click();
    });

    const politeRegion = document.querySelector('[aria-live="polite"]');
    const assertiveRegion = document.querySelector('[aria-live="assertive"]');

    expect(politeRegion?.textContent).toBe("Polite Announcement 1");

    // Advance 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Announce Assertive 1 while Polite 1 is playing
    act(() => {
      assertive1Btn.click();
    });

    // Assertive alert should immediately voice in assertive region and polite region is cleared (interrupted)
    expect(assertiveRegion?.textContent).toBe("Assertive Alert 1");
    expect(politeRegion?.textContent).toBe("");

    // Advance 3000ms (Assertive 1 finishes)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Assertive region clears, and interrupted Polite 1 resumes/finishes playing
    expect(assertiveRegion?.textContent).toBe("");
    expect(politeRegion?.textContent).toBe("Polite Announcement 1");

    // Advance 3000ms (Polite 1 finishes playing)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(politeRegion?.textContent).toBe("");
  });
});
