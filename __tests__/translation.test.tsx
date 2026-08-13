import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Terminology Translation Architecture and Compliance", () => {
  const providerPath = path.resolve(__dirname, "../components/providers/TranslationProvider.tsx");
  const navbarPath = path.resolve(__dirname, "../components/Navbar.tsx");
  const timelinePath = path.resolve(__dirname, "../components/Timeline.tsx");
  const bentoCardPath = path.resolve(__dirname, "../components/ui/CaseStudyBentoCard.tsx");
  const regularCardPath = path.resolve(__dirname, "../components/ui/CaseStudyCard.tsx");

  it("should have created TranslationProvider with usePersistentState and useAnnouncer", () => {
    expect(fs.existsSync(providerPath)).toBe(true);
    const content = fs.readFileSync(providerPath, "utf-8");
    expect(content).toContain('import { usePersistentState } from "@/hooks/usePersistentState";');
    expect(content).toContain('import { useAnnouncer } from "./A11yProvider";');
    expect(content).toContain('export function TranslationProvider');
    expect(content).toContain('export function useTranslation');
    expect(content).toContain('terminologyLevel === "simplified"');
    expect(content).toContain('announce(msg, "polite");');
  });

  it("should integrate TerminologyToggle inside Navbar", () => {
    expect(fs.existsSync(navbarPath)).toBe(true);
    const content = fs.readFileSync(navbarPath, "utf-8");
    expect(content).toContain('import { useTranslation } from "@/components/providers/TranslationProvider";');
    expect(content).toContain('const TerminologyToggle');
    expect(content).toContain('<TerminologyToggle />');
    expect(content).toContain('aria-label="Set terminology level to standard"');
    expect(content).toContain('aria-label="Set terminology level to simplified"');
  });

  it("should support and render simplified descriptions inside Timeline milestones", () => {
    expect(fs.existsSync(timelinePath)).toBe(true);
    const content = fs.readFileSync(timelinePath, "utf-8");
    expect(content).toContain('import { useTranslation } from "@/components/providers/TranslationProvider";');
    expect(content).toContain('description_simplified: string;');
    expect(content).toContain('terminologyLevel === "simplified" ? item.description_simplified : item.description');
  });

  it("should support and render simplified descriptions in Bento Grid Project Cards", () => {
    expect(fs.existsSync(bentoCardPath)).toBe(true);
    const content = fs.readFileSync(bentoCardPath, "utf-8");
    expect(content).toContain('import { useTranslation } from "@/components/providers/TranslationProvider";');
    expect(content).toContain('terminologyLevel === "simplified" ? study.editorial_content_simplified : study.editorial_content');
  });

  it("should support and render simplified descriptions in standard CaseStudyCards", () => {
    expect(fs.existsSync(regularCardPath)).toBe(true);
    const content = fs.readFileSync(regularCardPath, "utf-8");
    expect(content).toContain('import { useTranslation } from "@/components/providers/TranslationProvider";');
    expect(content).toContain('terminologyLevel === "simplified" ? study.editorial_content_simplified : study.editorial_content');
  });
});
