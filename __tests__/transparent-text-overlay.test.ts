import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Transparent Continuous Overlay Layer Compliance", () => {
  const usePretextLayoutPath = path.resolve(__dirname, "../hooks/usePretextLayout.tsx");
  const pretextCardPath = path.resolve(__dirname, "../components/PretextCard.tsx");
  const heroPath = path.resolve(__dirname, "../components/Hero.tsx");
  const lighthousercPath = path.resolve(__dirname, "../.lighthouserc.js");

  it("should implement transparent text overlay in PretextText", () => {
    const content = fs.readFileSync(usePretextLayoutPath, "utf-8");

    // Must wrap in a relative container
    expect(content).toContain('className="relative"');
    
    // Custom visual layout must be select-none and pointer-events-none
    expect(content).toContain('className={`${className || ""} select-none pointer-events-none`}');

    // Transparent semantic overlay must be absolute inset-0 select-text
    expect(content).toContain('className={`${className || ""} absolute inset-0 select-text bg-transparent`}');
    expect(content).toContain('color: "transparent"');
    expect(content).toContain('WebkitTextFillColor: "transparent"');
    expect(content).toContain('pointerEvents: "auto"');
  });

  it("should implement transparent text overlay in PretextRichText", () => {
    const content = fs.readFileSync(usePretextLayoutPath, "utf-8");

    // Must wrap in relative container
    expect(content).toContain('<div className="relative">');

    // Custom visual layout must be select-none and pointer-events-none
    expect(content).toContain('className={`${className || ""} select-none pointer-events-none`}');

    // Transparent semantic overlay must be absolute inset-0 select-text
    expect(content).toContain('className={`${className || ""} absolute inset-0 select-text bg-transparent`}');
    expect(content).toContain('color: "transparent"');
    expect(content).toContain('WebkitTextFillColor: "transparent"');
    expect(content).toContain('pointerEvents: "auto"');
  });

  it("should implement transparent text overlay in PretextCard", () => {
    const content = fs.readFileSync(pretextCardPath, "utf-8");

    // Must wrap in a relative container
    expect(content).toContain('<div className="relative">');

    // Custom visual layout must be select-none and pointer-events-none
    expect(content).toContain('className="select-none pointer-events-none"');

    // Transparent semantic overlay must be absolute inset-0 select-text
    expect(content).toContain('absolute inset-0 select-text bg-transparent');
    expect(content).toContain('color: "transparent"');
    expect(content).toContain('WebkitTextFillColor: "transparent"');
    expect(content).toContain('pointerEvents: "auto"');
  });

  it("should implement transparent text overlay in Hero components", () => {
    const content = fs.readFileSync(heroPath, "utf-8");

    // Headline and Text must be wrapped and set to relative with select-none and pointer-events-none on visual layer
    expect(content).toContain('className="w-full select-none pointer-events-none"');
    
    // Headline absolute transparent overlay h1
    expect(content).toContain('<h1\n        className="text-4xl md:text-6xl font-black tracking-tight text-center leading-tight md:leading-none absolute inset-0 select-text bg-transparent"');
    
    // Subheadline absolute transparent overlay p
    expect(content).toContain('<p\n        className="text-neutral-400 text-sm md:text-base leading-[28px] text-center absolute inset-0 select-text bg-transparent"');
  });

  it("should enforce Lighthouse accessibility assertions in automated audits", () => {
    const content = fs.readFileSync(lighthousercPath, "utf-8");

    // Ensure accessibility category has a minScore of 1.0 (strict enforcement, zero failures)
    expect(content).toContain("'categories:accessibility': ['error', {minScore: 1.0}]");
  });
});
