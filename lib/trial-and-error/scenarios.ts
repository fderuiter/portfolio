/**
 * Scenario presets for Trial & Error: Biostat Ops.
 *
 * All subjects, values and rules are fictional teaching material. They supply
 * game context only and are not clinical or regulatory advice.
 */
import type { Scenario, StagedTable, Subject, TlfCard } from "./types";

const snapshotId = "SNAP-DM-v1";

const subject = (
  id: string,
  arm: Subject["arm"],
  age: number,
  sex: Subject["sex"],
  populations: Subject["populations"]
): Subject => ({ id, arm, age, sex, populations });

const ALL = ["SCREENED", "ITT", "SAFETY", "FAS", "PER_PROTOCOL"] as const;
const NO_PP = ["SCREENED", "ITT", "SAFETY", "FAS"] as const;
// S-008 had no post-baseline assessment: randomized (ITT) but outside the FAS.
const ITT_ONLY = ["SCREENED", "ITT", "SAFETY"] as const;

const columns: StagedTable["columns"] = [
  { id: "placebo", label: "Placebo", arm: "PLACEBO" },
  { id: "active", label: "Active", arm: "ACTIVE" },
  { id: "total", label: "Total", arm: "TOTAL" },
];

const rows: StagedTable["rows"] = [
  { id: "n", label: "Subjects, N", statistic: { kind: "POPULATION_N" } },
  { id: "age", label: "Age (years), mean", statistic: { kind: "MEAN_AGE" } },
  {
    id: "female",
    label: "Female, n (%)",
    statistic: { kind: "SEX_COUNT_PCT", sex: "F" },
  },
  {
    id: "male",
    label: "Male, n (%)",
    statistic: { kind: "SEX_COUNT_PCT", sex: "M" },
  },
  {
    id: "age65",
    label: "Age ≥ 65, n (%)",
    statistic: { kind: "AGE_AT_LEAST_COUNT_PCT", minAge: 65 },
  },
];

const draft = (
  id: string,
  draftLabel: string,
  cells: string[][]
): StagedTable => ({
  id,
  shellId: "T-14.1.1",
  draftLabel,
  populationSnapshotId: snapshotId,
  columns,
  rows,
  cells,
});

const card = (c: TlfCard): TlfCard => c;
// Face data below is fictional and consistent with the snapshot: ITT 6/6,
// FAS 6/5 (S-008 has no post-baseline assessment), Safety 6/6.

/**
 * The Small Blind deck, dealt in this order. Only the three Table 14.1.1
 * drafts carry reviewable cells in this slice; the other outputs are dealt,
 * classified and scored, and gain QC content with T&E-02 (#911).
 */
const DEMOGRAPHICS_DECK: TlfCard[] = [
  card({
    id: "C-T14.1.1-A",
    cardType: "TABLE",
    number: "Table 14.1.1",
    title: "Demographics (Draft A)",
    population: "ITT",
    chips: 30,
    mult: 1,
    topic: "DM",
    csrStage: "BASELINE",
    draftId: "T-14.1.1-A",
  }),
  card({
    id: "C-L16.2.4",
    cardType: "LISTING",
    number: "Listing 16.2.4",
    title: "Demographic Data by Subject",
    population: "ITT",
    chips: 20,
    mult: 0,
    topic: "DM",
    csrStage: "PATIENT_LISTING",
    face: {
      kind: "LISTING",
      columns: ["Subject", "Arm", "Age", "Sex"],
      rows: [
        ["S-001", "PBO", "34", "F"],
        ["S-002", "PBO", "41", "M"],
        ["S-007", "ACT", "22", "F"],
        ["S-008", "ACT", "66", "M"],
      ],
    },
  }),
  card({
    id: "C-T14.1.2",
    cardType: "TABLE",
    number: "Table 14.1.2",
    title: "Subject Disposition",
    population: "ITT",
    chips: 25,
    mult: 1,
    topic: "DS",
    csrStage: "DISPOSITION",
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Total"],
      rows: [
        { label: "Randomized", values: ["6", "6", "12"] },
        { label: "Completed", values: ["5 (83.3)", "4 (66.7)", "9 (75.0)"] },
        { label: "Discontinued", values: ["1 (16.7)", "2 (33.3)", "3 (25.0)"] },
        { label: "Adverse event", values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"] },
      ],
    },
  }),
  card({
    id: "C-T14.2.1",
    cardType: "TABLE",
    number: "Table 14.2.1",
    title: "Primary Endpoint (ANCOVA)",
    population: "FAS",
    chips: 40,
    mult: 1,
    topic: "EFF",
    csrStage: "EFFICACY",
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Diff"],
      rows: [
        { label: "N", values: ["6", "5", "—"] },
        { label: "LS mean", values: ["-1.2", "-4.8", "-3.6"] },
        { label: "95% CI", values: ["—", "—", "(-6.9, -0.3)"] },
        { label: "p-value", values: ["—", "—", "0.034"] },
      ],
    },
  }),
  card({
    id: "C-F14.2.1",
    cardType: "FIGURE",
    number: "Figure 14.2.1",
    title: "Kaplan-Meier: Time to Response",
    population: "FAS",
    chips: 35,
    mult: 0,
    topic: "EFF",
    face: {
      kind: "FIGURE",
      plot: {
        type: "KM",
        series: [
          {
            label: "Placebo",
            points: [
              [0, 1],
              [2, 1],
              [4, 0.83],
              [8, 0.67],
              [12, 0.5],
            ],
          },
          {
            label: "Active",
            points: [
              [0, 1],
              [2, 0.8],
              [4, 0.6],
              [8, 0.4],
              [12, 0.2],
            ],
          },
        ],
      },
    },
  }),
  card({
    id: "C-T14.3.1",
    cardType: "TABLE",
    number: "Table 14.3.1",
    title: "Overview of Adverse Events",
    population: "SAFETY",
    chips: 35,
    mult: 1,
    topic: "AE",
    csrStage: "SAFETY_AE",
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Total"],
      rows: [
        { label: "Any TEAE", values: ["3 (50.0)", "5 (83.3)", "8 (66.7)"] },
        { label: "Serious AE", values: ["1 (16.7)", "2 (33.3)", "3 (25.0)"] },
        { label: "AE to discont.", values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"] },
        { label: "Deaths", values: ["0 (0.0)", "0 (0.0)", "0 (0.0)"] },
      ],
    },
  }),
  card({
    id: "C-L16.2.7",
    cardType: "LISTING",
    number: "Listing 16.2.7",
    title: "Adverse Events by Subject",
    population: "SAFETY",
    chips: 20,
    mult: 0,
    topic: "AE",
    csrStage: "PATIENT_LISTING",
    face: {
      kind: "LISTING",
      columns: ["Subject", "Preferred term", "Grade"],
      rows: [
        ["S-003", "Fatigue", "1"],
        ["S-007", "Headache", "1"],
        ["S-008", "Atrial fibrillation", "3"],
        ["S-010", "Syncope", "3"],
      ],
    },
  }),
  card({
    id: "C-L16.1.1",
    cardType: "LISTING",
    number: "Listing 16.1.1",
    title: "Discontinued Subjects",
    population: "ITT",
    chips: 15,
    mult: 0,
    topic: "DS",
    csrStage: "PATIENT_LISTING",
    face: {
      kind: "LISTING",
      columns: ["Subject", "Arm", "Reason"],
      rows: [
        ["S-004", "PBO", "Withdrew consent"],
        ["S-008", "ACT", "Adverse event"],
        ["S-012", "ACT", "Lost to follow-up"],
      ],
    },
  }),
  card({
    id: "C-T14.1.1-B",
    cardType: "TABLE",
    number: "Table 14.1.1",
    title: "Demographics (Draft B)",
    population: "ITT",
    chips: 30,
    mult: 1,
    topic: "DM",
    csrStage: "BASELINE",
    draftId: "T-14.1.1-B",
  }),
  card({
    id: "C-T14.2.2",
    cardType: "TABLE",
    number: "Table 14.2.2",
    title: "Key Secondary Endpoint",
    population: "FAS",
    chips: 35,
    mult: 1,
    topic: "EFF",
    csrStage: "EFFICACY",
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Diff"],
      rows: [
        { label: "N", values: ["6", "5", "—"] },
        { label: "Responders", values: ["2 (33.3)", "4 (80.0)", "—"] },
        { label: "Odds ratio", values: ["—", "—", "8.0"] },
        { label: "p-value", values: ["—", "—", "0.24"] },
      ],
    },
  }),
  card({
    id: "C-F14.2.2",
    cardType: "FIGURE",
    number: "Figure 14.2.2",
    title: "Forest Plot by Subgroup",
    population: "FAS",
    chips: 30,
    mult: 0,
    topic: "EFF",
    face: {
      kind: "FIGURE",
      plot: {
        type: "FOREST",
        reference: 0,
        intervals: [
          { label: "Overall", estimate: -3.6, lower: -6.9, upper: -0.3 },
          { label: "Age < 65", estimate: -4.1, lower: -8, upper: -0.2 },
          { label: "Age ≥ 65", estimate: -2.2, lower: -7.5, upper: 3.1 },
          { label: "Female", estimate: -4.4, lower: -8.6, upper: -0.2 },
        ],
      },
    },
  }),
  card({
    id: "C-T14.1.1-C",
    cardType: "TABLE",
    number: "Table 14.1.1",
    title: "Demographics (Draft C)",
    population: "ITT",
    chips: 30,
    mult: 1,
    topic: "DM",
    csrStage: "BASELINE",
    draftId: "T-14.1.1-C",
  }),
  card({
    id: "C-T14.3.2",
    cardType: "TABLE",
    number: "Table 14.3.2",
    title: "AEs by SOC: Cardiac Disorders",
    population: "SAFETY",
    chips: 25,
    mult: 1,
    topic: "AE",
    csrStage: "SAFETY_AE",
    soc: "Cardiac disorders",
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Total"],
      rows: [
        {
          label: "Cardiac disorders",
          values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"],
        },
        {
          label: "Atrial fibrillation",
          values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"],
        },
        { label: "Palpitations", values: ["0 (0.0)", "0 (0.0)", "0 (0.0)"] },
      ],
    },
  }),
  card({
    id: "C-L16.2.8",
    cardType: "LISTING",
    number: "Listing 16.2.8",
    title: "Serious Adverse Events",
    population: "SAFETY",
    chips: 20,
    mult: 0,
    topic: "AE",
    csrStage: "PATIENT_LISTING",
    face: {
      kind: "LISTING",
      columns: ["Subject", "Serious event", "Outcome"],
      rows: [
        ["S-005", "Pneumonia", "Recovered"],
        ["S-008", "Atrial fibrillation", "Recovered"],
        ["S-010", "Syncope", "Recovered"],
      ],
    },
  }),
];

/**
 * Demographics (Table 14.1.1) under SAP-DM-001. The SAP population is ITT
 * (N=12). FAS (N=11) is a distinct population here: the SAP declares no
 * alias, so a percentage divided by the FAS N is a fatal denominator error.
 * Rounding is half-to-even at one decimal place, and the Total mean age is
 * exactly 45.25, so the convention decides between 45.2 and 45.3.
 */
export const DEMOGRAPHICS_SCENARIO: Scenario = {
  id: "demographics-small-blind",
  title: "Demographics QC Desk",
  summary:
    "Internal CRO QC review of Table 14.1.1 (Demographics, ITT) before the first data review.",
  blind: {
    tier: "SMALL_BLIND",
    name: "Small Blind: Internal CRO QC",
    quota: 300,
  },
  handType: "HIGH_TABLE",
  startingCpu: 6,
  table: { startingCpu: 10, handSize: 8, maxSelection: 5 },
  deck: DEMOGRAPHICS_DECK,
  rulebook: {
    id: "SAP-DM-001",
    title: "SAP §9.1 Demographics and Baseline Characteristics",
    populationSuit: "ITT",
    populationAliases: [],
    percentPrecision: 1,
    meanPrecision: 1,
    roundingMode: "HALF_EVEN",
    rules: [
      {
        id: "SAP-DM-01",
        category: "DENOMINATOR",
        severity: "FATAL",
        statement:
          "Header N and every percentage use the ITT population from the locked snapshot. FAS is a separate population and is not interchangeable with ITT.",
        consequence:
          "A wrong denominator misstates every percentage in the column. While it stands, the hand's final Mult is 0.",
        correctionMultBonus: 1,
        redlineMultPenalty: 0,
      },
      {
        id: "SAP-DM-02",
        category: "PRECISION",
        severity: "MINOR",
        statement: "Percentages and means are reported to 1 decimal place.",
        consequence:
          "Inconsistent precision implies accuracy the data does not have. Redline: −1 Mult; correcting it earns +2 Mult.",
        correctionMultBonus: 2,
        redlineMultPenalty: 1,
      },
      {
        id: "SAP-DM-03",
        category: "ROUNDING",
        severity: "MINOR",
        statement:
          "Ties round half-to-even (banker's rounding): 45.25 becomes 45.2.",
        consequence:
          "A different convention silently shifts ties and breaks double programming. Redline: −1 Mult; correcting it earns +1 Mult.",
        correctionMultBonus: 1,
        redlineMultPenalty: 1,
      },
      {
        id: "SAP-DM-04",
        category: "VALUE",
        severity: "MAJOR",
        statement:
          "Every count and statistic must reproduce from the population snapshot.",
        consequence:
          "An unreproducible number cannot be defended at review. Redline: −2 Mult; correcting it earns +1 Mult.",
        correctionMultBonus: 1,
        redlineMultPenalty: 2,
      },
    ],
  },
  populationSnapshot: {
    id: snapshotId,
    version: 1,
    capturedAt: "2026-01-15T09:00:00Z",
    subjects: [
      subject("S-001", "PLACEBO", 34, "F", [...ALL]),
      subject("S-002", "PLACEBO", 41, "M", [...ALL]),
      subject("S-003", "PLACEBO", 47, "F", [...ALL]),
      subject("S-004", "PLACEBO", 52, "M", [...NO_PP]),
      subject("S-005", "PLACEBO", 58, "F", [...ALL]),
      subject("S-006", "PLACEBO", 67, "M", [...ALL]),
      subject("S-007", "ACTIVE", 22, "F", [...ALL]),
      subject("S-008", "ACTIVE", 66, "M", [...ITT_ONLY]),
      subject("S-009", "ACTIVE", 25, "F", [...ALL]),
      subject("S-010", "ACTIVE", 70, "F", [...ALL]),
      subject("S-011", "ACTIVE", 29, "F", [...ALL]),
      subject("S-012", "ACTIVE", 32, "M", [...NO_PP]),
    ],
  },
  shell: {
    id: "T-14.1.1",
    tableNumber: "Table 14.1.1",
    title: "Demographics and Baseline Characteristics (ITT)",
    cardType: "TABLE",
    targetPopulation: "ITT",
    chips: 30,
    mult: 1,
    requiredRulebookId: "SAP-DM-001",
    allowedFootnoteSlots: 1,
  },
  drawPile: [
    // Draft A: Total column divided by the FAS N, 2-dp precision slip,
    // half-away rounding of an exact tie.
    draft("T-14.1.1-A", "Draft A (v0.1)", [
      ["6", "6", "12"],
      ["49.8", "40.7", "45.3"],
      ["3 (50.0)", "4 (66.67)", "7 (63.6)"],
      ["3 (50.0)", "2 (33.3)", "5 (45.5)"],
      ["1 (16.7)", "2 (33.3)", "3 (27.3)"],
    ]),
    // Draft B: one integer percentage.
    draft("T-14.1.1-B", "Draft B (v0.2)", [
      ["6", "6", "12"],
      ["49.8", "40.7", "45.2"],
      ["3 (50)", "4 (66.7)", "7 (58.3)"],
      ["3 (50.0)", "2 (33.3)", "5 (41.7)"],
      ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    ]),
    // Draft C: clean.
    draft("T-14.1.1-C", "Draft C (v0.3)", [
      ["6", "6", "12"],
      ["49.8", "40.7", "45.2"],
      ["3 (50.0)", "4 (66.7)", "7 (58.3)"],
      ["3 (50.0)", "2 (33.3)", "5 (41.7)"],
      ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    ]),
  ],
};

/** Every playable scenario, keyed by id. */
export const SCENARIOS: Readonly<Record<string, Scenario>> = Object.freeze({
  [DEMOGRAPHICS_SCENARIO.id]: DEMOGRAPHICS_SCENARIO,
});
