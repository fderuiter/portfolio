import { describe, it, expect } from "vitest";
import { StudyAuditor } from "@/lib/crf/study-auditor";
import { lintFormula } from "@/lib/crf/formula-linter";
import { StudyProtocol, CRFField } from "@/lib/crf/types";

describe("Unified Multi-Form Quality Audit Engine & Formula Linter", () => {
  const sampleFields: CRFField[] = [
    {
      id: "fld_age",
      variableName: "AGE",
      label: "Subject Age",
      dataType: "number",
      required: true,
      columnSpan: 6,
      cdashMetadata: {
        domain: "DM",
        sdtmVariable: "AGE",
        cdashLabel: "Age",
        core: "R",
        acrfAnnotation: "DM.AGE",
      },
    },
    {
      id: "fld_sex",
      variableName: "SEX",
      label: "Sex",
      dataType: "single_select",
      required: true,
      columnSpan: 6,
      cdashMetadata: {
        domain: "DM",
        sdtmVariable: "SEX",
        cdashLabel: "Sex",
        core: "R",
        acrfAnnotation: "DM.SEX",
      },
    },
    {
      id: "fld_sysbp",
      variableName: "SYSBP",
      label: "Systolic Blood Pressure",
      dataType: "number",
      required: true,
      columnSpan: 6,
      cdashMetadata: {
        domain: "VS",
        sdtmVariable: "SYSBP",
        cdashLabel: "Systolic BP",
        core: "HR",
        acrfAnnotation: "VS.SYSBP",
      },
    },
    {
      id: "fld_aeterm",
      variableName: "AETERM",
      label: "Adverse Event Term",
      dataType: "text",
      required: true,
      columnSpan: 12,
      cdashMetadata: {
        domain: "AE",
        sdtmVariable: "AETERM",
        cdashLabel: "Adverse Event Term",
        core: "R",
        acrfAnnotation: "AE.AETERM",
      },
    },
  ];

  describe("Requirement 1: Cross-Form Field Reference Resolution", () => {
    it("resolves valid cross-form and domain-qualified variable references without false positives", () => {
      const multiFormStudy: StudyProtocol = {
        id: "multi_form_study_1",
        protocolNumber: "CROSS-001",
        studyName: "Cross Form Audit Study",
        phase: "Phase III",
        sponsor: "BioTest Corp",
        therapeuticArea: "Cardiology",
        version: "1.0",
        lastModified: new Date().toISOString(),
        forms: [
          {
            id: "f_dm",
            name: "Demographics",
            domain: "DM",
            description: "Demographics Form",
            version: "1.0",
            sections: [
              {
                id: "sec_dm",
                title: "Demographics Data",
                fields: [sampleFields[0], sampleFields[1]],
              },
            ],
            rules: [],
          },
          {
            id: "f_vs",
            name: "Vital Signs",
            domain: "VS",
            description: "Vital Signs Form",
            version: "1.0",
            sections: [
              {
                id: "sec_vs",
                title: "Vitals Data",
                fields: [sampleFields[2]],
              },
            ],
            rules: [
              {
                id: "r_cross_check",
                name: "Cross Form Age-Vitals Check",
                description:
                  "Triggers on Demographics AGE and targets Vital Signs SYSBP",
                triggerFieldIds: ["DM.AGE", "fld_sex"],
                actionType: "require_field",
                targetFieldId: "VS.SYSBP",
                conditions: [
                  {
                    fieldId: "DM.AGE",
                    operator: "gte",
                    value: 18,
                  },
                ],
                logicalOperator: "AND",
              },
            ],
          },
        ],
        visits: [
          {
            id: "v_screen",
            oid: "SE.SCR",
            name: "Screening",
            visitType: "Scheduled",
            targetDay: 1,
            windowBefore: 0,
            windowAfter: 0,
            assignedFormIds: ["f_dm", "f_vs"],
          },
        ],
        codelists: [],
      };

      const report = StudyAuditor.audit(multiFormStudy);
      const ruleErrors = report.diagnostics.filter(
        (d) => d.tier === "ast" && d.ruleId === "r_cross_check"
      );

      expect(ruleErrors.length).toBe(0);
    });
  });

  describe("Requirement 2: Study-Level Rule Evaluation", () => {
    it("evaluates study-level rules alongside form-level rules in protocol audit runs", () => {
      const studyWithGlobalRules: StudyProtocol = {
        id: "study_global_rules",
        protocolNumber: "GLOB-001",
        studyName: "Global Rules Study",
        phase: "Phase II",
        sponsor: "PharmaGlobal",
        therapeuticArea: "Oncology",
        version: "1.0",
        lastModified: new Date().toISOString(),
        forms: [
          {
            id: "f_dm",
            name: "Demographics",
            domain: "DM",
            description: "Demographics Form",
            version: "1.0",
            sections: [
              {
                id: "sec_dm",
                title: "DM Section",
                fields: [sampleFields[0]],
              },
            ],
            rules: [],
          },
        ],
        visits: [
          {
            id: "v1",
            oid: "SE.V1",
            name: "Visit 1",
            visitType: "Scheduled",
            targetDay: 1,
            windowBefore: 0,
            windowAfter: 0,
            assignedFormIds: ["f_dm"],
          },
        ],
        codelists: [],
        rules: [
          {
            id: "study_rule_valid",
            name: "Study Protocol Inclusion Check",
            description: "Verifies subject age across study",
            triggerFieldIds: ["DM.AGE"],
            actionType: "raise_query",
            targetFieldId: "fld_age",
            conditions: [
              {
                fieldId: "DM.AGE",
                operator: "gte",
                value: 18,
              },
            ],
            logicalOperator: "AND",
          },
          {
            id: "study_rule_invalid",
            name: "Broken Study Rule",
            description: "References non-existent field",
            triggerFieldIds: ["NON_EXISTENT_VAR"],
            actionType: "raise_query",
            targetFieldId: "fld_age",
            conditions: [],
            logicalOperator: "AND",
          },
        ],
      };

      const report = StudyAuditor.audit(studyWithGlobalRules);

      expect(report.health.conditionalRules).toBeGreaterThanOrEqual(2);
      const studyRuleDiag = report.diagnostics.find(
        (d) => d.ruleId === "study_rule_invalid"
      );

      expect(studyRuleDiag).toBeDefined();
      expect(studyRuleDiag?.severity).toBe("error");
      expect(report.score).toBeLessThan(100);
    });
  });

  describe("Requirement 3: Single-Click Auto-Fix for Invalid Study-Level Rules", () => {
    it("prunes invalid/orphaned field references in study-level rules using autoFixAll", () => {
      const invalidStudy: StudyProtocol = {
        id: "autofix_study_rules",
        protocolNumber: "FIX-001",
        studyName: "AutoFix Study",
        phase: "Phase I",
        sponsor: "Innovate Bio",
        therapeuticArea: "Neurology",
        version: "1.0",
        lastModified: new Date().toISOString(),
        forms: [
          {
            id: "f_dm",
            name: "Demographics",
            domain: "DM",
            description: "Demographics",
            version: "1.0",
            sections: [
              {
                id: "sec_1",
                title: "Demographics",
                fields: [sampleFields[0]],
              },
            ],
            rules: [],
          },
        ],
        visits: [
          {
            id: "v1",
            oid: "SE.V1",
            name: "Visit 1",
            visitType: "Scheduled",
            targetDay: 1,
            windowBefore: 0,
            windowAfter: 0,
            assignedFormIds: ["f_dm"],
          },
        ],
        codelists: [],
        rules: [
          {
            id: "r_broken_study",
            name: "Orphaned Study Rule",
            description: "Invalid triggers",
            triggerFieldIds: ["ORPHAN_FIELD_X"],
            actionType: "show_field",
            targetFieldId: "ORPHAN_FIELD_X",
            conditions: [
              {
                fieldId: "ORPHAN_FIELD_X",
                operator: "eq",
                value: "TEST",
              },
            ],
            logicalOperator: "AND",
          },
        ],
      };

      const initialReport = StudyAuditor.audit(invalidStudy);
      expect(initialReport.summary.errors).toBeGreaterThan(0);

      const { protocol: fixedStudy, fixedCount } = initialReport.autoFixAll();
      expect(fixedCount).toBeGreaterThan(0);

      const cleanReport = StudyAuditor.audit(fixedStudy);
      const remainingRuleErrors = cleanReport.diagnostics.filter(
        (d) => d.tier === "ast" && d.ruleId === "r_broken_study"
      );
      expect(remainingRuleErrors.length).toBe(0);
    });
  });

  describe("Requirement 4: Relational Operator Formula Tokenization & Linting", () => {
    it("tokenizes and parses relational operators cleanly without emitting unexpected token errors", () => {
      const relationalFormulas = [
        "AGE >= 18",
        "SYSBP > 120 AND SYSBP <= 180",
        "AETERM CONTAINS 'HEADACHE'",
        "SEX IN ('M', 'F')",
        "SYSBP != 0 AND SYSBP <> 999",
      ];

      relationalFormulas.forEach((formula) => {
        const res = StudyAuditor.auditFormula(formula, sampleFields);
        expect(res.isValid).toBe(true);
        expect(res.diagnostics.some((d) => d.code === "UNEXPECTED_TOKEN")).toBe(
          false
        );
      });
    });
  });

  describe("Requirement 5: Logical Operator Formula Parsing & Variable Validation", () => {
    it("parses AND, OR, and NOT logical expressions cleanly and validates variable existence", () => {
      const validLogicalFormula =
        "AGE >= 18 AND (SYSBP > 120 OR NOT IS_EMPTY(AETERM))";
      const validResult = lintFormula(validLogicalFormula, sampleFields);

      expect(validResult.isValid).toBe(true);
      expect(validResult.referencedVariables.map((v) => v.name)).toEqual(
        expect.arrayContaining(["AGE", "SYSBP", "AETERM"])
      );

      const invalidLogicalFormula = "AGE >= 18 AND UNKNOWN_VARIABLE > 10";
      const invalidResult = lintFormula(invalidLogicalFormula, sampleFields);

      expect(
        invalidResult.diagnostics.some((d) => d.code === "UNKNOWN_VARIABLE")
      ).toBe(true);
      const unknownRef = invalidResult.referencedVariables.find(
        (v) => v.name === "UNKNOWN_VARIABLE"
      );
      expect(unknownRef?.exists).toBe(false);
    });
  });
});
