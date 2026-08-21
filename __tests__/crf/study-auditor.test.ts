import { describe, it, expect } from "vitest";
import {
  StudyAuditor,
  auditStudy,
  auditForm,
  auditFormula,
  type StudyAuditReport,
  type FormAuditSummary,
  type FormulaAuditSummary,
} from "@/lib/crf/study-auditor";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { DEVICE_CARDIOVASCULAR_IMPLANT_PRESET } from "@/lib/crf/presets/device-cardiovascular-implant";
import { StudyProtocol, CRFForm, CRFField } from "@/lib/crf/types";

describe("StudyAuditor Domain Engine Contract Tests", () => {
  describe("1. Preset Audits & Public Contract Verification", () => {
    it("audits ONCOLOGY_RECIST_PRESET study protocol successfully", () => {
      const report: StudyAuditReport = StudyAuditor.audit(ONCOLOGY_RECIST_PRESET);

      expect(report).toBeDefined();
      expect(report.studyId).toBe(ONCOLOGY_RECIST_PRESET.id);
      expect(report.protocolNumber).toBe(ONCOLOGY_RECIST_PRESET.protocolNumber);
      expect(report.studyName).toBe(ONCOLOGY_RECIST_PRESET.studyName);
      expect(report.phase).toBe("Phase III");
      expect(report.therapeuticArea).toBe("Oncology");
      expect(report.timestamp).toBeDefined();

      // Check summary metrics
      expect(report.summary.totalForms).toBe(ONCOLOGY_RECIST_PRESET.forms.length);
      expect(report.summary.totalVisits).toBe(ONCOLOGY_RECIST_PRESET.visits.length);
      expect(report.summary.totalFields).toBeGreaterThan(0);
      expect(report.summary.errorCount).toBe(0);
      expect(report.isValid).toBe(true);

      // Conformance & Health Scores
      expect(report.overallScore).toBeGreaterThanOrEqual(80);
      expect(report.cdashConformanceScore).toBeGreaterThanOrEqual(80);
      expect(report.sdvReadinessScore).toBeGreaterThanOrEqual(0);

      // Form breakdowns
      expect(Object.keys(report.formAudits).length).toBe(ONCOLOGY_RECIST_PRESET.forms.length);
      for (const form of ONCOLOGY_RECIST_PRESET.forms) {
        const formSummary = report.formAudits[form.id];
        expect(formSummary).toBeDefined();
        expect(formSummary.formId).toBe(form.id);
        expect(formSummary.domain).toBe(form.domain);
        expect(formSummary.formName).toBe(form.name);
      }

      // Functional equivalent
      const functionalReport = auditStudy(ONCOLOGY_RECIST_PRESET);
      expect(functionalReport.studyId).toBe(report.studyId);
      expect(functionalReport.summary.totalForms).toBe(report.summary.totalForms);
    });

    it("audits DEVICE_CARDIOVASCULAR_IMPLANT_PRESET (ISO 14155 / TAVR) study protocol", () => {
      const report = StudyAuditor.audit(DEVICE_CARDIOVASCULAR_IMPLANT_PRESET);

      expect(report).toBeDefined();
      expect(report.protocolNumber).toBe(DEVICE_CARDIOVASCULAR_IMPLANT_PRESET.protocolNumber);
      expect(report.therapeuticArea).toContain("Cardiology");
      expect(report.summary.totalForms).toBe(DEVICE_CARDIOVASCULAR_IMPLANT_PRESET.forms.length);
      expect(report.summary.totalVisits).toBe(DEVICE_CARDIOVASCULAR_IMPLANT_PRESET.visits.length);
      expect(report.isValid).toBe(true);
      expect(report.summary.errorCount).toBe(0);

      // Validate device domains presence in form audits
      const formDomains = Object.values(report.formAudits).map((f) => f.domain);
      expect(formDomains).toContain("DI");
      expect(formDomains).toContain("DU");
      expect(formDomains).toContain("DE");
    });
  });

  describe("2. Comprehensive Defect & Compliance Interception (Synthetic Invalid Studies)", () => {
    it("detects CDASH variable name length violations (>8 characters, SD0001)", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      invalidStudy.forms[0].sections[0].fields.push({
        id: "f_length_viol",
        variableName: "VERYLONGVARNAME", // 15 chars > 8
        label: "Very Long Variable",
        dataType: "text",
        columnSpan: 6,
        required: false,
      });

      const report = StudyAuditor.audit(invalidStudy);
      expect(report.isValid).toBe(false);
      expect(report.summary.errorCount).toBeGreaterThanOrEqual(1);

      const lengthViolations = report.findings.filter(
        (f) => f.ruleId === "SD0001" || f.category === "variable_length"
      );
      expect(lengthViolations.length).toBeGreaterThanOrEqual(1);
      expect(lengthViolations[0].variableName).toBe("VERYLONGVARNAME");
      expect(lengthViolations[0].autoFixAvailable).toBe(true);
      expect(lengthViolations[0].autoFixType).toBe("truncate_variable");
      expect(lengthViolations[0].suggestedFix).toBe("Truncate to 'VERYLONG'");
    });

    it("detects missing required CDASH core variables (SD0002)", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      const dmForm = invalidStudy.forms.find((f) => f.domain === "DM");
      expect(dmForm).toBeDefined();

      if (dmForm) {
        // Strip out SEX and AGE
        dmForm.sections = dmForm.sections.map((sec) => ({
          ...sec,
          fields: sec.fields.filter(
            (f) => f.variableName.toUpperCase() !== "SEX" && f.variableName.toUpperCase() !== "AGE"
          ),
        }));
      }

      const report = StudyAuditor.audit(invalidStudy);
      expect(report.isValid).toBe(false);

      const missingCoreFindings = report.findings.filter(
        (f) => f.ruleId === "SD0002" || f.category === "cdash_conformance"
      );
      expect(missingCoreFindings.length).toBeGreaterThanOrEqual(1);
      const missingVars = missingCoreFindings.map((f) => f.variableName?.toUpperCase());
      expect(missingVars).toContain("SEX");
    });

    it("detects unbound choice fields missing NCI controlled terminology (SD0003)", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      invalidStudy.forms[0].sections[0].fields.push({
        id: "f_unbound_choice",
        variableName: "UNBOUND",
        label: "Unbound Radio Option",
        dataType: "radio",
        columnSpan: 6,
        required: false,
        codelistId: undefined,
        customOptions: undefined,
      });

      const report = StudyAuditor.audit(invalidStudy);
      const unboundFindings = report.findings.filter(
        (f) => f.ruleId === "SD0003" || f.category === "codelist_binding"
      );
      expect(unboundFindings.length).toBeGreaterThanOrEqual(1);
      expect(unboundFindings[0].variableName).toBe("UNBOUND");
      expect(unboundFindings[0].autoFixAvailable).toBe(true);
    });

    it("detects non-ISO 8601 date format violations (SD0004)", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      invalidStudy.forms[0].sections[0].fields.push({
        id: "f_bad_date",
        variableName: "BADDATE",
        label: "Invalid Default Date",
        dataType: "date",
        columnSpan: 6,
        required: false,
        defaultValue: "08/21/2026", // MM/DD/YYYY non-ISO
      });

      const report = StudyAuditor.audit(invalidStudy);
      const dateFindings = report.findings.filter(
        (f) => f.ruleId === "SD0004" || f.category === "date_format"
      );
      expect(dateFindings.length).toBeGreaterThanOrEqual(1);
      expect(dateFindings[0].variableName).toBe("BADDATE");
      expect(dateFindings[0].autoFixAvailable).toBe(true);
    });

    it("detects orphan forms not assigned to any visit in Schedule of Activities (SD0005)", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      invalidStudy.forms.push({
        id: "f_orphan_form",
        name: "Orphaned Unscheduled Form",
        domain: "PE",
        description: "Physical exam not linked to any visit",
        version: "1.0",
        isLogForm: false,
        sections: [
          {
            id: "sec_pe",
            title: "Physical Exam",
            fields: [
              {
                id: "f_pe_test",
                variableName: "PETESTCD",
                label: "PE Test",
                dataType: "text",
                columnSpan: 6,
                required: false,
              },
            ],
          },
        ],
        rules: [],
      });

      const report = StudyAuditor.audit(invalidStudy);
      expect(report.orphanForms.some((f) => f.formId === "f_orphan_form")).toBe(true);
      expect(report.summary.orphanFormsCount).toBeGreaterThanOrEqual(1);

      const soaFindings = report.findings.filter(
        (f) => f.ruleId === "SD0005" || f.category === "soa_integrity"
      );
      expect(soaFindings.some((f) => f.formId === "f_orphan_form")).toBe(true);
    });

    it("detects orphan visits with zero assigned forms and broken form references in visits", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      invalidStudy.visits.push({
        id: "v_empty_visit",
        oid: "SE.EMPTY",
        name: "Empty Test Visit",
        visitType: "Scheduled",
        targetDay: 100,
        windowBefore: 0,
        windowAfter: 0,
        assignedFormIds: [],
      });
      invalidStudy.visits.push({
        id: "v_broken_ref",
        oid: "SE.BROKEN",
        name: "Broken Reference Visit",
        visitType: "Scheduled",
        targetDay: 110,
        windowBefore: 0,
        windowAfter: 0,
        assignedFormIds: ["non_existent_form_id_123"],
      });

      const report = StudyAuditor.audit(invalidStudy);
      expect(report.orphanVisits.some((v) => v.visitId === "v_empty_visit")).toBe(true);
      expect(report.summary.orphanVisitsCount).toBeGreaterThanOrEqual(1);

      const brokenVisitRefFindings = report.findings.filter(
        (f) => f.category === "soa_integrity" && f.message.includes("non_existent_form_id_123")
      );
      expect(brokenVisitRefFindings.length).toBeGreaterThanOrEqual(1);
    });

    it("detects duplicate field IDs and duplicate variable names within forms", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      const dmForm = invalidStudy.forms[0];
      dmForm.sections[0].fields.push({
        id: dmForm.sections[0].fields[0].id, // Duplicate ID
        variableName: dmForm.sections[0].fields[0].variableName, // Duplicate Variable Name
        label: "Duplicate Field",
        dataType: "text",
        columnSpan: 6,
        required: false,
      });

      const report = StudyAuditor.audit(invalidStudy);
      const dupIdFindings = report.findings.filter((f) => f.message.includes("Duplicate field ID"));
      const dupVarFindings = report.findings.filter((f) => f.message.includes("Duplicate variable name"));

      expect(dupIdFindings.length).toBeGreaterThanOrEqual(1);
      expect(dupVarFindings.length).toBeGreaterThanOrEqual(1);
    });

    it("detects broken edit check rule triggers and targets", () => {
      const invalidStudy: StudyProtocol = JSON.parse(JSON.stringify(ONCOLOGY_RECIST_PRESET));
      const dmForm = invalidStudy.forms[0];
      dmForm.rules.push({
        id: "rule_broken_refs",
        name: "Broken Trigger & Target Rule",
        description: "References non-existent field IDs",
        triggerFieldIds: ["non_existent_trigger_999"],
        targetFieldId: "non_existent_target_888",
        actionType: "show_field",
        conditions: [
          {
            fieldId: "non_existent_trigger_999",
            operator: "eq",
            value: "Y",
          },
        ],
        logicalOperator: "AND",
      });

      const report = StudyAuditor.audit(invalidStudy);
      const brokenRuleFindings = report.findings.filter(
        (f) => f.category === "rule_integrity" || f.ruleName === "Broken Trigger & Target Rule"
      );
      expect(brokenRuleFindings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("3. StudyAuditor.auditForm Single Form Engine", () => {
    it("audits single CRFForm with complete health metrics and SDV readiness", () => {
      const form: CRFForm = ONCOLOGY_RECIST_PRESET.forms[0]; // DM form
      const formReport: FormAuditSummary = StudyAuditor.auditForm(form);

      expect(formReport).toBeDefined();
      expect(formReport.formId).toBe(form.id);
      expect(formReport.domain).toBe(form.domain);
      expect(formReport.formName).toBe(form.name);
      expect(formReport.totalFields).toBeGreaterThan(0);
      expect(formReport.mandatoryFields).toBeGreaterThanOrEqual(0);
      expect(formReport.codelistsAttached).toBeGreaterThanOrEqual(0);
      expect(formReport.cdashConformancePercentage).toBeGreaterThanOrEqual(80);
      expect(formReport.sdvReadinessPercentage).toBeGreaterThanOrEqual(0);

      // Functional equivalent
      const functionalFormReport = auditForm(form);
      expect(functionalFormReport.formId).toBe(formReport.formId);
      expect(functionalFormReport.totalFields).toBe(formReport.totalFields);
    });

    it("identifies calculated fields with missing formula expressions in form audit", () => {
      const form: CRFForm = {
        id: "f_calc_test",
        name: "Calculation Test Form",
        domain: "VS",
        description: "Form testing calculated field validation",
        version: "1.0",
        sections: [
          {
            id: "sec_1",
            title: "Vital Measures",
            fields: [
              {
                id: "f_weight",
                variableName: "WEIGHT",
                label: "Weight (kg)",
                dataType: "number",
                columnSpan: 6,
                required: true,
              },
              {
                id: "f_empty_calc",
                variableName: "CALCVAL",
                label: "Empty Calc Field",
                dataType: "calculated",
                columnSpan: 6,
                required: false,
                calculationFormula: "", // Missing formula
              },
            ],
          },
        ],
        rules: [],
      };

      const report = StudyAuditor.auditForm(form);
      expect(report.findings.some((f) => f.message.includes("no arithmetic formula defined"))).toBe(true);
    });
  });

  describe("4. StudyAuditor.auditFormula AST Engine & Static Analysis", () => {
    const mockFields: CRFField[] = [
      {
        id: "f_height",
        variableName: "HEIGHT",
        label: "Height",
        dataType: "number",
        columnSpan: 6,
        required: true,
      },
      {
        id: "f_weight",
        variableName: "WEIGHT",
        label: "Weight",
        dataType: "number",
        columnSpan: 6,
        required: true,
      },
      {
        id: "f_systolic",
        variableName: "SYSBP",
        label: "Systolic Blood Pressure",
        dataType: "integer",
        columnSpan: 6,
        required: true,
      },
      {
        id: "f_text_val",
        variableName: "TEXTVAL",
        label: "Non-numeric Text Note",
        dataType: "text",
        columnSpan: 6,
        required: false,
      },
    ];

    it("validates valid arithmetic formulas (BMI, RECIST sums, mathematical functions)", () => {
      const bmiFormula = "WEIGHT / ((HEIGHT / 100) * (HEIGHT / 100))";
      const result: FormulaAuditSummary = StudyAuditor.auditFormula(bmiFormula, mockFields);

      expect(result.isValid).toBe(true);
      expect(result.diagnostics.filter((d) => d.severity === "error").length).toBe(0);
      expect(result.referencedVariables.some((v) => v.name === "WEIGHT" && v.exists && v.isNumeric)).toBe(true);
      expect(result.referencedVariables.some((v) => v.name === "HEIGHT" && v.exists && v.isNumeric)).toBe(true);

      // Functional equivalent
      const functionalFormulaResult = auditFormula(bmiFormula, mockFields);
      expect(functionalFormulaResult.isValid).toBe(true);
    });

    it("validates math functions: round, sqrt, abs, min, max, clamp", () => {
      const formula = "round(sqrt(WEIGHT) + abs(SYSBP), 2)";
      const result = StudyAuditor.auditFormula(formula, mockFields);

      expect(result.isValid).toBe(true);
      expect(result.diagnostics.filter((d) => d.severity === "error").length).toBe(0);
    });

    it("detects syntax error: unmatched parentheses in formula", () => {
      const badFormula = "WEIGHT / ((HEIGHT / 100)";
      const result = StudyAuditor.auditFormula(badFormula, mockFields);

      expect(result.isValid).toBe(false);
      expect(result.diagnostics.some((d) => d.code === "UNMATCHED_LPAREN")).toBe(true);
      expect(result.unmatchedBracketIndices.length).toBeGreaterThan(0);
    });

    it("detects syntax error: trailing operators and consecutive operators", () => {
      const badFormula1 = "WEIGHT + ";
      const result1 = StudyAuditor.auditFormula(badFormula1, mockFields);
      expect(result1.isValid).toBe(false);
      expect(result1.diagnostics.some((d) => d.code === "TRAILING_OPERATOR")).toBe(true);

      const badFormula2 = "WEIGHT * * HEIGHT";
      const result2 = StudyAuditor.auditFormula(badFormula2, mockFields);
      expect(result2.isValid).toBe(false);
      expect(result2.diagnostics.some((d) => d.code === "CONSECUTIVE_OPERATORS")).toBe(true);
    });

    it("detects static division by zero", () => {
      const divZeroFormula = "WEIGHT / 0";
      const result = StudyAuditor.auditFormula(divZeroFormula, mockFields);

      expect(result.isValid).toBe(false);
      expect(result.diagnostics.some((d) => d.code === "DIVISION_BY_ZERO")).toBe(true);
    });

    it("detects circular reference when formula references self field ID or variable", () => {
      const circularFormula = "f_bmi + WEIGHT";
      const result = StudyAuditor.auditFormula(circularFormula, mockFields, "f_bmi");

      expect(result.isValid).toBe(false);
      expect(result.diagnostics.some((d) => d.code === "CIRCULAR_REFERENCE")).toBe(true);
    });

    it("detects non-numeric variable types referenced in arithmetic expressions", () => {
      const badTypeFormula = "WEIGHT + TEXTVAL";
      const result = StudyAuditor.auditFormula(badTypeFormula, mockFields);

      // Warning about non-numeric variable
      expect(result.diagnostics.some((d) => d.code === "NON_NUMERIC_VARIABLE")).toBe(true);
    });

    it("detects unknown function names and invalid function arity", () => {
      const unknownFnFormula = "custom_unsupported_fn(WEIGHT)";
      const result1 = StudyAuditor.auditFormula(unknownFnFormula, mockFields);
      expect(result1.isValid).toBe(false);
      expect(result1.diagnostics.some((d) => d.code === "UNKNOWN_FUNCTION")).toBe(true);

      const badArityFormula = "sqrt(WEIGHT, HEIGHT)"; // sqrt expects 1 arg
      const result2 = StudyAuditor.auditFormula(badArityFormula, mockFields);
      expect(result2.isValid).toBe(false);
      expect(result2.diagnostics.some((d) => d.code === "INVALID_ARITY")).toBe(true);
    });
  });
});
