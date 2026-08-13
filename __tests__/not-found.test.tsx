import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import NotFound from "@/app/not-found";

describe("NotFound component", () => {
  const notFoundPath = path.resolve(__dirname, "../app/not-found.tsx");
  const content = fs.readFileSync(notFoundPath, "utf-8");

  it("exports a function as default", () => {
    expect(typeof NotFound).toBe("function");
  });

  it("dynamically imports the LabyrinthGame with ssr: false", () => {
    expect(content).toContain("dynamic(");
    expect(content).toContain("@/components/LabyrinthGame");
    expect(content).toContain("ssr: false");
  });

  it("provides a visual loading state during dynamic load", () => {
    expect(content).toContain("loading:");
    expect(content).toContain("INITIALIZING CORE MATRIX...");
  });

  it("contains the play trigger button to activate the game", () => {
    expect(content).toContain("Play 404 Labyrinth");
  });

  it("retains all existing features (Error 404, Search Site, Return to Core)", () => {
    expect(content).toContain("ERROR 404");
    expect(content).toContain("Search Site");
    expect(content).toContain("Return to Core");
  });
});

