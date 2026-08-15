/**
 * CRF Studio Domain Types
 * Clinical Data Acquisition, CDISC CDASH 2.2, ODM-XML v1.3.2, and 21 CFR Part 11 Types
 */

export type ClinicalDataType =
  | "text"
  | "textarea"
  | "number"
  | "integer"
  | "date"
  | "partial_date"
  | "time"
  | "datetime"
  | "single_select"
  | "multi_select"
  | "radio"
  | "checkbox"
  | "vas_scale"       // Visual Analog Scale (0-100mm)
  | "nrs_scale"       // Numerical Rating Scale (0-10)
  | "calculated"      // Dynamic formula (BMI, BSA, eGFR, RECIST)
  | "repeating_table" // ConMeds, Adverse Events, Lesions
  | "signature";      // 21 CFR Part 11 e-signature

export interface CodelistOption {
  code: string;
  label: string;
  nciCode?: string;
  order: number;
}

export interface CodelistDefinition {
  id: string;
  name: string;
  nciCodelistCode?: string; // e.g. C66742 for Sex
  options: CodelistOption[];
  isStandard?: boolean;
}

export interface CdashVariableMetadata {
  domain: string;           // e.g. DM, VS, AE, CM, LB
  sdtmVariable: string;     // e.g. USUBJID, AESTDTC, VSTESTCD
  cdashLabel: string;       // e.g. "Adverse Event Start Date"
  nciConceptId?: string;    // e.g. C49487
  core: "HR" | "O" | "R";   // Highly Recommended, Optional, Required
  acrfAnnotation: string;   // e.g. "AE.AESTDTC"
  dataCategory?: string;    // Identifier, Timing, Topic, Qualifier
}

export interface AstCondition {
  fieldId: string;
  crossVisitId?: string; // Optional cross-visit comparator (e.g. "v_screen" or "prev_visit")
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in" | "contains" | "is_empty" | "is_not_empty";
  value: string | number | boolean | string[];
}

export interface EditCheckRule {
  id: string;
  name: string;
  description: string;
  triggerFieldIds: string[];
  actionType: "show_field" | "hide_field" | "require_field" | "raise_query" | "set_value";
  targetFieldId: string;
  conditions: AstCondition[];
  logicalOperator: "AND" | "OR";
  querySeverity?: "info" | "warning" | "error";
  queryMessage?: string;
  formulaExpression?: string; // For calculations: e.g. "weight / ((height/100) * (height/100))"
}

export interface CRFField {
  id: string;
  variableName: string;      // e.g. BRTHYR, DIABP, AETERM
  label: string;             // Question text displayed to investigator
  description?: string;      // Instructions / hint
  dataType: ClinicalDataType;
  columnSpan: number;        // 1 to 12 in responsive grid
  required: boolean;
  readOnly?: boolean;
  placeholder?: string;
  unit?: string;             // e.g. mmHg, kg, cm, mg/dL
  unitOptions?: string[];
  minValue?: number;
  maxValue?: number;
  defaultValue?: string | number | boolean;
  codelistId?: string;       // Reference to CodelistDefinition
  customOptions?: CodelistOption[];
  calculationFormula?: string; // AST formula string
  cdashMetadata?: CdashVariableMetadata;
  repeatingColumns?: CRFField[]; // When dataType is 'repeating_table'
  scaleMinLabel?: string;    // For VAS/NRS e.g. "No Pain"
  scaleMaxLabel?: string;    // For VAS/NRS e.g. "Worst Possible Pain"
  sdvVerified?: boolean;     // CRA Source Data Verification flag
  sdvTimestamp?: string;
  sdvAuditedBy?: string;
}

export interface CRFSection {
  id: string;
  title: string;
  description?: string;
  collapsible?: boolean;
  isRepeating?: boolean;
  fields: CRFField[];
}

export interface CRFForm {
  id: string;
  name: string;
  domain: string;            // e.g. DM, VS, AE, CM, LB, RECIST
  description: string;
  version: string;
  sections: CRFSection[];
  rules: EditCheckRule[];
  isLogForm?: boolean;       // Continuous log form vs visit-specific
  isLocked?: boolean;        // PI Data Lock flag
  lockedBy?: string;
  lockedAt?: string;
}

export interface StudyVisit {
  id: string;
  oid: string;               // e.g. SE.SCREENING, SE.VISIT1
  name: string;              // e.g. "Screening", "Cycle 1 Day 1"
  visitType: "Scheduled" | "Unscheduled" | "Common";
  targetDay: number;         // e.g. Day 0, Day 28
  windowBefore: number;      // -3 days
  windowAfter: number;       // +3 days
  assignedFormIds: string[]; // Forms collected at this visit
  isRepeating?: boolean;
  repeatMax?: number;
}

export interface StudyBranding {
  organizationName: string;
  logoBase64?: string;
  logoUrl?: string;
  primaryColor: string;     // e.g. "#0284c7" or "#00f0ff"
  accentColor: string;      // e.g. "#9333ea" or "#3b82f6"
  tableHeaderColor?: string;
  headerText?: string;      // e.g. "CONFIDENTIAL - INVESTIGATOR USE ONLY"
  footerText?: string;      // e.g. "Protocol: ONC-2026-003 | Global Development"
  confidentialityNotice?: string;
  watermarkText?: string;
  showPageNumbers?: boolean;
  showTableOfContents?: boolean;
}

export interface ExportDocxOptions {
  mode: "blank" | "annotated";
  scope: "single" | "all" | "selected";
  selectedFormIds?: string[];
  includeTableOfContents?: boolean;
  includeSdtmAppendix?: boolean;
  includeRulesSummary?: boolean;
  branding?: StudyBranding;
}

export interface ExportPdfOptions {
  mode: "blank" | "annotated";
  scope: "single" | "all" | "selected";
  selectedFormIds?: string[];
  includeTableOfContents?: boolean;
  includeSdtmAppendix?: boolean;
  branding?: StudyBranding;
}

export interface StudyProtocol {
  id: string;
  protocolNumber: string;    // e.g. "ONC-2026-003"
  studyName: string;         // e.g. "Phase III Multicenter Study of Immuno-Oncology..."
  phase: "Phase I" | "Phase I/II" | "Phase II" | "Phase III" | "Phase IV" | "Registry";
  sponsor: string;
  therapeuticArea: string;   // Oncology, Neurology, Cardiology, Infectious Disease, etc.
  version: string;
  lastModified: string;
  forms: CRFForm[];
  visits: StudyVisit[];
  codelists: CodelistDefinition[];
  branding?: StudyBranding;
}

export interface EDCQuery {
  id: string;
  fieldId: string;
  fieldName: string;
  ruleId?: string;
  formId: string;
  visitId: string;
  subjectId: string;
  status: "Open" | "Answered" | "Closed" | "Cancelled";
  severity: "info" | "warning" | "error";
  message: string;
  raisedBy: string;          // System or User name
  raisedAt: string;          // ISO Date
  response?: string;
  respondedBy?: string;
  respondedAt?: string;
}

export interface AuditTrailEntry {
  id: string;
  timestamp: string;         // ISO Date
  subjectId: string;
  formId: string;
  fieldId: string;
  fieldName: string;
  previousValue: string | number | boolean | null;
  newValue: string | number | boolean | null;
  changedBy: string;
  userRole: "Site Coordinator" | "Principal Investigator" | "CRA Monitor" | "Data Manager";
  reasonForChange: string;
}

export interface ElectronicSignature {
  id: string;
  subjectId: string;
  formId: string;
  signedBy: string;
  userRole: string;
  timestamp: string;
  meaning: "Author" | "Investigator Approval" | "Data Lock" | "Monitor Verification";
  digest: string;            // Cryptographic SHA-256 simulated signature hash
}

export type ComplianceSeverity = "error" | "warning" | "notice";

export interface ComplianceViolation {
  id: string;
  ruleId: "SD0001" | "SD0002" | "SD0003" | "SD0004" | "SD0005";
  ruleDescription: string;
  severity: ComplianceSeverity;
  formId: string;
  formName: string;
  fieldId?: string;
  variableName?: string;
  message: string;
  autoFixAvailable: boolean;
  autoFixType?: "truncate_variable" | "add_core_variable" | "assign_nci_codelist" | "fix_date_format" | "assign_visit_form";
  suggestedFix?: string;
}

export interface SubjectFormStatus {
  subjectId: string;
  visitId: string;
  formId: string;
  isComplete: boolean;
  isLocked: boolean;
  isSdvVerified: boolean;
  openQueriesCount: number;
  lastModified?: string;
}

export type StudioMode =
  | "designer"               // 12-Column Responsive Form Canvas
  | "matrix"                 // Visit x Form Matrix
  | "rules"                  // Visual Logic & AST Edit Check Graph
  | "edc"                    // Live 21 CFR Part 11 EDC Simulator
  | "acrf"                   // Annotated CRF Preview & Overlay
  | "export";                // ODM-XML, JSON, FHIR & Define-XML Export

export type DeviceViewport = "desktop" | "tablet" | "mobile";
