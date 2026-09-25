import { describe, it, expect, vi } from "vitest";
import type jsPDF from "jspdf";
import { generateStudyPdf, generateFormPdf } from "@/lib/crf/export-pdf";
import { ONCOLOGY_RECIST_PRESET } from "@/lib/crf/presets";
import { StudyBranding } from "@/lib/crf/types";

const pdfTextCalls = vi.hoisted(
  () =>
    [] as Array<{
      text: string;
      section: string;
      page: number;
      y: number;
    }>
);
const pdfCurrentSection = vi.hoisted(() => ({ title: "" }));

vi.mock("jspdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jspdf")>();

  class InstrumentedJsPDF extends actual.default {
    constructor(...args: ConstructorParameters<typeof actual.default>) {
      super(...args);
      const originalText = this.text.bind(this);

      this.text = (...textArgs: Parameters<jsPDF["text"]>) => {
        const [content, , y] = textArgs;
        const text = Array.isArray(content) ? content.join("\n") : content;

        if (text.startsWith("Section: ")) {
          pdfCurrentSection.title = text;
        }
        if (
          text.startsWith("Section: ") ||
          text === "Question / Variable Prompt" ||
          text.includes("Boundary footer safety field")
        ) {
          pdfTextCalls.push({
            text,
            section: pdfCurrentSection.title,
            page: this.getCurrentPageInfo().pageNumber,
            y,
          });
        }

        return originalText(...textArgs);
      };
    }
  }

  return { ...actual, default: InstrumentedJsPDF };
});

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
      confidentialityNotice:
        "Contains proprietary clinical investigation data.",
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

  it.each(["blank", "annotated"] as const)(
    "keeps a near-footer section heading with its table header in %s mode",
    async (mode) => {
      const study = structuredClone(ONCOLOGY_RECIST_PRESET);
      const form = study.forms[0]!;
      const section = form.sections[0]!;
      const sourceField = section.fields[0]!;
      const expandedFields = Array.from({ length: 8 }, (_, index) => ({
        ...sourceField,
        id: `boundary-field-${index}`,
        label: `Boundary field ${index} with a longer prompt to fill the page`,
        description:
          "A clinical observation value and its collection context must remain legible in the generated regulatory document.",
      }));
      const boundaryField = {
        ...sourceField,
        id: "boundary-footer-safety-field",
        label: "Boundary footer safety field",
      };

      form.sections = [
        { ...section, title: "Preceding section", fields: expandedFields },
        {
          ...section,
          title: "Near-footer boundary",
          fields: [boundaryField],
        },
      ];
      study.forms = [form];
      pdfTextCalls.length = 0;
      pdfCurrentSection.title = "";
      const blob = await generateStudyPdf(study, {
        mode,
        scope: "all",
        includeTableOfContents: false,
        includeSdtmAppendix: false,
      });
      expect(blob.size).toBeGreaterThan(1000);

      const headings = pdfTextCalls.filter((call) =>
        call.text.startsWith("Section: ")
      );
      const tableHeaders = pdfTextCalls.filter(
        (call) =>
          call.text === "Question / Variable Prompt" &&
          call.section === "Section: Near-footer boundary"
      );
      const fieldText = pdfTextCalls.find((call) =>
        call.text.includes("Boundary footer safety field")
      );
      expect(headings).toHaveLength(2);
      expect(tableHeaders).toHaveLength(1);
      expect(fieldText).toBeDefined();
      expect(headings[1]!.page).toBeGreaterThan(headings[0]!.page);
      expect(headings[1]!.page).toBe(tableHeaders[0]!.page);
      expect(headings[1]!.y).toBeLessThanOrEqual(297 - 14 - 40);
      expect(fieldText!.page).toBe(tableHeaders[0]!.page);
      expect(fieldText!.y).toBeLessThan(297 - 15);
    }
  );
});
