import { CRFField, CRFForm } from "./types";
import { lintFormula } from "./formula-linter";

export interface DiagnosticItem {
  id: string;
  severity: "error" | "warning" | "info";
  message: string;
  location: string;
  fieldId?: string;
  ruleId?: string;
}

/**
 * Lint CRF forms to identify dead rules, duplicate variables, broken references
 */
export function lintForm(form: CRFForm): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = [];
  const fieldMap = new Map<string, CRFField>();
  const varNames = new Set<string>();

  // 1. Check all fields
  form.sections.forEach((section) => {
    section.fields.forEach((field) => {
      // Check ID uniqueness
      if (fieldMap.has(field.id)) {
        diagnostics.push({
          id: `dup_id_${field.id}`,
          severity: "error",
          message: `Duplicate field ID detected: "${field.id}"`,
          location: `Section "${section.title}"`,
          fieldId: field.id,
        });
      }
      fieldMap.set(field.id, field);

      // Check Variable Name
      if (!field.variableName || field.variableName.trim() === "") {
        diagnostics.push({
          id: `missing_var_${field.id}`,
          severity: "error",
          message: `Field "${field.label}" is missing a CDASH/SDTM Variable Name`,
          location: `Section "${section.title}"`,
          fieldId: field.id,
        });
      } else {
        const vName = field.variableName.toUpperCase();
        if (varNames.has(vName)) {
          diagnostics.push({
            id: `dup_var_${field.id}`,
            severity: "warning",
            message: `Duplicate variable name "${vName}" across fields`,
            location: `Field "${field.label}"`,
            fieldId: field.id,
          });
        }
        varNames.add(vName);
      }

      // Check Calculated Fields
      if (field.dataType === "calculated") {
        if (!field.calculationFormula || field.calculationFormula.trim() === "") {
          diagnostics.push({
            id: `empty_formula_${field.id}`,
            severity: "warning",
            message: `Calculated field "${field.label}" has no arithmetic formula defined`,
            location: `Field "${field.label}"`,
            fieldId: field.id,
          });
        } else {
          const allFormFields = form.sections.flatMap((s) => s.fields);
          const formulaRes = lintFormula(field.calculationFormula, allFormFields, field.id);
          formulaRes.diagnostics.forEach((fd, idx) => {
            diagnostics.push({
              id: `formula_diag_${field.id}_${idx}`,
              severity: fd.severity,
              message: `Calculated field "${field.label}" formula issue: ${fd.message}`,
              location: `Field "${field.label}"`,
              fieldId: field.id,
            });
          });
        }
      }
    });
  });

  // 2. Check Rules
  form.rules.forEach((rule) => {
    rule.triggerFieldIds.forEach((tfId) => {
      if (!fieldMap.has(tfId)) {
        diagnostics.push({
          id: `broken_rule_ref_${rule.id}_${tfId}`,
          severity: "error",
          message: `Rule "${rule.name}" references non-existent trigger field "${tfId}"`,
          location: `Edit Check Rule "${rule.name}"`,
          ruleId: rule.id,
        });
      }
    });

    if (rule.targetFieldId && !fieldMap.has(rule.targetFieldId)) {
      diagnostics.push({
        id: `broken_rule_target_${rule.id}`,
        severity: "warning",
        message: `Rule "${rule.name}" targets non-existent field "${rule.targetFieldId}"`,
        location: `Edit Check Rule "${rule.name}"`,
        ruleId: rule.id,
      });
    }
  });

  return diagnostics;
}
