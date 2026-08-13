import { describe, it, expect, vi, beforeEach } from "vitest";
import RecruiterSimulator from "@/app/simulator/page";

// Mock dependencies
vi.mock("@/hooks/useTelemetry", () => ({
  useTelemetry: () => ({
    recordEvent: vi.fn(),
  }),
}));

describe("RecruiterSimulator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a function as default", () => {
    expect(typeof RecruiterSimulator).toBe("function");
  });
});
