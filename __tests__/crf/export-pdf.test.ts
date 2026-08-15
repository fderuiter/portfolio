import { describe, it, expect } from "vitest";
import { generateStudyPdf, generateFormPdf } from "@/lib/crf/export-pdf";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets/oncology-recist";
import { StudyBranding } from "@/lib/crf/types";

// 1x1 transparent PNG Base64 for logo testing
const SAMPLE_BASE64_LOGO =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

describe("CRF Studio - Direct PDF Exporter", () => {
  it("should generate a valid PDF document (Blob) for an entire study in blank mode", async () => {
    const blob = await generateStudyPdf(ONCOLOGY_RECIST_PRESET, {
      mode: "blank",
      scope: "all",
      includeTableOfContents: true,
      includeSdtmAppendix: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("should generate a valid PDF document (Blob) in annotated regulatory aCRF mode", async () => {
    const blob = await generateStudyPdf(ONCOLOGY_RECIST_PRESET, {
      mode: "annotated",
      scope: "all",
      includeTableOfContents: true,
      includeSdtmAppendix: true,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });

  it("should generate a single form PDF document using generateFormPdf", async () => {
    const form = ONCOLOGY_RECIST_PRESET.forms[0];
    const blob = await generateFormPdf(form, ONCOLOGY_RECIST_PRESET, {
      mode: "blank",
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(500);
  });

  it("should apply custom sponsor branding and logo image to generated PDF document", async () => {
    const customBranding: StudyBranding = {
      organizationName: "Vanguard Therapeutics Corp",
      primaryColor: "#be123c",
      accentColor: "#e11d48",
      headerText: "CONFIDENTIAL • CLINICAL INVESTIGATION PLAN",
      footerText: "Institutional Review Board (IRB) Copy",
      confidentialityNotice: "Contains proprietary clinical investigation data.",
      logoBase64: SAMPLE_BASE64_LOGO,
      showPageNumbers: true,
      showTableOfContents: true,
    };

    const blob = await generateStudyPdf(ONCOLOGY_RECIST_PRESET, {
      mode: "annotated",
      scope: "all",
      branding: customBranding,
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(1000);
  });
});
