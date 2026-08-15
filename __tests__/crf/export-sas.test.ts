import { describe, it, expect } from "vitest";
import {
  sanitizeSasName,
  getSasFormatName,
  escapeSasString,
  getFieldSasAttributes,
  generateSasProcFormat,
  generateSasDataStepForForm,
  exportFormToSas,
  exportStudyToSas,
} from "@/lib/crf/export-sas";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyProtocol, CRFField } from "@/lib/crf/types";

describe("CRF Studio - Automated SAS Statistical Exporter", () => {
  describe("Sanitization & Utility Functions", () => {
    it("sanitizes SAS variable and dataset names properly", () => {
      expect(sanitizeSasName("123badname")).toBe("V_123BADNAME");
      expect(sanitizeSasName("patient_weight_kg")).toBe("PATIENT_WEIGHT_KG");
      expect(sanitizeSasName("var-with-dashes.and.dots")).toBe("VAR_WITH_DASHES_AND_DOTS");
      expect(sanitizeSasName("a".repeat(40), 32)).toHaveLength(32);
      expect(sanitizeSasName("")).toBe("VAR");
    });

    it("generates correct SAS format names for character and numeric formats", () => {
      expect(getSasFormatName("CL_SEX", true)).toBe("$SEXF");
      expect(getSasFormatName("CL_AESEV", false)).toBe("AESEVF");
      expect(getSasFormatName("CUSTOM_GRADE", true)).toBe("$CUSTOM_GRADEF");
    });

    it("escapes single quotes for SAS string literals", () => {
      expect(escapeSasString("Patient's Baseline Assessment")).toBe("Patient''s Baseline Assessment");
      expect(escapeSasString("No quotes here")).toBe("No quotes here");
      expect(escapeSasString("")).toBe("");
    });
  });

  describe("Field SAS Attributes Mapping", () => {
    it("maps numeric types correctly to SAS best12 format", () => {
      const numField: CRFField = {
        id: "f_weight",
        variableName: "WEIGHT",
        label: "Weight (kg)",
        dataType: "number",
        columnSpan: 6,
        required: true,
      };

      const attrs = getFieldSasAttributes(numField, ONCOLOGY_RECIST_PRESET);
      expect(attrs.sasVarName).toBe("WEIGHT");
      expect(attrs.isNumeric).toBe(true);
      expect(attrs.length).toBe("8");
      expect(attrs.format).toBe("BEST12.");
    });

    it("maps date and datetime types to ISO 8601 character formats", () => {
      const dateField: CRFField = {
        id: "f_dtc",
        variableName: "AESTDTC",
        label: "Adverse Event Start Date",
        dataType: "date",
        columnSpan: 6,
        required: true,
      };

      const attrs = getFieldSasAttributes(dateField, ONCOLOGY_RECIST_PRESET);
      expect(attrs.sasVarName).toBe("AESTDTC");
      expect(attrs.isNumeric).toBe(false);
      expect(attrs.length).toBe("$10");
      expect(attrs.format).toBe("$10.");
    });

    it("maps codelist select fields to format definitions", () => {
      const sexField: CRFField = {
        id: "f_sex",
        variableName: "SEX",
        label: "Biological Sex",
        dataType: "single_select",
        columnSpan: 6,
        required: true,
        codelistId: "CL_SEX",
      };

      const attrs = getFieldSasAttributes(sexField, ONCOLOGY_RECIST_PRESET);
      expect(attrs.sasVarName).toBe("SEX");
      expect(attrs.format).toBe("$SEXF.");
      expect(attrs.codelistRef).toBeDefined();
    });
  });

  describe("PROC FORMAT Generation", () => {
    it("generates PROC FORMAT block for study codelists", () => {
      const procFormatCode = generateSasProcFormat(
        ONCOLOGY_RECIST_PRESET,
        ONCOLOGY_RECIST_PRESET.forms
      );

      expect(procFormatCode).toContain("PROC FORMAT;");
      expect(procFormatCode).toContain("VALUE $SEXF");
      expect(procFormatCode).toContain("'M' = 'Male'");
      expect(procFormatCode).toContain("'F' = 'Female'");
      expect(procFormatCode).toContain("OTHER = 'Unknown / Unmapped'");
      expect(procFormatCode).toContain("RUN;");
    });

    it("handles studies with no codelists gracefully", () => {
      const emptyStudy: StudyProtocol = {
        ...ONCOLOGY_RECIST_PRESET,
        codelists: [],
      };
      const code = generateSasProcFormat(emptyStudy, emptyStudy.forms);
      expect(code).toContain("/* No codelists defined for this study */");
    });
  });

  describe("DATA Step & Full Study Suite Generation", () => {
    it("generates a complete SAS DATA step for a CRF Form with ATTRIB and test records", () => {
      const dmForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "DM")!;
      const dataStep = generateSasDataStepForForm(dmForm, ONCOLOGY_RECIST_PRESET, {
        includeSampleData: true,
        includeProcContents: true,
        includeProcFreq: true,
      });

      expect(dataStep).toContain("DATA raw_dm");
      expect(dataStep).toContain("ATTRIB");
      expect(dataStep).toContain("STUDYID");
      expect(dataStep).toContain("USUBJID");
      expect(dataStep).toContain("INFILE DATALINES");
      expect(dataStep).toContain("CARDS;");
      expect(dataStep).toContain("PROC CONTENTS DATA=raw_dm");
      expect(dataStep).toContain("PROC FREQ DATA=raw_dm");
    });

    it("exports a single form to a self-contained SAS program", () => {
      const vsForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "VS")!;
      const sasProgram = exportFormToSas(vsForm, ONCOLOGY_RECIST_PRESET);

      expect(sasProgram).toContain("/*=============================================================================");
      expect(sasProgram).toContain("PROGRAM:      create_raw_vs.sas");
      expect(sasProgram).toContain(ONCOLOGY_RECIST_PRESET.protocolNumber);
      expect(sasProgram).toContain("DATA raw_vs");
      expect(sasProgram).toContain("RUN;");
    });

    it("exports entire study to a multi-domain SAS suite", () => {
      const fullSuite = exportStudyToSas(ONCOLOGY_RECIST_PRESET);

      expect(fullSuite).toContain("PROGRAM:      create_raw_suite.sas");
      expect(fullSuite).toContain("SECTION 1:");
      expect(fullSuite).toContain("DATA raw_dm");
      expect(fullSuite).toContain("DATA raw_vs");
      expect(fullSuite).toContain("DATA raw_ae");
    });

    it("filters to a selected form when selectedFormId option is provided", () => {
      const aeForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "AE")!;
      const filtered = exportStudyToSas(ONCOLOGY_RECIST_PRESET, {
        selectedFormId: aeForm.id,
      });

      expect(filtered).toContain("DATA raw_ae");
      expect(filtered).not.toContain("DATA raw_dm");
    });
  });
});
