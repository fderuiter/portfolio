import { expect, test } from "@playwright/test";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";

const diagramPages = FALLBACK_CASE_STUDIES.map((study) => ({
  slug: study.slug,
  diagrams: (study.architectural_narrative.match(/language-mermaid/g) ?? [])
    .length,
})).filter((study) => study.diagrams > 0);

test.describe("Case-study architecture diagrams", () => {
  test.describe.configure({ mode: "serial" });
  test("renders the clinical data mapper architecture as a readable SVG", async ({
    page,
  }) => {
    await page.goto("/case-studies/clinical-data-mapper", {
      waitUntil: "domcontentloaded",
    });

    const diagram = page
      .getByRole("img", { name: /architecture diagram/i })
      .first();

    await expect(async () => {
      await expect(diagram).toBeVisible();
      await expect(diagram.locator("svg")).toBeVisible();
    }).toPass({ timeout: 15000 });

    await expect(page.locator("code.language-mermaid")).toHaveCount(0);
    await expect(diagram.locator("svg")).toContainText("Streaming SAX Lexer");
  });

  for (const study of diagramPages) {
    test(`${study.slug} renders every stored Mermaid diagram`, async ({
      page,
    }) => {
      await page.goto(`/case-studies/${study.slug}`, {
        waitUntil: "domcontentloaded",
      });

      const diagrams = page.locator("[data-mermaid-diagram]");
      await expect(async () => {
        await expect(diagrams).toHaveCount(study.diagrams);
        await expect(diagrams.locator("svg")).toHaveCount(study.diagrams);
      }).toPass({ timeout: 15_000 });

      await expect(page.locator("[data-mermaid-error]")).toHaveCount(0);
      await expect(page.locator("code.language-mermaid")).toHaveCount(0);
    });
  }
});
