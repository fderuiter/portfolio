import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Diagnostics Boot Overlay and Synth Audio", () => {
  const terminalPath = path.resolve(__dirname, "../components/SandboxTerminal.tsx");
  const content = fs.readFileSync(terminalPath, "utf-8");

  it("should import IconRefresh from @tabler/icons-react", () => {
    expect(content).toContain("IconRefresh");
  });

  it("should declare isBooted and isFading state variables", () => {
    expect(content).toContain("const [isBooted, setIsBooted]");
    expect(content).toContain("const [isFading, setIsFading]");
  });

  it("should define playChime helper to synthesize startup diagnostic arpeggio", () => {
    expect(content).toContain("const playChime = () => {");
    expect(content).toContain("new AudioCtx()");
    expect(content).toContain("ctx.createOscillator()");
    expect(content).toContain("ctx.createGain()");
  });

  it("should implement handleBoot to trigger audio and start fade", () => {
    expect(content).toContain("const handleBoot = () => {");
    expect(content).toContain("playChime()");
    expect(content).toContain("setIsFading(true)");
  });

  it("should implement handleReset to restore overlay cover", () => {
    expect(content).toContain("const handleReset = () => {");
    expect(content).toContain("setIsBooted(false)");
    expect(content).toContain("setIsFading(false)");
  });

  it("should block inputs when terminal diagnostics are suspended (not booted)", () => {
    expect(content).toContain("disabled={!isBooted || isExecuting}");
    expect(content).toContain("tabIndex={isBooted ? 0 : -1}");
  });

  it("should render a reset button in the header with proper label and title", () => {
    expect(content).toContain('title="Reset Simulation"');
    expect(content).toContain('aria-label="Reset Terminal Simulation"');
  });
});
