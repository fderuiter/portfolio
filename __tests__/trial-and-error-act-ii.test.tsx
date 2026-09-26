// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CardTable } from "@/components/trial-and-error/CardTable";
import { ACT_II } from "@/lib/trial-and-error";

vi.mock("@/hooks/useAnnouncer", () => ({
  useAnnouncer: () => ({ announce: vi.fn() }),
}));
vi.mock("@/components/FieldManualButton", () => ({
  FieldManualButton: () => <button type="button">Manual</button>,
}));

afterEach(cleanup);

describe("CardTable playing Act II on its own (#1084)", () => {
  it("opens on Phase II internal QC with the new SAP", () => {
    render(<CardTable act={ACT_II} seed="alpha" />);
    expect(screen.getAllByText(/Phase II Internal QC/).length).toBeGreaterThan(
      0
    );
    expect(document.body.textContent).toContain("whole numbers");
  });

  it("deals the internal QC deck, Kaplan-Meier Figure included", () => {
    render(<CardTable act={ACT_II} seed="alpha" />);
    const dealt = Array.from(
      document.querySelectorAll<HTMLElement>("[data-card-id]")
    ).map((el) => el.dataset.cardId);
    expect(dealt).toContain("C-F14.3.3");
    expect(dealt).toContain("C-T14.3.3-A");
  });
});
