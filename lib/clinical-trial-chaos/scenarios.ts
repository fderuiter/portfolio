import {
  CDISCDomain,
  ClinicalObservation,
  ClinicalSubject,
  ProtocolAmendment,
  StationConfig,
  ValidationErrorType,
} from "./types";

export interface MockObservationTemplate {
  field: string;
  destination: CDISCDomain;
  validValues: string[];
  corruptions: {
    rawValue: string;
    correctedValue: string;
    errorType: ValidationErrorType;
    hint: string;
  }[];
}

export const MOCK_OBSERVATION_TEMPLATES: MockObservationTemplate[] = [
  // DM (Demographics)
  {
    field: "Height",
    destination: "DM",
    validValues: ["175 cm", "168 cm", "182 cm", "159 cm", "190 cm"],
    corruptions: [
      { rawValue: "180 m", correctedValue: "180 cm", errorType: "unit-error", hint: "Meters unit anomaly (expected cm)" },
      { rawValue: "1750 cm", correctedValue: "175 cm", errorType: "range-outlier", hint: "Extra zero outlier (>300cm)" },
      { rawValue: "-168 cm", correctedValue: "168 cm", errorType: "negative-value", hint: "Negative height recorded" },
    ],
  },
  {
    field: "Weight",
    destination: "DM",
    validValues: ["72.5 kg", "68.0 kg", "84.2 kg", "55.9 kg"],
    corruptions: [
      { rawValue: "-75 kg", correctedValue: "75 kg", errorType: "negative-value", hint: "Negative weight recorded" },
      { rawValue: "700 kg", correctedValue: "70 kg", errorType: "range-outlier", hint: "Typo in weight decimal" },
      { rawValue: "150 lbs", correctedValue: "68 kg", errorType: "unit-error", hint: "Imperial pounds instead of metric kg" },
    ],
  },
  {
    field: "Date of Birth",
    destination: "DM",
    validValues: ["1985-04-12", "1992-11-03", "1978-08-25", "2001-02-17"],
    corruptions: [
      { rawValue: "13/25/1990", correctedValue: "1990-12-25", errorType: "invalid-date", hint: "Month 13 does not exist (ISO standard required)" },
      { rawValue: "1995-02-30", correctedValue: "1995-02-28", errorType: "invalid-date", hint: "Feb 30 invalid calendar day" },
    ],
  },
  {
    field: "Sex at Birth",
    destination: "DM",
    validValues: ["M", "F"],
    corruptions: [
      { rawValue: "male", correctedValue: "M", errorType: "casing-mismatch", hint: "CDISC Controlled Terminology requires 'M' or 'F'" },
      { rawValue: "female", correctedValue: "F", errorType: "casing-mismatch", hint: "CDISC Controlled Terminology requires 'M' or 'F'" },
    ],
  },

  // VS (Vital Signs)
  {
    field: "Systolic BP",
    destination: "VS",
    validValues: ["118 mmHg", "122 mmHg", "130 mmHg", "110 mmHg"],
    corruptions: [
      { rawValue: "12", correctedValue: "120 mmHg", errorType: "missing-digit", hint: "Missing digit (12 mmHg is fatal)" },
      { rawValue: "1200 mmHg", correctedValue: "120 mmHg", errorType: "range-outlier", hint: "Explosive pressure typo" },
      { rawValue: "125 psi", correctedValue: "125 mmHg", errorType: "unit-error", hint: "Tire pressure unit (expected mmHg)" },
    ],
  },
  {
    field: "Diastolic BP",
    destination: "VS",
    validValues: ["78 mmHg", "82 mmHg", "70 mmHg", "85 mmHg"],
    corruptions: [
      { rawValue: "8", correctedValue: "80 mmHg", errorType: "missing-digit", hint: "Missing trailing zero" },
      { rawValue: "-80 mmHg", correctedValue: "80 mmHg", errorType: "negative-value", hint: "Negative diastolic reading" },
    ],
  },
  {
    field: "Heart Rate",
    destination: "VS",
    validValues: ["68 bpm", "72 bpm", "80 bpm", "62 bpm"],
    corruptions: [
      { rawValue: "720 bpm", correctedValue: "72 bpm", errorType: "range-outlier", hint: "Supra-physiological tachy-typo (>300 bpm)" },
      { rawValue: "7 bpm", correctedValue: "70 bpm", errorType: "missing-digit", hint: "Missing digit for heart rate" },
    ],
  },
  {
    field: "Body Temp",
    destination: "VS",
    validValues: ["36.8 °C", "37.1 °C", "36.6 °C", "37.0 °C"],
    corruptions: [
      { rawValue: "98.6 °F", correctedValue: "37.0 °C", errorType: "unit-error", hint: "Fahrenheit recorded in Celsius trial form" },
      { rawValue: "370 °C", correctedValue: "37.0 °C", errorType: "range-outlier", hint: "Missing decimal point" },
    ],
  },

  // AE (Adverse Events)
  {
    field: "Adverse Event Term",
    destination: "AE",
    validValues: ["Mild Headache (Grade 1)", "Nausea (Grade 1)", "Fatigue (Grade 1)", "No AE reported"],
    corruptions: [
      { rawValue: "headache bad", correctedValue: "Headache (Grade 2)", errorType: "casing-mismatch", hint: "Map free-text to MedDRA PT: Headache" },
      { rawValue: "PATIENT DIZZY", correctedValue: "Dizziness (Grade 1)", errorType: "casing-mismatch", hint: "Standardize MedDRA Preferred Term capitalization" },
    ],
  },
  {
    field: "AE Severity Grade",
    destination: "AE",
    validValues: ["Grade 1 (Mild)", "Grade 2 (Moderate)", "Grade 3 (Severe)"],
    corruptions: [
      { rawValue: "Grade 9", correctedValue: "Grade 3 (Severe)", errorType: "range-outlier", hint: "CTCAE max severity scale is 1 to 5" },
    ],
  },
  {
    field: "AE Serious Criteria",
    destination: "AE",
    validValues: ["No", "Yes (Hospitalization Required)", "Yes (Life Threatening)"],
    corruptions: [
      { rawValue: "maybe", correctedValue: "No", errorType: "casing-mismatch", hint: "Binary regulatory criteria (Yes/No required)" },
    ],
  },

  // LB (Laboratory)
  {
    field: "Serum Creatinine",
    destination: "LB",
    validValues: ["0.9 mg/dL", "1.1 mg/dL", "0.8 mg/dL", "1.2 mg/dL"],
    corruptions: [
      { rawValue: "90 mg/dL", correctedValue: "0.9 mg/dL", errorType: "range-outlier", hint: "Missing leading zero decimal" },
      { rawValue: "-1.0 mg/dL", correctedValue: "1.0 mg/dL", errorType: "negative-value", hint: "Negative biochemistry concentration" },
    ],
  },
  {
    field: "ALT (Alanine Aminotransferase)",
    destination: "LB",
    validValues: ["24 U/L", "31 U/L", "19 U/L", "40 U/L"],
    corruptions: [
      { rawValue: "2400 U/L", correctedValue: "24 U/L", errorType: "range-outlier", hint: "Check sample dilution / decimal error" },
    ],
  },
  {
    field: "White Blood Cells",
    destination: "LB",
    validValues: ["6.2 x10^9/L", "7.5 x10^9/L", "5.1 x10^9/L", "8.9 x10^9/L"],
    corruptions: [
      { rawValue: "6200000000000 /L", correctedValue: "6.2 x10^9/L", errorType: "unit-error", hint: "Scientific notation normalization required" },
    ],
  },
];

export const INITIAL_STATIONS: StationConfig[] = [
  {
    id: "DM",
    name: "Demographics",
    label: "DM Station",
    description: "Subject demographics, age, sex, height, weight standardisation",
    color: "#3b82f6",
    accentColor: "rgba(59, 130, 246, 0.2)",
    positionIndex: 0,
    vendor: "iMednet",
    pendingSubjects: [],
    processedCount: 0,
  },
  {
    id: "VS",
    name: "Vital Signs",
    label: "VS Station",
    description: "Blood pressure, heart rate, temperature, respiratory metrics",
    color: "#10b981",
    accentColor: "rgba(16, 185, 129, 0.2)",
    positionIndex: 1,
    vendor: "Veeva Vault",
    pendingSubjects: [],
    processedCount: 0,
  },
  {
    id: "AE",
    name: "Adverse Events",
    label: "AE Station",
    description: "MedDRA coding, CTCAE grading, SAE regulatory triage",
    color: "#f59e0b",
    accentColor: "rgba(245, 158, 11, 0.2)",
    positionIndex: 2,
    vendor: "iMednet",
    pendingSubjects: [],
    processedCount: 0,
  },
  {
    id: "LB",
    name: "Laboratory",
    label: "LB Station",
    description: "Serum chemistry, hematology, urinalysis, reference ranges",
    color: "#8b5cf6",
    accentColor: "rgba(139, 92, 246, 0.2)",
    positionIndex: 3,
    vendor: "OpenClinica",
    pendingSubjects: [],
    processedCount: 0,
  },
];

export const AMENDMENT_PRESETS: ProtocolAmendment[] = [
  {
    id: "amd-001",
    version: "Protocol v2.1",
    title: "Station Layout Scramble",
    description: "IRB approved site workflow restructuring — station conveyor slots swapped!",
    type: "station-scramble",
    durationSeconds: 18,
    timeRemaining: 18,
    active: false,
  },
  {
    id: "amd-002",
    version: "Safety Alert v4.0",
    title: "SAE Emergency Expedited Priority",
    description: "Serious Adverse Event reported! Urgent 24-hr FDA expedited report required.",
    type: "sae-priority-rush",
    durationSeconds: 15,
    timeRemaining: 15,
    active: false,
  },
  {
    id: "amd-003",
    version: "Protocol v3.0",
    title: "Metric Normalization Mandate",
    description: "Global harmonization: All imperial units must be converted to metric immediately.",
    type: "unit-shift-lbs-to-kg",
    durationSeconds: 20,
    timeRemaining: 20,
    active: false,
  },
];

const STUDY_SITES = [
  "Site 014 (Boston General)",
  "Site 022 (Charité Berlin)",
  "Site 008 (Mount Sinai NYC)",
  "Site 041 (Mayo Clinic Rochester)",
  "Site 019 (Karolinska Solna)",
  "Site 033 (Oxford Clinical Hub)",
];

let globalSubjSeq = 1001;

/**
 * Generates a random or seeded ClinicalSubject with 2-4 observations.
 * @param errorProbability Probability that any given observation has a typo/anomaly (0 to 1).
 * @param forceSAE Whether this subject is an emergency SAE priority rush.
 */
export function generateClinicalSubject(
  errorProbability = 0.5,
  forceSAE = false,
  customSeq?: number
): ClinicalSubject {
  const seq = customSeq ?? globalSubjSeq++;
  const subjectLabel = `SUBJ-${seq}`;
  const siteIndex = (seq % STUDY_SITES.length);
  const studySite = STUDY_SITES[siteIndex];

  // Pick 2 to 3 observations across different CDISC domains
  const pickedTemplates = [...MOCK_OBSERVATION_TEMPLATES]
    .sort(() => 0.5 - Math.random())
    .slice(0, forceSAE ? 3 : Math.floor(Math.random() * 2) + 2);

  // If forceSAE, guarantee at least one AE observation
  if (forceSAE && !pickedTemplates.some((t) => t.destination === "AE")) {
    const aeTemplate = MOCK_OBSERVATION_TEMPLATES.find((t) => t.destination === "AE");
    if (aeTemplate) pickedTemplates[0] = aeTemplate;
  }

  const observations: ClinicalObservation[] = pickedTemplates.map((template, idx) => {
    const hasError = Math.random() < errorProbability;
    if (hasError && template.corruptions.length > 0) {
      const corruption = template.corruptions[Math.floor(Math.random() * template.corruptions.length)];
      return {
        id: `obs-${seq}-${idx}`,
        field: template.field,
        rawValue: corruption.rawValue,
        correctedValue: corruption.correctedValue,
        currentValue: corruption.rawValue,
        destination: template.destination,
        errorType: corruption.errorType,
        hint: corruption.hint,
        isResolved: false,
      };
    } else {
      const validVal = template.validValues[Math.floor(Math.random() * template.validValues.length)];
      return {
        id: `obs-${seq}-${idx}`,
        field: template.field,
        rawValue: validVal,
        currentValue: validVal,
        destination: template.destination,
        isResolved: true,
      };
    }
  });

  const maxTime = forceSAE ? 20 : 35;

  return {
    id: `subject-${seq}-${Date.now()}`,
    subjectLabel,
    studySite,
    observations,
    status: "queued",
    isSAE: forceSAE,
    timeRemaining: maxTime,
    maxTime,
    createdAt: Date.now(),
  };
}

/** Pre-seeded scenario list for tests and deterministic introductory rounds. */
export const SEEDED_SCENARIOS: readonly ClinicalSubject[] = [
  {
    id: "seeded-001",
    subjectLabel: "SUBJ-1001",
    studySite: "Site 014 (Boston General)",
    status: "queued",
    timeRemaining: 40,
    maxTime: 40,
    createdAt: 1000,
    observations: [
      {
        id: "obs-1001-1",
        field: "Height",
        rawValue: "180 m",
        correctedValue: "180 cm",
        currentValue: "180 m",
        destination: "DM",
        errorType: "unit-error",
        hint: "Meters unit anomaly (expected cm)",
        isResolved: false,
      },
      {
        id: "obs-1001-2",
        field: "Systolic BP",
        rawValue: "120 mmHg",
        currentValue: "120 mmHg",
        destination: "VS",
        isResolved: true,
      },
    ],
  },
  {
    id: "seeded-002",
    subjectLabel: "SUBJ-1002",
    studySite: "Site 022 (Charité Berlin)",
    status: "queued",
    timeRemaining: 40,
    maxTime: 40,
    createdAt: 1001,
    observations: [
      {
        id: "obs-1002-1",
        field: "Date of Birth",
        rawValue: "13/25/1990",
        correctedValue: "1990-12-25",
        currentValue: "13/25/1990",
        destination: "DM",
        errorType: "invalid-date",
        hint: "Month 13 does not exist (ISO standard required)",
        isResolved: false,
      },
      {
        id: "obs-1002-2",
        field: "Weight",
        rawValue: "-75 kg",
        correctedValue: "75 kg",
        currentValue: "-75 kg",
        destination: "DM",
        errorType: "negative-value",
        hint: "Negative weight recorded",
        isResolved: false,
      },
    ],
  },
  {
    id: "seeded-003",
    subjectLabel: "SUBJ-1003",
    studySite: "Site 008 (Mount Sinai NYC)",
    status: "queued",
    isSAE: true,
    timeRemaining: 25,
    maxTime: 25,
    createdAt: 1002,
    observations: [
      {
        id: "obs-1003-1",
        field: "Adverse Event Term",
        rawValue: "headache bad",
        correctedValue: "Headache (Grade 2)",
        currentValue: "headache bad",
        destination: "AE",
        errorType: "casing-mismatch",
        hint: "Map free-text to MedDRA PT: Headache",
        isResolved: false,
      },
      {
        id: "obs-1003-2",
        field: "Serum Creatinine",
        rawValue: "0.9 mg/dL",
        currentValue: "0.9 mg/dL",
        destination: "LB",
        isResolved: true,
      },
    ],
  },
];
