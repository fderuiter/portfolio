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
import {
  ACT_I,
  ACT_I_CRISES,
  DEMOGRAPHICS_SCENARIO,
  DOSE_ESCALATION_SCENARIO,
  FIREWALL_CELL,
  SPONSOR_SAFETY_SCENARIO,
  type Act,
  type CrisisCard,
} from "@/lib/trial-and-error";

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

/**
 * Act I with a one-point Small Blind and a one-card crisis deck, so the Big
 * Blind opens on `crisis` whatever the seed.
 */
const crisisAct = (crisis: CrisisCard): Act => ({
  ...ACT_I,
  blinds: [
    {
      ...DEMOGRAPHICS_SCENARIO,
      blind: { ...DEMOGRAPHICS_SCENARIO.blind, quota: 1 },
    },
    SPONSOR_SAFETY_SCENARIO,
  ],
  crisisDeck: [crisis],
});

/** Clears the one-point Small Blind and deals the Big Blind. */
function reachBigBlind() {
  fireEvent.click(card("C-T14.1.1-C"));
  fireEvent.click(screen.getByRole("button", { name: /Play Hand/ }));
  fireEvent.click(screen.getByRole("button", { name: "Next Blind" }));
  expect(screen.getByTestId("blind-name").textContent).toBe(
    "Big Blind: Sponsor Safety Review"
  );
}

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

  it("focuses a clicked cell without scrolling, so narrow-width taps land (#956)", async () => {
    render(<CardTable />);
    await openInspect(DRAFT_A);
    const target = gridCell(1, 2);
    const focusSpy = vi.spyOn(target, "focus");

    // A pointer press is swallowed so focus can't scroll the grid before pointerup.
    expect(fireEvent.mouseDown(target)).toBe(false);
    fireEvent.click(target);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(target.getAttribute("data-status")).not.toBe("UNREVIEWED");

    // Keyboard moves still scroll the newly focused cell into view.
    const left = gridCell(1, 1);
    const leftSpy = vi.spyOn(left, "focus");
    fireEvent.keyDown(target, { key: "ArrowLeft" });
    expect(leftSpy).toHaveBeenCalledWith(undefined);
  });

  it("clears the Blind by inspecting, correcting and playing, then moves to the next Blind", async () => {
    // Seed "early" draws the Site Audit for the Big Blind.
    render(<CardTable seed="early" />);
    expect(screen.getByTestId("run-seed").textContent).toBe("early");
    expect(screen.getByTestId("blind-intro").textContent).toContain(
      "Phase I, first data review."
    );
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
    expect(screen.queryByTestId("blind-intro")).toBeNull();

    const result = screen.getByTestId("blind-result");
    expect(result.textContent).toContain("Blind cleared");
    expect(result.textContent).toContain("828 of 300");
    expect(result.textContent).toContain(
      "Next: Big Blind: Sponsor Safety Review · target 750"
    );
    const next = screen.getByRole("button", { name: "Next Blind" });
    expect(document.activeElement).toBe(next);
    fireEvent.click(next);
    expect(screen.getByTestId("blind-name").textContent).toBe(
      "Big Blind: Sponsor Safety Review"
    );
    expect(screen.getByTestId("round-target").textContent).toBe("750");
    expect(screen.getByTestId("round-score").textContent?.trim()).toBe("0");
    expect(screen.getByTestId("cpu-counter").textContent).toBe("10/10");
    expect(screen.getByTestId("blind-intro").textContent).toContain(
      "safety physician"
    );
    expect(lastAnnouncement()).toContain(
      "Big Blind: Sponsor Safety Review. Target 750. Crisis: Site Audit."
    );
    // The crisis must be answered first, so focus goes to its first choice.
    const crisis = screen.getByTestId("crisis");
    expect(within(crisis).getByRole("heading").textContent).toBe(
      "Crisis: Site Audit"
    );
    const host = within(crisis).getByRole("button", {
      name: /Host the auditors/,
    });
    await waitFor(() => expect(document.activeElement).toBe(host));
    expect(screen.getByRole("button", { name: /Play Hand/ })).toHaveProperty(
      "disabled",
      true
    );
    // Remote audit costs budget the study does not have.
    const remote = within(crisis).getByRole("button", {
      name: /Pay for a remote audit/,
    });
    expect(remote).toHaveProperty("disabled", true);
    expect(remote.textContent).toContain("Needs $2k study budget; $0k left.");

    fireEvent.click(host);
    expect(screen.queryByTestId("crisis")).toBeNull();
    expect(screen.getByTestId("blind-modifier").textContent).toContain(
      "Crisis: Site Audit"
    );
    expect(
      screen.getByRole("button", { name: /Discard · 2 CPU/ })
    ).toBeTruthy();
    expect(lastAnnouncement()).toContain("Site Audit: Host the auditors.");
    await waitFor(() =>
      expect(document.activeElement).toBe(card("C-T14.3.1-A"))
    );
  });

  it("shows the boss debuff on disabled cards and ends the run on a loss", () => {
    render(<CardTable scenario={DOSE_ESCALATION_SCENARIO} />);
    expect(screen.getByTestId("boss-modifier").textContent).toContain(
      "Boss: Safety Set Only"
    );
    const disabled = card("C-T14.1.2");
    expect(disabled.getAttribute("aria-label")).toContain(
      "disabled by the boss, scores 0 Chips"
    );
    expect(within(disabled).getByTestId("debuff-badge").textContent).toBe(
      "25 → 0 Chips"
    );
    expect(
      within(card("C-T14.3.2.1-B")).queryByTestId("debuff-badge")
    ).toBeNull();

    // Discard one card at a time until no hand can be played.
    for (let i = 0; i < 9; i++) {
      const first = cards()[0];
      if (!first) break;
      fireEvent.click(first);
      fireEvent.click(screen.getByRole("button", { name: /Discard/ }));
    }
    const result = screen.getByTestId("blind-result");
    expect(result.textContent).toContain("Blind failed · run over");
    const restart = screen.getByRole("button", { name: "Restart run" });
    expect(document.activeElement).toBe(restart);
    fireEvent.click(restart);
    expect(screen.getByTestId("round-score").textContent?.trim()).toBe("0");
    expect(screen.getByTestId("blind-intro")).toBeTruthy();
  });

  it("enforces a crisis hand limit on the Blind panel and ends the Blind when it runs out", () => {
    const emergency = ACT_I_CRISES.find((c) => c.id === "CR-EMERGENCY-REVIEW")!;
    render(<CardTable act={crisisAct(emergency)} seed="ui-limit" />);
    reachBigBlind();
    expect(screen.queryByTestId("hand-limit")).toBeNull();
    fireEvent.click(
      within(screen.getByTestId("crisis")).getByRole("button", {
        name: /Accept the early deadline/,
      })
    );
    expect(screen.getByTestId("blind-modifier").textContent).toContain(
      "Crisis: Emergency Review"
    );
    expect(screen.getByTestId("hand-limit").textContent).toBe("2 left");
    expect(screen.getByTestId("hands-affordable").textContent).toBe("2");

    // Two single uninspected cards score far short of 750. A card the first
    // hand's snapshot change staled, or an empty shell, cannot be played.
    for (const left of ["1 left", "0 left"]) {
      const playable = cards().find(
        (c) => !/stale|empty shell/.test(c.getAttribute("aria-label") ?? "")
      )!;
      fireEvent.click(playable);
      fireEvent.click(screen.getByRole("button", { name: /Play Hand/ }));
      expect(screen.getByTestId("hand-limit").textContent).toBe(left);
    }
    const result = screen.getByTestId("blind-result");
    expect(result.textContent).toContain("Blind failed");
    expect(lastAnnouncement()).toContain("the 2-hand limit is used up");
  });

  it("turns treatment-arm values face down under a DMC firewall and refuses Inspect", () => {
    const firewall: CrisisCard = {
      id: "CR-UI-FIREWALL",
      name: "Closed Session",
      description: "The DMC meets behind closed doors.",
      choices: [
        {
          id: "wait",
          label: "Wait outside",
          consequence: "Treatment arms are face down this Blind.",
          effect: {
            modifier: {
              id: "CR-UI-FIREWALL-MOD",
              name: "DMC Firewall",
              description: "Arms stay blinded.",
              debuffType: "BLIND_FIREWALL",
            },
          },
        },
        {
          id: "leave",
          label: "Leave",
          consequence: "Nothing changes.",
          effect: {},
        },
      ],
    };
    render(<CardTable act={crisisAct(firewall)} seed="ui-firewall" />);
    reachBigBlind();
    const target = "C-T14.3.1-A";
    expect(card(target).textContent).not.toContain(FIREWALL_CELL);
    fireEvent.click(screen.getByRole("button", { name: /Wait outside/ }));
    expect(screen.getByTestId("blind-modifier").textContent).toContain(
      "Crisis: DMC Firewall"
    );
    expect(card(target).textContent).toContain(FIREWALL_CELL);
    act(() => card(target).focus());
    expect(
      screen.getByRole("button", { name: /^Inspect .*\[I\]$/ })
    ).toHaveProperty("disabled", true);
    fireEvent.keyDown(card(target), { key: "i" });
    expect(drawer()).toBeNull();
  });

  it("offers Play again once the final Blind of the act is cleared", () => {
    const quick = {
      ...DEMOGRAPHICS_SCENARIO,
      blind: { ...DEMOGRAPHICS_SCENARIO.blind, quota: 1 },
    };
    render(<CardTable scenario={quick} />);
    fireEvent.click(card("C-T14.1.1-C"));
    fireEvent.click(screen.getByRole("button", { name: /Play Hand/ }));
    expect(screen.getByTestId("blind-result").textContent).toContain(
      "Demographics QC Desk complete"
    );
    expect(screen.queryByRole("button", { name: "Next Blind" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Play again" }));
    expect(screen.getByTestId("round-score").textContent?.trim()).toBe("0");
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

describe("CardTable population snapshots (T&E-03)", () => {
  const NERVOUS_A = "C-T14.3.2.5-A";
  const STALE_SAFETY = [
    "C-T14.3.1-A",
    "C-L16.2.7",
    "C-T14.3.3-A",
    "C-L16.2.8",
    NERVOUS_A,
  ];

  /** The sponsor review after its first hand: S-004 has left the Safety set. */
  function renderAfterDataChange() {
    render(<CardTable scenario={SPONSOR_SAFETY_SCENARIO} />);
    expect(screen.getByTestId("current-snapshot").textContent).toBe(
      "SNAP-P1-v1"
    );
    fireEvent.click(card("C-T14.1.2"));
    fireEvent.click(screen.getByRole("button", { name: /Play Hand/ }));
  }

  it("expires the Safety outputs in hand and announces why", () => {
    renderAfterDataChange();
    expect(lastAnnouncement()).toContain(
      "S-004 stays randomized (ITT) but leaves the Safety population. Safety population now SNAP-P1-v2. Stale: Table 14.3.1 (Draft A)"
    );
    expect(screen.getByTestId("current-snapshot").textContent).toBe(
      "SNAP-P1-v2"
    );
    const stale = card(NERVOUS_A);
    expect(stale.getAttribute("aria-label")).toContain(
      "stale, compiled against SNAP-P1-v1, scores 0 Chips until recompiled"
    );
    expect(stale.getAttribute("aria-label")).toContain("stale stamp");
    expect(stale.dataset.stale).toBe("true");
    expect(within(stale).getByTestId("stale-badge").textContent).toBe(
      "25 → 0 Chips"
    );
    expect(stale.querySelector('[data-stamp="STALE"]')).not.toBeNull();
    // ITT outputs are unrelated to the change.
    const itt = card("C-L16.1.1");
    expect(itt.dataset.stale).toBeUndefined();
    expect(within(itt).queryByTestId("stale-badge")).toBeNull();
  });

  it("blocks Play Hand on a stale card and recompiles it with R", () => {
    renderAfterDataChange();
    fireEvent.click(card(NERVOUS_A));
    expect(screen.getByTestId("stale-alert").textContent).toBe(
      "Output compiled against obsolete population snapshot; recompile required (2 CPU). Stale: Table 14.3.2.5 (Draft A)."
    );
    expect(
      (screen.getByRole("button", { name: /Play Hand/ }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    fireEvent.keyDown(card(NERVOUS_A), { key: "Enter" });
    expect(lastAnnouncement()).toContain(
      "Output compiled against obsolete population snapshot"
    );

    act(() => card(NERVOUS_A).focus());
    expect(
      screen.getByRole("button", {
        name: "Recompile Table 14.3.2.5 · 2 CPU [R]",
      })
    ).toBeTruthy();
    fireEvent.keyDown(card(NERVOUS_A), { key: "r" });
    expect(screen.getByTestId("cpu-counter").textContent).toBe("6/10");
    expect(lastAnnouncement()).toContain("against SNAP-P1-v2 for 2 CPU");
    expect(within(card(NERVOUS_A)).queryByTestId("stale-badge")).toBeNull();
    expect(screen.queryByTestId("stale-alert")).toBeNull();
    expect(screen.queryByRole("button", { name: /Recompile/ })).toBeNull();
    expect(document.activeElement).toBe(card(NERVOUS_A));
  });

  it("recompiles from the button, and names the stale cards that break a flush", () => {
    renderAfterDataChange();
    for (const id of STALE_SAFETY) fireEvent.click(card(id));
    expect(screen.getByTestId("hand-preview").textContent).toContain(
      "TLF Two Pair"
    );
    expect(screen.getByTestId("flush-broken").textContent).toBe(
      "Population Flush broken: Table 14.3.1 (Draft A), Listing 16.2.7, Table 14.3.3 (Draft A), Listing 16.2.8, Table 14.3.2.5 (Draft A) are stale."
    );
    expect(screen.getByTestId("stale-alert").textContent).toBe(
      "Output compiled against obsolete population snapshot; recompile required (2 CPU)."
    );
    act(() => card("C-L16.2.7").focus());
    fireEvent.click(
      screen.getByRole("button", { name: /Recompile Listing 16.2.7/ })
    );
    expect(screen.getByTestId("cpu-counter").textContent).toBe("6/10");
    expect(screen.getByTestId("flush-broken").textContent).toContain(
      "Table 14.3.2.5 (Draft A) are stale."
    );
  });

  it("shows each card's snapshot in its detail and its Inspect drawer", async () => {
    renderAfterDataChange();
    act(() => card(NERVOUS_A).focus());
    fireEvent.keyDown(card(NERVOUS_A), { key: "?" });
    const detail = screen.getByTestId("card-detail");
    expect(within(detail).getByTestId("snapshot-chip").textContent).toBe(
      "SNAP-P1-v1 · v1 · stale: recompile required"
    );
    fireEvent.click(within(detail).getByRole("button", { name: /Close/ }));

    await openInspect(NERVOUS_A);
    expect(within(drawer()!).getByTestId("snapshot-chip").textContent).toBe(
      "Compiled against SNAP-P1-v1 · v1 · captured 2026-01-15 · stale: Output compiled against obsolete population snapshot; recompile required (2 CPU)."
    );
    fireEvent.click(screen.getByRole("button", { name: /Close Inspect/ }));
    await waitFor(() => expect(drawer()).toBeNull());

    await openInspect("C-T14.3.2.1-A");
    expect(within(drawer()!).getByTestId("snapshot-chip").textContent).toBe(
      "Compiled against SNAP-P1-v2 · v2 · captured 2026-02-02"
    );
  });
});

describe("CardTable shells, seals and CPU (T&E-04)", () => {
  const BLANK = "C-T14.1.3";
  const tray = () => screen.getByTestId("consumable-tray");
  const seal = (name: RegExp) =>
    within(tray()).getByRole("button", { name }) as HTMLButtonElement;

  /** Sends A, B and the DM listing back, which deals the blank shell. */
  function renderWithBlank() {
    render(<CardTable />);
    for (const id of [DRAFT_A, "C-T14.1.1-B", DM_LISTING]) {
      fireEvent.click(card(id));
    }
    fireEvent.click(screen.getByRole("button", { name: /Discard/ }));
    expect(card(BLANK)).toBeTruthy();
  }

  it("draws the blank shell as an empty skeleton and blocks it from play", () => {
    renderWithBlank();
    const blank = card(BLANK);
    expect(blank.dataset.blank).toBe("true");
    expect(within(blank).getByTestId("shell-badge").textContent).toBe("Shell");
    expect(blank.getAttribute("aria-label")).toContain(
      "empty shell, accepts ITT or Safety data, press A to allocate"
    );
    fireEvent.click(blank);
    expect(screen.getByTestId("empty-alert").textContent).toBe(
      "Empty shell: Table 14.1.3. Allocate an analysis set to compile it first."
    );
    expect(
      (screen.getByRole("button", { name: /Play Hand/ }) as HTMLButtonElement)
        .disabled
    ).toBe(true);
    expect(screen.queryByTestId("stale-alert")).toBeNull();
  });

  it("previews each analysis set and allocates one with A, for free", () => {
    renderWithBlank();
    for (const id of [
      "C-T14.3.1",
      "C-L16.2.7",
      "C-T14.3.2",
      "C-L16.2.8",
      BLANK,
    ]) {
      fireEvent.click(card(id));
    }
    const panel = screen.getByTestId("allocate-panel");
    const [itt, safety] = within(panel).getAllByTestId("allocate-option");
    expect(itt.textContent).toContain("Compile on ITT · N=12");
    expect(itt.textContent).toContain("TLF Pair");
    expect(safety.textContent).toContain("SNAP-P1-v1 · v1");
    expect(safety.textContent).toContain("Population Flush");
    expect(safety.textContent).toContain("? unverified");

    act(() => card(BLANK).focus());
    fireEvent.keyDown(card(BLANK), { key: "a" });
    expect(document.activeElement).toBe(itt);
    fireEvent.click(safety);
    expect(lastAnnouncement()).toBe(
      "Allocated Safety data (N=12, SNAP-P1-v1) to Table 14.1.3. It compiled as a Safety output."
    );
    expect(screen.getByTestId("cpu-counter").textContent).toBe("9/10");
    expect(screen.queryByTestId("allocate-panel")).toBeNull();
    expect(card(BLANK).getAttribute("aria-label")).toContain(
      "Safety population"
    );
    expect(document.activeElement).toBe(card(BLANK));
    expect(screen.getByTestId("hand-preview").textContent).toContain(
      "Population Flush"
    );
  });

  it("arms a seal from the tray and affixes it with Enter", () => {
    renderWithBlank();
    act(() => card(BLANK).focus());
    fireEvent.keyDown(card(BLANK), { key: "a" });
    fireEvent.click(
      within(screen.getByTestId("allocate-panel")).getAllByTestId(
        "allocate-option"
      )[1]
    );
    expect(within(tray()).getAllByTestId("consumable")).toHaveLength(2);
    const adjudicated = seal(/Adjudicated Endpoint/);
    fireEvent.click(adjudicated);
    expect(adjudicated.getAttribute("aria-pressed")).toBe("true");
    expect(lastAnnouncement()).toContain("Adjudicated Endpoint picked up");
    fireEvent.keyDown(card(BLANK), { key: "Escape" });
    expect(lastAnnouncement()).toBe("Adjudicated Endpoint put back.");
    expect(seal(/Adjudicated Endpoint/).getAttribute("aria-pressed")).toBe(
      "false"
    );

    fireEvent.click(seal(/Adjudicated Endpoint/));
    fireEvent.keyDown(card(BLANK), { key: "Enter" });
    expect(lastAnnouncement()).toContain(
      "Sealed Table 14.1.3 with Adjudicated Endpoint: +3 Mult."
    );
    expect(within(card(BLANK)).getAllByTestId("seal-badge")).toHaveLength(1);
    expect(card(BLANK).getAttribute("aria-label")).toContain(
      "footnote seal: Adjudicated Endpoint"
    );
    expect(within(tray()).getAllByTestId("consumable")).toHaveLength(1);
    // Enter played nothing: the seal took it.
    expect(screen.getByTestId("round-score").textContent?.trim()).toBe("0");

    fireEvent.keyDown(card(BLANK), { key: "?" });
    const footnotes = within(screen.getByTestId("card-detail")).getByTestId(
      "card-footnotes"
    );
    expect(footnotes.textContent).toContain(
      "Serious events were adjudicated by an independent committee blinded to treatment."
    );
  });

  it("affixes a seal dropped on a card, or clicked onto one", () => {
    render(<CardTable />);
    const data = new Map<string, string>();
    const dataTransfer = {
      types: [] as string[],
      setData: (type: string, value: string) => {
        data.set(type, value);
        dataTransfer.types.push(type);
      },
      getData: (type: string) => data.get(type) ?? "",
      dropEffect: "none",
      effectAllowed: "all",
    };
    fireEvent.dragStart(seal(/Sponsor rounding standard/), { dataTransfer });
    fireEvent.dragOver(card(DRAFT_A), { dataTransfer });
    fireEvent.drop(card(DRAFT_A), { dataTransfer });
    expect(lastAnnouncement()).toContain(
      "Sealed Table 14.1.1 (Draft A) with Sponsor rounding standard: waives SAP-DM-03 redlines."
    );
    // A click with a seal armed affixes it instead of selecting the card.
    fireEvent.click(seal(/Adjudicated Endpoint/));
    fireEvent.click(card("C-T14.1.1-B"));
    expect(lastAnnouncement()).toBe(
      "Adjudicated Endpoint applies to Safety outputs only; Table 14.1.1 (Draft B) is built on ITT."
    );
    expect(card("C-T14.1.1-B").getAttribute("aria-pressed")).toBe("false");
  });

  it("sells a seal into the study budget", () => {
    render(<CardTable />);
    expect(screen.getByTestId("study-budget").textContent).toBe("Budget $0k");
    fireEvent.click(within(tray()).getByRole("button", { name: "Sell · $2k" }));
    expect(lastAnnouncement()).toBe(
      "Sold Adjudicated Endpoint for $2k. Study budget $2k."
    );
    expect(screen.getByTestId("study-budget").textContent).toBe("Budget $2k");
    expect(within(tray()).getByText("Empty slot")).toBeTruthy();
  });

  it("draws CPU as pips that empty as they are spent, and says why a move is unaffordable", async () => {
    const poor = {
      ...DEMOGRAPHICS_SCENARIO,
      table: { ...DEMOGRAPHICS_SCENARIO.table, startingCpu: 2 },
    };
    render(<CardTable scenario={poor} />);
    const pips = () =>
      Array.from(
        screen
          .getByTestId("cpu-pips")
          .querySelectorAll<HTMLElement>("[data-pip]")
      ).map((p) => p.dataset.pip);
    expect(pips()).toEqual(["on", "on"]);
    expect(screen.queryByTestId("cpu-note")).toBeNull();
    await openInspect(DRAFT_A);
    fireEvent.click(screen.getByRole("button", { name: /Close Inspect/ }));
    await waitFor(() => expect(drawer()).toBeNull());
    expect(pips()).toEqual(["on", "spent"]);
    expect(
      screen.getByTestId("cpu-pips").querySelectorAll(".te-pip-burst")
    ).toHaveLength(1);
    fireEvent.click(card(DRAFT_A));
    expect(screen.getByTestId("cpu-note").textContent).toBe(
      "Play Hand needs 2 CPU; 1 left."
    );
    expect(
      screen
        .getByRole("button", { name: /Play Hand/ })
        .getAttribute("aria-describedby")
    ).toBe("cpu-note");
  });
});
