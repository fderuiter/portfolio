import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { ClinicalTrialChaos } from "@/components/ClinicalTrialChaos";

describe("ClinicalTrialChaos Component Architecture & Invariants", () => {
  const componentPath = path.resolve(__dirname, "../components/ClinicalTrialChaos.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("exports a function or component named ClinicalTrialChaos", () => {
    expect(typeof ClinicalTrialChaos).toBe("function");
  });

  it("should contain SSR fallback check for non-JS clients", () => {
    expect(content).toContain("if (!isMounted) {");
    expect(content).toContain("INITIALIZING CLINICAL TRIAL CHAOS ARCADE...");
  });

  it("should render a canvas element for physics, conveyor rollers, and auditor sprite", () => {
    expect(content).toContain("<canvas");
    expect(content).toContain("ref={canvasRef}");
  });

  it("should enforce keyboard boundary with data-keyboard-boundary='true' and tabIndex={0}", () => {
    expect(content).toContain('data-keyboard-boundary="true"');
    expect(content).toContain("tabIndex={0}");
  });

  it("should support CDISC domain stations (DM, VS, AE, LB)", () => {
    expect(content).toContain("handleInitiateSubmission");
    expect(content).toContain("EDC Form Stations");
    expect(content).toContain("DM");
    expect(content).toContain("VS");
    expect(content).toContain("AE");
    expect(content).toContain("LB");
  });

  it("should implement 21 CFR Part 11 Electronic Signature modal with reason selection", () => {
    expect(content).toContain("21 CFR Part 11 Electronic Signature");
    expect(content).toContain("Intent to Submit");
    expect(content).toContain("handleConfirmSignature");
  });

  it("should feature FDA Auditor scrutiny meter and Form 483 warning letter", () => {
    expect(content).toContain("FDA AUDITOR SCRUTINY");
    expect(content).toContain("FDA FORM 483 WARNING LETTER");
  });

  it("should include real-time scrolling audit trail terminal", () => {
    expect(content).toContain("AUDIT TRAIL LOG · 21 CFR PART 11 COMPLIANT");
    expect(content).toContain("auditLogs");
  });

  it("should cross-link to iMednet Python SDK Case Study", () => {
    expect(content).toContain("/case-studies/imednet-python-sdk");
    expect(content).toContain("iMednet Python SDK");
  });

  it("should handle keydown navigation and prevent default on game keys", () => {
    expect(content).toContain("handleKeyDown");
    expect(content).toContain("e.preventDefault()");
  });
});
