import {
  DEMOGRAPHICS_SCENARIO,
  SPONSOR_SAFETY_SCENARIO,
  type Scenario,
  type TlfCard,
} from "@/lib/trial-and-error";

/**
 * A Kaplan–Meier figure of time to treatment discontinuation, dependent on
 * Table 14.1.2 (Disposition). Act I deals no Figures (ADR 0046), so tests
 * insert it. Its records match the Discontinued Subjects listing: S-004
 * (week 5), S-008 (week 3), S-012 (week 8); everyone else is censored at 12.
 * The draft has two defects: Active at risk at week 8 drops S-012, and
 * S-004's event is drawn as a censoring tick.
 */
export const KM_FIGURE: TlfCard = {
  id: "C-F14.1.2",
  cardType: "FIGURE",
  number: "Figure 14.1.2",
  title: "Time to Discontinuation (KM)",
  population: "ITT",
  chips: 25,
  mult: 1,
  topic: "DS",
  km: {
    endpoint: "Time to treatment discontinuation",
    timeUnit: "weeks",
    populationSnapshotId: "SNAP-P1-v1",
    parent: {
      cardId: "C-T14.1.2",
      atRiskRow: "Randomized",
      eventsRow: "Discontinued",
    },
    timeOrigin: 0,
    milestones: [0, 4, 8, 12],
    records: [
      { subjectId: "S-001", time: 12, event: false },
      { subjectId: "S-002", time: 12, event: false },
      { subjectId: "S-003", time: 12, event: false },
      { subjectId: "S-004", time: 5, event: true },
      { subjectId: "S-005", time: 12, event: false },
      { subjectId: "S-006", time: 12, event: false },
      { subjectId: "S-007", time: 12, event: false },
      { subjectId: "S-008", time: 3, event: true },
      { subjectId: "S-009", time: 12, event: false },
      { subjectId: "S-010", time: 12, event: false },
      { subjectId: "S-011", time: 12, event: false },
      { subjectId: "S-012", time: 8, event: true },
    ],
    displayed: [
      {
        arm: "PLACEBO",
        curve: [
          [0, 1],
          [5, 0.833],
          [12, 0.833],
        ],
        censorTicks: [5, 12],
        atRisk: [6, 6, 5, 5],
      },
      {
        arm: "ACTIVE",
        curve: [
          [0, 1],
          [3, 0.833],
          [8, 0.667],
          [12, 0.667],
        ],
        censorTicks: [12],
        atRisk: [6, 5, 4, 4],
      },
    ],
  },
};

const withFigure = (scenario: Scenario, at: number): Scenario => ({
  ...scenario,
  deck: [...scenario.deck.slice(0, at), KM_FIGURE, ...scenario.deck.slice(at)],
});

/** The Small Blind with the figure dealt fourth, after its parent Table. */
export const SMALL_BLIND_WITH_KM = withFigure(DEMOGRAPHICS_SCENARIO, 3);

/** The Big Blind with the figure dealt seventh, after its parent Table. */
export const BIG_BLIND_WITH_KM = withFigure(SPONSOR_SAFETY_SCENARIO, 6);
