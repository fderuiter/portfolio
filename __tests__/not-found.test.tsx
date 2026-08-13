import { describe, it, expect } from "vitest";
import NotFound from "@/app/not-found";

describe("NotFound component", () => {
  it("exports a function as default", () => {
    expect(typeof NotFound).toBe("function");
  });
});
