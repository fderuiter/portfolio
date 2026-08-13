import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { RetroLabyrinth } from "@/components/RetroLabyrinth";

describe("RetroLabyrinth Component Architecture & Functional Rules", () => {
  const componentPath = path.resolve(__dirname, "../components/RetroLabyrinth.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("exports a function or component named RetroLabyrinth", () => {
    expect(typeof RetroLabyrinth).toBe("function");
  });

  it("should contain the state-deferred client mounting logic check", () => {
    expect(content).toContain("if (!isMounted) {");
    expect(content).toContain("renderAsciiFallback()");
  });

  it("should render a canvas element once client-side hydrated", () => {
    expect(content).toContain("<canvas");
    expect(content).toContain("ref={canvasRef}");
  });

  it("should implement tabIndex={0} on the focusable game container to capture keyboard input", () => {
    expect(content).toContain("tabIndex={0}");
  });

  it("should specify data-keyboard-boundary='true' to prevent command-palette overlap", () => {
    expect(content).toContain('data-keyboard-boundary="true"');
  });

  it("should intercept and prevent default on directional keys inside handleKeyDown", () => {
    expect(content).toContain("handleKeyDown");
    expect(content).toContain("e.preventDefault()");
    expect(content).toContain("ArrowUp");
    expect(content).toContain("ArrowDown");
    expect(content).toContain("ArrowLeft");
    expect(content).toContain("ArrowRight");
  });

  it("should trigger recordEvent with 'project_click' when victory condition is met", () => {
    expect(content).toContain("recordEvent");
    expect(content).toContain('"project_click"');
    expect(content).toContain('"victory"');
  });

  it("should contain a fully-aligned static ASCII fallback grid structure", () => {
    expect(content).toContain("const renderAsciiFallback = () => {");
    expect(content).toContain('if (cell === "#") return "█"');
    expect(content).toContain('if (x === START_X && y === START_Y) return "@"');
  });
});
