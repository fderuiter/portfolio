import { describe, it, expect } from "vitest";
import {
  generateStudyDocx,
  generateFormDocx,
  TABLE_WIDTH_DXA,
  STANDARD_COL_WIDTH_1,
  STANDARD_COL_WIDTH_2,
  ANNOTATED_COL_WIDTH_1,
  ANNOTATED_COL_WIDTH_2,
  ANNOTATED_COL_WIDTH_3,
  TOC_COL_WIDTH_1,
  TOC_COL_WIDTH_2,
  TOC_COL_WIDTH_3,
  TOC_COL_WIDTH_4,
  TOC_COL_WIDTH_5,
  SDTM_COL_WIDTH_1,
  SDTM_COL_WIDTH_2,
  SDTM_COL_WIDTH_3,
  SDTM_COL_WIDTH_4,
  SDTM_COL_WIDTH_5,
  SDTM_COL_WIDTH_6,
} from "@/lib/crf/export-docx";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { CNS_NEURO_PRESET } from "@/lib/crf/presets/cns-neuro";
import { StudyBranding } from "@/lib/crf/types";

// 1x1 transparent PNG Base64 for logo testing
const SAMPLE_BASE64_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("CRF Studio - Microsoft Word (.docx) Exporter", () => {
  it("should use 9,360 DXA table width matching 1-inch margins on Letter paper", () => {
    expect(TABLE_WIDTH_DXA).toBe(9360);
  });

  it("should have proportional cell column widths summing to 9,360 DXA in standard and annotated modes", () => {
    expect(STANDARD_COL_WIDTH_1 + STANDARD_COL_WIDTH_2).toBe(TABLE_WIDTH_DXA);
    expect(ANNOTATED_COL_WIDTH_1 + ANNOTATED_COL_WIDTH_2 + ANNOTATED_COL_WIDTH_3).toBe(
      TABLE_WIDTH_DXA
    );
    expect(
      TOC_COL_WIDTH_1 + TOC_COL_WIDTH_2 + TOC_COL_WIDTH_3 + TOC_COL_WIDTH_4 + TOC_COL_WIDTH_5
    ).toBe(TABLE_WIDTH_DXA);
    expect(
      SDTM_COL_WIDTH_1 +
        SDTM_COL_WIDTH_2 +
        SDTM_COL_WIDTH_3 +
        SDTM_COL_WIDTH_4 +
        SDTM_COL_WIDTH_5 +
        SDTM_COL_WIDTH_6
    ).toBe(TABLE_WIDTH_DXA);
  });

  it("should generate a valid Word document (.docx Blob) for an entire study in blank mode", async () => {
    const blob = await generateStudyDocx(ONCOLOGY_RECIST_PRESET, {
      mode: "blank",
      scope: "all",
      includeTableOfContents: true,
      includeSdtmAppendix: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("should generate a valid Word document (.docx Blob) in annotated regulatory aCRF mode", async () => {
    const blob = await generateStudyDocx(ONCOLOGY_RECIST_PRESET, {
      mode: "annotated",
      scope: "all",
      includeTableOfContents: true,
      includeSdtmAppendix: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("should generate a single form Word document using generateFormDocx", async () => {
    const form = ONCOLOGY_RECIST_PRESET.forms[0];
    const blob = await generateFormDocx(form, ONCOLOGY_RECIST_PRESET, {
      mode: "blank",
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(500);
  });

  it("should apply custom sponsor branding and logo image to generated Word document", async () => {
    const customBranding: StudyBranding = {
      organizationName: "BioNexus Global Therapeutics",
      primaryColor: "#047857",
      accentColor: "#059669",
      headerText: "CONFIDENTIAL • PROTOCOL BNT-2026",
      footerText: "Investigator Master Copy",
      confidentialityNotice: "Proprietary clinical trial protocol documentation.",
      logoBase64: SAMPLE_BASE64_LOGO,
      showPageNumbers: true,
      showTableOfContents: true,
    };

    const blob = await generateStudyDocx(CNS_NEURO_PRESET, {
      mode: "annotated",
      scope: "all",
      branding: customBranding,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("should export a selective subset of forms when scope is selected", async () => {
    const selectedIds = [ONCOLOGY_RECIST_PRESET.forms[0].id, ONCOLOGY_RECIST_PRESET.forms[1].id];
    const blob = await generateStudyDocx(ONCOLOGY_RECIST_PRESET, {
      mode: "blank",
      scope: "selected",
      selectedFormIds: selectedIds,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });
});
