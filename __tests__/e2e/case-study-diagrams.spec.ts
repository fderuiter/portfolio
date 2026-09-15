import { expect, test } from "@playwright/test";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";

const diagramPages = FALLBACK_CASE_STUDIES.map((study) => {
  const combined =
    (study.editorial_content || "") + (study.architectural_narrative || "");
  return {
    slug: study.slug,
    diagrams: (combined.match(/language-mermaid/g) ?? []).length,
  };
}).filter((study) => study.diagrams > 0);

test.describe("Case-study architecture diagrams", () => {
  test.describe.configure({ mode: "serial" });

  test("renders the clinical data mapper architecture as a readable SVG with screenshot verification", async ({
    page,
    isMobile,
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

    // Accessibility & container layout checks
    const srDescription = diagram.locator(".sr-only");
    await expect(srDescription).toBeAttached();
    await expect(srDescription).toContainText("Mermaid source alternative:");

    await expect(diagram).toHaveClass(/overflow-x-auto/);

    // Capture visual screenshot for evidence review
    const screenshotPath = isMobile
      ? "/tmp/case-study-diagram-mobile.png"
      : "/tmp/case-study-diagram-desktop.png";
    await diagram.screenshot({ path: screenshotPath });
  });

  test("renders multiple diagrams on a single case study page independently without ID collision", async ({
    page,
  }) => {
    // Lambda Wave has 2 Mermaid diagrams
    await page.goto("/case-studies/lambda-wave", {
      waitUntil: "domcontentloaded",
    });

    const diagrams = page.locator("[data-mermaid-diagram]");
    await expect(async () => {
      await expect(diagrams).toHaveCount(2);
      await expect(diagrams.nth(0).locator("svg")).toBeVisible();
      await expect(diagrams.nth(1).locator("svg")).toBeVisible();
    }).toPass({ timeout: 15000 });

    const svg0 = await diagrams.nth(0).locator("svg").innerHTML();
    const svg1 = await diagrams.nth(1).locator("svg").innerHTML();
    expect(svg0).not.toEqual(svg1);
  });

  test("pages without Mermaid diagrams do not render raw code or error blocks", async ({
    page,
  }) => {
    await page.goto("/case-studies/imednet-python-sdk", {
      waitUntil: "domcontentloaded",
    });

    await expect(page.locator("[data-mermaid-diagram]")).toHaveCount(0);
    await expect(page.locator("[data-mermaid-error]")).toHaveCount(0);
    await expect(page.locator("code.language-mermaid")).toHaveCount(0);
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
