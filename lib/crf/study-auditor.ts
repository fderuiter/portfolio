/**
 * CRF Studio StudyAuditor Domain Engine
 * Unified clinical protocol audit service providing deep AST syntax verification,
 * CDASH 2.2 variable length and conformance validation, NCI controlled terminology auditing,
 * Schedule of Activities (SoA) integrity checks, and SDV readiness telemetry behind a single
 * typed StudyAuditReport contract.
 */

import {
  StudyProtocol,
  CRFForm,
  CRFField,
  EditCheckRule,
} from "./types";
import { CDASH_STANDARD_VARIABLES } from "./cdash-domain-templates";
import { lintFormula, FormulaDiagnostic, HighlightToken } from "./formula-linter";
import { validateStudyCompliance } from "./cdisc-conformance-linter";

export type AuditSeverity = "error" | "warning" | "info";

export type AuditCategory =
  | "cdash_conformance"
  | "variable_length"
  | "codelist_binding"
  | "date_format"
  | "soa_integrity"
  | "ast_syntax"
  | "rule_integrity"
  | "sdv_governance"
  | "general";

export interface AuditFinding {
  id: string;
  category: AuditCategory;
  ruleId: string;
  severity: AuditSeverity;
  message: string;
  formId?: string;
  formName?: string;
  fieldId?: string;
  variableName?: string;
  ruleName?: string;
  location?: string;
  autoFixAvailable?: boolean;
  autoFixType?: "truncate_variable" | "add_core_variable" | "assign_nci_codelist" | "fix_date_format" | "assign_visit_form";
  suggestedFix?: string;
}

export interface FormAuditSummary {
  formId: string;
  domain: string;
  formName: string;
  isValid: boolean;
  totalFields: number;
  mandatoryFields: number;
  codelistsAttached: number;
  sdvVerifiedCount: number;
  sdvReadinessPercentage: number;
  cdashConformancePercentage: number;
  missingCoreVariables: string[];
  findings: AuditFinding[];
  formulaAuditCount: number;
  invalidFormulaCount: number;
}

export interface FormulaAuditSummary {
  formula: string;
  isValid: boolean;
  diagnostics: FormulaDiagnostic[];
  tokens: HighlightToken[];
  unmatchedBracketIndices: number[];
  referencedVariables: {
    name: string;
    field?: CRFField;
    isNumeric: boolean;
    exists: boolean;
  }[];
}

export interface StudyAuditReport {
  studyId: string;
  protocolNumber: string;
  studyName: string;
  phase?: string;
  therapeuticArea?: string;
  timestamp: string;
  isValid: boolean;
  overallScore: number;
  cdashConformanceScore: number;
  sdvReadinessScore: number;
  summary: {
    totalForms: number;
    totalVisits: number;
    totalFields: number;
    totalRules: number;
    totalFindings: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
    autoFixableCount: number;
    orphanFormsCount: number;
    orphanVisitsCount: number;
  };
  findings: AuditFinding[];
  orphanForms: { formId: string; formName: string; domain: string }[];
  orphanVisits: { visitId: string; visitName: string; oid: string }[];
  formAudits: Record<string, FormAuditSummary>;
  formulaAudits: Record<string, FormulaAuditSummary>;
}

export interface FormAuditContext {
  allStudyFields?: CRFField[];
  studyRules?: EditCheckRule[];
}

/**
 * Retrieves standard CDASH core (Required or Highly Recommended) variables for a clinical domain.
 * Derived directly from the single source of truth in CDASH_STANDARD_VARIABLES.
 */
export function getDomainCoreVariables(domain: string): string[] {
  const domainUpper = (domain || "").trim().toUpperCase();
  const stdVars = CDASH_STANDARD_VARIABLES[domainUpper] || [];
  return stdVars
    .filter((v) => v.core === "HR" || v.core === "R")
    .map((v) => v.sdtmVariable.toUpperCase());
}

/**
 * Pure AST static formula auditing engine without eval() execution.
 */
export function auditFormula(
  formula: string,
  fields: CRFField[] = [],
  currentFieldId?: string
): FormulaAuditSummary {
  const result = lintFormula(formula, fields, currentFieldId);
  return {
    formula,
    isValid: result.isValid,
    diagnostics: result.diagnostics,
    tokens: result.tokens,
    unmatchedBracketIndices: result.unmatchedBracketIndices,
    referencedVariables: result.referencedVariables,
  };
}

/**
 * Pure functional audit of an individual CRF form.
 */
export function auditForm(
  form: CRFForm,
  context?: FormAuditContext
): FormAuditSummary {
  const findings: AuditFinding[] = [];
  const sections = form?.sections || [];
  const allFields = sections.flatMap((s) => s?.fields || []).filter(Boolean);
  const totalFields = allFields.length;
  const mandatoryFields = allFields.filter((f) => Boolean(f.required)).length;
  const codelistsAttached = allFields.filter(
    (f) => Boolean(f.codelistId || (f.customOptions && f.customOptions.length > 0))
  ).length;
  const sdvVerifiedCount = allFields.filter((f) => Boolean(f.sdvVerified)).length;
  const sdvReadinessPercentage = totalFields > 0 ? Math.round((sdvVerifiedCount / totalFields) * 100) : 0;

  const domain = (form?.domain || "").toUpperCase();
  const coreVars = getDomainCoreVariables(domain);
  const presentVarNames = new Set(
    allFields
      .map((f) => (f.variableName ? f.variableName.trim().toUpperCase() : ""))
      .filter((v) => v.length > 0)
  );

  const missingCoreVariables = coreVars.filter((v) => !presentVarNames.has(v));
  let cdashConformancePercentage = 100;
  if (coreVars.length > 0) {
    const presentCoreCount = coreVars.length - missingCoreVariables.length;
    cdashConformancePercentage = Math.round((presentCoreCount / coreVars.length) * 100);
  }

  const fieldIdSet = new Set<string>();
  const varNameSet = new Set<string>();
  const fieldLookupMap = new Map<string, CRFField>();

  let formulaAuditCount = 0;
  let invalidFormulaCount = 0;

  // 1. Audit Form Fields
  sections.forEach((section) => {
    (section.fields || []).forEach((field) => {
      // Duplicate field ID check
      if (fieldIdSet.has(field.id)) {
        findings.push({
          id: `finding_dupid_${form.id}_${field.id}`,
          category: "general",
          ruleId: "DUPLICATE_ID",
          severity: "error",
          formId: form.id,
          formName: form.name,
          fieldId: field.id,
          variableName: field.variableName,
          location: `Section "${section.title}"`,
          message: `Duplicate field ID detected: "${field.id}"`,
        });
      }
      fieldIdSet.add(field.id);
      fieldLookupMap.set(field.id, field);

      // Missing variable name
      if (!field.variableName || field.variableName.trim() === "") {
        findings.push({
          id: `finding_missingvar_${form.id}_${field.id}`,
          category: "cdash_conformance",
          ruleId: "MISSING_VAR",
          severity: "error",
          formId: form.id,
          formName: form.name,
          fieldId: field.id,
          location: `Section "${section.title}"`,
          message: `Field "${field.label}" is missing a CDASH/SDTM Variable Name`,
        });
      } else {
        const vUpper = field.variableName.trim().toUpperCase();
        // Variable length check (> 8 chars)
        if (field.variableName.length > 8) {
          const truncated = field.variableName.slice(0, 8).toUpperCase();
          findings.push({
            id: `finding_varlength_${form.id}_${field.id}`,
            category: "variable_length",
            ruleId: "SD0001",
            severity: "error",
            formId: form.id,
            formName: form.name,
            fieldId: field.id,
            variableName: field.variableName,
            location: `Field "${field.label}"`,
            message: `Variable '${field.variableName}' is ${field.variableName.length} characters long. SDTM standard requires <= 8 characters.`,
            autoFixAvailable: true,
            autoFixType: "truncate_variable",
            suggestedFix: `Truncate to '${truncated}'`,
          });
        }

        // Duplicate variable name within form
        if (varNameSet.has(vUpper)) {
          findings.push({
            id: `finding_dupvar_${form.id}_${field.id}`,
            category: "cdash_conformance",
            ruleId: "DUPLICATE_VAR",
            severity: "warning",
            formId: form.id,
            formName: form.name,
            fieldId: field.id,
            variableName: field.variableName,
            location: `Field "${field.label}"`,
            message: `Duplicate variable name "${vUpper}" across fields in form "${form.name}"`,
          });
        }
        varNameSet.add(vUpper);
      }

      // Codelist binding validation for discrete choice fields (SD0003)
      if (
        (field.dataType === "radio" ||
          field.dataType === "single_select" ||
          field.dataType === "checkbox" ||
          field.dataType === "multi_select") &&
        !field.codelistId &&
        (!field.customOptions || field.customOptions.length === 0)
      ) {
        findings.push({
          id: `finding_unbound_codelist_${form.id}_${field.id}`,
          category: "codelist_binding",
          ruleId: "SD0003",
          severity: "warning",
          formId: form.id,
          formName: form.name,
          fieldId: field.id,
          variableName: field.variableName,
          location: `Field "${field.label}"`,
          message: `Choice field '${field.variableName}' has no standard NCI codelist or custom options configured.`,
          autoFixAvailable: true,
          autoFixType: "assign_nci_codelist",
          suggestedFix: "Assign standard No/Yes (NY) codelist (C66741)",
        });
      }

      // Date format validation (SD0004)
      if (
        (field.dataType === "date" ||
          field.dataType === "datetime" ||
          field.dataType === "partial_date" ||
          field.dataType === "precision_date") &&
        field.defaultValue &&
        typeof field.defaultValue === "string" &&
        !/^\d{4}(-\d{2}(-\d{2}(T\d{2}:\d{2}(:\d{2})?)?)?)?$/.test(field.defaultValue) &&
        !/^\d{4}(-\d{2})?(-UNK)?$/.test(field.defaultValue) &&
        field.defaultValue !== "ND" &&
        field.defaultValue !== "NA" &&
        field.defaultValue !== "UNK"
      ) {
        findings.push({
          id: `finding_bad_date_${form.id}_${field.id}`,
          category: "date_format",
          ruleId: "SD0004",
          severity: "error",
          formId: form.id,
          formName: form.name,
          fieldId: field.id,
          variableName: field.variableName,
          location: `Field "${field.label}"`,
          message: `Default value '${field.defaultValue}' for date field '${field.variableName}' is not valid ISO 8601.`,
          autoFixAvailable: true,
          autoFixType: "fix_date_format",
          suggestedFix: "Reset to empty or format as YYYY-MM-DD",
        });
      }

      // Calculated Field Formula Audits
      if (field.dataType === "calculated") {
        if (!field.calculationFormula || field.calculationFormula.trim() === "") {
          findings.push({
            id: `finding_empty_formula_${form.id}_${field.id}`,
            category: "ast_syntax",
            ruleId: "CALC_EMPTY_FORMULA",
            severity: "warning",
            formId: form.id,
            formName: form.name,
            fieldId: field.id,
            variableName: field.variableName,
            location: `Field "${field.label}"`,
            message: `Calculated field "${field.label}" has no arithmetic formula defined`,
          });
        } else {
          formulaAuditCount++;
          const formulaResult = auditFormula(
            field.calculationFormula,
            context?.allStudyFields || allFields,
            field.id
          );
          if (!formulaResult.isValid) {
            invalidFormulaCount++;
            formulaResult.diagnostics.forEach((diag, idx) => {
              findings.push({
                id: `finding_formula_err_${form.id}_${field.id}_${idx}`,
                category: "ast_syntax",
                ruleId: diag.code,
                severity: diag.severity,
                formId: form.id,
                formName: form.name,
                fieldId: field.id,
                variableName: field.variableName,
                location: `Formula in field "${field.label}" [chars ${diag.start}-${diag.end}]`,
                message: diag.message,
              });
            });
          }
        }
      }
    });
  });

  // 2. Audit Missing CDASH Core Variables (SD0002)
  if (coreVars.length > 0) {
    const stdVarsForDomain = CDASH_STANDARD_VARIABLES[domain] || [];
    missingCoreVariables.forEach((missingVar) => {
      const meta = stdVarsForDomain.find((v) => v.sdtmVariable.toUpperCase() === missingVar);
      findings.push({
        id: `finding_missing_core_${form.id}_${missingVar}`,
        category: "cdash_conformance",
        ruleId: "SD0002",
        severity: "error",
        formId: form.id,
        formName: form.name,
        variableName: missingVar,
        location: `Form "${form.name}" (${form.domain})`,
        message: `Domain '${form.domain}' is missing standard CDASH Core variable '${missingVar}' (${meta?.cdashLabel || missingVar}).`,
        autoFixAvailable: true,
        autoFixType: "add_core_variable",
        suggestedFix: `Add '${missingVar}' field to form`,
      });
    });
  }

  // 3. Audit Edit Check Rules
  (form.rules || []).forEach((rule) => {
    (rule.triggerFieldIds || []).forEach((tfId) => {
      if (!fieldLookupMap.has(tfId)) {
        findings.push({
          id: `finding_broken_trigger_${form.id}_${rule.id}_${tfId}`,
          category: "rule_integrity",
          ruleId: "BROKEN_RULE_REF",
          severity: "error",
          formId: form.id,
          formName: form.name,
          ruleName: rule.name,
          location: `Edit Check Rule "${rule.name}"`,
          message: `Rule "${rule.name}" references non-existent trigger field "${tfId}"`,
        });
      }
    });

    if (rule.targetFieldId && !fieldLookupMap.has(rule.targetFieldId)) {
      findings.push({
        id: `finding_broken_target_${form.id}_${rule.id}_${rule.targetFieldId}`,
        category: "rule_integrity",
        ruleId: "BROKEN_RULE_TARGET",
        severity: "warning",
        formId: form.id,
        formName: form.name,
        ruleName: rule.name,
        location: `Edit Check Rule "${rule.name}"`,
        message: `Rule "${rule.name}" targets non-existent field "${rule.targetFieldId}"`,
      });
    }

    if (rule.formulaExpression && rule.formulaExpression.trim() !== "") {
      formulaAuditCount++;
      const formulaResult = auditFormula(
        rule.formulaExpression,
        context?.allStudyFields || allFields
      );
      if (!formulaResult.isValid) {
        invalidFormulaCount++;
        formulaResult.diagnostics.forEach((diag, idx) => {
          findings.push({
            id: `finding_rule_formula_${form.id}_${rule.id}_${idx}`,
            category: "ast_syntax",
            ruleId: diag.code,
            severity: diag.severity,
            formId: form.id,
            formName: form.name,
            ruleName: rule.name,
            location: `Rule Formula "${rule.name}" [chars ${diag.start}-${diag.end}]`,
            message: diag.message,
          });
        });
      }
    }
  });

  const errorCount = findings.filter((f) => f.severity === "error").length;

  return {
    formId: form.id,
    domain: form.domain,
    formName: form.name,
    isValid: errorCount === 0,
    totalFields,
    mandatoryFields,
    codelistsAttached,
    sdvVerifiedCount,
    sdvReadinessPercentage,
    cdashConformancePercentage,
    missingCoreVariables,
    findings,
    formulaAuditCount,
    invalidFormulaCount,
  };
}

/**
 * Pure functional holistic protocol audit engine.
 */
export function auditStudy(study: StudyProtocol): StudyAuditReport {
  const findings: AuditFinding[] = [];
  const forms = study?.forms || [];
  const visits = study?.visits || [];
  const allFields = forms.flatMap((f) => (f.sections || []).flatMap((s) => s.fields || [])).filter(Boolean);

  const formAudits: Record<string, FormAuditSummary> = {};
  const formulaAudits: Record<string, FormulaAuditSummary> = {};

  const formIdSet = new Set(forms.map((f) => f.id));
  const assignedFormIdSet = new Set<string>();

  // 1. Visit and SoA Integrity Audits
  const orphanVisits: { visitId: string; visitName: string; oid: string }[] = [];
  visits.forEach((visit) => {
    const assigned = visit.assignedFormIds || [];
    if (assigned.length === 0) {
      orphanVisits.push({
        visitId: visit.id,
        visitName: visit.name,
        oid: visit.oid,
      });
      findings.push({
        id: `finding_orphan_visit_${visit.id}`,
        category: "soa_integrity",
        ruleId: "ORPHAN_VISIT",
        severity: "warning",
        location: `Visit "${visit.name}" (${visit.oid})`,
        message: `Visit '${visit.name}' (${visit.oid}) has zero assigned clinical forms in the Schedule of Activities (SoA).`,
      });
    }

    assigned.forEach((fId) => {
      assignedFormIdSet.add(fId);
      if (!formIdSet.has(fId)) {
        findings.push({
          id: `finding_broken_visit_form_${visit.id}_${fId}`,
          category: "soa_integrity",
          ruleId: "BROKEN_VISIT_FORM_REF",
          severity: "error",
          location: `Visit "${visit.name}"`,
          message: `Visit '${visit.name}' references non-existent form ID '${fId}' in Schedule of Activities.`,
        });
      }
    });
  });

  // 2. Orphan Forms in SoA Check (SD0005)
  const orphanForms: { formId: string; formName: string; domain: string }[] = [];
  forms.forEach((form) => {
    if (!form.isLogForm && !assignedFormIdSet.has(form.id)) {
      orphanForms.push({
        formId: form.id,
        formName: form.name,
        domain: form.domain,
      });
      findings.push({
        id: `finding_orphan_form_${form.id}`,
        category: "soa_integrity",
        ruleId: "SD0005",
        severity: "warning",
        formId: form.id,
        formName: form.name,
        location: `Form "${form.name}" (${form.domain})`,
        message: `Form '${form.name}' (${form.domain}) is defined but not assigned to any study visit in the visit schedule.`,
        autoFixAvailable: visits.length > 0,
        autoFixType: "assign_visit_form",
        suggestedFix: `Assign '${form.name}' to ${visits[0]?.name || "First Visit"}`,
      });
    }
  });

  // 3. Form-Level Deep Audits
  forms.forEach((form) => {
    const formReport = auditForm(form, { allStudyFields: allFields });
    formAudits[form.id] = formReport;
    findings.push(...formReport.findings);

    // Collect formula audits from calculated fields
    (form.sections || []).forEach((sec) => {
      (sec.fields || []).forEach((field) => {
        if (field.dataType === "calculated" && field.calculationFormula) {
          if (!formulaAudits[field.calculationFormula]) {
            formulaAudits[field.calculationFormula] = auditFormula(
              field.calculationFormula,
              allFields,
              field.id
            );
          }
        }
      });
    });

    // Collect formula audits from rules
    (form.rules || []).forEach((rule) => {
      if (rule.formulaExpression) {
        if (!formulaAudits[rule.formulaExpression]) {
          formulaAudits[rule.formulaExpression] = auditFormula(
            rule.formulaExpression,
            allFields
          );
        }
      }
    });
  });

  // 4. Also run legacy cdisc conformance linter to ensure complete coverage parity
  const legacyViolations = validateStudyCompliance(study);
  legacyViolations.forEach((viol) => {
    const exists = findings.some(
      (f) =>
        f.ruleId === viol.ruleId &&
        f.formId === viol.formId &&
        (f.fieldId === viol.fieldId || f.variableName === viol.variableName)
    );
    if (!exists) {
      findings.push({
        id: `finding_${viol.id}`,
        category:
          viol.ruleId === "SD0001"
            ? "variable_length"
            : viol.ruleId === "SD0002"
            ? "cdash_conformance"
            : viol.ruleId === "SD0003"
            ? "codelist_binding"
            : viol.ruleId === "SD0004"
            ? "date_format"
            : "soa_integrity",
        ruleId: viol.ruleId,
        severity: viol.severity === "notice" ? "info" : (viol.severity as AuditSeverity),
        formId: viol.formId,
        formName: viol.formName,
        fieldId: viol.fieldId,
        variableName: viol.variableName,
        message: viol.message,
        autoFixAvailable: viol.autoFixAvailable,
        autoFixType: viol.autoFixType,
        suggestedFix: viol.suggestedFix,
      });
    }
  });

  // 5. Aggregate Summary & Telemetry Metrics
  const errorCount = findings.filter((f) => f.severity === "error").length;
  const warningCount = findings.filter((f) => f.severity === "warning").length;
  const infoCount = findings.filter((f) => f.severity === "info").length;
  const autoFixableCount = findings.filter((f) => Boolean(f.autoFixAvailable)).length;

  const totalFields = allFields.length;
  const totalRules = forms.reduce((sum, f) => sum + (f.rules?.length || 0), 0);
  const totalSdvVerified = allFields.filter((f) => Boolean(f.sdvVerified)).length;
  const sdvReadinessScore = totalFields > 0 ? Math.round((totalSdvVerified / totalFields) * 100) : 0;

  const formAuditList = Object.values(formAudits);
  const cdashConformanceScore =
    formAuditList.length > 0
      ? Math.round(
          formAuditList.reduce((acc, curr) => acc + curr.cdashConformancePercentage, 0) /
            formAuditList.length
        )
      : 100;

  // Holistic score computation:
  // Starts from 100, docks 15 points per error (min 0) and 3 points per warning
  const penalty = Math.min(100, errorCount * 15 + warningCount * 3);
  const baseScore = Math.max(0, 100 - penalty);
  const overallScore = Math.round(baseScore * 0.7 + cdashConformanceScore * 0.3);

  return {
    studyId: study?.id || "unknown",
    protocolNumber: study?.protocolNumber || "UNASSIGNED",
    studyName: study?.studyName || "Untitled Protocol",
    phase: study?.phase,
    therapeuticArea: study?.therapeuticArea,
    timestamp: new Date().toISOString(),
    isValid: errorCount === 0,
    overallScore,
    cdashConformanceScore,
    sdvReadinessScore,
    summary: {
      totalForms: forms.length,
      totalVisits: visits.length,
      totalFields,
      totalRules,
      totalFindings: findings.length,
      errorCount,
      warningCount,
      infoCount,
      autoFixableCount,
      orphanFormsCount: orphanForms.length,
      orphanVisitsCount: orphanVisits.length,
    },
    findings,
    orphanForms,
    orphanVisits,
    formAudits,
    formulaAudits,
  };
}

/**
 * StudyAuditor Deep Domain Facade
 */
export class StudyAuditor {
  /**
   * Performs an exhaustive multi-dimensional audit of an entire clinical study protocol.
   */
  public static audit(study: StudyProtocol): StudyAuditReport {
    return auditStudy(study);
  }

  /**
   * Audits an individual CRF form for CDASH conformance, duplicate variables, broken rules, and health telemetry.
   */
  public static auditForm(form: CRFForm, context?: FormAuditContext): FormAuditSummary {
    return auditForm(form, context);
  }

  /**
   * Static character-accurate AST syntax and clinical validity audit of an arithmetic formula without eval().
   */
  public static auditFormula(
    formula: string,
    fields?: CRFField[],
    currentFieldId?: string
  ): FormulaAuditSummary {
    return auditFormula(formula, fields, currentFieldId);
  }
}
