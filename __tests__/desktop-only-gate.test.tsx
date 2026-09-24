// @vitest-environment jsdom
import { describe, it, expect, afterEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { DesktopOnlyGate } from "../components/arcade/DesktopOnlyGate";

const GATE_QUERY = "[@media(pointer:coarse)_and_(max-width:1023px)]";

describe("DesktopOnlyGate", () => {
  afterEach(() => {
    cleanup();
  });

  it("server-renders both the cabinet and the notice, split by the touch media query", () => {
    render(
      <DesktopOnlyGate gameTitle="Laser Loon">
        <div data-testid="cabinet">cabinet</div>
      </DesktopOnlyGate>
    );

    const cabinetWrapper = screen.getByTestId("cabinet").parentElement;
    expect(cabinetWrapper?.className).toContain(`${GATE_QUERY}:hidden`);

    const notice = screen.getByTestId("desktop-only-notice");
    expect(notice.className).toContain("hidden");
    expect(notice.className).toContain(`${GATE_QUERY}:block`);
    expect(notice.textContent).toContain(
      "Laser Loon is a desktop game for now"
    );
  });

  it("links back to the arcade hub", () => {
    render(
      <DesktopOnlyGate gameTitle="Retro Labyrinth">
        <div />
      </DesktopOnlyGate>
    );

    expect(
      screen
        .getByRole("link", { name: "Back to the Arcade" })
        .getAttribute("href")
    ).toBe("/arcade");
  });

  it("reveals only the cabinet after Try it anyway", () => {
    render(
      <DesktopOnlyGate gameTitle="Working With Duck">
        <div data-testid="cabinet">cabinet</div>
      </DesktopOnlyGate>
    );

    fireEvent.click(screen.getByRole("button", { name: "Try it anyway" }));

    expect(screen.queryByTestId("desktop-only-notice")).toBeNull();
    const cabinet = screen.getByTestId("cabinet");
    expect(cabinet.parentElement?.className ?? "").not.toContain(GATE_QUERY);
  });
});
