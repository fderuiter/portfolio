/**
 * Clinical Smart Blocks Engine
 * Provides standardized CDASH-compliant compound section bundles and atomic field templates
 * for in-canvas slash command palettes (`/vitals`, `/recist`, `/conmeds`, `/ae`, etc.).
 */

import { CRFSection, CRFField, EditCheckRule, FieldDataType } from "./types";

export type SlashCommandCategory = "smart_block" | "widget" | "layout";

export interface ClinicalSmartBlockDefinition {
  id: string;
  title: string;
  description: string;
  category: SlashCommandCategory;
  iconName: string;
  cdashDomain: string;
  command: string;
  keywords: string[];
  variableCount: number;
  hasRules: boolean;
  factory: () => { section: CRFSection; rules: EditCheckRule[] };
}

export interface SlashCommandItem {
  id: string;
  title: string;
  description: string;
  category: SlashCommandCategory;
  command: string;
  keywords: string[];
  badge?: string;
  action: "insert_smart_block" | "insert_field" | "insert_section";
  smartBlockId?: string;
  fieldTemplate?: Partial<CRFField>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Compound Clinical Smart Blocks
// ─────────────────────────────────────────────────────────────────────────────

export const CLINICAL_SMART_BLOCKS: ClinicalSmartBlockDefinition[] = [
  {
    id: "vitals",
    title: "Vital Signs & Anthropometrics",
    description: "Standard 7-field panel (BP, Pulse, Temp, Weight, Height) with automated BMI formula and BP validation.",
    category: "smart_block",
    iconName: "IconHeartRateMonitor",
    cdashDomain: "VS",
    command: "/vitals",
    keywords: ["vitals", "blood pressure", "pulse", "temperature", "weight", "height", "bmi", "vs"],
    variableCount: 7,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_vs_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_sysbp_${now}`,
          name: "SYSBP",
          variableName: "SYSBP",
          label: "Systolic Blood Pressure",
          dataType: "integer",
          unit: "mmHg",
          required: true,
          validation: { min: 60, max: 250 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=SYSBP]",
            coreDesignation: "HR",
            implementationNotes: "Sitting/Resting SBP measurement",
          },
        },
        {
          id: `f_diabp_${now}`,
          name: "DIABP",
          variableName: "DIABP",
          label: "Diastolic Blood Pressure",
          dataType: "integer",
          unit: "mmHg",
          required: true,
          validation: { min: 30, max: 150 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=DIABP]",
            coreDesignation: "HR",
            implementationNotes: "Sitting/Resting DBP measurement",
          },
        },
        {
          id: `f_pulse_${now}`,
          name: "PULSE",
          variableName: "PULSE",
          label: "Heart Rate / Pulse",
          dataType: "integer",
          unit: "beats/min",
          required: true,
          validation: { min: 30, max: 220 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=PULSE]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_temp_${now}`,
          name: "TEMP",
          variableName: "TEMP",
          label: "Body Temperature",
          dataType: "decimal",
          unit: "°C",
          required: true,
          validation: { min: 34.0, max: 43.0 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=TEMP]",
            coreDesignation: "O",
          },
        },
        {
          id: `f_weight_${now}`,
          name: "WEIGHT",
          variableName: "WEIGHT",
          label: "Body Weight",
          dataType: "decimal",
          unit: "kg",
          required: true,
          validation: { min: 2.0, max: 350.0 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=WEIGHT]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_height_${now}`,
          name: "HEIGHT",
          variableName: "HEIGHT",
          label: "Standing Height",
          dataType: "decimal",
          unit: "cm",
          required: true,
          validation: { min: 30.0, max: 250.0 },
          widthCols: 6,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=HEIGHT]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_bmi_${now}`,
          name: "BMI",
          variableName: "BMI",
          label: "Body Mass Index (Calculated)",
          dataType: "derived",
          unit: "kg/m²",
          calculationFormula: "WEIGHT / ((HEIGHT / 100) * (HEIGHT / 100))",
          isReadOnly: true,
          widthCols: 12,
          cdashMetadata: {
            domain: "VS",
            sdtmTarget: "VS.VSSTRESN [VSTESTCD=BMI]",
            coreDesignation: "O",
            implementationNotes: "Automated Quetelet index derivation",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_sys_dia_${now}`,
          name: "Systolic Must Exceed Diastolic Blood Pressure",
          description: "Flags discrepancy if systolic BP is less than or equal to diastolic BP.",
          severity: "error",
          triggerFields: ["SYSBP", "DIABP"],
          targetFields: ["SYSBP", "DIABP"],
          action: "show_query",
          queryMessage: "Systolic Blood Pressure must exceed Diastolic Blood Pressure.",
          astCondition: {
            type: "logical",
            operator: "AND",
            children: [
              { type: "comparison", fieldId: "SYSBP", operator: "!=", value: null },
              { type: "comparison", fieldId: "DIABP", operator: "!=", value: null },
              { type: "comparison", fieldId: "SYSBP", operator: "<=", value: "$DIABP" },
            ],
          },
        },
        {
          id: `rule_bmi_range_${now}`,
          name: "BMI Plausibility Range Verification",
          description: "Warns if calculated BMI is outside normal clinical bounds (10-60 kg/m²).",
          severity: "warning",
          triggerFields: ["BMI"],
          targetFields: ["BMI"],
          action: "show_query",
          queryMessage: "Calculated Body Mass Index is outside standard clinical envelope (10-60 kg/m²).",
          astCondition: {
            type: "logical",
            operator: "OR",
            children: [
              { type: "comparison", fieldId: "BMI", operator: "<", value: 10 },
              { type: "comparison", fieldId: "BMI", operator: ">", value: 60 },
            ],
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Vital Signs & Anthropometrics",
          fields,
        },
        rules,
      };
    },
  },
  {
    id: "recist",
    title: "Oncology RECIST 1.1 Tumor Assessment",
    description: "Target lesion tracking with anatomical site, modality, longest diameter, and sum of diameters.",
    category: "smart_block",
    iconName: "IconTarget",
    cdashDomain: "TR",
    command: "/recist",
    keywords: ["recist", "tumor", "oncology", "lesion", "sld", "tr", "response"],
    variableCount: 6,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_recist_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_trlinkid_${now}`,
          name: "TRLINKID",
          variableName: "TRLINKID",
          label: "Target Lesion ID / Code",
          dataType: "text",
          required: true,
          widthCols: 4,
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRLINKID",
            coreDesignation: "HR",
            implementationNotes: "Unique lesion identifier (e.g. TL01, TL02)",
          },
        },
        {
          id: `f_trloc_${now}`,
          name: "TRLOC",
          variableName: "TRLOC",
          label: "Lesion Anatomical Location",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Lung", value: "LUNG" },
            { label: "Liver", value: "LIVER" },
            { label: "Lymph Node", value: "LYMPH_NODE" },
            { label: "Bone", value: "BONE" },
            { label: "Brain", value: "BRAIN" },
            { label: "Soft Tissue", value: "SOFT_TISSUE" },
          ],
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRLOC",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_trmeth_${now}`,
          name: "TRMETHOD",
          variableName: "TRMETHOD",
          label: "Imaging Modality / Assessment Method",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "CT with IV Contrast", value: "CT_CONTRAST" },
            { label: "MRI", value: "MRI" },
            { label: "PET-CT", value: "PET_CT" },
            { label: "Chest X-Ray", value: "XRAY" },
            { label: "Physical Examination", value: "PHYSICAL_EXAM" },
          ],
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRMETHOD",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_trldiam_${now}`,
          name: "TRLDIAM",
          variableName: "TRLDIAM",
          label: "Longest Diameter",
          dataType: "decimal",
          unit: "mm",
          required: true,
          validation: { min: 0.0, max: 300.0 },
          widthCols: 6,
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRORRES [TRTESTCD=LDIAM]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_trsld_${now}`,
          name: "TRSLD",
          variableName: "TRSLD",
          label: "Sum of Longest Diameters (SLD)",
          dataType: "derived",
          unit: "mm",
          calculationFormula: "TRLDIAM",
          isReadOnly: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRSTRESN [TRTESTCD=SLD]",
            coreDesignation: "O",
          },
        },
        {
          id: `f_trresp_${now}`,
          name: "TRRESP",
          variableName: "TRRESP",
          label: "Target Lesion Response Evaluation",
          dataType: "single_select",
          required: true,
          widthCols: 12,
          customOptions: [
            { label: "Complete Response (CR)", value: "CR" },
            { label: "Partial Response (PR)", value: "PR" },
            { label: "Stable Disease (SD)", value: "SD" },
            { label: "Progressive Disease (PD)", value: "PD" },
            { label: "Not Evaluable (NE)", value: "NE" },
          ],
          cdashMetadata: {
            domain: "TR",
            sdtmTarget: "TR.TRRESP",
            coreDesignation: "HR",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_recist_min_size_${now}`,
          name: "RECIST 1.1 Target Lesion Measurability Check",
          description: "Flags notice if target lesion longest diameter is under 10 mm on cross-sectional imaging.",
          severity: "warning",
          triggerFields: ["TRLDIAM"],
          targetFields: ["TRLDIAM"],
          action: "show_query",
          queryMessage: "Target measurable lesions should measure >= 10 mm on CT/MRI per RECIST 1.1 criteria.",
          astCondition: {
            type: "comparison",
            fieldId: "TRLDIAM",
            operator: "<",
            value: 10,
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Oncology RECIST 1.1 Tumor Assessment",
          fields,
        },
        rules,
      };
    },
  },
  {
    id: "conmeds",
    title: "Concomitant Medications Log",
    description: "Repeating medication section with reported term, indication, dose/unit, route, start/stop dates, and ongoing status.",
    category: "smart_block",
    iconName: "IconPill",
    cdashDomain: "CM",
    command: "/conmeds",
    keywords: ["conmeds", "medications", "drugs", "cm", "concomitant", "prior"],
    variableCount: 8,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_cm_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_cmtrt_${now}`,
          name: "CMTRT",
          variableName: "CMTRT",
          label: "Reported Medication Name",
          dataType: "text",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMTRT",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmindc_${now}`,
          name: "CMINDC",
          variableName: "CMINDC",
          label: "Clinical Indication / Reason for Treatment",
          dataType: "text",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMINDC",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmdose_${now}`,
          name: "CMDOSE",
          variableName: "CMDOSE",
          label: "Dose per Administration",
          dataType: "decimal",
          required: true,
          widthCols: 4,
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMDOSE",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmdosu_${now}`,
          name: "CMDOSU",
          variableName: "CMDOSU",
          label: "Dose Unit",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "mg", value: "mg" },
            { label: "mcg", value: "mcg" },
            { label: "g", value: "g" },
            { label: "mL", value: "mL" },
            { label: "IU", value: "IU" },
            { label: "drops", value: "drops" },
            { label: "puffs", value: "puffs" },
          ],
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMDOSU",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmroute_${now}`,
          name: "CMROUTE",
          variableName: "CMROUTE",
          label: "Route of Administration",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Oral (PO)", value: "ORAL" },
            { label: "Intravenous (IV)", value: "IV" },
            { label: "Subcutaneous (SC)", value: "SC" },
            { label: "Intramuscular (IM)", value: "IM" },
            { label: "Topical", value: "TOPICAL" },
            { label: "Inhalation", value: "INHALATION" },
          ],
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMROUTE",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmstdtc_${now}`,
          name: "CMSTDTC",
          variableName: "CMSTDTC",
          label: "Medication Start Date",
          dataType: "date",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMSTDTC",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_cmendtc_${now}`,
          name: "CMENDTC",
          variableName: "CMENDTC",
          label: "Medication Stop Date",
          dataType: "date",
          required: false,
          widthCols: 6,
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMENDTC",
            coreDesignation: "O",
          },
        },
        {
          id: `f_cmongo_${now}`,
          name: "CMONGO",
          variableName: "CMONGO",
          label: "Medication Ongoing at End of Study?",
          dataType: "radio",
          required: true,
          widthCols: 12,
          customOptions: [
            { label: "Yes", value: "Y" },
            { label: "No", value: "N" },
          ],
          cdashMetadata: {
            domain: "CM",
            sdtmTarget: "CM.CMONGO",
            coreDesignation: "HR",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_cm_stop_req_${now}`,
          name: "Stop Date Mandatory if Medication Not Ongoing",
          description: "Requires CMENDTC when CMONGO is answered 'No'.",
          severity: "error",
          triggerFields: ["CMONGO", "CMENDTC"],
          targetFields: ["CMENDTC"],
          action: "show_query",
          queryMessage: "Stop Date is required when medication is marked as not ongoing.",
          astCondition: {
            type: "logical",
            operator: "AND",
            children: [
              { type: "comparison", fieldId: "CMONGO", operator: "==", value: "N" },
              { type: "comparison", fieldId: "CMENDTC", operator: "==", value: null },
            ],
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Concomitant & Prior Medications Log",
          fields,
        },
        rules,
      };
    },
  },
  {
    id: "ae",
    title: "Adverse Events & Safety Log",
    description: "Safety reporting block with CTCAE severity, SAE seriousness criteria, causality, outcome, and date tracking.",
    category: "smart_block",
    iconName: "IconAlertTriangle",
    cdashDomain: "AE",
    command: "/ae",
    keywords: ["ae", "adverse", "events", "safety", "sae", "ctcae", "toxicity"],
    variableCount: 7,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_ae_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_aeterm_${now}`,
          name: "AETERM",
          variableName: "AETERM",
          label: "Reported Adverse Event Term",
          dataType: "text",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AETERM",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aesev_${now}`,
          name: "AESEV",
          variableName: "AESEV",
          label: "CTCAE v5.0 Severity Grade",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "Grade 1 - Mild", value: "1" },
            { label: "Grade 2 - Moderate", value: "2" },
            { label: "Grade 3 - Severe", value: "3" },
            { label: "Grade 4 - Life-Threatening", value: "4" },
            { label: "Grade 5 - Death", value: "5" },
          ],
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AESEV",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aeser_${now}`,
          name: "AESER",
          variableName: "AESER",
          label: "Serious Adverse Event (SAE)?",
          dataType: "radio",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "No", value: "N" },
            { label: "Yes", value: "Y" },
          ],
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AESER",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aerel_${now}`,
          name: "AEREL",
          variableName: "AEREL",
          label: "Causality / Relatedness to Investigational Product",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Not Related", value: "NOT_RELATED" },
            { label: "Unlikely Related", value: "UNLIKELY" },
            { label: "Possibly Related", value: "POSSIBLY" },
            { label: "Probably Related", value: "PROBABLY" },
            { label: "Definitely Related", value: "DEFINITELY" },
          ],
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AEREL",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aeout_${now}`,
          name: "AEOUT",
          variableName: "AEOUT",
          label: "Outcome of Event",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Recovered / Resolved", value: "RESOLVED" },
            { label: "Recovering / Resolving", value: "RESOLVING" },
            { label: "Not Recovered / Not Resolved", value: "NOT_RESOLVED" },
            { label: "Recovered with Sequelae", value: "SEQUELAE" },
            { label: "Fatal", value: "FATAL" },
            { label: "Unknown", value: "UNKNOWN" },
          ],
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AEOUT",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aestdtc_${now}`,
          name: "AESTDTC",
          variableName: "AESTDTC",
          label: "Adverse Event Start Date",
          dataType: "date",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AESTDTC",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_aeendtc_${now}`,
          name: "AEENDTC",
          variableName: "AEENDTC",
          label: "Adverse Event Resolution Date",
          dataType: "date",
          required: false,
          widthCols: 6,
          cdashMetadata: {
            domain: "AE",
            sdtmTarget: "AE.AEENDTC",
            coreDesignation: "O",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_ae_sae_severity_${now}`,
          name: "Serious AE CTCAE Grade Check",
          description: "Notice when Serious AE is graded as Grade 1-2 mild/moderate.",
          severity: "warning",
          triggerFields: ["AESER", "AESEV"],
          targetFields: ["AESEV"],
          action: "show_query",
          queryMessage: "Event is marked Serious (SAE) with CTCAE Grade 1-2 severity. Please verify SAE criteria.",
          astCondition: {
            type: "logical",
            operator: "AND",
            children: [
              { type: "comparison", fieldId: "AESER", operator: "==", value: "Y" },
              {
                type: "logical",
                operator: "OR",
                children: [
                  { type: "comparison", fieldId: "AESEV", operator: "==", value: "1" },
                  { type: "comparison", fieldId: "AESEV", operator: "==", value: "2" },
                ],
              },
            ],
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Adverse Events & Safety Log",
          fields,
        },
        rules,
      };
    },
  },
  {
    id: "demographics",
    title: "Subject Demographics & Consent",
    description: "Informed consent verification, birth year, age, sex assigned at birth, race, and ethnicity.",
    category: "smart_block",
    iconName: "IconUserCheck",
    cdashDomain: "DM",
    command: "/demographics",
    keywords: ["demographics", "consent", "age", "sex", "race", "ethnicity", "dm", "baseline"],
    variableCount: 7,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_dm_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_icdat_${now}`,
          name: "ICDAT",
          variableName: "ICDAT",
          label: "Date Informed Consent Signed",
          dataType: "date",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "DS",
            sdtmTarget: "DS.DSSTDTC [DSDECOD=INFORMED CONSENT OBTAINED]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_icyn_${now}`,
          name: "ICYN",
          variableName: "ICYN",
          label: "Written Informed Consent Provided Prior to Procedures?",
          dataType: "radio",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "Yes", value: "Y" },
            { label: "No", value: "N" },
          ],
          cdashMetadata: {
            domain: "DS",
            sdtmTarget: "DS.DSDECOD",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_brthyr_${now}`,
          name: "BRTHYR",
          variableName: "BRTHYR",
          label: "Year of Birth (YYYY)",
          dataType: "integer",
          required: true,
          validation: { min: 1900, max: 2026 },
          widthCols: 4,
          cdashMetadata: {
            domain: "DM",
            sdtmTarget: "DM.BRTHYR",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_age_${now}`,
          name: "AGE",
          variableName: "AGE",
          label: "Age at Screening",
          dataType: "integer",
          unit: "Years",
          required: true,
          validation: { min: 18, max: 110 },
          widthCols: 4,
          cdashMetadata: {
            domain: "DM",
            sdtmTarget: "DM.AGE",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_sex_${now}`,
          name: "SEX",
          variableName: "SEX",
          label: "Sex Assigned at Birth",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Male", value: "M" },
            { label: "Female", value: "F" },
            { label: "Undifferentiated", value: "U" },
            { label: "Unknown", value: "UNK" },
          ],
          cdashMetadata: {
            domain: "DM",
            sdtmTarget: "DM.SEX",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_race_${now}`,
          name: "RACE",
          variableName: "RACE",
          label: "Primary Race",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "American Indian or Alaska Native", value: "AMERICAN_INDIAN" },
            { label: "Asian", value: "ASIAN" },
            { label: "Black or African American", value: "BLACK" },
            { label: "Native Hawaiian or Other Pacific Islander", value: "PACIFIC_ISLANDER" },
            { label: "White", value: "WHITE" },
            { label: "Other / Multiple", value: "OTHER" },
          ],
          cdashMetadata: {
            domain: "DM",
            sdtmTarget: "DM.RACE",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_ethnic_${now}`,
          name: "ETHNIC",
          variableName: "ETHNIC",
          label: "Ethnicity",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "Hispanic or Latino", value: "HISPANIC" },
            { label: "Not Hispanic or Latino", value: "NOT_HISPANIC" },
            { label: "Not Reported", value: "NOT_REPORTED" },
            { label: "Unknown", value: "UNKNOWN" },
          ],
          cdashMetadata: {
            domain: "DM",
            sdtmTarget: "DM.ETHNIC",
            coreDesignation: "HR",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_consent_mandatory_${now}`,
          name: "Informed Consent Protocol Prerequisite",
          description: "Requires ICYN to be 'Yes' before subject protocol procedures can proceed.",
          severity: "error",
          triggerFields: ["ICYN"],
          targetFields: ["ICYN"],
          action: "show_query",
          queryMessage: "Written informed consent is a mandatory prerequisite for study participation.",
          astCondition: {
            type: "comparison",
            fieldId: "ICYN",
            operator: "!=",
            value: "Y",
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Subject Demographics & Consent",
          fields,
        },
        rules,
      };
    },
  },
  {
    id: "labs",
    title: "Central & Local Laboratory Panel",
    description: "Quantitative lab testing section with test name, result value, units, and reference range indicator.",
    category: "smart_block",
    iconName: "IconTestPipe",
    cdashDomain: "LB",
    command: "/labs",
    keywords: ["labs", "laboratory", "blood", "chemistry", "hematology", "lb", "biomarker"],
    variableCount: 4,
    hasRules: false,
    factory: () => {
      const now = Date.now();
      const secId = `sec_lb_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_lbtest_${now}`,
          name: "LBTEST",
          variableName: "LBTEST",
          label: "Laboratory Test Name",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "Hemoglobin (HGB)", value: "HGB" },
            { label: "White Blood Cell Count (WBC)", value: "WBC" },
            { label: "Platelets (PLT)", value: "PLT" },
            { label: "Alanine Aminotransferase (ALT)", value: "ALT" },
            { label: "Aspartate Aminotransferase (AST)", value: "AST" },
            { label: "Total Bilirubin (TBIL)", value: "TBIL" },
            { label: "Serum Creatinine (CREAT)", value: "CREAT" },
            { label: "Blood Urea Nitrogen (BUN)", value: "BUN" },
          ],
          cdashMetadata: {
            domain: "LB",
            sdtmTarget: "LB.LBTESTCD",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_lborres_${now}`,
          name: "LBORRES",
          variableName: "LBORRES",
          label: "Numeric Result Value",
          dataType: "decimal",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "LB",
            sdtmTarget: "LB.LBORRES",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_lborresu_${now}`,
          name: "LBORRESU",
          variableName: "LBORRESU",
          label: "Original Result Unit",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "g/dL", value: "g/dL" },
            { label: "10^3/uL", value: "10^3/uL" },
            { label: "U/L", value: "U/L" },
            { label: "mg/dL", value: "mg/dL" },
            { label: "mmol/L", value: "mmol/L" },
            { label: "umol/L", value: "umol/L" },
          ],
          cdashMetadata: {
            domain: "LB",
            sdtmTarget: "LB.LBORRESU",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_lbnrind_${now}`,
          name: "LBNRIND",
          variableName: "LBNRIND",
          label: "Reference Range Indicator",
          dataType: "single_select",
          required: true,
          widthCols: 6,
          customOptions: [
            { label: "NORMAL", value: "NORMAL" },
            { label: "LOW", value: "LOW" },
            { label: "HIGH", value: "HIGH" },
            { label: "CRITICAL LOW", value: "CRIT_LOW" },
            { label: "CRITICAL HIGH", value: "CRIT_HIGH" },
          ],
          cdashMetadata: {
            domain: "LB",
            sdtmTarget: "LB.LBNRIND",
            coreDesignation: "HR",
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Central & Local Laboratory Panel",
          fields,
        },
        rules: [],
      };
    },
  },
  {
    id: "pro",
    title: "Patient-Reported Outcomes (PRO / ePRO)",
    description: "Standard instrument with 0-10 NRS fatigue scale, 0-100 VAS pain slider, and quality-of-life interference.",
    category: "smart_block",
    iconName: "IconMoodSmile",
    cdashDomain: "QS",
    command: "/pro",
    keywords: ["pro", "epro", "patient", "outcomes", "vas", "nrs", "pain", "fatigue", "qol", "qs"],
    variableCount: 3,
    hasRules: false,
    factory: () => {
      const now = Date.now();
      const secId = `sec_pro_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_pro_fatigue_${now}`,
          name: "PRO_FATIGUE",
          variableName: "PRO_FATIGUE",
          label: "Fatigue Severity Rating (0 = None, 10 = As bad as you can imagine)",
          dataType: "nrs",
          scaleMin: 0,
          scaleMax: 10,
          scaleMinLabel: "No Fatigue",
          scaleMaxLabel: "Worst Fatigue",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "QS",
            sdtmTarget: "QS.QSORRES [QSTESTCD=FATIGUE]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_pro_pain_${now}`,
          name: "PRO_PAIN",
          variableName: "PRO_PAIN",
          label: "Pain Intensity Scale (0 = No Pain, 100 = Worst Possible Pain)",
          dataType: "vas",
          scaleMin: 0,
          scaleMax: 100,
          scaleMinLabel: "No Pain",
          scaleMaxLabel: "Worst Possible Pain",
          required: true,
          widthCols: 6,
          cdashMetadata: {
            domain: "QS",
            sdtmTarget: "QS.QSORRES [QSTESTCD=PAIN]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_pro_interf_${now}`,
          name: "PRO_INTERF",
          variableName: "PRO_INTERF",
          label: "Interference with Daily Activities Over Past 7 Days",
          dataType: "single_select",
          required: true,
          widthCols: 12,
          customOptions: [
            { label: "Not at all", value: "0" },
            { label: "A little bit", value: "1" },
            { label: "Somewhat", value: "2" },
            { label: "Quite a bit", value: "3" },
            { label: "Very much", value: "4" },
          ],
          cdashMetadata: {
            domain: "QS",
            sdtmTarget: "QS.QSORRES [QSTESTCD=DAILY_INTERF]",
            coreDesignation: "HR",
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "Patient-Reported Outcomes (PRO / ePRO)",
          fields,
        },
        rules: [],
      };
    },
  },
  {
    id: "ecg",
    title: "12-Lead Electrocardiogram (ECG)",
    description: "Standard cardiac interval tracking (HR, PR, QRS, QT) with automated Fridericia QTcF derivation.",
    category: "smart_block",
    iconName: "IconActivity",
    cdashDomain: "EG",
    command: "/ecg",
    keywords: ["ecg", "ekg", "cardiac", "qtcf", "interval", "eg", "heart"],
    variableCount: 6,
    hasRules: true,
    factory: () => {
      const now = Date.now();
      const secId = `sec_eg_${now}`;
      const fields: CRFField[] = [
        {
          id: `f_eghr_${now}`,
          name: "EGHR",
          variableName: "EGHR",
          label: "Ventricular Heart Rate",
          dataType: "integer",
          unit: "bpm",
          required: true,
          validation: { min: 30, max: 250 },
          widthCols: 4,
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGORRES [EGTESTCD=HR]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_egpr_${now}`,
          name: "EGPR",
          variableName: "EGPR",
          label: "PR Interval",
          dataType: "integer",
          unit: "ms",
          required: true,
          validation: { min: 50, max: 400 },
          widthCols: 4,
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGORRES [EGTESTCD=PR]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_egqrs_${now}`,
          name: "EGQRS",
          variableName: "EGQRS",
          label: "QRS Duration",
          dataType: "integer",
          unit: "ms",
          required: true,
          validation: { min: 40, max: 250 },
          widthCols: 4,
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGORRES [EGTESTCD=QRS]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_egqt_${now}`,
          name: "EGQT",
          variableName: "EGQT",
          label: "QT Interval",
          dataType: "integer",
          unit: "ms",
          required: true,
          validation: { min: 200, max: 700 },
          widthCols: 4,
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGORRES [EGTESTCD=QT]",
            coreDesignation: "HR",
          },
        },
        {
          id: `f_egqtcf_${now}`,
          name: "EGQTCF",
          variableName: "EGQTCF",
          label: "Fridericia Corrected QT (QTcF)",
          dataType: "derived",
          unit: "ms",
          calculationFormula: "EGQT / Math.cbrt(60 / EGHR)",
          isReadOnly: true,
          widthCols: 4,
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGSTRESN [EGTESTCD=QTCF]",
            coreDesignation: "O",
          },
        },
        {
          id: `f_egclsig_${now}`,
          name: "EGCLSIG",
          variableName: "EGCLSIG",
          label: "Overall Clinical Significance",
          dataType: "single_select",
          required: true,
          widthCols: 4,
          customOptions: [
            { label: "Normal", value: "NORMAL" },
            { label: "Abnormal - Not Clinically Significant", value: "ABNORMAL_NCS" },
            { label: "Abnormal - Clinically Significant", value: "ABNORMAL_CS" },
          ],
          cdashMetadata: {
            domain: "EG",
            sdtmTarget: "EG.EGCLSIG",
            coreDesignation: "HR",
          },
        },
      ];

      const rules: EditCheckRule[] = [
        {
          id: `rule_qtcf_prolongation_${now}`,
          name: "QTcF Prolongation Safety Alert",
          description: "Warns investigator when Fridericia corrected QT exceeds 500 ms.",
          severity: "warning",
          triggerFields: ["EGQTCF"],
          targetFields: ["EGQTCF"],
          action: "show_query",
          queryMessage: "Fridericia Corrected QT (QTcF) >= 500 ms requires immediate PI assessment for arrhythmia risk.",
          astCondition: {
            type: "comparison",
            fieldId: "EGQTCF",
            operator: ">=",
            value: 500,
          },
        },
      ];

      return {
        section: {
          id: secId,
          title: "12-Lead Electrocardiogram (ECG)",
          fields,
        },
        rules,
      };
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Atomic Field Slash Commands
// ─────────────────────────────────────────────────────────────────────────────

export const ATOMIC_SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: "text",
    title: "Single-Line Text",
    description: "Standard text input field for short strings, names, or codes.",
    category: "widget",
    command: "/text",
    keywords: ["text", "string", "input", "short", "char"],
    badge: "text",
    action: "insert_field",
    fieldTemplate: {
      dataType: "text",
      label: "Text Variable",
      variableName: "VAR_TXT",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "textarea",
    title: "Multi-Line Text / Notes",
    description: "Multi-line text area for medical narratives or investigator comments.",
    category: "widget",
    command: "/textarea",
    keywords: ["textarea", "narrative", "notes", "long text", "comments"],
    badge: "textarea",
    action: "insert_field",
    fieldTemplate: {
      dataType: "textarea",
      label: "Clinical Narrative / Notes",
      variableName: "VAR_COMM",
      required: false,
      widthCols: 12,
    },
  },
  {
    id: "number",
    title: "Integer / Count",
    description: "Whole number field for counts, scores, or whole-integer measurements.",
    category: "widget",
    command: "/number",
    keywords: ["number", "integer", "int", "count", "score"],
    badge: "integer",
    action: "insert_field",
    fieldTemplate: {
      dataType: "integer",
      label: "Numeric Count",
      variableName: "VAR_NUM",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "decimal",
    title: "Decimal / Continuous",
    description: "Floating-point numeric measurement with unit definition.",
    category: "widget",
    command: "/decimal",
    keywords: ["decimal", "float", "measurement", "continuous", "value"],
    badge: "decimal",
    action: "insert_field",
    fieldTemplate: {
      dataType: "decimal",
      label: "Measurement Value",
      variableName: "VAR_DEC",
      unit: "unit",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "date",
    title: "Calendar Date",
    description: "ISO 8601 clinical date selector (YYYY-MM-DD).",
    category: "widget",
    command: "/date",
    keywords: ["date", "calendar", "day", "iso", "time"],
    badge: "date",
    action: "insert_field",
    fieldTemplate: {
      dataType: "date",
      label: "Assessment Date",
      variableName: "VAR_DTC",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "time",
    title: "Clock Time",
    description: "Time selector for dose or sample collection timestamps (HH:MM).",
    category: "widget",
    command: "/time",
    keywords: ["time", "clock", "hour", "minute", "timestamp"],
    badge: "time",
    action: "insert_field",
    fieldTemplate: {
      dataType: "time",
      label: "Collection Time",
      variableName: "VAR_TIM",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "datetime",
    title: "Date & Time Timestamp",
    description: "Combined ISO 8601 datetime selector for exact PK/PD event logging.",
    category: "widget",
    command: "/datetime",
    keywords: ["datetime", "timestamp", "exact", "pk", "time"],
    badge: "datetime",
    action: "insert_field",
    fieldTemplate: {
      dataType: "datetime",
      label: "Event Timestamp",
      variableName: "VAR_DTM",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "radio",
    title: "Radio Choice Group",
    description: "Mutually exclusive single choice group (e.g. Yes / No).",
    category: "widget",
    command: "/radio",
    keywords: ["radio", "yesno", "binary", "choice", "options"],
    badge: "radio",
    action: "insert_field",
    fieldTemplate: {
      dataType: "radio",
      label: "Binary Indicator",
      variableName: "VAR_YN",
      required: false,
      widthCols: 6,
      customOptions: [
        { label: "Yes", value: "Y" },
        { label: "No", value: "N" },
      ],
    },
  },
  {
    id: "select",
    title: "Dropdown Select",
    description: "Single select dropdown linked to NCI controlled terminology or custom choices.",
    category: "widget",
    command: "/select",
    keywords: ["select", "dropdown", "codelist", "choice", "menu"],
    badge: "select",
    action: "insert_field",
    fieldTemplate: {
      dataType: "single_select",
      label: "Codelist Selection",
      variableName: "VAR_COD",
      required: false,
      widthCols: 6,
      customOptions: [
        { label: "Option A", value: "OPT_A" },
        { label: "Option B", value: "OPT_B" },
        { label: "Option C", value: "OPT_C" },
      ],
    },
  },
  {
    id: "multiselect",
    title: "Multi-Select Checkboxes",
    description: "Multiple-choice checkbox group for symptoms or co-morbidities.",
    category: "widget",
    command: "/multiselect",
    keywords: ["multiselect", "multiple", "checkboxes", "tags", "list"],
    badge: "multiselect",
    action: "insert_field",
    fieldTemplate: {
      dataType: "multi_select",
      label: "Multi-Select Factors",
      variableName: "VAR_MULTI",
      required: false,
      widthCols: 12,
      customOptions: [
        { label: "Factor 1", value: "F1" },
        { label: "Factor 2", value: "F2" },
        { label: "Factor 3", value: "F3" },
      ],
    },
  },
  {
    id: "calc",
    title: "Derived Calculated Field",
    description: "Real-time computed AST mathematical formula (e.g. Creatinine Clearance, BSA).",
    category: "widget",
    command: "/calc",
    keywords: ["calc", "calculation", "derived", "formula", "math", "ast"],
    badge: "derived",
    action: "insert_field",
    fieldTemplate: {
      dataType: "derived",
      label: "Calculated Metric",
      variableName: "VAR_CALC",
      calculationFormula: "VAR_A + VAR_B",
      isReadOnly: true,
      widthCols: 12,
    },
  },
  {
    id: "vas",
    title: "Visual Analog Scale (VAS 0-100)",
    description: "Continuous visual slider for patient-reported pain or symptom burden.",
    category: "widget",
    command: "/vas",
    keywords: ["vas", "slider", "analog", "pain", "continuous", "visual"],
    badge: "vas",
    action: "insert_field",
    fieldTemplate: {
      dataType: "vas",
      label: "Visual Analog Scale (0-100)",
      variableName: "VAR_VAS",
      scaleMin: 0,
      scaleMax: 100,
      scaleMinLabel: "None",
      scaleMaxLabel: "Severe",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "nrs",
    title: "Numeric Rating Scale (NRS 0-10)",
    description: "Discrete button scale for fatigue, nausea, or patient-reported metrics.",
    category: "widget",
    command: "/nrs",
    keywords: ["nrs", "rating", "scale", "discrete", "fatigue", "score"],
    badge: "nrs",
    action: "insert_field",
    fieldTemplate: {
      dataType: "nrs",
      label: "Numeric Rating Scale (0-10)",
      variableName: "VAR_NRS",
      scaleMin: 0,
      scaleMax: 10,
      scaleMinLabel: "0 - None",
      scaleMaxLabel: "10 - Severe",
      required: false,
      widthCols: 6,
    },
  },
  {
    id: "signature",
    title: "21 CFR Part 11 Electronic Signature",
    description: "Investigator sign-off widget with cryptographic attestation and audit trail.",
    category: "widget",
    command: "/signature",
    keywords: ["signature", "sign", "part11", "21cfr", "attestation", "pi"],
    badge: "signature",
    action: "insert_field",
    fieldTemplate: {
      dataType: "signature",
      label: "Principal Investigator Electronic Signature",
      variableName: "PI_SIG",
      required: true,
      widthCols: 12,
    },
  },
  {
    id: "section",
    title: "New Form Section",
    description: "Insert a clean, blank form section container to group related clinical fields.",
    category: "layout",
    command: "/section",
    keywords: ["section", "container", "group", "block", "layout"],
    badge: "section",
    action: "insert_section",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Unified Registry & Search Helpers
// ─────────────────────────────────────────────────────────────────────────────

export const ALL_SLASH_COMMANDS: SlashCommandItem[] = [
  ...CLINICAL_SMART_BLOCKS.map((sb): SlashCommandItem => ({
    id: sb.id,
    title: sb.title,
    description: sb.description,
    category: "smart_block",
    command: sb.command,
    keywords: sb.keywords,
    badge: `${sb.cdashDomain} • ${sb.variableCount} vars`,
    action: "insert_smart_block",
    smartBlockId: sb.id,
  })),
  ...ATOMIC_SLASH_COMMANDS,
];

/**
 * Searches and ranks slash commands by match relevance
 */
export function searchSlashCommands(query: string): SlashCommandItem[] {
  const clean = query.trim().toLowerCase().replace(/^\//, "");
  if (!clean) return ALL_SLASH_COMMANDS;

  return ALL_SLASH_COMMANDS.filter((item) => {
    if (item.command.toLowerCase().includes(clean)) return true;
    if (item.title.toLowerCase().includes(clean)) return true;
    if (item.description.toLowerCase().includes(clean)) return true;
    return item.keywords.some((k) => k.toLowerCase().includes(clean));
  });
}

/**
 * Instantiates a compound Clinical Smart Block by ID
 */
export function instantiateSmartBlock(blockId: string): { section: CRFSection; rules: EditCheckRule[] } {
  const definition = CLINICAL_SMART_BLOCKS.find((b) => b.id === blockId);
  if (!definition) {
    throw new Error(`Unknown clinical smart block: "${blockId}"`);
  }
  return definition.factory();
}

/**
 * Instantiates an atomic CRF Field from a slash command
 */
export function instantiateAtomicField(commandId: string, indexOffset = 0): CRFField {
  const item = ATOMIC_SLASH_COMMANDS.find((c) => c.id === commandId);
  const now = Date.now() + indexOffset;
  const template = item?.fieldTemplate || {};
  const dataType: FieldDataType = template.dataType || "text";

  return {
    id: `f_${dataType}_${now}`,
    name: template.variableName ? `${template.variableName}_${now % 1000}` : `VAR_${now % 1000}`,
    variableName: template.variableName ? `${template.variableName}_${now % 1000}` : `VAR_${now % 1000}`,
    label: template.label || "New Field",
    dataType,
    unit: template.unit,
    required: template.required ?? false,
    isReadOnly: template.isReadOnly ?? false,
    calculationFormula: template.calculationFormula,
    scaleMin: template.scaleMin,
    scaleMax: template.scaleMax,
    scaleMinLabel: template.scaleMinLabel,
    scaleMaxLabel: template.scaleMaxLabel,
    customOptions: template.customOptions ? template.customOptions.map((o) => ({ ...o })) : undefined,
    validation: template.validation ? { ...template.validation } : undefined,
    widthCols: template.widthCols || 6,
    cdashMetadata: template.cdashMetadata ? { ...template.cdashMetadata } : undefined,
  };
}
