import { describe, it, expect } from "vitest";
import {
  isValidNode,
  getSuggestion,
  evaluateProofStatus,
  type Edge
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
        { source: "B", target: "C" }
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
        { source: "D", target: "E" }
      ];
      const status = evaluateProofStatus(edges);
      expect(status.isC_Proven).toBe(true);
      expect(status.isE_Proven).toBe(true);
    });
  });
});
