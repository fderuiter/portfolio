// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { QcDesk } from "@/components/trial-and-error/QcDesk";

vi.mock("@/components/FieldManualButton", () => ({
  FieldManualButton: () => <button type="button">Manual</button>,
}));

afterEach(cleanup);

const cell = (row: number, col: number) =>
  screen
    .getAllByRole("row")
    [row + 1].querySelectorAll<HTMLElement>('[role="gridcell"]')[col];

const announcer = () => screen.getByTestId("desk-announcer");

describe("QcDesk HUD", () => {
  it("renders the Blind quota, expected value, CPU counter and a roving-tabindex grid", () => {
    render(<QcDesk />);
    expect(screen.getByTestId("round-target").textContent).toBe("300");
    expect(screen.getByTestId("expected-value").textContent).toBe(
      "[57] × [2] = 114"
    );
    expect(screen.getByTestId("cpu-counter").textContent).toContain("6/6");
    const cells = screen.getAllByRole("gridcell");
    expect(cells).toHaveLength(15);
    expect(cells.filter((c) => c.tabIndex === 0)).toHaveLength(1);
    expect(cells[0].tabIndex).toBe(0);
  });

  it("moves the cursor with arrow keys and inspects with Enter, announcing the result", () => {
    render(<QcDesk />);
    const start = cell(0, 0);
    start.focus();
    fireEvent.keyDown(start, { key: "ArrowRight" });
    fireEvent.keyDown(cell(0, 1), { key: "ArrowRight" });
    fireEvent.keyDown(cell(0, 2), { key: "ArrowDown" });
    fireEvent.keyDown(cell(1, 2), { key: "ArrowDown" });
    const target = cell(2, 2);
    expect(document.activeElement).toBe(target);
    expect(target.tabIndex).toBe(0);

    fireEvent.keyDown(target, { key: "Enter" });
    expect(target.getAttribute("data-status")).toBe("REDLINE");
    expect(announcer().textContent).toBe(
      "Female, n (%), Total: 1 redline. DENOMINATOR (FATAL)."
    );
    // The fatal redline slashes the expected Mult to zero.
    expect(screen.getByTestId("expected-value").textContent).toContain("= 0");
    expect(screen.getByTestId("slashed-mult").textContent).toBe("2");

    const finding = screen.getByTestId("finding");
    expect(finding.textContent).toContain("SAP-DM-01 · DENOMINATOR · FATAL");
    expect(finding.textContent).toContain("the FAS N for Total");
    expect(finding.textContent).toContain("final Mult is 0");
  });

  it("corrects a revealed finding with C and restores the Mult", () => {
    render(<QcDesk />);
    const target = cell(2, 2);
    fireEvent.click(target);
    fireEvent.keyDown(target, { key: "c" });
    expect(target.getAttribute("data-status")).toBe("CORRECTED");
    expect(target.textContent).toBe("7 (63.6)7 (58.3)");
    expect(announcer().textContent).toBe(
      "Corrected 7 (63.6) to 7 (58.3) under SAP-DM-01."
    );
    expect(screen.getByTestId("expected-value").textContent).toBe(
      "[57] × [3] = 171"
    );
    expect(
      within(screen.getByTestId("redline-log")).getByText("corrected")
    ).toBeTruthy();
  });

  it("does not inspect when Enter comes from a nested control rather than the cell", () => {
    render(<QcDesk />);
    const target = cell(0, 0);
    const child = document.createElement("span");
    target.appendChild(child);
    fireEvent.keyDown(child, { key: "Enter" });
    expect(target.getAttribute("data-status")).toBe("UNREVIEWED");
  });

  it("plays a hand for 2 CPU with P and returns focus to the grid", () => {
    render(<QcDesk />);
    const start = cell(0, 0);
    start.focus();
    fireEvent.keyDown(start, { key: "p" });
    expect(screen.getByTestId("cpu-counter").textContent).toContain("4/6");
    expect(screen.getByTestId("last-hand").textContent).toContain(
      "(zero-score rule)"
    );
    expect(announcer().textContent).toContain("Hand scored 0");
    expect(screen.getByText("Draft B (v0.2)")).toBeTruthy();
    expect(document.activeElement).toBe(cell(0, 0));
  });

  it("discards for 1 CPU with D, and via the button", () => {
    render(<QcDesk />);
    fireEvent.keyDown(cell(0, 0), { key: "d" });
    expect(screen.getByTestId("cpu-counter").textContent).toContain("5/6");
    fireEvent.click(screen.getByRole("button", { name: /Reject & Discard/ }));
    expect(screen.getByTestId("cpu-counter").textContent).toContain("4/6");
    expect(screen.getByText("Draft C (v0.3)")).toBeTruthy();
    // Modified keys are left to the browser.
    fireEvent.keyDown(cell(0, 0), { key: "d", ctrlKey: true });
    expect(screen.getByTestId("cpu-counter").textContent).toContain("4/6");
  });

  it("clears the Blind after correcting Draft A, then restarts with focus on the grid", () => {
    render(<QcDesk />);
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        const c = cell(row, col);
        fireEvent.click(c);
        const fix = screen.queryByRole("button", { name: /Flag & Correct/ });
        if (fix) fireEvent.click(fix);
        // A cell can carry two findings; correct any that remains.
        const again = screen.queryByRole("button", { name: /Flag & Correct/ });
        if (again) fireEvent.click(again);
      }
    }
    expect(screen.getByTestId("expected-value").textContent).toBe(
      "[57] × [8] = 456"
    );
    fireEvent.click(screen.getByRole("button", { name: /Approve & Play/ }));

    const result = screen.getByTestId("blind-result");
    expect(result.textContent).toContain("Blind cleared");
    expect(result.textContent).toContain("456 of 300");
    const restart = screen.getByRole("button", { name: "Restart Blind" });
    expect(document.activeElement).toBe(restart);
    // Game hotkeys are inert once the Blind is over.
    fireEvent.keyDown(restart, { key: "p" });

    fireEvent.click(restart);
    expect(screen.getByTestId("round-score").textContent).toBe("0");
    expect(document.activeElement).toBe(cell(0, 0));
  });

  it("shows a failed Blind once no playable hand remains", () => {
    render(<QcDesk />);
    for (let i = 0; i < 3; i++) fireEvent.keyDown(cell(0, 0), { key: "d" });
    expect(screen.getByTestId("blind-result").textContent).toContain(
      "Blind failed"
    );
  });

  it("supports Home and End within a row and clamps at the edges", () => {
    render(<QcDesk />);
    fireEvent.keyDown(cell(0, 0), { key: "End" });
    expect(document.activeElement).toBe(cell(0, 2));
    fireEvent.keyDown(cell(0, 2), { key: "ArrowRight" });
    fireEvent.keyDown(cell(0, 2), { key: "ArrowUp" });
    expect(document.activeElement).toBe(cell(0, 2));
    fireEvent.keyDown(cell(0, 2), { key: "Home" });
    fireEvent.keyDown(cell(0, 0), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(cell(0, 0));
    fireEvent.keyDown(cell(0, 0), { key: " " });
    expect(cell(0, 0).getAttribute("data-status")).toBe("CLEAN");
  });
});
