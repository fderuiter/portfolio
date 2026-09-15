import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import DOMPurify from "isomorphic-dompurify";
import mermaid from "mermaid";

if (typeof window !== "undefined") {
  Object.assign(window, { DOMPurify });
}
Object.assign(globalThis, { DOMPurify });

mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

function unescapeHtml(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

interface MermaidBlock {
  file: string;
  index: number;
  source: string;
}

function extractAllMermaidBlocks(
  workspaceRoot: string = process.cwd()
): MermaidBlock[] {
  const files = [
    "lib/case-studies-data.ts",
    "prisma/seed.ts",
    "ARCHITECTURE.md",
    "CASE_STUDY.md",
    "docs/CASE_STUDY.md",
    "PRODUCT_EXCELLENCE_EVALUATION.md",
  ];

  const htmlRegex =
    /<code\b[^>]*class=(?:["'])[^"']*\blanguage-mermaid\b[^"']*(?:["'])[^>]*>([\s\S]*?)<\/code>/gi;
  const mdRegex = /```mermaid\r?\n([\s\S]*?)\r?\n```/gi;

  const blocks: MermaidBlock[] = [];

  for (const relPath of files) {
    const fullPath = path.resolve(workspaceRoot, relPath);
    if (!fs.existsSync(fullPath)) {
      continue;
    }
    const text = fs.readFileSync(fullPath, "utf8");

    let match: RegExpExecArray | null;

    htmlRegex.lastIndex = 0;
    let blockIndex = 1;
    while ((match = htmlRegex.exec(text)) !== null) {
      blocks.push({
        file: relPath,
        index: blockIndex++,
        source: unescapeHtml(match[1].trim()),
      });
    }

    mdRegex.lastIndex = 0;
    while ((match = mdRegex.exec(text)) !== null) {
      blocks.push({
        file: relPath,
        index: blockIndex++,
        source: unescapeHtml(match[1].trim()),
      });
    }
  }

  return blocks;
}

describe("48-Source Mermaid Corpus Validation", () => {
  it("extracts all 48 static Mermaid diagrams across repository source files", () => {
    const blocks = extractAllMermaidBlocks();
    expect(blocks.length).toBe(48);
  });

  it("parses every static Mermaid block in the repository corpus without syntax errors", async () => {
    const blocks = extractAllMermaidBlocks();
    const failures: Array<{ file: string; index: number; error: string }> = [];

    for (const block of blocks) {
      try {
        await mermaid.parse(block.source);
      } catch (err: unknown) {
        failures.push({
          file: block.file,
          index: block.index,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    expect(failures).toEqual([]);
  });
});
