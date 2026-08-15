import { describe, it, expect } from "vitest";
import {
  exportProofToLean4,
  exportProofToLatex,
  exportProofToMarkdown,
  exportProofToMermaid,
} from "../lib/proof-utils";

describe("Proof Export Generators (Lean 4, LaTeX, Markdown, Mermaid)", () => {
  it("exports valid Lean 4 code across theorems", () => {
    const leanMP = exportProofToLean4("modus-ponens");
    expect(leanMP).toContain("theorem modus_ponens_pipeline");
    expect(leanMP).toContain("have hC : Q := hB hA");

    const leanMT = exportProofToLean4("modus-tollens");
    expect(leanMT).toContain("theorem modus_tollens_memory_safety");
  });

  it("exports valid LaTeX natural deduction tree prooftrees", () => {
    const latexMP = exportProofToLatex("modus-ponens");
    expect(latexMP).toContain("\\begin{prooftree}");
    expect(latexMP).toContain("\\end{prooftree}");
    expect(latexMP).toContain("MP");
  });

  it("exports formatted Markdown certificate with ledger table", () => {
    const md = exportProofToMarkdown([], "modus-ponens");
    expect(md).toContain("# Formal Proof Certificate: Modus Ponens");
    expect(md).toContain("| Step | Proposition | Inference Rule |");
    expect(md).toContain("PENDING");
  });

  it("exports valid Mermaid flowchart graph syntax", () => {
    const mermaid = exportProofToMermaid([{ source: "A", target: "C" }], "modus-ponens");
    expect(mermaid).toContain("graph LR");
    expect(mermaid).toContain("Node_A --> Node_C");
    expect(mermaid).toContain("classDef proven");
  });
});
