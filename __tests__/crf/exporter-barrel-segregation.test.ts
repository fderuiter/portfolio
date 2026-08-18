import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import * as lightExporters from "@/lib/crf/exporters";
import * as subpathLightExporters from "@/lib/crf/exporters/light";

describe("Exporter Barrel Segregation & Code Splitting Entry Points", () => {
  const root = path.resolve(process.cwd());

  describe("1. Shared Main Exporter Barrel (@/lib/crf/exporters)", () => {
    it("exposes lightweight data export utilities", () => {
      expect(typeof lightExporters.exportStudyToSas).toBe("function");
      expect(typeof lightExporters.exportStudyToR).toBe("function");
      expect(typeof lightExporters.generateAcrfHtml).toBe("function");
      expect(typeof lightExporters.exportStudyToCdiscOdmXml).toBe("function");
      expect(typeof lightExporters.exportFormToFhirQuestionnaire).toBe("function");
    });

    it("does NOT expose heavy document generators in main entry point", () => {
      const exports = Object.keys(lightExporters);
      expect(exports).not.toContain("generateStudyDocx");
      expect(exports).not.toContain("generateFormDocx");
      expect(exports).not.toContain("generateStudyPdf");
      expect(exports).not.toContain("generateFormPdf");
    });

    it("matches light subpath entry point (@/lib/crf/exporters/light)", () => {
      expect(typeof subpathLightExporters.exportStudyToSas).toBe("function");
      expect(typeof subpathLightExporters.exportStudyToR).toBe("function");
      expect(typeof subpathLightExporters.generateAcrfHtml).toBe("function");
      expect(typeof subpathLightExporters.exportStudyToCdiscOdmXml).toBe("function");
      expect(typeof subpathLightExporters.exportFormToFhirQuestionnaire).toBe("function");

      const exports = Object.keys(subpathLightExporters);
      expect(exports).not.toContain("generateStudyDocx");
      expect(exports).not.toContain("generateStudyPdf");
    });
  });

  describe("2. Dedicated Heavy Document Exporter Entry Point (@/lib/crf/exporters/heavy)", () => {
    it("exposes heavy Word and PDF document generation tools via dynamic import", async () => {
      const heavy = await import("@/lib/crf/exporters/heavy");
      expect(typeof heavy.generateStudyDocx).toBe("function");
      expect(typeof heavy.generateFormDocx).toBe("function");
      expect(typeof heavy.generateStudyPdf).toBe("function");
      expect(typeof heavy.generateFormPdf).toBe("function");
    });
  });

  describe("3. Static File & Build Guardrail Verification", () => {
    it("ensures main exporter index contains zero references to heavy export modules", () => {
      const indexPath = path.join(root, "lib", "crf", "exporters", "index.ts");
      const content = fs.readFileSync(indexPath, "utf-8");

      expect(content).not.toContain("export-docx");
      expect(content).not.toContain("export-pdf");
      expect(content).not.toContain("docx");
      expect(content).not.toContain("jspdf");
    });

    it("ensures ExportDocumentModal loads heavy exporters on demand using heavy subpath", () => {
      const modalPath = path.join(root, "components", "crf", "Modes", "ExportDocumentModal.tsx");
      const content = fs.readFileSync(modalPath, "utf-8");

      expect(content).toContain('import("@/lib/crf/exporters/heavy")');
      expect(content).not.toContain('import { generateStudyDocx } from');
      expect(content).not.toContain('import { generateStudyPdf } from');
    });
  });
});
