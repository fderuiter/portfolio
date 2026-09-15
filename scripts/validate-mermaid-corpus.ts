import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import DOMPurify from "isomorphic-dompurify";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
});

const win = dom.window;

Object.defineProperty(globalThis, "window", { value: win, writable: true });
Object.defineProperty(globalThis, "document", {
  value: win.document,
  writable: true,
});
Object.defineProperty(globalThis, "DOMPurify", {
  value: DOMPurify,
  writable: true,
});
(win as unknown as Record<string, unknown>).DOMPurify = DOMPurify;

import mermaid from "mermaid";

mermaid.initialize({ startOnLoad: false, securityLevel: "strict" });

export interface MermaidBlock {
  file: string;
  index: number;
  source: string;
}

function unescapeHtml(str: string): string {
  return str
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

export function extractAllMermaidBlocks(
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

    // Search HTML pre/code tags
    htmlRegex.lastIndex = 0;
    let blockIndex = 1;
    while ((match = htmlRegex.exec(text)) !== null) {
      blocks.push({
        file: relPath,
        index: blockIndex++,
        source: unescapeHtml(match[1].trim()),
      });
    }

    // Search markdown fenced code blocks
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

export async function validateCorpus(workspaceRoot: string = process.cwd()) {
  const blocks = extractAllMermaidBlocks(workspaceRoot);
  const results: {
    file: string;
    index: number;
    source: string;
    valid: boolean;
    error?: string;
  }[] = [];

  for (const block of blocks) {
    try {
      await mermaid.parse(block.source);
      results.push({
        file: block.file,
        index: block.index,
        source: block.source,
        valid: true,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      results.push({
        file: block.file,
        index: block.index,
        source: block.source,
        valid: false,
        error: msg,
      });
    }
  }

  return { total: blocks.length, results };
}

if (process.argv[1] && process.argv[1].endsWith("validate-mermaid-corpus.ts")) {
  validateCorpus().then(({ total, results }) => {
    const failed = results.filter((r) => !r.valid);
    console.log(`Extracted ${total} total Mermaid blocks across corpus files.`);
    for (const r of results) {
      console.log(`[${r.valid ? "PASS" : "FAIL"}] ${r.file} #${r.index}`);
      if (!r.valid) {
        console.error(`  Error: ${r.error}`);
        console.error(`  Source snippet: ${r.source.slice(0, 100)}...`);
      }
    }
    if (failed.length > 0) {
      console.error(
        `\nValidation failed: ${failed.length}/${total} diagrams invalid.`
      );
      process.exit(1);
    } else {
      console.log(`\nAll ${total} diagrams parsed successfully!`);
    }
  });
}
