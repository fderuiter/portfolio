import {
  StudyProtocol,
  CRFForm,
  CRFField,
  CdashVariableMetadata,
} from "@/lib/crf/types";
import {
  CDASH_STANDARD_VARIABLES,
  STANDARD_CODELISTS,
} from "@/lib/crf/cdisc-cdash-library";
import { lintFormula, FormulaLintResult } from "@/lib/crf/formula-linter";

/**
 * Diagnostic finding tier categorization.
 */
export type DiagnosticTier = "ast" | "cdash" | "soa" | "health";

/**
 * Severity level of an audit finding.
 */
export type DiagnosticSeverity = "error" | "warning" | "info";

/**
 * Standardized audit diagnostic finding.
 */
export interface AuditDiagnostic {
  id: string;
  tier: DiagnosticTier;
  severity: DiagnosticSeverity;
  formId: string;
  formName?: string;
  fieldId?: string;
  variableName?: string;
  ruleId?: string;
  ruleDescription?: string;
  message: string;
  autoFixAvailable: boolean;
  autoFixType?:
    | "truncate_variable"
    | "add_core_variable"
    | "assign_nci_codelist"
    | "fix_date_format"
    | "assign_visit_form"
    | "prune_study_rule_reference"
    | "prune_invalid_field_ref";
  suggestedFix?: string;
}

/**
 * Form-level health and compliance metrics.
 */
export interface FormHealthMetrics {
  totalFields: number;
  mandatoryFields: number;
  codelistsAttached: number;
  calculatedFields: number;
  conditionalRules: number;
  sdvVerifiedCount: number;
  sdvReadinessPercentage: number;
  cdashConformancePercentage: number;
  missingCoreVariables: string[];
}

/**
 * Single form audit report.
 */
export interface FormAuditReport {
  formId: string;
  formName: string;
  isCompliant: boolean;
  health: FormHealthMetrics;
  diagnostics: AuditDiagnostic[];
}

/**
 * Global study audit report returned by StudyAuditor.audit().
 */
export interface StudyAuditReport {
  isCompliant: boolean;
  score: number;
  health: FormHealthMetrics;
  diagnostics: AuditDiagnostic[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    fixable: number;
  };
  autoFix: (diagnosticId: string) => StudyProtocol;
  autoFixAll: () => { protocol: StudyProtocol; fixedCount: number };
}

/**
 * Deep domain engine for unified clinical study, form, and formula quality auditing.
 * Consolidates AST syntax checking, CDISC CDASH 2.2 regulatory compliance,
 * Schedule of Activities (SoA) consistency, form health telemetry, and 1-click auto-fix remediation.
 */
export class StudyAuditor {
  /**
   * Helper to collect all fields across all forms in a study.
   */
  public static getAllFields(study: StudyProtocol): CRFField[] {
    const fields: CRFField[] = [];
    (study.forms || []).forEach((form) => {
      (form.sections || []).forEach((sec) => {
        (sec.fields || []).forEach((fld) => {
          fields.push(fld);
        });
      });
    });
    return fields;
  }

  /**
   * Resolves whether a field reference exists in the study protocol, supporting domain-qualified variable names.
   */
  public static resolveFieldInStudy(
    ref: string,
    study: StudyProtocol,
    allFields?: CRFField[]
  ): boolean {
    if (!ref || typeof ref !== "string") return false;
    const trimmed = ref.trim();
    if (!trimmed) return false;

    const fields = allFields || StudyAuditor.getAllFields(study);
    const upper = trimmed.toUpperCase();

    // Direct match by ID or variableName
    const directMatch = fields.some(
      (f) =>
        f.id === trimmed ||
        f.id.toUpperCase() === upper ||
        (f.variableName && f.variableName.toUpperCase() === upper)
    );
    if (directMatch) return true;

    // Domain-qualified match (e.g., VS.WEIGHT or DM.AGE)
    if (upper.includes(".")) {
      const parts = upper.split(".");
      const prefix = parts[0];
      const varName = parts[1];

      const matchedField = fields.some((f) => {
        const vMatch =
          f.id === varName ||
          f.id.toUpperCase() === varName ||
          (f.variableName && f.variableName.toUpperCase() === varName);
        if (!vMatch) return false;

        if (
          f.cdashMetadata?.domain &&
          f.cdashMetadata.domain.toUpperCase() === prefix
        ) {
          return true;
        }

        const belongingForm = (study.forms || []).find((fm) =>
          fm.sections?.some((s) => s.fields?.some((field) => field.id === f.id))
        );
        if (belongingForm) {
          if (
            belongingForm.domain?.toUpperCase() === prefix ||
            belongingForm.id.toUpperCase() === prefix ||
            belongingForm.name.toUpperCase() === prefix
          ) {
            return true;
          }
        }
        return false;
      });

      if (matchedField) return true;
    }

    return false;
  }

  /**
   * Performs a comprehensive multi-tier audit across an entire clinical study protocol.
   *
   * @param study The StudyProtocol object to evaluate.
   * @returns A consolidated StudyAuditReport containing diagnostics, health scores, and auto-fix mutations.
   */
  public static audit(study: StudyProtocol): StudyAuditReport {
    const diagnostics: AuditDiagnostic[] = [];
    let totalFields = 0;
    let mandatoryFields = 0;
    let codelistsAttached = 0;
    let calculatedFields = 0;
    let conditionalRules = 0;
    let sdvVerifiedCount = 0;
    const allMissingCoreVariables = new Set<string>();

    const forms = study.forms || [];
    const visits = study.visits || [];

    const assignedFormIds = new Set<string>();
    visits.forEach((v) => {
      (v.assignedFormIds || v.formIds || []).forEach((id) =>
        assignedFormIds.add(id)
      );
    });

    const variableOccurrenceMap = new Map<
      string,
      Array<{ formId: string; fieldId: string }>
    >();

    const allStudyFields = StudyAuditor.getAllFields(study);
    const resolveField = (ref: string) =>
      StudyAuditor.resolveFieldInStudy(ref, study, allStudyFields);

    // 1. Audit Forms, Sections, and Fields
    forms.forEach((form) => {
      conditionalRules += (form.rules || []).length;
      const formFields: CRFField[] = [];

      (form.sections || []).forEach((section) => {
        (section.fields || []).forEach((field) => {
          formFields.push(field);
          totalFields++;
          if (field.required) mandatoryFields++;
          if (
            field.codelistId ||
            (field.customOptions && field.customOptions.length > 0)
          )
            codelistsAttached++;
          if (field.dataType === "calculated" || field.calculationFormula)
            calculatedFields++;
          if (field.sdvVerified) sdvVerifiedCount++;

          // Tier 1: AST / Syntax linting
          if (!field.variableName || field.variableName.trim() === "") {
            diagnostics.push({
              id: `ast_missing_var_${form.id}_${field.id}`,
              tier: "ast",
              severity: "error",
              formId: form.id,
              formName: form.name,
              fieldId: field.id,
              message: `Field "${field.label}" is missing a standard SDTM/CDASH variable name.`,
              autoFixAvailable: false,
            });
          } else {
            const normalizedVar = field.variableName.trim().toUpperCase();
            const existing = variableOccurrenceMap.get(normalizedVar) || [];
            existing.push({ formId: form.id, fieldId: field.id });
            variableOccurrenceMap.set(normalizedVar, existing);

            // Tier 2: CDASH Rule SD0001 (Variable length <= 8)
            if (normalizedVar.length > 8) {
              const truncated = normalizedVar.substring(0, 8);
              diagnostics.push({
                id: `SD0001_${form.id}_${field.id}`,
                tier: "cdash",
                severity: "error",
                ruleId: "SD0001",
                ruleDescription:
                  "Variable name exceeds 8-character CDISC SDTM/CDASH limit",
                formId: form.id,
                formName: form.name,
                fieldId: field.id,
                variableName: field.variableName,
                message: `Variable "${field.variableName}" exceeds 8 characters (${normalizedVar.length} chars). Submissions must not exceed 8 characters.`,
                autoFixAvailable: true,
                autoFixType: "truncate_variable",
                suggestedFix: `Truncate to "${truncated}"`,
              });
            }
          }

          // Rule SD0003: Choice fields missing controlled terminology
          const isChoiceType = [
            "single_select",
            "multi_select",
            "radio",
            "checkbox",
          ].includes(field.dataType);
          if (
            isChoiceType &&
            !field.codelistId &&
            (!field.customOptions || field.customOptions.length === 0)
          ) {
            diagnostics.push({
              id: `SD0003_${form.id}_${field.id}`,
              tier: "cdash",
              severity: "warning",
              ruleId: "SD0003",
              ruleDescription:
                "Choice field missing controlled terminology (NCI Codelist)",
              formId: form.id,
              formName: form.name,
              fieldId: field.id,
              variableName: field.variableName,
              message: `Choice field "${field.label}" has no attached codelist or discrete choice options.`,
              autoFixAvailable: true,
              autoFixType: "assign_nci_codelist",
              suggestedFix:
                "Attach standard NCI codelist or generate default choice options.",
            });
          }

          // Rule SD0004: Date defaults not in ISO 8601 format (YYYY-MM-DD)
          if (
            ["date", "datetime", "precision_date"].includes(field.dataType) &&
            field.defaultValue
          ) {
            const isIso = /^\d{4}(-\d{2}(-\d{2})?)?$/.test(
              String(field.defaultValue)
            );
            if (!isIso) {
              diagnostics.push({
                id: `SD0004_${form.id}_${field.id}`,
                tier: "cdash",
                severity: "warning",
                ruleId: "SD0004",
                ruleDescription:
                  "Date default value not compliant with ISO 8601",
                formId: form.id,
                formName: form.name,
                fieldId: field.id,
                variableName: field.variableName,
                message: `Date field "${field.label}" default value "${field.defaultValue}" does not follow ISO 8601 (YYYY-MM-DD).`,
                autoFixAvailable: true,
                autoFixType: "fix_date_format",
                suggestedFix: "Normalize date format to YYYY-MM-DD.",
              });
            }
          }
        });
      });

      // Tier 2: CDASH Rule SD0002 (Missing Core variables for domain)
      const domain = form.domain?.toUpperCase();
      const domainMetadata = CDASH_STANDARD_VARIABLES[domain];
      if (domainMetadata && Array.isArray(domainMetadata)) {
        const presentVars = new Set(
          formFields.map((f) => f.variableName?.trim().toUpperCase())
        );
        const missingCore = domainMetadata.filter(
          (v: CdashVariableMetadata) =>
            (v.core === "HR" || v.core === "R") &&
            !presentVars.has(v.sdtmVariable)
        );

        missingCore.forEach((coreVar: CdashVariableMetadata) => {
          allMissingCoreVariables.add(`${domain}.${coreVar.sdtmVariable}`);
          diagnostics.push({
            id: `SD0002_${form.id}_${coreVar.sdtmVariable}`,
            tier: "cdash",
            severity: coreVar.core === "R" ? "error" : "warning",
            ruleId: "SD0002",
            ruleDescription: `Missing CDASH Core (${coreVar.core}) variable for domain ${domain}`,
            formId: form.id,
            formName: form.name,
            variableName: coreVar.sdtmVariable,
            message: `Domain ${domain} is missing Highly Recommended/Required variable "${coreVar.sdtmVariable}" (${coreVar.cdashLabel}).`,
            autoFixAvailable: true,
            autoFixType: "add_core_variable",
            suggestedFix: `Add variable "${coreVar.sdtmVariable}" (${coreVar.cdashLabel}) to form.`,
          });
        });
      }

      // Rule SD0005: SoA Orphan Form Check
      if (!form.isLogForm && !assignedFormIds.has(form.id)) {
        diagnostics.push({
          id: `SD0005_${form.id}`,
          tier: "soa",
          severity: "warning",
          ruleId: "SD0005",
          ruleDescription:
            "Form is orphaned and not assigned to any visit in Schedule of Activities",
          formId: form.id,
          formName: form.name,
          message: `Form "${form.name}" is not scheduled in any study visit. It will not be collected in the EDC workflow.`,
          autoFixAvailable: true,
          autoFixType: "assign_visit_form",
          suggestedFix:
            "Assign this form to the primary baseline/screening visit.",
        });
      }

      // Form AST Rule trigger/target/condition references
      (form.rules || []).forEach((rule) => {
        (rule.triggerFieldIds || []).forEach((triggerId) => {
          if (!resolveField(triggerId)) {
            diagnostics.push({
              id: `ast_rule_trigger_${form.id}_${rule.id}_${triggerId}`,
              tier: "ast",
              severity: "error",
              formId: form.id,
              formName: form.name,
              ruleId: rule.id,
              ruleDescription: rule.description || rule.name,
              message: `Rule "${rule.name}" references non-existent trigger field ID "${triggerId}".`,
              autoFixAvailable: true,
              autoFixType: "prune_study_rule_reference",
              suggestedFix: `Remove non-existent trigger field reference "${triggerId}".`,
            });
          }
        });

        if (rule.targetFieldId && !resolveField(rule.targetFieldId)) {
          diagnostics.push({
            id: `ast_rule_target_${form.id}_${rule.id}_${rule.targetFieldId}`,
            tier: "ast",
            severity: "error",
            formId: form.id,
            formName: form.name,
            ruleId: rule.id,
            ruleDescription: rule.description || rule.name,
            message: `Rule "${rule.name}" references non-existent target field ID "${rule.targetFieldId}".`,
            autoFixAvailable: true,
            autoFixType: "prune_study_rule_reference",
            suggestedFix: `Clear non-existent target field reference.`,
          });
        }

        (rule.conditions || []).forEach((cond) => {
          if (cond.fieldId && !resolveField(cond.fieldId)) {
            diagnostics.push({
              id: `ast_rule_cond_${form.id}_${rule.id}_${cond.fieldId}`,
              tier: "ast",
              severity: "error",
              formId: form.id,
              formName: form.name,
              ruleId: rule.id,
              ruleDescription: rule.description || rule.name,
              message: `Rule "${rule.name}" condition references non-existent field ID "${cond.fieldId}".`,
              autoFixAvailable: true,
              autoFixType: "prune_study_rule_reference",
              suggestedFix: `Remove invalid condition referencing "${cond.fieldId}".`,
            });
          }
        });

        if (rule.formulaExpression) {
          const lint = lintFormula(rule.formulaExpression, allStudyFields);
          if (!lint.isValid) {
            lint.diagnostics.forEach((d) => {
              if (d.severity === "error") {
                diagnostics.push({
                  id: `ast_rule_formula_${form.id}_${rule.id}_${d.code}`,
                  tier: "ast",
                  severity: "error",
                  formId: form.id,
                  formName: form.name,
                  ruleId: rule.id,
                  message: `Rule "${rule.name}" formula error: ${d.message}`,
                  autoFixAvailable: false,
                });
              }
            });
          }
        }
      });
    });

    // 2. Audit Study-Level Rules
    const studyRules = study.rules || [];
    conditionalRules += studyRules.length;

    studyRules.forEach((rule) => {
      (rule.triggerFieldIds || []).forEach((triggerId) => {
        if (!resolveField(triggerId)) {
          diagnostics.push({
            id: `ast_study_rule_trigger_${rule.id}_${triggerId}`,
            tier: "ast",
            severity: "error",
            formId: "study",
            ruleId: rule.id,
            ruleDescription: rule.description || rule.name,
            message: `Study-level rule "${rule.name}" references non-existent trigger field ID "${triggerId}".`,
            autoFixAvailable: true,
            autoFixType: "prune_study_rule_reference",
            suggestedFix: `Remove non-existent trigger field reference "${triggerId}" from study-level rule "${rule.name}".`,
          });
        }
      });

      if (rule.targetFieldId && !resolveField(rule.targetFieldId)) {
        diagnostics.push({
          id: `ast_study_rule_target_${rule.id}_${rule.targetFieldId}`,
          tier: "ast",
          severity: "error",
          formId: "study",
          ruleId: rule.id,
          ruleDescription: rule.description || rule.name,
          message: `Study-level rule "${rule.name}" references non-existent target field ID "${rule.targetFieldId}".`,
          autoFixAvailable: true,
          autoFixType: "prune_study_rule_reference",
          suggestedFix: `Clear non-existent target field reference from study-level rule "${rule.name}".`,
        });
      }

      (rule.conditions || []).forEach((cond) => {
        if (cond.fieldId && !resolveField(cond.fieldId)) {
          diagnostics.push({
            id: `ast_study_rule_cond_${rule.id}_${cond.fieldId}`,
            tier: "ast",
            severity: "error",
            formId: "study",
            ruleId: rule.id,
            ruleDescription: rule.description || rule.name,
            message: `Study-level rule "${rule.name}" condition references non-existent field ID "${cond.fieldId}".`,
            autoFixAvailable: true,
            autoFixType: "prune_study_rule_reference",
            suggestedFix: `Remove invalid condition referencing "${cond.fieldId}" from study-level rule "${rule.name}".`,
          });
        }
      });

      if (rule.formulaExpression) {
        const lint = lintFormula(rule.formulaExpression, allStudyFields);
        if (!lint.isValid) {
          lint.diagnostics.forEach((d) => {
            if (d.severity === "error") {
              diagnostics.push({
                id: `ast_study_rule_formula_${rule.id}_${d.code}`,
                tier: "ast",
                severity: "error",
                formId: "study",
                ruleId: rule.id,
                message: `Study-level rule "${rule.name}" formula error: ${d.message}`,
                autoFixAvailable: false,
              });
            }
          });
        }
      }
    });

    // Check duplicate variable names within the same form
    variableOccurrenceMap.forEach((occurrences, varName) => {
      const byForm = new Map<string, string[]>();
      occurrences.forEach((occ) => {
        const list = byForm.get(occ.formId) || [];
        list.push(occ.fieldId);
        byForm.set(occ.formId, list);
      });

      byForm.forEach((fieldIds, formId) => {
        if (fieldIds.length > 1) {
          diagnostics.push({
            id: `ast_dup_var_${formId}_${varName}`,
            tier: "ast",
            severity: "error",
            formId,
            variableName: varName,
            message: `Duplicate variable name "${varName}" detected on ${fieldIds.length} fields in the same form.`,
            autoFixAvailable: false,
          });
        }
      });
    });

    // Compute Health and Scoring
    const sdvReadiness =
      totalFields > 0 ? Math.round((sdvVerifiedCount / totalFields) * 100) : 0;
    const totalExpectedCore = Object.values(CDASH_STANDARD_VARIABLES).reduce(
      (sum, vars) => sum + vars.length,
      0
    );
    const cdashConformance =
      totalExpectedCore > 0
        ? Math.max(
            0,
            Math.round(
              ((totalExpectedCore - allMissingCoreVariables.size) /
                totalExpectedCore) *
                100
            )
          )
        : 100;

    const errors = diagnostics.filter((d) => d.severity === "error").length;
    const warnings = diagnostics.filter((d) => d.severity === "warning").length;
    const infos = diagnostics.filter((d) => d.severity === "info").length;
    const fixable = diagnostics.filter((d) => d.autoFixAvailable).length;

    const penalty = errors * 15 + warnings * 5;
    const score = Math.max(0, Math.min(100, 100 - penalty));

    const health: FormHealthMetrics = {
      totalFields,
      mandatoryFields,
      codelistsAttached,
      calculatedFields,
      conditionalRules,
      sdvVerifiedCount,
      sdvReadinessPercentage: sdvReadiness,
      cdashConformancePercentage: cdashConformance,
      missingCoreVariables: Array.from(allMissingCoreVariables),
    };

    return {
      isCompliant: errors === 0,
      score,
      health,
      diagnostics,
      summary: {
        errors,
        warnings,
        infos,
        fixable,
      },
      autoFix: (diagnosticId: string) =>
        StudyAuditor.applyAutoFix(study, diagnosticId),
      autoFixAll: () => StudyAuditor.applyAutoFixAll(study, diagnostics),
    };
  }

  /**
   * Audits an individual CRF Form.
   */
  public static auditForm(
    form: CRFForm,
    studyContext?: StudyProtocol
  ): FormAuditReport {
    const syntheticStudy: StudyProtocol = studyContext || {
      id: "synthetic_study",
      protocolNumber: "SYNTH-001",
      studyName: "Single Form Context",
      phase: "Phase III",
      sponsor: "Synthetic Sponsor",
      therapeuticArea: "Oncology",
      version: "1.0",
      lastModified: new Date().toISOString(),
      forms: [form],
      visits: [],
      codelists: [],
    };

    const fullReport = StudyAuditor.audit(syntheticStudy);
    const formDiagnostics = fullReport.diagnostics.filter(
      (d) => d.formId === form.id
    );

    return {
      formId: form.id,
      formName: form.name,
      isCompliant: !formDiagnostics.some((d) => d.severity === "error"),
      health: fullReport.health,
      diagnostics: formDiagnostics,
    };
  }

  /**
   * Evaluates and tokenizes an arithmetic formula expression against a list of fields.
   */
  public static auditFormula(
    formula: string,
    fields: CRFField[]
  ): FormulaLintResult {
    return lintFormula(formula, fields);
  }

  /**
   * Applies an individual 1-click auto-fix remediation to a StudyProtocol instance.
   */
  public static applyAutoFix(
    study: StudyProtocol,
    diagnosticId: string
  ): StudyProtocol {
    const report = StudyAuditor.audit(study);
    const target = report.diagnostics.find((d) => d.id === diagnosticId);
    if (!target || !target.autoFixAvailable) {
      return study;
    }

    const cloned: StudyProtocol = JSON.parse(JSON.stringify(study));

    if (
      (target.autoFixType === "prune_study_rule_reference" ||
        target.autoFixType === ("prune_invalid_field_ref" as string)) &&
      target.ruleId
    ) {
      const allFields = StudyAuditor.getAllFields(cloned);
      const resolveField = (ref: string) =>
        StudyAuditor.resolveFieldInStudy(ref, cloned, allFields);

      // Fix study-level rules
      if (cloned.rules && cloned.rules.length > 0) {
        cloned.rules = cloned.rules
          .map((rule) => {
            if (rule.id !== target.ruleId) return rule;
            const updatedTriggers = (rule.triggerFieldIds || []).filter((id) =>
              resolveField(id)
            );
            const updatedConditions = (rule.conditions || []).filter((c) =>
              resolveField(c.fieldId)
            );
            const targetValid = rule.targetFieldId
              ? resolveField(rule.targetFieldId)
              : true;
            const updatedTarget = targetValid ? rule.targetFieldId : "";

            return {
              ...rule,
              triggerFieldIds: updatedTriggers,
              conditions: updatedConditions,
              targetFieldId: updatedTarget,
            };
          })
          .filter((rule) => {
            const hasTriggers = (rule.triggerFieldIds || []).length > 0;
            const hasConditions =
              (rule.conditions || []).filter((c) => Boolean(c.fieldId)).length >
              0;
            const hasTarget = Boolean(rule.targetFieldId);
            return hasTriggers || hasConditions || hasTarget;
          });
      }

      // Fix form-level rules
      cloned.forms.forEach((form) => {
        if (form.rules && form.rules.length > 0) {
          form.rules = form.rules
            .map((rule) => {
              if (rule.id !== target.ruleId) return rule;
              const updatedTriggers = (rule.triggerFieldIds || []).filter(
                (id) => resolveField(id)
              );
              const updatedConditions = (rule.conditions || []).filter((c) =>
                resolveField(c.fieldId)
              );
              const targetValid = rule.targetFieldId
                ? resolveField(rule.targetFieldId)
                : true;
              const updatedTarget = targetValid ? rule.targetFieldId : "";

              return {
                ...rule,
                triggerFieldIds: updatedTriggers,
                conditions: updatedConditions,
                targetFieldId: updatedTarget,
              };
            })
            .filter((rule) => {
              const hasTriggers = (rule.triggerFieldIds || []).length > 0;
              const hasConditions =
                (rule.conditions || []).filter((c) => Boolean(c.fieldId))
                  .length > 0;
              const hasTarget = Boolean(rule.targetFieldId);
              return hasTriggers || hasConditions || hasTarget;
            });
        }
      });
    }

    if (
      target.autoFixType === "truncate_variable" &&
      target.fieldId &&
      target.formId
    ) {
      const form = cloned.forms.find((f) => f.id === target.formId);
      if (form) {
        form.sections.forEach((sec) => {
          const fld = sec.fields.find((f) => f.id === target.fieldId);
          if (fld && fld.variableName) {
            fld.variableName = fld.variableName.substring(0, 8).toUpperCase();
          }
        });
      }
    }

    if (target.autoFixType === "assign_visit_form" && target.formId) {
      if (cloned.visits.length > 0) {
        const firstVisit = cloned.visits[0];
        const assigned = firstVisit.assignedFormIds || firstVisit.formIds || [];
        if (!assigned.includes(target.formId)) {
          firstVisit.assignedFormIds = [...assigned, target.formId];
        }
      }
    }

    if (
      target.autoFixType === "assign_nci_codelist" &&
      target.fieldId &&
      target.formId
    ) {
      const form = cloned.forms.find((f) => f.id === target.formId);
      if (form) {
        form.sections.forEach((sec) => {
          const fld = sec.fields.find((f) => f.id === target.fieldId);
          if (fld && (!fld.customOptions || fld.customOptions.length === 0)) {
            const nyCodelist = STANDARD_CODELISTS.find((c) => c.id === "CL_NY");
            fld.codelistId = "CL_NY";
            fld.customOptions = nyCodelist
              ? nyCodelist.options
              : [
                  { code: "Y", label: "Yes", order: 1 },
                  { code: "N", label: "No", order: 2 },
                ];
          }
        });
      }
    }

    if (
      target.autoFixType === "fix_date_format" &&
      target.fieldId &&
      target.formId
    ) {
      const form = cloned.forms.find((f) => f.id === target.formId);
      if (form) {
        form.sections.forEach((sec) => {
          const fld = sec.fields.find((f) => f.id === target.fieldId);
          if (fld && fld.defaultValue) {
            const parsed = new Date(String(fld.defaultValue));
            if (!isNaN(parsed.getTime())) {
              fld.defaultValue = parsed.toISOString().split("T")[0];
            } else {
              fld.defaultValue = new Date().toISOString().split("T")[0];
            }
          }
        });
      }
    }

    if (
      target.autoFixType === "add_core_variable" &&
      target.variableName &&
      target.formId
    ) {
      const form = cloned.forms.find((f) => f.id === target.formId);
      if (form && form.sections.length > 0) {
        const targetSection = form.sections[0];
        const newField: CRFField = {
          id: `fld_autofix_${target.variableName.toLowerCase()}_${Date.now()}`,
          variableName: target.variableName,
          label: target.variableName,
          dataType: target.variableName.endsWith("DTC") ? "date" : "text",
          required: true,
          columnSpan: 6,
        };
        targetSection.fields.push(newField);
      }
    }

    return cloned;
  }

  /**
   * Applies all available auto-fix remediations in a single pass.
   */
  public static applyAutoFixAll(
    study: StudyProtocol,
    diagnostics?: AuditDiagnostic[]
  ): { protocol: StudyProtocol; fixedCount: number } {
    let currentStudy = study;
    let fixedCount = 0;
    const diags = diagnostics || StudyAuditor.audit(study).diagnostics;
    const fixables = diags.filter((d) => d.autoFixAvailable);

    for (const diag of fixables) {
      const next = StudyAuditor.applyAutoFix(currentStudy, diag.id);
      if (next !== currentStudy) {
        currentStudy = next;
        fixedCount++;
      }
    }

    return { protocol: currentStudy, fixedCount };
  }
}
