import { describe, it, expect } from "vitest";
import { skillsData, homepageTooltips } from "@/components/skillsData";

describe("Reactive Easter Eggs Centralized Configurations", () => {
  it("should have all four core technical specializations configured", () => {
    const requiredKeys = [
      "clinical-integrations",
      "layout-physics",
      "serverless-scaling",
      "full-stack-security"
    ];

    requiredKeys.forEach((key) => {
      expect(skillsData).toHaveProperty(key);
      const skill = skillsData[key];
      expect(skill).toHaveProperty("name");
      expect(skill).toHaveProperty("tooltipText");
      expect(skill).toHaveProperty("terminalLogs");
      expect(typeof skill.name).toBe("string");
      expect(typeof skill.tooltipText).toBe("string");
      expect(Array.isArray(skill.terminalLogs)).toBe(true);
      expect(skill.terminalLogs.length).toBeGreaterThan(0);
    });
  });

  it("should have witty, developer-themed translations for each skill card", () => {
    expect(skillsData["clinical-integrations"].tooltipText).toContain("cryptic medical");
    expect(skillsData["layout-physics"].tooltipText).toContain("59fps");
    expect(skillsData["serverless-scaling"].tooltipText).toContain("credit card");
    expect(skillsData["full-stack-security"].tooltipText).toContain("trusting your users");
  });

  it("should have centralized configurations for other homepage and case study tooltips", () => {
    expect(homepageTooltips).toHaveProperty("systems-rigor");
    expect(homepageTooltips).toHaveProperty("architectural-narratives");
    expect(typeof homepageTooltips["systems-rigor"]).toBe("string");
    expect(typeof homepageTooltips["architectural-narratives"]).toBe("string");
  });
});
