import { describe, it, expect } from "vitest";
import DOMPurify from "isomorphic-dompurify";
import fs from "fs";
import path from "path";

describe("Interactive Terminology Tooltips - Sanitization Layers", () => {
  const allowedTags = [
    "h2", "h3", "h4", "p", "code", "pre", "strong", "em", "a", "ul", "ol", "li", "span", "abbr"
  ];
  const allowedAttrs = [
    "href", "target", "rel", "class", "data-term", "data-definition", "data-key"
  ];

  const sanitizeOptions = {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttrs,
  };

  it("should preserve allowed inline terminology tags span and abbr", () => {
    const dirtyHtml = `
      <span data-term="Node Editor" data-definition="A visual editor" data-key="node-editor">Reactive Engine</span>
      <abbr data-term="AST" data-definition="Abstract Syntax Tree" data-key="ast-key">AST Compiler</abbr>
    `;
    const cleanHtml = DOMPurify.sanitize(dirtyHtml, sanitizeOptions);

    expect(cleanHtml).toContain("span");
    expect(cleanHtml).toContain("abbr");
    expect(cleanHtml).toContain('data-term="Node Editor"');
    expect(cleanHtml).toContain('data-definition="A visual editor"');
    expect(cleanHtml).toContain('data-key="node-editor"');
    expect(cleanHtml).toContain('data-term="AST"');
    expect(cleanHtml).toContain('data-definition="Abstract Syntax Tree"');
    expect(cleanHtml).toContain('data-key="ast-key"');
  });

  it("should rigorously block and strip arbitrary scripts, onclick handlers, and style tags", () => {
    const maliciousHtml = `
      <span data-term="Test" onclick="alert(1)" style="color: red">Safe text</span>
      <script>console.log('injected');</script>
      <img src="x" onerror="alert(2)" />
    `;
    const cleanHtml = DOMPurify.sanitize(maliciousHtml, sanitizeOptions);

    expect(cleanHtml).not.toContain("<script>");
    expect(cleanHtml).not.toContain("onclick");
    expect(cleanHtml).not.toContain("style");
    expect(cleanHtml).not.toContain("onerror");
    expect(cleanHtml).not.toContain("img");
  });
});

describe("Interactive Terminology Tooltips - Component Structures", () => {
  const richNarrativePath = path.resolve(__dirname, "../components/RichNarrative.tsx");
  const togglePath = path.resolve(__dirname, "../components/TerminologyToggle.tsx");
  const tooltipPath = path.resolve(__dirname, "../components/ui/Tooltip.tsx");

  it("should have imported usePersistentState and implemented DOMParser rehydration in RichNarrative", () => {
    const content = fs.readFileSync(richNarrativePath, "utf-8");
    expect(content).toContain('import { usePersistentState } from "@/hooks/usePersistentState";');
    expect(content).toContain("new DOMParser()");
    expect(content).toContain('parseFromString(`<div>${cleanHtml}</div>`, "text/html")');
    expect(content).toContain("domToReact");
  });

  it("should implement Simplified Terminology option and standard accessibility attributes in TerminologyToggle", () => {
    const content = fs.readFileSync(togglePath, "utf-8");
    expect(content).toContain('usePersistentState("simplified-terminology", false)');
    expect(content).toContain('role="switch"');
    expect(content).toContain('aria-checked={simplified}');
    expect(content).toContain('aria-label="Toggle simplified terminology"');
  });

  it("should implement focusable and accessible tooltip specifications in Tooltip component", () => {
    const content = fs.readFileSync(tooltipPath, "utf-8");
    expect(content).toContain("tabIndex={0}");
    expect(content).toContain("aria-describedby={tooltipId}");
    expect(content).toContain('role="tooltip"');
  });
});
