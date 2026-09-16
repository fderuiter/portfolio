import path from "path";
import { chromium } from "@playwright/test";
import { extractAllMermaidBlocks } from "./mermaid-corpus";

export { extractAllMermaidBlocks, type MermaidBlock } from "./mermaid-corpus";

interface MermaidRenderResult {
  file: string;
  index: number;
  source: string;
  valid: boolean;
  error?: string;
}

/**
 * Render the complete static corpus in Chromium, where Mermaid has access to
 * real SVG geometry. This catches renderer failures that parsing alone misses.
 */
export async function validateCorpus(
  workspaceRoot: string = process.cwd()
): Promise<{ total: number; results: MermaidRenderResult[] }> {
  const blocks = extractAllMermaidBlocks(workspaceRoot);
  const browser = await chromium.launch();

  try {
    const page = await browser.newPage();
    await page.setContent("<!doctype html><html><body></body></html>");
    await page.addScriptTag({
      path: path.join(
        workspaceRoot,
        "node_modules/mermaid/dist/mermaid.min.js"
      ),
    });

    const results = await page.evaluate(async (corpus) => {
      const mermaid = (
        window as unknown as { mermaid: typeof import("mermaid").default }
      ).mermaid;
      mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

      const rendered = [];
      for (const block of corpus) {
        try {
          const host = document.createElement("div");
          document.body.append(host);
          const { svg } = await mermaid.render(
            `mermaid-corpus-${block.file.replace(/[^a-z0-9]/gi, "-")}-${block.index}`,
            block.source,
            host
          );
          host.remove();

          if (!svg.includes("<svg")) {
            throw new Error("Mermaid did not produce an SVG diagram.");
          }

          rendered.push({ ...block, valid: true });
        } catch (error) {
          rendered.push({
            ...block,
            valid: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      return rendered;
    }, blocks);

    return { total: blocks.length, results };
  } finally {
    await browser.close();
  }
}

if (process.argv[1] && process.argv[1].endsWith("validate-mermaid-corpus.ts")) {
  validateCorpus().then(({ total, results }) => {
    const failed = results.filter((result) => !result.valid);
    console.log(`Extracted ${total} total Mermaid blocks across corpus files.`);
    for (const result of results) {
      console.log(
        `[${result.valid ? "PASS" : "FAIL"}] ${result.file} #${result.index}`
      );
      if (!result.valid) {
        console.error(`  Error: ${result.error}`);
        console.error(`  Source snippet: ${result.source.slice(0, 100)}...`);
      }
    }

    if (failed.length > 0) {
      console.error(
        `\nValidation failed: ${failed.length}/${total} diagrams invalid.`
      );
      process.exitCode = 1;
    } else {
      console.log(`\nAll ${total} diagrams rendered successfully!`);
    }
  });
}
