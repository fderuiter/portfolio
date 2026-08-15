import { describe, it, expect } from "vitest";
import {
  sanitizeRName,
  escapeRString,
  generateRCodelists,
  generateRDataStepForForm,
  exportFormToR,
  exportStudyToR,
} from "@/lib/crf/export-r";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyProtocol } from "@/lib/crf/types";

describe("CRF Studio - Automated R & Pharmaverse Scaffolding Exporter", () => {
  describe("Sanitization & String Escaping", () => {
    it("sanitizes R variable and tibble names cleanly", () => {
      expect(sanitizeRName("123badname")).toBe("v_123badname");
      expect(sanitizeRName("subject_age")).toBe("subject_age");
      expect(sanitizeRName("var-with-dash")).toBe("var_with_dash");
      expect(sanitizeRName("")).toBe("var");
    });

    it("escapes quotes and backslashes in R literals", () => {
      expect(escapeRString('Label with "quotes"')).toBe('Label with \\"quotes\\"');
      expect(escapeRString("Path\\To\\File")).toBe("Path\\\\To\\\\File");
    });
  });

  describe("Codelist Factor Level Generation", () => {
    it("generates factor level and label vectors for study codelists", () => {
      const code = generateRCodelists(ONCOLOGY_RECIST_PRESET, ONCOLOGY_RECIST_PRESET.forms);

      expect(code).toContain("cl_cl_sex_levels <- c(");
      expect(code).toContain('"M", "F"');
      expect(code).toContain('cl_cl_sex_labels <- c(');
      expect(code).toContain('"Male", "Female"');
    });

    it("handles studies without codelists gracefully", () => {
      const emptyStudy: StudyProtocol = {
        ...ONCOLOGY_RECIST_PRESET,
        codelists: [],
      };
      const code = generateRCodelists(emptyStudy, emptyStudy.forms);
      expect(code).toContain("# No codelists defined for this study");
    });
  });

  describe("Tibble Data Steps & Full R Suite Generation", () => {
    it("generates a valid tibble creation block with typed vectors and labelled attributes", () => {
      const dmForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "DM")!;
      const rCode = generateRDataStepForForm(dmForm, ONCOLOGY_RECIST_PRESET, {
        includeSampleData: true,
        includeGlimpse: true,
        useLabelledPackage: true,
      });

      expect(rCode).toContain("tbl_dm <- tibble::tibble(");
      expect(rCode).toContain("STUDYID");
      expect(rCode).toContain("USUBJID");
      expect(rCode).toContain("labelled::var_label(tbl_dm) <- list(");
      expect(rCode).toContain("dplyr::glimpse(tbl_dm)");
      expect(rCode).toContain("summary(tbl_dm)");
    });

    it("exports a single form to an independent R script", () => {
      const vsForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "VS")!;
      const rScript = exportFormToR(vsForm, ONCOLOGY_RECIST_PRESET);

      expect(rScript).toContain("#==============================================================================");
      expect(rScript).toContain("PROGRAM:      create_raw_vs.R");
      expect(rScript).toContain("tbl_vs <- tibble::tibble(");
    });

    it("exports full study into a complete multi-domain R script suite", () => {
      const fullScript = exportStudyToR(ONCOLOGY_RECIST_PRESET);

      expect(fullScript).toContain("PROGRAM:      create_raw_suite.R");
      expect(fullScript).toContain("SECTION 1:");
      expect(fullScript).toContain("tbl_dm <- tibble::tibble(");
      expect(fullScript).toContain("tbl_vs <- tibble::tibble(");
      expect(fullScript).toContain("tbl_ae <- tibble::tibble(");
    });

    it("filters to selected form when selectedFormId is specified", () => {
      const aeForm = ONCOLOGY_RECIST_PRESET.forms.find((f) => f.domain === "AE")!;
      const filtered = exportStudyToR(ONCOLOGY_RECIST_PRESET, {
        selectedFormId: aeForm.id,
      });

      expect(filtered).toContain("tbl_ae <- tibble::tibble(");
      expect(filtered).not.toContain("tbl_dm <- tibble::tibble(");
    });
  });
});
