import { describe, it, expect, vi } from "vitest";
import { Navbar } from "@/components/Navbar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/proof",
}));

describe("Navbar component", () => {
  it("should export Navbar function", () => {
    expect(typeof Navbar).toBe("function");
  });
});
