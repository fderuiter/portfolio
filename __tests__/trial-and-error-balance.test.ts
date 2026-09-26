/**
 * Balance harness (T&E-14, #1074). The bot in `utils/trial-and-error-bot.ts`
 * plays every Blind through the public reducers in four styles, and this
 * suite holds each Blind's quota inside the band below.
 *
 * To set the quota of a new or changed Blind, print the score table:
 *
 *   TE_BALANCE_REPORT=balance.md npx vitest run __tests__/trial-and-error-balance.test.ts
 *
 * It writes one row per Blind and style: the median and minimum score each
 * style reaches across the seeds when the quota is lifted, and how often it
 * clears the real quota. Pick a quota the band accepts, then add the Blind
 * to `BLINDS` with its expected band.
 */
import { writeFileSync } from "node:fs";
import { beforeAll, describe, it, expect } from "vitest";
import {
  ACT_I,
  DMC_MILESTONE_SCENARIO,
  FDA_IR_SCENARIO,
  advanceRun,
  createRunState,
  createTableState,
  deriveRunView,
  type RunState,
  type Scenario,
  type TableAction,
  type TableState,
} from "@/lib/trial-and-error";
import { playBlind, type BotStyle } from "./utils/trial-and-error-bot";

/** Seeds vary the crisis draws. The same list gives the same table. */
const SEEDS = [
  "fold-change",
  "e2e-4",
  "alpha",
  "bravo",
  "charlie",
  "delta",
  "echo",
  "foxtrot",
];
const STYLES: BotStyle[] = ["SLOPPY", "HASTY", "MEDIAN", "PERFECT"];

/**
 * Each Blind's band: the share of seeds on which each style must clear
 * ("ALL", "MOST" = at least 75%, "FEW" = at most 25%). QC stops being
 * optional after the Small Blind: a player who never inspects clears
 * internal QC, and nothing after it.
 */
type Band = "ALL" | "MOST" | "FEW";
const BANDS: Record<string, Record<BotStyle, Band>> = {
  "demographics-small-blind": {
    SLOPPY: "FEW",
    HASTY: "MOST",
    MEDIAN: "MOST",
    PERFECT: "ALL",
  },
  "sponsor-safety-big-blind": {
    SLOPPY: "FEW",
    HASTY: "FEW",
    MEDIAN: "MOST",
    PERFECT: "ALL",
  },
  "dose-escalation-boss-blind": {
    SLOPPY: "FEW",
    HASTY: "FEW",
    MEDIAN: "MOST",
    PERFECT: "ALL",
  },
  "dmc-milestone-boss-blind": {
    SLOPPY: "FEW",
    HASTY: "FEW",
    MEDIAN: "MOST",
    PERFECT: "ALL",
  },
  "fda-information-request-boss-blind": {
    SLOPPY: "FEW",
    HASTY: "FEW",
    MEDIAN: "MOST",
    PERFECT: "ALL",
  },
};

/** The Blind with its quota lifted, to measure how far a style scores. */
function lifted(scenario: Scenario): Scenario {
  const LIMIT = 1_000_000_000;
  const encounter = scenario.encounter;
  // An FDA Information Request clears on its questions, not the round score.
  if (encounter?.kind === "FDA_IR") return scenario;
  return {
    ...scenario,
    blind: { ...scenario.blind, quota: LIMIT },
    // Stage 1 keeps its quota: it gates the closed session.
    encounter: encounter && {
      ...encounter,
      stages: [
        encounter.stages[0],
        { ...encounter.stages[1], quota: LIMIT - encounter.stages[0].quota },
      ],
    },
  };
}

interface Sample {
  blindId: string;
  quota: number;
  style: BotStyle;
  seed: string;
  score: number;
  cleared: boolean;
}

/**
 * Scores each style with the quota lifted. The score only grows, so a style
 * clears the real quota exactly when its lifted score reaches it, except in
 * a staged encounter, where the real run decides.
 */
function measure(
  scenario: Scenario,
  state: TableState,
  seed: string
): { samples: Sample[]; perfectLine: TableAction[] } {
  let perfectLine: TableAction[] = [];
  const samples = STYLES.map((style) => {
    const result = playBlind(lifted(scenario), state, style);
    if (style === "PERFECT") perfectLine = result.actions;
    const cleared = scenario.encounter
      ? playBlind(scenario, state, style).state.status === "CLEARED"
      : result.score >= scenario.blind.quota;
    return {
      blindId: scenario.id,
      quota: scenario.blind.quota,
      style,
      seed,
      score: result.score,
      cleared,
    };
  });
  return { samples, perfectLine };
}

/** Plays Act I on one seed, measuring every Blind as the run reaches it. */
function sampleAct(seed: string): Sample[] {
  const samples: Sample[] = [];
  let run: RunState = createRunState(ACT_I, seed);
  for (;;) {
    const view = deriveRunView(ACT_I, run);
    const measured = measure(view.blind, run.table, seed);
    samples.push(...measured.samples);
    // The perfect line carries the run, and its tray, to the next Blind.
    // Its decisions never read the quota, so it clears the real one on the
    // way; the run stops there.
    for (const action of measured.perfectLine) {
      if (run.table.status !== "REVIEWING") break;
      // The bot never resets a table; a run has no RESET.
      if (action.type === "RESET") continue;
      run = advanceRun(ACT_I, run, action);
    }
    if (run.table.status !== "CLEARED" || !view.nextBlind) break;
    run = advanceRun(ACT_I, run, { type: "NEXT_BLIND" });
  }
  return samples;
}

let SAMPLES: Sample[] = [];

const median = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor((sorted.length - 1) / 2)];
};

function report(): string {
  const rows = [
    "| Blind | Quota | Style | Median | Min | Clears |",
    "|---|---:|---|---:|---:|---:|",
  ];
  for (const blindId of Object.keys(BANDS)) {
    for (const style of STYLES) {
      const cell = SAMPLES.filter(
        (s) => s.blindId === blindId && s.style === style
      );
      if (cell.length === 0) continue;
      const scores = cell.map((s) => s.score);
      const clears = cell.filter((s) => s.cleared).length;
      rows.push(
        `| ${blindId} | ${cell[0].quota} | ${style} | ${median(scores)} | ${Math.min(...scores)} | ${clears}/${cell.length} |`
      );
    }
  }
  return rows.join("\n");
}

describe("balance harness", () => {
  beforeAll(() => {
    SAMPLES = [
      ...SEEDS.flatMap(sampleAct),
      ...measure(
        DMC_MILESTONE_SCENARIO,
        createTableState(DMC_MILESTONE_SCENARIO),
        "standalone"
      ).samples,
      ...measure(
        FDA_IR_SCENARIO,
        createTableState(FDA_IR_SCENARIO),
        "standalone"
      ).samples,
    ];
    if (process.env.TE_BALANCE_REPORT) {
      writeFileSync(process.env.TE_BALANCE_REPORT, `${report()}\n`);
    }
  }, 120_000);

  it("reaches every Blind in Act I on every seed, and the DMC boss", () => {
    for (const blindId of Object.keys(BANDS)) {
      expect(SAMPLES.some((s) => s.blindId === blindId)).toBe(true);
    }
    const reached = (id: string) =>
      new Set(SAMPLES.filter((s) => s.blindId === id).map((s) => s.seed)).size;
    expect(reached("dose-escalation-boss-blind")).toBe(SEEDS.length);
  });

  it.each(Object.entries(BANDS))(
    "holds %s inside its band",
    (blindId, band) => {
      for (const style of STYLES) {
        const cell = SAMPLES.filter(
          (s) => s.blindId === blindId && s.style === style
        );
        const rate = cell.filter((s) => s.cleared).length / cell.length;
        const label = `${blindId} ${style} clears ${rate}`;
        if (band[style] === "ALL") expect(rate, label).toBe(1);
        if (band[style] === "MOST")
          expect(rate, label).toBeGreaterThanOrEqual(0.75);
        if (band[style] === "FEW")
          expect(rate, label).toBeLessThanOrEqual(0.25);
      }
    }
  );

  it("orders the styles: more care never scores less", () => {
    for (const blindId of Object.keys(BANDS)) {
      const med = (style: BotStyle) =>
        median(
          SAMPLES.filter((s) => s.blindId === blindId && s.style === style).map(
            (s) => s.score
          )
        );
      expect(med("SLOPPY")).toBeLessThan(med("HASTY"));
      expect(med("HASTY")).toBeLessThan(med("MEDIAN"));
      expect(med("MEDIAN")).toBeLessThanOrEqual(med("PERFECT"));
    }
  });

  it("is deterministic from seed", { timeout: 60_000 }, () => {
    const again = sampleAct(SEEDS[0]);
    expect(again).toEqual(SAMPLES.filter((s) => s.seed === SEEDS[0]));
  });

  it("never peeks behind the DMC firewall", () => {
    for (const style of STYLES) {
      const { actions, state } = playBlind(
        DMC_MILESTONE_SCENARIO,
        createTableState(DMC_MILESTONE_SCENARIO),
        style
      );
      expect(actions.some((a) => a.type === "PEEK_BLINDED")).toBe(false);
      expect(state.accessLog.every((r) => r.authorized)).toBe(true);
    }
  });
});
