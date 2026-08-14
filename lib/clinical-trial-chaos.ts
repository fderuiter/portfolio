export type ClinicalDomain = "DM" | "VS" | "LB" | "AE";

export interface ClinicalObservation {
  field: string;
  value: string;
  correction?: string;
  destination: ClinicalDomain;
}

export interface ClinicalScenario {
  id: string;
  subjectLabel: string;
  observations: readonly ClinicalObservation[];
}

/** Entirely fictional data for an educational game; never use patient data here. */
export const clinicalChaosScenarios: readonly ClinicalScenario[] = [
  {
    id: "bright-001",
    subjectLabel: "SIM-001",
    observations: [
      { field: "Height", value: "180 m", correction: "180 cm", destination: "DM" },
      { field: "Systolic BP", value: "120 mmHg", destination: "VS" },
    ],
  },
];
