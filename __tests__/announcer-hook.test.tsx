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
});
