import { describe, it, expect } from "vitest";
import {
  isValidNode,
  getSuggestion,
  evaluateProofStatus,
  canConnect,
  getNextTacticHint,
  type Edge,
} from "../lib/proof-utils";

describe("Logic Proof Workspace Utilities", () => {
  describe("isValidNode", () => {
    it("recognizes valid uppercase and lowercase node IDs", () => {
      expect(isValidNode("A")).toBe(true);
      expect(isValidNode("b")).toBe(true);
      expect(isValidNode("E")).toBe(true);
    });

    it("rejects invalid node IDs", () => {
      expect(isValidNode("X")).toBe(false);
      expect(isValidNode("1")).toBe(false);
      expect(isValidNode("")).toBe(false);
    });
  });

  describe("getSuggestion (Autocomplete)", () => {
    it("suggests valid command names from prefixes", () => {
      expect(getSuggestion("c")).toBe("connect");
      expect(getSuggestion("co")).toBe("connect");
      expect(getSuggestion("di")).toBe("disconnect");
      expect(getSuggestion("l")).toBe("list");
      expect(getSuggestion("he")).toBe("help");
      expect(getSuggestion("si")).toBe("simulate");
      expect(getSuggestion("sim")).toBe("simulate");
    });

    it("does not suggest anything if command is already complete", () => {
      expect(getSuggestion("help")).toBe("");
      expect(getSuggestion("list")).toBe("");
    });

    it("suggests subcommands for simulate", () => {
      expect(getSuggestion("simulate ")).toBe("simulate normal");
      expect(getSuggestion("simulate n")).toBe("simulate normal");
      expect(getSuggestion("simulate l")).toBe("simulate loop");
    });

    it("suggests node IDs inside connect parameters", () => {
      expect(getSuggestion("connect a")).toBe("connect A ");
      expect(getSuggestion("connect A b")).toBe("connect A B");
    });

    it("returns empty string if no valid prediction can be made", () => {
      expect(getSuggestion("invalid")).toBe("");
      expect(getSuggestion("connect A B C")).toBe("");
    });
  });

  describe("evaluateProofStatus", () => {
    it("correctly evaluates incomplete proof state", () => {
      const edges: Edge[] = [];
      const status = evaluateProofStatus(edges);
      expect(status.isC_Proven).toBe(false);
      expect(status.isE_Proven).toBe(false);
    });

    it("correctly evaluates proven intermediate step C but incomplete E", () => {
      const edges: Edge[] = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
      ];
      const status = evaluateProofStatus(edges);
      expect(status.isC_Proven).toBe(true);
      expect(status.isE_Proven).toBe(false);
    });

    it("correctly evaluates completed proof when all connections exist", () => {
      const edges: Edge[] = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
        { source: "C", target: "E" },
        { source: "D", target: "E" },
      ];
      const status = evaluateProofStatus(edges);
      expect(status.isC_Proven).toBe(true);
      expect(status.isE_Proven).toBe(true);
    });
  });

  describe("canConnect", () => {
    it("prevents connecting a node to itself", () => {
      const result = canConnect("C", "C", []);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("itself");
    });

    it("prevents duplicate edges", () => {
      const edges: Edge[] = [{ source: "A", target: "C" }];
      const result = canConnect("A", "C", edges);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("already connected");
    });

    it("allows valid deductive pairs (e.g. C -> E, D -> E)", () => {
      const edges: Edge[] = [];
      expect(canConnect("C", "E", edges).allowed).toBe(true);
      expect(canConnect("D", "E", edges).allowed).toBe(true);
      expect(canConnect("A", "C", edges).allowed).toBe(true);
      expect(canConnect("B", "C", edges).allowed).toBe(true);
    });

    it("rejects invalid inference pairs (e.g. A -> D or A -> E)", () => {
      const result = canConnect("A", "E", []);
      expect(result.allowed).toBe(false);
      expect(result.reason).toContain("No valid deductive inference rule");
    });
  });

  describe("getNextTacticHint", () => {
    it("returns Step 1 hint when initial premises are missing", () => {
      const hint = getNextTacticHint([]);
      expect(hint.stepNumber).toBe(1);
      expect(hint.isCompleted).toBe(false);
      expect(hint.suggestedSource).toBe("A");
      expect(hint.suggestedTarget).toBe("C");
    });

    it("returns Step 2 hint when C is proven but C -> E is missing", () => {
      const edges: Edge[] = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
      ];
      const hint = getNextTacticHint(edges);
      expect(hint.stepNumber).toBe(2);
      expect(hint.isCompleted).toBe(false);
      expect(hint.suggestedSource).toBe("C");
      expect(hint.suggestedTarget).toBe("E");
    });

    it("returns completed Q.E.D. hint when all connections exist", () => {
      const edges: Edge[] = [
        { source: "A", target: "C" },
        { source: "B", target: "C" },
        { source: "C", target: "E" },
        { source: "D", target: "E" },
      ];
      const hint = getNextTacticHint(edges);
      expect(hint.stepNumber).toBe(3);
      expect(hint.isCompleted).toBe(true);
      expect(hint.title).toContain("Q.E.D.");
    });
  });
});
