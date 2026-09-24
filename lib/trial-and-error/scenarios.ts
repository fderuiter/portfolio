/**
 * Scenario presets for Trial & Error: Biostat Ops.
 *
 * Act I is a Phase I safety study played as three Blinds: Internal QC, the
 * sponsor's safety review, then the Dose Escalation Committee (ADR 0046).
 * The study opens on one population snapshot; a scripted data change during
 * the sponsor review moves it to a second version. All subjects, events, values and
 * rules are fictional teaching material. They supply game context only and
 * are not clinical or regulatory advice.
 */
import type {
  Act,
  AdverseEvent,
  FootnoteSeal,
  RowStatistic,
  SapRulebook,
  Scenario,
  StagedTable,
  Subject,
  TableShellSpec,
  TlfCard,
} from "./types";

const snapshotId = "SNAP-P1-v1";

const ALL = ["SCREENED", "ITT", "SAFETY", "FAS", "PER_PROTOCOL"] as const;
const NO_PP = ["SCREENED", "ITT", "SAFETY", "FAS"] as const;
// S-008 had no post-baseline assessment: randomized (ITT) but outside the FAS.
const ITT_ONLY = ["SCREENED", "ITT", "SAFETY"] as const;

const CARDIAC = "Cardiac disorders";
const GI = "Gastrointestinal disorders";
const GENERAL = "General disorders and administration site conditions";
const INFECTIONS = "Infections and infestations";
const NERVOUS = "Nervous system disorders";
const SKIN = "Skin and subcutaneous tissue disorders";

const ae = (
  soc: string,
  term: string,
  grade: number,
  flags: { serious?: true; ledToDiscontinuation?: true } = {}
): AdverseEvent => ({
  soc,
  term,
  grade,
  serious: flags.serious ?? false,
  ledToDiscontinuation: flags.ledToDiscontinuation ?? false,
});

const subject = (
  id: string,
  arm: Subject["arm"],
  age: number,
  sex: Subject["sex"],
  populations: Subject["populations"],
  adverseEvents?: AdverseEvent[]
): Subject => ({
  id,
  arm,
  age,
  sex,
  populations,
  ...(adverseEvents ? { adverseEvents } : {}),
});

/**
 * The study's opening snapshot. Safety = ITT = 12 (6/6); FAS 11 (6/5);
 * Per-Protocol 9 (5/4). Eight subjects report 13 treatment-emergent events,
 * so counting events instead of subjects is always a visible mistake.
 */
const POPULATION_SNAPSHOT: Scenario["populationSnapshot"] = {
  id: snapshotId,
  version: 1,
  capturedAt: "2026-01-15T09:00:00Z",
  subjects: [
    subject("S-001", "PLACEBO", 34, "F", [...ALL]),
    subject("S-002", "PLACEBO", 41, "M", [...ALL]),
    subject("S-003", "PLACEBO", 47, "F", [...ALL], [ae(GENERAL, "Fatigue", 1)]),
    subject("S-004", "PLACEBO", 52, "M", [...NO_PP]),
    subject(
      "S-005",
      "PLACEBO",
      58,
      "F",
      [...ALL],
      [ae(INFECTIONS, "Pneumonia", 3, { serious: true }), ae(GI, "Nausea", 1)]
    ),
    subject(
      "S-006",
      "PLACEBO",
      67,
      "M",
      [...ALL],
      [ae(NERVOUS, "Headache", 1)]
    ),
    subject(
      "S-007",
      "ACTIVE",
      22,
      "F",
      [...ALL],
      [ae(NERVOUS, "Headache", 1), ae(GI, "Nausea", 1), ae(GI, "Vomiting", 1)]
    ),
    subject(
      "S-008",
      "ACTIVE",
      66,
      "M",
      [...ITT_ONLY],
      [
        ae(CARDIAC, "Atrial fibrillation", 3, {
          serious: true,
          ledToDiscontinuation: true,
        }),
      ]
    ),
    subject("S-009", "ACTIVE", 25, "F", [...ALL], [ae(SKIN, "Rash", 1)]),
    subject(
      "S-010",
      "ACTIVE",
      70,
      "F",
      [...ALL],
      [
        ae(NERVOUS, "Syncope", 3, { serious: true }),
        ae(NERVOUS, "Dizziness", 2),
      ]
    ),
    subject(
      "S-011",
      "ACTIVE",
      29,
      "F",
      [...ALL],
      [ae(GENERAL, "Fatigue", 1), ae(GENERAL, "Injection site reaction", 1)]
    ),
    subject("S-012", "ACTIVE", 32, "M", [...NO_PP]),
  ],
};

const columns: StagedTable["columns"] = [
  { id: "placebo", label: "Placebo", arm: "PLACEBO" },
  { id: "active", label: "Active", arm: "ACTIVE" },
  { id: "total", label: "Total", arm: "TOTAL" },
];

type Row = StagedTable["rows"][number];
const row = (id: string, label: string, statistic: RowStatistic): Row => ({
  id,
  label,
  statistic,
});
const N_ROW = row("n", "Subjects, N", { kind: "POPULATION_N" });

const draftOf =
  (shellId: string, rows: Row[]) =>
  (id: string, draftLabel: string, cells: string[][]): StagedTable => ({
    id,
    shellId,
    draftLabel,
    populationSnapshotId: snapshotId,
    columns,
    rows,
    cells,
  });

const card = (c: TlfCard): TlfCard => c;

/** A draft card: its face is compiled from the staged draft it points at. */
const draftCard = (
  draft: StagedTable,
  shell: TableShellSpec,
  fields: Pick<TlfCard, "title" | "topic" | "csrStage" | "soc">
): TlfCard => ({
  id: `C-${draft.id.replace(/^T-/, "T")}`,
  cardType: "TABLE",
  number: shell.tableNumber,
  population: shell.targetPopulation,
  chips: shell.chips,
  mult: shell.mult,
  draftId: draft.id,
  ...fields,
});

// Supporting listings and face-only tables, shared across Act I. Face data is
// fictional and consistent with the snapshot.

const DM_LISTING = card({
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
});

const DISPOSITION = card({
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
});

const AE_LISTING = card({
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
});

const DISCONTINUED_LISTING = card({
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
});

const SAE_LISTING = card({
  id: "C-L16.2.8",
  cardType: "LISTING",
  number: "Listing 16.2.8",
  title: "Serious Adverse Events",
  population: "SAFETY",
  chips: 20,
  mult: 0,
  topic: "SAE",
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
});

// ---------------------------------------------------------------------------
// Small Blind: Internal QC. Demographics (Table 14.1.1) under SAP-DM-001.
// ---------------------------------------------------------------------------

const demographicsRows: Row[] = [
  N_ROW,
  row("age", "Age (years), mean", { kind: "MEAN_AGE" }),
  row("female", "Female, n (%)", { kind: "SEX_COUNT_PCT", sex: "F" }),
  row("male", "Male, n (%)", { kind: "SEX_COUNT_PCT", sex: "M" }),
  row("age65", "Age ≥ 65, n (%)", {
    kind: "AGE_AT_LEAST_COUNT_PCT",
    minAge: 65,
  }),
];
const demographicsDraft = draftOf("T-14.1.1", demographicsRows);

const DEMOGRAPHICS_CLEAN = [
  ["6", "6", "12"],
  ["49.8", "40.7", "45.2"],
  ["3 (50.0)", "4 (66.7)", "7 (58.3)"],
  ["3 (50.0)", "2 (33.3)", "5 (41.7)"],
  ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
];

const demographicsCard = (id: "A" | "B" | "C"): TlfCard =>
  card({
    id: `C-T14.1.1-${id}`,
    cardType: "TABLE",
    number: "Table 14.1.1",
    title: `Demographics (Draft ${id})`,
    population: "ITT",
    chips: 30,
    mult: 1,
    topic: "DM",
    csrStage: "BASELINE",
    draftId: `T-14.1.1-${id}`,
  });

/**
 * Table 14.1.3, a blank demographics shell. The SAP allows it on the ITT or
 * the Safety population, so the player chooses its suit when allocating.
 */
const demographicsShell = (rulebookId: string): TableShellSpec => ({
  id: "T-14.1.3",
  tableNumber: "Table 14.1.3",
  title: "Demographics and Baseline Characteristics (blank shell)",
  cardType: "TABLE",
  targetPopulation: "ITT",
  compatiblePopulations: ["ITT", "SAFETY"],
  chips: 30,
  mult: 1,
  requiredRulebookId: rulebookId,
  allowedFootnoteSlots: 1,
  layout: { columns, rows: demographicsRows },
});

const DEMOGRAPHICS_BLANK = card({
  id: "C-T14.1.3",
  cardType: "TABLE",
  number: "Table 14.1.3",
  title: "Demographics",
  population: "ITT",
  chips: 30,
  mult: 1,
  topic: "DM",
  csrStage: "BASELINE",
  shellId: "T-14.1.3",
});

// Footnote seals: real table footnotes that legitimise a presentation choice.

const SPONSOR_ROUNDING: FootnoteSeal = {
  id: "FN-ROUND-SPONSOR",
  name: "Sponsor rounding standard",
  footnote:
    "Percentages and means are rounded half away from zero, per the sponsor's reporting standard (SAP §9.1, note 2).",
  effect: { kind: "WAIVE" },
  eligible: { cardTypes: ["TABLE"] },
  sellValue: 1,
};

const ADJUDICATED: FootnoteSeal = {
  id: "FN-ADJUDICATED",
  name: "Adjudicated Endpoint",
  footnote:
    "Serious events were adjudicated by an independent committee blinded to treatment.",
  effect: { kind: "PLUS_MULT", value: 3 },
  eligible: { cardTypes: ["TABLE"], populations: ["SAFETY"] },
  sellValue: 2,
};

const AE_NOT_EXCLUSIVE: FootnoteSeal = {
  id: "FN-AE-OVERLAP",
  name: "AE Not Mutually Exclusive",
  footnote:
    "A subject with more than one event is counted once in each row that applies, so rows are not mutually exclusive.",
  effect: { kind: "PLUS_CHIPS", value: 20 },
  eligible: { cardTypes: ["TABLE"], populations: ["SAFETY"], topics: ["AE"] },
  sellValue: 1,
};

/**
 * The Small Blind deck, dealt in this order. The three Table 14.1.1 drafts
 * carry reviewable cells, and the blank Table 14.1.3 shell compiles its cells
 * when an analysis set is allocated to it; the safety tables here are
 * face-only previews of what the next two Blinds put under review.
 */
const DEMOGRAPHICS_DECK: TlfCard[] = [
  demographicsCard("A"),
  DM_LISTING,
  DISPOSITION,
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
  AE_LISTING,
  DISCONTINUED_LISTING,
  demographicsCard("B"),
  demographicsCard("C"),
  DEMOGRAPHICS_BLANK,
  card({
    id: "C-T14.3.2",
    cardType: "TABLE",
    number: "Table 14.3.2.1",
    title: "AEs by SOC: Cardiac Disorders",
    population: "SAFETY",
    chips: 25,
    mult: 1,
    topic: "AE",
    csrStage: "SAFETY_AE",
    soc: CARDIAC,
    face: {
      kind: "TABLE",
      columns: ["Placebo", "Active", "Total"],
      rows: [
        { label: "Cardiac (SOC)", values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"] },
        {
          label: "Atrial fibrillation",
          values: ["0 (0.0)", "1 (16.7)", "1 (8.3)"],
        },
        { label: "Palpitations", values: ["0 (0.0)", "0 (0.0)", "0 (0.0)"] },
      ],
    },
  }),
  SAE_LISTING,
];

/**
 * Small Blind. The SAP population is ITT (N=12). FAS (N=11) is a distinct
 * population here: the SAP declares no alias, so a percentage divided by the
 * FAS N is a fatal denominator error. Rounding is half-to-even at one decimal
 * place, and the Total mean age is exactly 45.25, so the convention decides
 * between 45.2 and 45.3.
 */
export const DEMOGRAPHICS_SCENARIO: Scenario = {
  id: "demographics-small-blind",
  title: "Demographics QC Desk",
  summary:
    "Internal QC review of Table 14.1.1 (Demographics, ITT) before the first data review.",
  intro:
    "Phase I, first data review. Your own QC team checks the demographics table before anyone outside sees it. Inspect a draft, correct what the SAP forbids, and play it with its supporting listing.",
  blind: {
    tier: "SMALL_BLIND",
    name: "Small Blind: Internal QC",
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
          "Ties round half-to-even (banker's rounding): 45.25 becomes 45.2, unless the output footnotes the sponsor's half-away-from-zero standard.",
        consequence:
          "A different convention silently shifts ties and breaks double programming. Redline: −1 Mult; correcting it earns +1 Mult. The sponsor rounding footnote waives the redline.",
        correctionMultBonus: 1,
        redlineMultPenalty: 1,
        waivableBy: [SPONSOR_ROUNDING.id],
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
  populationSnapshot: POPULATION_SNAPSHOT,
  consumables: [SPONSOR_ROUNDING, ADJUDICATED],
  shells: [
    demographicsShell("SAP-DM-001"),
    {
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
  ],
  drawPile: [
    // Draft A: Total column divided by the FAS N, 2-dp precision slip,
    // half-away rounding of an exact tie.
    demographicsDraft("T-14.1.1-A", "Draft A (v0.1)", [
      ["6", "6", "12"],
      ["49.8", "40.7", "45.3"],
      ["3 (50.0)", "4 (66.67)", "7 (63.6)"],
      ["3 (50.0)", "2 (33.3)", "5 (45.5)"],
      ["1 (16.7)", "2 (33.3)", "3 (27.3)"],
    ]),
    // Draft B: one integer percentage.
    demographicsDraft("T-14.1.1-B", "Draft B (v0.2)", [
      ["6", "6", "12"],
      ["49.8", "40.7", "45.2"],
      ["3 (50)", "4 (66.7)", "7 (58.3)"],
      ["3 (50.0)", "2 (33.3)", "5 (41.7)"],
      ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    ]),
    // Draft C: clean.
    demographicsDraft("T-14.1.1-C", "Draft C (v0.3)", DEMOGRAPHICS_CLEAN),
  ],
};

// ---------------------------------------------------------------------------
// Safety outputs shared by the Big and Boss Blinds.
// ---------------------------------------------------------------------------

/** A safety rulebook: Safety population, 1 dp, half-to-even. */
const safetyRulebook = (
  id: string,
  title: string,
  rulePrefix: string,
  precisionBonus: number
): SapRulebook => ({
  id,
  title,
  populationSuit: "SAFETY",
  populationAliases: [],
  percentPrecision: 1,
  meanPrecision: 1,
  roundingMode: "HALF_EVEN",
  rules: [
    {
      id: `${rulePrefix}-01`,
      category: "DENOMINATOR",
      severity: "FATAL",
      statement:
        "Header N and every incidence use the Safety population: every subject who took study drug. FAS and Per-Protocol drop subjects who had events, so they cannot stand in for it.",
      consequence:
        "A wrong denominator hides the very subjects a safety review exists to count. While it stands, the hand's final Mult is 0.",
      correctionMultBonus: 1,
      redlineMultPenalty: 0,
    },
    {
      id: `${rulePrefix}-02`,
      category: "PRECISION",
      severity: "MINOR",
      statement: "Incidence percentages are reported to 1 decimal place.",
      consequence: `Inconsistent precision implies accuracy the data does not have. Redline: −1 Mult; correcting it earns +${precisionBonus} Mult.`,
      correctionMultBonus: precisionBonus,
      redlineMultPenalty: 1,
    },
    {
      id: `${rulePrefix}-03`,
      category: "ROUNDING",
      severity: "MINOR",
      statement: "Ties round half-to-even (banker's rounding).",
      consequence:
        "A different convention silently shifts ties and breaks double programming. Redline: −1 Mult; correcting it earns +1 Mult.",
      correctionMultBonus: 1,
      redlineMultPenalty: 1,
    },
    {
      id: `${rulePrefix}-04`,
      category: "VALUE",
      severity: "MAJOR",
      statement:
        "Incidence counts subjects, not events: a subject with several events in a System Organ Class or preferred term is counted once. Every n must reproduce from the snapshot.",
      consequence:
        "Counting events inflates incidence and double-counts the same subject. Redline: −2 Mult; correcting it earns +2 Mult.",
      correctionMultBonus: 2,
      redlineMultPenalty: 2,
    },
  ],
});

const shellOf = (
  rulebookId: string,
  id: string,
  title: string,
  chips: number
): TableShellSpec => ({
  id,
  tableNumber: `Table ${id.slice(2)}`,
  title,
  cardType: "TABLE",
  targetPopulation: "SAFETY",
  chips,
  mult: 1,
  requiredRulebookId: rulebookId,
  allowedFootnoteSlots: 1,
});

const overviewRows: Row[] = [
  N_ROW,
  row("any", "Any TEAE", { kind: "AE_SUBJECT_COUNT_PCT" }),
  row("serious", "Serious AE", { kind: "AE_SUBJECT_COUNT_PCT", serious: true }),
  row("grade3", "Grade ≥ 3 AE", { kind: "AE_SUBJECT_COUNT_PCT", minGrade: 3 }),
  row("discont", "AE to discont.", {
    kind: "AE_SUBJECT_COUNT_PCT",
    ledToDiscontinuation: true,
  }),
];

const saeRows: Row[] = [
  N_ROW,
  row("any", "Any SAE", { kind: "AE_SUBJECT_COUNT_PCT", serious: true }),
  ...["Pneumonia", "Atrial fibrillation", "Syncope"].map((term) =>
    row(term.toLowerCase().replace(/ /g, "-"), term, {
      kind: "AE_SUBJECT_COUNT_PCT",
      serious: true,
      term,
    })
  ),
];

/** A System Organ Class table: N, the SOC row, then its preferred terms. */
const socRows = (soc: string, label: string, terms: string[]): Row[] => [
  N_ROW,
  row("soc", label, { kind: "AE_SUBJECT_COUNT_PCT", soc }),
  ...terms.map((term) =>
    row(term.toLowerCase().replace(/ /g, "-"), term, {
      kind: "AE_SUBJECT_COUNT_PCT",
      soc,
      term,
    })
  ),
];

const N = ["6", "6", "12"];
const NONE = ["0 (0.0)", "0 (0.0)", "0 (0.0)"];
const ACTIVE_ONE = ["0 (0.0)", "1 (16.7)", "1 (8.3)"];
const PLACEBO_ONE = ["1 (16.7)", "0 (0.0)", "1 (8.3)"];
const EACH_ONE = ["1 (16.7)", "1 (16.7)", "2 (16.7)"];

/** Clean cells, reproduced from the snapshot by the validator's rules. */
const CLEAN = {
  overview: [
    N,
    ["3 (50.0)", "5 (83.3)", "8 (66.7)"],
    ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    ACTIVE_ONE,
  ],
  sae: [
    N,
    ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    PLACEBO_ONE,
    ACTIVE_ONE,
    ACTIVE_ONE,
  ],
  cardiac: [N, ACTIVE_ONE, ACTIVE_ONE, NONE],
  gi: [N, EACH_ONE, EACH_ONE, ACTIVE_ONE],
  general: [N, EACH_ONE, EACH_ONE, ACTIVE_ONE],
  infections: [N, PLACEBO_ONE, PLACEBO_ONE],
  nervous: [
    N,
    ["1 (16.7)", "2 (33.3)", "3 (25.0)"],
    EACH_ONE,
    ACTIVE_ONE,
    ACTIVE_ONE,
  ],
  skin: [N, ACTIVE_ONE, ACTIVE_ONE],
};

/** Copies clean cells and overwrites the given `row:col` cells. */
const withDefects = (
  clean: string[][],
  defects: Record<string, string>
): string[][] =>
  clean.map((cells, r) => cells.map((cell, c) => defects[`${r}:${c}`] ?? cell));

/** The shells, rows and card fields of each safety output. */
const SAFETY_OUTPUTS = {
  overview: {
    id: "T-14.3.1",
    title: "Overview of Treatment-Emergent Adverse Events (Safety)",
    chips: 35,
    rows: overviewRows,
    card: { title: "Overview of AEs", topic: "AE", csrStage: "SAFETY_AE" },
  },
  cardiac: {
    id: "T-14.3.2.1",
    title: "AEs by SOC and PT: Cardiac Disorders (Safety)",
    chips: 25,
    rows: socRows(CARDIAC, "Cardiac (SOC)", [
      "Atrial fibrillation",
      "Palpitations",
    ]),
    card: {
      title: "AEs by SOC: Cardiac",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: CARDIAC,
    },
  },
  gi: {
    id: "T-14.3.2.2",
    title: "AEs by SOC and PT: Gastrointestinal Disorders (Safety)",
    chips: 25,
    rows: socRows(GI, "Gastrointestinal (SOC)", ["Nausea", "Vomiting"]),
    card: {
      title: "AEs by SOC: Gastrointestinal",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: GI,
    },
  },
  general: {
    id: "T-14.3.2.3",
    title: "AEs by SOC and PT: General Disorders (Safety)",
    chips: 25,
    rows: socRows(GENERAL, "General (SOC)", [
      "Fatigue",
      "Injection site reaction",
    ]),
    card: {
      title: "AEs by SOC: General",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: GENERAL,
    },
  },
  infections: {
    id: "T-14.3.2.4",
    title: "AEs by SOC and PT: Infections and Infestations (Safety)",
    chips: 25,
    rows: socRows(INFECTIONS, "Infections (SOC)", ["Pneumonia"]),
    card: {
      title: "AEs by SOC: Infections",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: INFECTIONS,
    },
  },
  nervous: {
    id: "T-14.3.2.5",
    title: "AEs by SOC and PT: Nervous System Disorders (Safety)",
    chips: 25,
    rows: socRows(NERVOUS, "Nervous system (SOC)", [
      "Headache",
      "Syncope",
      "Dizziness",
    ]),
    card: {
      title: "AEs by SOC: Nervous System",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: NERVOUS,
    },
  },
  skin: {
    id: "T-14.3.2.6",
    title: "AEs by SOC and PT: Skin and Subcutaneous Tissue (Safety)",
    chips: 25,
    rows: socRows(SKIN, "Skin (SOC)", ["Rash"]),
    card: {
      title: "AEs by SOC: Skin",
      topic: "AE",
      csrStage: "SAFETY_AE",
      soc: SKIN,
    },
  },
  sae: {
    id: "T-14.3.3",
    title: "Serious Adverse Events by Preferred Term (Safety)",
    chips: 30,
    rows: saeRows,
    card: {
      title: "Serious Adverse Events",
      topic: "SAE",
      csrStage: "SAFETY_AE",
    },
  },
} satisfies Record<
  string,
  {
    id: string;
    title: string;
    chips: number;
    rows: Row[];
    card: Pick<TlfCard, "title" | "topic" | "csrStage" | "soc">;
  }
>;
type SafetyOutput = keyof typeof SAFETY_OUTPUTS;

/**
 * Builds a safety Blind's shells, staged drafts and draft cards from a list
 * of drafts: which output, which version letter, and the defective cells.
 */
function safetyDrafts(
  rulebookId: string,
  drafts: {
    output: SafetyOutput;
    version: string;
    label: string;
    defects?: Record<string, string>;
  }[]
) {
  const shells = new Map<SafetyOutput, TableShellSpec>();
  const drawPile: StagedTable[] = [];
  const cards = new Map<string, TlfCard>();
  for (const { output, version, label, defects } of drafts) {
    const spec = SAFETY_OUTPUTS[output];
    const shell =
      shells.get(output) ??
      shellOf(rulebookId, spec.id, spec.title, spec.chips);
    shells.set(output, shell);
    const staged = draftOf(spec.id, spec.rows)(
      `${spec.id}-${version}`,
      label,
      withDefects(CLEAN[output], defects ?? {})
    );
    drawPile.push(staged);
    cards.set(
      `${output}-${version}`,
      draftCard(staged, shell, {
        ...spec.card,
        title: `${spec.card.title} (Draft ${version})`,
      })
    );
  }
  return { shells: [...shells.values()], drawPile, cards };
}

const pick = (cards: Map<string, TlfCard>, key: string) =>
  cards.get(key) as TlfCard;

// ---------------------------------------------------------------------------
// Big Blind: Sponsor Safety Review.
// ---------------------------------------------------------------------------

const SPONSOR_RULEBOOK = safetyRulebook(
  "SAP-AE-001",
  "SAP §10.2 Adverse Events",
  "SAP-AE",
  3
);

const SPONSOR = safetyDrafts(SPONSOR_RULEBOOK.id, [
  // Active column divided by the FAS N: S-008's atrial fibrillation vanishes.
  {
    output: "overview",
    version: "A",
    label: "Draft A (v0.1)",
    defects: {
      "0:1": "5",
      "1:1": "5 (100.0)",
      "2:1": "2 (40.0)",
      "3:1": "2 (40.0)",
      "4:1": "1 (20.0)",
    },
  },
  // A 2-dp slip, and a Total that counts 13 events instead of 8 subjects.
  {
    output: "overview",
    version: "B",
    label: "Draft B (v0.2)",
    defects: { "1:1": "5 (83.33)", "1:2": "13 (108.3)" },
  },
  // One SAE too many in Active, and a 2-dp slip in Total.
  {
    output: "sae",
    version: "A",
    label: "Draft A (v0.1)",
    defects: { "1:1": "3 (50.0)", "3:2": "1 (8.33)" },
  },
  { output: "sae", version: "B", label: "Draft B (v0.2)" },
  // S-010's syncope and dizziness counted as two subjects.
  {
    output: "nervous",
    version: "A",
    label: "Draft A (v0.1)",
    defects: { "1:1": "3 (50.0)", "1:2": "4 (33.3)" },
  },
  { output: "cardiac", version: "A", label: "Draft A (v0.1)" },
  // S-007's nausea and vomiting counted as two subjects.
  {
    output: "gi",
    version: "A",
    label: "Draft A (v0.1)",
    defects: { "1:1": "2 (33.3)" },
  },
  // Reruns at the bottom of the deck. After S-004 leaves the Safety set,
  // they are what sending stale drafts back to programming brings in.
  { output: "sae", version: "C", label: "Draft C (v0.3)" },
  {
    output: "overview",
    version: "C",
    label: "Draft C (v0.3)",
    defects: { "2:2": "3 (25.00)" },
  },
  { output: "skin", version: "B", label: "Draft B (v0.2)" },
]);

/**
 * Big Blind. The sponsor's safety physician reviews the AE overview, the SAE
 * table and SOC tables under SAP-AE-001. The traps are the FAS denominator,
 * which silently drops S-008, and counting events instead of subjects.
 *
 * After the first hand, S-004 is found never to have been dosed and leaves
 * the Safety population (SNAP-P1-v2). The Safety drafts still in hand go
 * stale; ITT outputs stay valid; the Dose Escalation Committee inherits v2.
 */
export const SPONSOR_SAFETY_SCENARIO: Scenario = {
  id: "sponsor-safety-big-blind",
  title: "Sponsor Safety Review",
  summary:
    "The sponsor's safety physician reviews the adverse event tables (Safety population) before the committee meets.",
  intro:
    "The sponsor's safety physician wants the adverse event tables. Incidence counts subjects, not events, and every percentage divides by the Safety population. A table built on FAS quietly loses S-008's atrial fibrillation.",
  blind: {
    tier: "BIG_BLIND",
    name: "Big Blind: Sponsor Safety Review",
    quota: 750,
  },
  handType: "HIGH_TABLE",
  startingCpu: 6,
  table: { startingCpu: 10, handSize: 8, maxSelection: 5 },
  deck: [
    pick(SPONSOR.cards, "overview-A"),
    AE_LISTING,
    pick(SPONSOR.cards, "sae-A"),
    SAE_LISTING,
    pick(SPONSOR.cards, "nervous-A"),
    DISPOSITION,
    DISCONTINUED_LISTING,
    pick(SPONSOR.cards, "overview-B"),
    pick(SPONSOR.cards, "cardiac-A"),
    pick(SPONSOR.cards, "sae-B"),
    DM_LISTING,
    pick(SPONSOR.cards, "gi-A"),
    pick(SPONSOR.cards, "sae-C"),
    pick(SPONSOR.cards, "overview-C"),
    pick(SPONSOR.cards, "skin-B"),
  ],
  rulebook: SPONSOR_RULEBOOK,
  populationSnapshot: POPULATION_SNAPSHOT,
  consumables: [AE_NOT_EXCLUSIVE],
  shells: SPONSOR.shells,
  drawPile: SPONSOR.drawPile,
  events: [
    {
      afterHands: 1,
      transition: {
        id: "EV-P1-S004-UNDOSED",
        subjectId: "S-004",
        reason: "DROPOUT",
        change: "LEAVE",
        populations: ["SAFETY"],
        effectiveAt: "2026-02-02T09:00:00Z",
        description:
          "Site query resolved: S-004 withdrew consent before the first dose and was never dosed. S-004 stays randomized (ITT) but leaves the Safety population.",
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Boss Blind: Dose Escalation Committee.
// ---------------------------------------------------------------------------

const COMMITTEE_RULEBOOK = safetyRulebook(
  "SAP-SAF-001",
  "DEC Charter §4 Safety Data for Dose Escalation",
  "SAP-SAF",
  4
);

const COMMITTEE = safetyDrafts(COMMITTEE_RULEBOOK.id, [
  {
    output: "nervous",
    version: "B",
    label: "Draft B (v0.2)",
    defects: { "2:2": "2 (16.67)" },
  },
  { output: "cardiac", version: "B", label: "Draft B (v0.2)" },
  // Total column divided by the Per-Protocol N.
  {
    output: "gi",
    version: "B",
    label: "Draft B (v0.2)",
    defects: {
      "0:2": "9",
      "1:2": "2 (22.2)",
      "2:2": "2 (22.2)",
      "3:2": "1 (11.1)",
    },
  },
  // S-011's two events counted as two subjects.
  {
    output: "general",
    version: "A",
    label: "Draft A (v0.1)",
    defects: { "1:1": "2 (33.3)", "1:2": "3 (25.0)" },
  },
  { output: "infections", version: "A", label: "Draft A (v0.1)" },
  {
    output: "skin",
    version: "A",
    label: "Draft A (v0.1)",
    defects: { "1:2": "1 (8.33)" },
  },
  { output: "overview", version: "C", label: "Draft C (v0.3)" },
]);

/**
 * Boss Blind. The Dose Escalation Committee decides whether the next cohort
 * doses. It reads the Safety population only: every output built on another
 * population scores 0 Chips (DEC-SAFETY-ONLY).
 */
export const DOSE_ESCALATION_SCENARIO: Scenario = {
  id: "dose-escalation-boss-blind",
  title: "Dose Escalation Committee",
  summary:
    "The Dose Escalation Committee reviews the safety tables to decide whether the next cohort doses.",
  intro:
    "The committee decides whether the next cohort doses, and it reads only the Safety population. Anything built on ITT scores no Chips here, however clean. Five SOC tables together make a MedDRA Five of a Kind.",
  blind: {
    tier: "BOSS_BLIND",
    name: "Boss Blind: Dose Escalation Committee",
    quota: 1500,
  },
  boss: {
    id: "DEC-SAFETY-ONLY",
    name: "Safety Set Only",
    description:
      "The committee reviews the Safety population only. Outputs built on any other population score 0 Chips.",
    debuffType: "DISABLE_POPULATION",
    disabledPopulations: ["SCREENED", "ITT", "PER_PROTOCOL", "FAS"],
  },
  handType: "HIGH_TABLE",
  startingCpu: 6,
  table: { startingCpu: 10, handSize: 8, maxSelection: 5 },
  deck: [
    pick(COMMITTEE.cards, "nervous-B"),
    DISPOSITION,
    pick(COMMITTEE.cards, "cardiac-B"),
    AE_LISTING,
    pick(COMMITTEE.cards, "gi-B"),
    card({
      id: "C-T14.1.1",
      cardType: "TABLE",
      number: "Table 14.1.1",
      title: "Demographics (Final)",
      population: "ITT",
      chips: 30,
      mult: 1,
      topic: "DM",
      csrStage: "BASELINE",
      face: {
        kind: "TABLE",
        columns: ["Placebo", "Active", "Total"],
        rows: demographicsRows.map((r, i) => ({
          label: r.label,
          values: DEMOGRAPHICS_CLEAN[i],
        })),
      },
    }),
    pick(COMMITTEE.cards, "general-A"),
    SAE_LISTING,
    DEMOGRAPHICS_BLANK,
    pick(COMMITTEE.cards, "infections-A"),
    pick(COMMITTEE.cards, "overview-C"),
    pick(COMMITTEE.cards, "skin-A"),
    DISCONTINUED_LISTING,
  ],
  rulebook: COMMITTEE_RULEBOOK,
  populationSnapshot: POPULATION_SNAPSHOT,
  shells: [...COMMITTEE.shells, demographicsShell(COMMITTEE_RULEBOOK.id)],
  drawPile: COMMITTEE.drawPile,
};

/** Act I: the Phase I safety study, Small to Boss. */
export const ACT_I: Act = {
  id: "act-1-phase-1",
  title: "Act I: Phase I Safety",
  blinds: [
    DEMOGRAPHICS_SCENARIO,
    SPONSOR_SAFETY_SCENARIO,
    DOSE_ESCALATION_SCENARIO,
  ],
};

/** Every playable scenario, keyed by id. */
export const SCENARIOS: Readonly<Record<string, Scenario>> = Object.freeze(
  Object.fromEntries(ACT_I.blinds.map((scenario) => [scenario.id, scenario]))
);
