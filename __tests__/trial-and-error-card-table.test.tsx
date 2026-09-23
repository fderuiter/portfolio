// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { CardTable } from "@/components/trial-and-error/CardTable";

const announce = vi.fn();
vi.mock("@/hooks/useAnnouncer", () => ({
  useAnnouncer: () => ({ announce }),
}));
vi.mock("@/components/FieldManualButton", () => ({
  FieldManualButton: () => <button type="button">Manual</button>,
}));

beforeEach(() => {
  announce.mockClear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      matches: query.includes("reduce"),
      media: query,
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
  });
});
afterEach(cleanup);

const DRAFT_A = "C-T14.1.1-A";
const DM_LISTING = "C-L16.2.4";

const card = (id: string) =>
  document.querySelector<HTMLButtonElement>(`[data-card-id="${id}"]`)!;
const cards = () =>
  Array.from(document.querySelectorAll<HTMLButtonElement>("[data-card-id]"));
const lastAnnouncement = () => announce.mock.calls.at(-1)?.[0];
const drawer = () => screen.queryByTestId("inspect-drawer");
const gridCell = (row: number, col: number) =>
  within(drawer()!)
    .getAllByRole("row")
    [row + 1].querySelectorAll<HTMLElement>('[role="gridcell"]')[col];

async function openInspect(id: string) {
  act(() => card(id).focus());
  fireEvent.keyDown(card(id), { key: "i" });
  await waitFor(() => expect(drawer()).not.toBeNull());
}

describe("CardTable", () => {
  it("deals a hand of 8 with one roving tab stop and an empty relic rack", () => {
    render(<CardTable />);
    expect(cards()).toHaveLength(8);
    expect(cards().filter((c) => c.tabIndex === 0)).toEqual([card(DRAFT_A)]);
    expect(screen.getByTestId("round-target").textContent).toBe("300");
    expect(screen.getByTestId("cpu-counter").textContent).toBe("10/10");
    expect(screen.getByTestId("hands-affordable").textContent).toBe("5");
    const rack = screen.getByTestId("relic-rack");
    expect(rack.tabIndex).toBe(0);
    expect(within(rack).getAllByText("Empty")).toHaveLength(5);
    expect(card(DRAFT_A).getAttribute("aria-label")).toContain("unverified");
  });

  it("moves with arrows and Home/End, and selects with Space", () => {
    render(<CardTable />);
    card(DRAFT_A).focus();
    fireEvent.keyDown(card(DRAFT_A), { key: "ArrowRight" });
    expect(document.activeElement).toBe(card(DM_LISTING));
    fireEvent.keyDown(card(DM_LISTING), { key: "End" });
    expect(document.activeElement).toBe(cards()[7]);
    fireEvent.keyDown(cards()[7], { key: "ArrowRight" });
    expect(document.activeElement).toBe(cards()[7]);
    fireEvent.keyDown(cards()[7], { key: "Home" });
    fireEvent.keyDown(card(DRAFT_A), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(card(DRAFT_A));

    fireEvent.keyDown(card(DRAFT_A), { key: " " });
    fireEvent.click(card(DM_LISTING));
    expect(card(DRAFT_A).getAttribute("aria-pressed")).toBe("true");
    expect(card(DM_LISTING).getAttribute("aria-pressed")).toBe("true");
    const preview = screen.getByTestId("hand-preview");
    expect(preview.textContent).toContain("TLF Pair");
    expect(preview.textContent).toContain("[92] × [3] = 276");
    expect(screen.getByTestId("unverified-flag")).toBeTruthy();
    expect(lastAnnouncement()).toBe(
      "Selected Listing 16.2.4 Demographic Data by Subject. 2 selected: TLF Pair."
    );
  });

  it("plays with Enter, revealing the hidden fatal defect, and keeps focus in the hand", () => {
    render(<CardTable />);
    fireEvent.keyDown(card(DRAFT_A), { key: " " });
    fireEvent.keyDown(card(DRAFT_A), { key: "ArrowRight" });
    fireEvent.keyDown(card(DM_LISTING), { key: " " });
    fireEvent.keyDown(card(DM_LISTING), { key: "Enter" });
    expect(screen.getByTestId("cpu-counter").textContent).toBe("8/10");
    expect(screen.getByTestId("last-hand").textContent).toContain(
      "TLF Pair · 80 Chips × 0 Mult = 0 (zero-score rule)"
    );
    expect(lastAnnouncement()).toContain("Zero-score rule triggered.");
    expect(cards()).toHaveLength(8);
    expect(cards()).toContain(document.activeElement);
  });

  it("discards with D and ignores keys from a nested element or with modifiers", () => {
    render(<CardTable />);
    fireEvent.keyDown(card(DRAFT_A), { key: " " });
    fireEvent.keyDown(card(DRAFT_A), { key: "d", ctrlKey: true });
    expect(screen.getByTestId("cpu-counter").textContent).toBe("10/10");
    const child = document.createElement("span");
    card(DRAFT_A).appendChild(child);
    fireEvent.keyDown(child, { key: "d" });
    expect(screen.getByTestId("cpu-counter").textContent).toBe("10/10");
    fireEvent.keyDown(card(DRAFT_A), { key: "d" });
    expect(screen.getByTestId("cpu-counter").textContent).toBe("9/10");
    expect(lastAnnouncement()).toBe("Discarded 1 card.");
  });

  it("announces refusals, such as inspecting a card with no reviewable cells", () => {
    render(<CardTable />);
    card("C-T14.1.2").focus();
    fireEvent.keyDown(card("C-T14.1.2"), { key: "i" });
    expect(drawer()).toBeNull();
    expect(lastAnnouncement()).toBe(
      "Table 14.1.2 Subject Disposition has no reviewable cells in this slice."
    );
    fireEvent.keyDown(card("C-T14.1.2"), { key: "Enter" });
    expect(lastAnnouncement()).toBe("Select at least one card to play.");
  });

  it("opens a focus-trapped Inspect drawer that reviews cells and closes with Escape", async () => {
    render(<CardTable />);
    await openInspect(DRAFT_A);
    expect(screen.getByTestId("cpu-counter").textContent).toBe("9/10");
    const dialog = screen.getByRole("dialog");
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    await waitFor(() => expect(document.activeElement).toBe(gridCell(0, 0)));

    const target = gridCell(2, 2);
    fireEvent.click(target);
    expect(target.getAttribute("data-status")).toBe("REDLINE");
    expect(within(dialog).getByTestId("slashed-mult").textContent).toBe("2");
    fireEvent.keyDown(target, { key: "c" });
    expect(gridCell(2, 2).getAttribute("data-status")).toBe("CORRECTED");
    expect(lastAnnouncement()).toBe(
      "Corrected 7 (63.6) to 7 (58.3) under SAP-DM-01."
    );

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    await waitFor(() => expect(drawer()).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(card(DRAFT_A)));
    expect(card(DRAFT_A).getAttribute("aria-label")).not.toContain(
      "unverified"
    );
  });

  it("persists corrections between openings and reopens without charging CPU", async () => {
    render(<CardTable />);
    await openInspect(DRAFT_A);
    fireEvent.click(gridCell(1, 2));
    fireEvent.click(screen.getByRole("button", { name: /Close Inspect/ }));
    await waitFor(() => expect(drawer()).toBeNull());
    await openInspect(DRAFT_A);
    expect(screen.getByTestId("cpu-counter").textContent).toBe("9/10");
    expect(gridCell(1, 2).getAttribute("data-status")).toBe("REDLINE");
    expect(within(drawer()!).getByTestId("reviewed-count").textContent).toBe(
      "1/15"
    );
  });

  it("clears the Blind by inspecting, correcting and playing, then restarts", async () => {
    render(<CardTable />);
    await openInspect(DRAFT_A);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const cell = gridCell(row, col);
        act(() => cell.focus());
        fireEvent.keyDown(cell, { key: "Enter" });
        fireEvent.keyDown(cell, { key: "c" });
      }
    }
    fireEvent.click(screen.getByRole("button", { name: /Close Inspect/ }));
    await waitFor(() => expect(drawer()).toBeNull());
    fireEvent.keyDown(card(DRAFT_A), { key: " " });
    fireEvent.click(card(DM_LISTING));
    // Draft A is inspected and corrected, so the preview is fully verified.
    expect(screen.queryByTestId("unverified-flag")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Play Hand/ }));

    const result = screen.getByTestId("blind-result");
    expect(result.textContent).toContain("Blind cleared");
    expect(result.textContent).toContain("828 of 300");
    const restart = screen.getByRole("button", { name: "Restart Blind" });
    expect(document.activeElement).toBe(restart);
    fireEvent.click(restart);
    expect(screen.getByTestId("round-score").textContent?.trim()).toBe("0");
    await waitFor(() => expect(document.activeElement).toBe(card(DRAFT_A)));
  });

  it("uses the Inspect button for the focused card and labels it as reopenable", async () => {
    render(<CardTable />);
    const inspectButton = screen.getByRole("button", {
      name: /Inspect Table 14.1.1 · 1 CPU/,
    });
    fireEvent.click(inspectButton);
    await waitFor(() => expect(drawer()).not.toBeNull());
    fireEvent.click(screen.getByRole("button", { name: /Close Inspect/ }));
    await waitFor(() => expect(drawer()).toBeNull());
    expect(
      screen.getByRole("button", { name: /Inspect Table 14.1.1 · open/ })
    ).toBeTruthy();
    act(() => card(DM_LISTING).focus());
    expect(
      (
        screen.getByRole("button", {
          name: /Inspect Listing 16.2.4/,
        }) as HTMLButtonElement
      ).disabled
    ).toBe(true);
  });
});
