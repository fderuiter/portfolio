export interface Study {
  studyID: string;
  name: string;
  status: "ACTIVE" | "ENROLLING" | "COMPLETED";
  subjectsCount: number;
  version: string;
}

export interface SubjectDemographics {
  age: number;
  gender: string;
  ethnicity: string;
}

export interface Subject {
  subjectID: string;
  studyID: string;
  siteID: number;
  enrollmentDate: string;
  status: string;
  recordsCount: number;
  complianceScore: string;
  demographics: SubjectDemographics;
  lastVisit: string;
}

export interface RecordItem {
  subjectID: string;
  visitName: string;
  heartRate: number;
  tempCelsius: number;
  systolicBP: number;
  diastolicBP: number;
  timestamp: string;
}

export interface RecordsSearchResult {
  studyID: string;
  totalRecordsMatched: number;
  domain: string;
  results: RecordItem[];
}

// Map the strict command names to their precise payload structures
export interface CommandPayloadMap {
  "imednet studies list": Study[];
  "imednet subjects get --id 123": Subject;
  "imednet records search --study BRIGHT-01": RecordsSearchResult;
}

export type CommandName = keyof CommandPayloadMap;

export interface CommandDefinition<T extends CommandName> {
  description: string;
  payload: CommandPayloadMap[T];
}

export type CommandRegistry = {
  [K in CommandName]: CommandDefinition<K>;
};

export const COMMAND_REGISTRY: CommandRegistry = {
  "imednet studies list": {
    description: "Retrieve a list of all active clinical trials from the iMednet EDC platform.",
    payload: [
      {
        studyID: "BRIGHT-01",
        name: "Phase III Pediatric Leukemia Study",
        status: "ACTIVE",
        subjectsCount: 142,
        version: "v4.2.1",
      },
      {
        studyID: "ONCO-2026",
        name: "Advanced Melanoma Immunotherapy Trial",
        status: "ENROLLING",
        subjectsCount: 89,
        version: "v1.0.8",
      },
      {
        studyID: "CARDIO-REF",
        name: "Congestive Heart Failure Observational Registry",
        status: "COMPLETED",
        subjectsCount: 310,
        version: "v2.5.0",
      },
    ],
  },
  "imednet subjects get --id 123": {
    description: "Query specific details and records for subject 123 (HIPAA-anonymized).",
    payload: {
      subjectID: "SUB-123",
      studyID: "BRIGHT-01",
      siteID: 401,
      enrollmentDate: "2025-11-12",
      status: "COMPLETED",
      recordsCount: 18,
      complianceScore: "[VERIFY_SECURITY_LOGS]",
      demographics: {
        age: 11,
        gender: "F",
        ethnicity: "ANONYMIZED_UNDER_HIPAA_SAFE_HARBOR",
      },
      lastVisit: "2026-05-10T14:30Z",
    },
  },
  "imednet records search --study BRIGHT-01": {
    description: "Search dynamic patient records and EDC form entries matching active trials.",
    payload: {
      studyID: "BRIGHT-01",
      totalRecordsMatched: 3,
      domain: "VS (Vital Signs)",
      results: [
        {
          subjectID: "SUB-101",
          visitName: "Week 4 Follow-up",
          heartRate: 72,
          tempCelsius: 36.8,
          systolicBP: 110,
          diastolicBP: 72,
          timestamp: "2026-05-20T08:30Z",
        },
        {
          subjectID: "SUB-102",
          visitName: "Week 4 Follow-up",
          heartRate: 84,
          tempCelsius: 37.1,
          systolicBP: 115,
          diastolicBP: 76,
          timestamp: "2026-05-20T09:15Z",
        },
        {
          subjectID: "SUB-103",
          visitName: "Week 4 Follow-up",
          heartRate: 68,
          tempCelsius: 36.6,
          systolicBP: 108,
          diastolicBP: 70,
          timestamp: "2026-05-20T10:00Z",
        },
      ],
    },
  },
};
