/**
 * Universal CRF Specification & Schema Engine
 * Declarative, portable, and machine-verifiable clinical protocol schema
 * CDISC CDASH 2.2 • ODM-XML 1.3.2 • 21 CFR Part 11 • HL7 FHIR
 */

import { z } from "zod";
import type { StudyProtocol, CRFForm, CRFField } from "./types";

// 1. Clinical Data Types
export const UniversalClinicalDataTypeSchema = z.enum([
  "text",
  "textarea",
  "number",
  "integer",
  "date",
  "partial_date",
  "precision_date",
  "time",
  "datetime",
  "boolean",
  "single_select",
  "multi_select",
  "radio",
  "checkbox",
  "vas_scale",
  "nrs_scale",
  "calculated",
  "repeating_table",
  "signature",
]);
export type UniversalClinicalDataType = z.infer<typeof UniversalClinicalDataTypeSchema>;

// 2. Codelists & Controlled Terminology
export const CodelistOptionSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  nciCode: z.string().optional(),
  order: z.number().int().default(1),
});
export type UniversalCodelistOption = z.infer<typeof CodelistOptionSchema>;

export const CodelistDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  nciCodelistCode: z.string().optional(),
  options: z.array(CodelistOptionSchema).default([]),
  isStandard: z.boolean().optional(),
});
export type UniversalCodelist = z.infer<typeof CodelistDefinitionSchema>;

// 3. CDASH & SDTM Metadata
export const CdashVariableMetadataSchema = z.object({
  domain: z.string().min(1).max(8),
  sdtmVariable: z.string().min(1).max(8),
  cdashLabel: z.string().min(1),
  nciConceptId: z.string().optional(),
  core: z.enum(["HR", "O", "R"]),
  acrfAnnotation: z.string().min(1),
  dataCategory: z.string().optional(),
});
export type UniversalCdashMetadata = z.infer<typeof CdashVariableMetadataSchema>;

// 4. AST Conditions & Logic Rules
export const AstConditionSchema = z.object({
  fieldId: z.string().min(1),
  crossVisitId: z.string().optional(),
  operator: z.enum(["eq", "neq", "gt", "gte", "lt", "lte", "in", "contains", "is_empty", "is_not_empty"]),
  value: z.union([z.string(), z.number(), z.boolean(), z.array(z.string())]),
});
export type UniversalAstCondition = z.infer<typeof AstConditionSchema>;

export const EditCheckRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(""),
  triggerFieldIds: z.array(z.string()).min(1),
  actionType: z.enum(["show_field", "hide_field", "require_field", "raise_query", "set_value"]),
  targetFieldId: z.string().min(1),
  conditions: z.array(AstConditionSchema).min(1),
  logicalOperator: z.enum(["AND", "OR"]).default("AND"),
  querySeverity: z.enum(["info", "warning", "error"]).optional(),
  queryMessage: z.string().optional(),
  formulaExpression: z.string().optional(),
});
export type UniversalEditCheckRule = z.infer<typeof EditCheckRuleSchema>;

// 5. Recursive CRF Field Schema
export const BaseCRFFieldSchema = z.object({
  id: z.string().min(1),
  variableName: z.string().min(1).max(8),
  label: z.string().min(1),
  description: z.string().optional(),
  dataType: UniversalClinicalDataTypeSchema,
  columnSpan: z.number().int().min(1).max(12).default(6),
  required: z.boolean().default(false),
  readOnly: z.boolean().optional(),
  placeholder: z.string().optional(),
  unit: z.string().optional(),
  unitOptions: z.array(z.string()).optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  defaultValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
  codelistId: z.string().optional(),
  customOptions: z.array(CodelistOptionSchema).optional(),
  calculationFormula: z.string().optional(),
  cdashMetadata: CdashVariableMetadataSchema.optional(),
  scaleMinLabel: z.string().optional(),
  scaleMaxLabel: z.string().optional(),
  allowPartial: z.boolean().optional(),
  preventFutureDate: z.boolean().optional(),
  allowNullFlavor: z.boolean().optional(),
  requirementTier: z.enum(["optional", "hard_stop", "auto_query"]).optional(),
  requiresSdv: z.boolean().optional(),
  isBlinded: z.boolean().optional(),
  nullFlavorValue: z.string().optional(),
  sdvVerified: z.boolean().optional(),
  sdvTimestamp: z.string().optional(),
  sdvAuditedBy: z.string().optional(),
});

export type UniversalCrfField = z.infer<typeof BaseCRFFieldSchema> & {
  repeatingColumns?: UniversalCrfField[];
};

export const UniversalCrfFieldSchema: z.ZodType<UniversalCrfField> = BaseCRFFieldSchema.extend({
  repeatingColumns: z.lazy(() => z.array(UniversalCrfFieldSchema).optional()),
});

// 6. Section & Form Schema
export const UniversalCrfSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  collapsible: z.boolean().optional(),
  isRepeating: z.boolean().optional(),
  fields: z.array(UniversalCrfFieldSchema).default([]),
});
export type UniversalCrfSection = z.infer<typeof UniversalCrfSectionSchema>;

export const UniversalCrfFormSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  domain: z.string().min(1).max(8),
  description: z.string().default(""),
  version: z.string().default("1.0"),
  sections: z.array(UniversalCrfSectionSchema).default([]),
  rules: z.array(EditCheckRuleSchema).default([]),
  isLogForm: z.boolean().optional(),
  isLocked: z.boolean().optional(),
  lockedBy: z.string().optional(),
  lockedAt: z.string().optional(),
});
export type UniversalCrfForm = z.infer<typeof UniversalCrfFormSchema>;

// 7. Schedule of Activities (SoA) Visits
export const UniversalCrfVisitSchema = z.object({
  id: z.string().min(1),
  oid: z.string().optional(),
  name: z.string().min(1),
  visitType: z.enum(["Scheduled", "Unscheduled", "Common"]).default("Scheduled"),
  targetDay: z.number().default(0),
  timepointDays: z.number().optional(),
  windowBefore: z.number().default(0),
  windowAfter: z.number().default(0),
  assignedFormIds: z.array(z.string()).default([]),
  formIds: z.array(z.string()).optional(),
  isRepeating: z.boolean().optional(),
  repeatMax: z.number().optional(),
});
export type UniversalCrfVisit = z.infer<typeof UniversalCrfVisitSchema>;

// 8. Branding & Organization Profile
export const UniversalCrfBrandingSchema = z.object({
  organizationName: z.string().default("Clinical Research Organization"),
  logoBase64: z.string().optional(),
  logoUrl: z.string().optional(),
  primaryColor: z.string().default("#0284c7"),
  accentColor: z.string().default("#9333ea"),
  tableHeaderColor: z.string().optional(),
  headerText: z.string().optional(),
  footerText: z.string().optional(),
  confidentialityNotice: z.string().optional(),
  watermarkText: z.string().optional(),
  showPageNumbers: z.boolean().default(true),
  showTableOfContents: z.boolean().default(true),
});
export type UniversalCrfBranding = z.infer<typeof UniversalCrfBrandingSchema>;

// 9. Root Universal Study Protocol Schema
export const UniversalCrfProtocolSchema = z.object({
  $schema: z.string().optional(),
  schemaVersion: z.string().default("1.0.0"),
  id: z.string().min(1),
  protocolNumber: z.string().optional(),
  protocolId: z.string().optional(),
  studyName: z.string().optional(),
  title: z.string().optional(),
  phase: z.string().default("Phase III"),
  sponsor: z.string().default("Clinical Sponsor"),
  therapeuticArea: z.string().default("General Medicine"),
  version: z.string().default("1.0"),
  lastModified: z.string().default(() => new Date().toISOString()),
  forms: z.array(UniversalCrfFormSchema).default([]),
  visits: z.array(UniversalCrfVisitSchema).default([]),
  codelists: z.array(CodelistDefinitionSchema).default([]),
  rules: z.array(EditCheckRuleSchema).optional(),
  branding: UniversalCrfBrandingSchema.optional(),
});
export type UniversalCrfProtocol = z.infer<typeof UniversalCrfProtocolSchema>;
export const UniversalStudyProtocolSchema = UniversalCrfProtocolSchema;
export type UniversalStudyProtocol = UniversalCrfProtocol;

// 10. Validation & Serialization Utilities

export interface UniversalCrfValidationResult {
  success: boolean;
  study?: StudyProtocol;
  errors: Array<{ path: string; message: string; code?: string }>;
}

/**
 * Validates any JSON object against the Universal CRF Protocol specification.
 */
export function validateUniversalCrf(data: unknown): UniversalCrfValidationResult {
  const result = UniversalCrfProtocolSchema.safeParse(data);
  if (result.success) {
    return {
      success: true,
      study: result.data as unknown as StudyProtocol,
      errors: [],
    };
  }

  return {
    success: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    })),
  };
}

/**
 * Parses raw JSON string or object into a typed StudyProtocol.
 * Throws a descriptive Error on schema violation.
 */
export function parseUniversalCrf(raw: string | object): StudyProtocol {
  const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
  const validation = validateUniversalCrf(parsed);
  if (!validation.success) {
    const errorDetails = validation.errors
      .slice(0, 5)
      .map((e) => `[${e.path}]: ${e.message}`)
      .join(", ");
    throw new Error(`Universal CRF validation failed: ${errorDetails}`);
  }
  return validation.study!;
}

/**
 * Serializes a StudyProtocol to Universal CRF JSON string.
 */
export function exportUniversalCrfJson(study: StudyProtocol, pretty = true): string {
  const payload = {
    $schema: "https://www.deruiter.dev/schemas/crf/v1/universal-crf.schema.json",
    schemaVersion: "1.0.0",
    ...study,
    lastModified: study.lastModified || new Date().toISOString(),
  };
  return pretty ? JSON.stringify(payload, null, 2) : JSON.stringify(payload);
}

/**
 * Lossless Zero-dependency YAML Serializer for Universal CRF
 * Serializes all study protocol attributes 1:1 without data loss, omitting redundant summary count fields.
 */
export function exportUniversalCrfYaml(study: StudyProtocol): string {
  const cleanUndefined = (obj: unknown): unknown => {
    if (obj === null || obj === undefined) {
      return undefined;
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => cleanUndefined(item)).filter((item) => item !== undefined);
    }
    if (typeof obj === "object") {
      const cleaned: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
        if (
          key === "formsCount" ||
          key === "visitsCount" ||
          key === "sectionsCount" ||
          key === "fieldsCount" ||
          key === "rulesCount"
        ) {
          continue;
        }
        const cleanedVal = cleanUndefined(val);
        if (cleanedVal !== undefined) {
          cleaned[key] = cleanedVal;
        }
      }
      return cleaned;
    }
    return obj;
  };

  const payload = cleanUndefined({
    $schema: (study as unknown as Record<string, unknown>).$schema || "https://www.deruiter.dev/schemas/crf/v1/universal-crf.schema.json",
    schemaVersion: (study as unknown as Record<string, unknown>).schemaVersion || "1.0.0",
    ...study,
    lastModified: study.lastModified || new Date().toISOString(),
  });

  const toYaml = (obj: unknown, indent = 0): string => {
    const pad = "  ".repeat(indent);
    if (obj === null || obj === undefined) return "null";
    if (typeof obj === "string") {
      const needsQuoting =
        obj.includes("\n") ||
        obj.includes(":") ||
        obj.includes("#") ||
        obj.includes("[") ||
        obj.includes("]") ||
        obj.includes("{") ||
        obj.includes("}") ||
        obj.includes(",") ||
        obj.includes("*") ||
        obj.includes("&") ||
        obj.includes("!") ||
        obj.includes("|") ||
        obj.includes(">") ||
        obj.includes("'") ||
        obj.includes('"') ||
        obj.includes("%") ||
        obj.includes("@") ||
        obj.trim() === "" ||
        /^[-?:=]\s/.test(obj) ||
        /^[-?:=]$/.test(obj) ||
        /^(true|false|null|yes|no|on|off)$/i.test(obj) ||
        !isNaN(Number(obj));
      return needsQuoting ? JSON.stringify(obj) : obj;
    }
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return obj
        .map((item) => {
          if (typeof item === "object" && item !== null) {
            const nested = toYaml(item, indent + 1);
            const lines = nested.split("\n");
            const first = lines[0].trimStart();
            const rest = lines.slice(1).join("\n");
            return `${pad}- ${first}${rest ? `\n${rest}` : ""}`;
          }
          return `${pad}- ${toYaml(item, indent + 1)}`;
        })
        .join("\n");
    }
    if (typeof obj === "object") {
      const keys = Object.keys(obj as Record<string, unknown>);
      if (keys.length === 0) return "{}";
      return keys
        .map((k) => {
          const val = (obj as Record<string, unknown>)[k];
          if (
            typeof val === "object" &&
            val !== null &&
            (Array.isArray(val) ? val.length > 0 : Object.keys(val).length > 0)
          ) {
            return `${pad}${k}:\n${toYaml(val, indent + 1)}`;
          }
          return `${pad}${k}: ${toYaml(val, indent)}`;
        })
        .join("\n");
    }
    return String(obj);
  };

  return `# Universal Clinical Research Form (CRF) Specification v1.0.0\n# Generated by CRF Studio Engine\n\n${toYaml(payload)}`;
}

// 11. CLI Command Generation Helpers

/**
 * Generates the CLI subcommand string to add this field via terminal
 */
export function generateCliCommandForField(domain: string, field: CRFField): string {
  const parts = [`crf add field ${domain}`, `--var ${field.variableName}`, `--type ${field.dataType}`];
  if (field.label) {
    const safeLabel = field.label.replace(/"/g, '\\"');
    parts.push(`--label "${safeLabel}"`);
  }
  if (field.required) {
    parts.push("--required");
  }
  if (field.unit) {
    parts.push(`--unit "${field.unit}"`);
  }
  if (field.columnSpan && field.columnSpan !== 6) {
    parts.push(`--span ${field.columnSpan}`);
  }
  if (field.calculationFormula) {
    parts.push(`--calc "${field.calculationFormula.replace(/"/g, '\\"')}"`);
  }
  return parts.join(" ");
}

/**
 * Generates the CLI subcommand string to scaffold a form via terminal
 */
export function generateCliCommandForForm(form: CRFForm): string {
  return `crf add form ${form.domain} --name "${form.name.replace(/"/g, '\\"')}"`;
}

// 12. Protocol Semantic Diff Engine

export interface ProtocolDiffSummary {
  protocolNumber: string;
  hasChanges: boolean;
  addedForms: string[];
  removedForms: string[];
  modifiedForms: Array<{
    formId: string;
    domain: string;
    addedFields: string[];
    removedFields: string[];
    modifiedFields: string[];
    addedRules: string[];
    removedRules: string[];
  }>;
  addedVisits: string[];
  removedVisits: string[];
}

/**
 * Performs semantic protocol comparison between two StudyProtocol objects.
 */
export function diffUniversalCrfStudies(studyA: StudyProtocol, studyB: StudyProtocol): ProtocolDiffSummary {
  const formMapA = new Map(studyA.forms.map((f) => [f.id, f]));
  const formMapB = new Map(studyB.forms.map((f) => [f.id, f]));

  const addedForms: string[] = [];
  const removedForms: string[] = [];
  const modifiedForms: ProtocolDiffSummary["modifiedForms"] = [];

  for (const [id, formB] of formMapB.entries()) {
    if (!formMapA.has(id)) {
      addedForms.push(`${formB.domain} (${formB.name})`);
    } else {
      const formA = formMapA.get(id)!;
      const fieldsA = new Map(formA.sections.flatMap((s) => s.fields).map((fld) => [fld.variableName, fld]));
      const fieldsB = new Map(formB.sections.flatMap((s) => s.fields).map((fld) => [fld.variableName, fld]));

      const addedFields: string[] = [];
      const removedFields: string[] = [];
      const modifiedFields: string[] = [];

      for (const [vName, fB] of fieldsB.entries()) {
        if (!fieldsA.has(vName)) {
          addedFields.push(vName);
        } else {
          const fA = fieldsA.get(vName)!;
          if (
            fA.dataType !== fB.dataType ||
            fA.required !== fB.required ||
            fA.label !== fB.label ||
            fA.unit !== fB.unit ||
            fA.allowPartial !== fB.allowPartial ||
            fA.preventFutureDate !== fB.preventFutureDate ||
            fA.allowNullFlavor !== fB.allowNullFlavor ||
            fA.requirementTier !== fB.requirementTier ||
            fA.requiresSdv !== fB.requiresSdv ||
            fA.isBlinded !== fB.isBlinded
          ) {
            modifiedFields.push(vName);
          }
        }
      }

      for (const vName of fieldsA.keys()) {
        if (!fieldsB.has(vName)) {
          removedFields.push(vName);
        }
      }

      const rulesA = new Set((formA.rules || []).map((r) => r.name || r.id));
      const rulesB = new Set((formB.rules || []).map((r) => r.name || r.id));

      const addedRules = [...rulesB].filter((r) => !rulesA.has(r));
      const removedRules = [...rulesA].filter((r) => !rulesB.has(r));

      if (
        addedFields.length > 0 ||
        removedFields.length > 0 ||
        modifiedFields.length > 0 ||
        addedRules.length > 0 ||
        removedRules.length > 0
      ) {
        modifiedForms.push({
          formId: id,
          domain: formB.domain,
          addedFields,
          removedFields,
          modifiedFields,
          addedRules,
          removedRules,
        });
      }
    }
  }

  for (const [id, formA] of formMapA.entries()) {
    if (!formMapB.has(id)) {
      removedForms.push(`${formA.domain} (${formA.name})`);
    }
  }

  const visitIdsA = new Set((studyA.visits || []).map((v) => v.oid || v.id));
  const visitIdsB = new Set((studyB.visits || []).map((v) => v.oid || v.id));

  const addedVisits = [...visitIdsB].filter((v) => !visitIdsA.has(v));
  const removedVisits = [...visitIdsA].filter((v) => !visitIdsB.has(v));

  const hasChanges =
    addedForms.length > 0 ||
    removedForms.length > 0 ||
    modifiedForms.length > 0 ||
    addedVisits.length > 0 ||
    removedVisits.length > 0;

  return {
    protocolNumber: studyB.protocolNumber || "STUDY01",
    hasChanges,
    addedForms,
    removedForms,
    modifiedForms,
    addedVisits,
    removedVisits,
  };
}
