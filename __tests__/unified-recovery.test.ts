import { describe, it, expect } from "vitest";
import { useSearch } from "@/components/providers/SearchProvider";
import { UnifiedErrorLayout } from "@/components/UnifiedErrorLayout";

describe("SearchProvider & useSearch Context", () => {
  it("should throw an error when useSearch is used outside of a SearchProvider", () => {
    expect(() => {
      useSearch();
    }).toThrow();
  });

  it("should export UnifiedErrorLayout and make it available", () => {
    expect(UnifiedErrorLayout).toBeDefined();
    expect(typeof UnifiedErrorLayout).toBe("function");
  });
});
