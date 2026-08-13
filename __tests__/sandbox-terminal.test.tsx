/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { highlightValue } from "../components/SandboxTerminal";

describe("SandboxTerminal Accessibility Implementations", () => {
  const terminalPath = path.resolve(__dirname, "../components/SandboxTerminal.tsx");
  const content = fs.readFileSync(terminalPath, "utf-8");

  it("should have imported useAnnouncer from A11yProvider", () => {
    expect(content).toContain('import { useAnnouncer } from "@/components/providers/A11yProvider";');
  });

  it("should invoke useAnnouncer inside the SandboxTerminal component", () => {
    expect(content).toContain("const { announce } = useAnnouncer();");
  });

  it("should contain the required landmark and log roles for screen reader compliance", () => {
    // Assert region role and accessible label on terminal window frame
    expect(content).toContain('role="region"');
    expect(content).toContain('aria-label="Interactive Terminal Sandbox"');

    // Assert log role and output log label on terminal output viewport
    expect(content).toContain('role="log"');
    expect(content).toContain('aria-label="Terminal output log"');
  });

  it("should implement natural escape blur behavior to prevent keyboard trap", () => {
    expect(content).toContain('e.key === "Escape"');
    expect(content).toContain("inputRef.current?.blur()");
  });

  it("should prevent default on Tab key press only conditionally when a match exists", () => {
    expect(content).toContain('e.key === "Tab"');
    expect(content).toContain("e.preventDefault()");
    // Should verify that the autocomplete is matched and trimmed input is present
    expect(content).toContain("const trimmed = input.trim().toLowerCase();");
  });

  it("should announce command start and various command completion phases clearly and polite-ly", () => {
    expect(content).toContain('announce("Command execution started", "polite");');
    expect(content).toContain('announce("Console cleared", "polite");');
    expect(content).toContain('announce("Help menu loaded displaying available SDK commands.", "polite");');
    expect(content).toContain('announce("Command execution completed. Returned active clinical trials: BRIGHT-01, ONCO-2026, and CARDIO-REF.", "polite");');
    expect(content).toContain('announce("Command execution completed. Returned clinical records and HIPAA-anonymized demographics for subject 123.", "polite");');
    expect(content).toContain('announce("Command execution completed. Returned 3 vital sign records matching study BRIGHT-01.", "polite");');
    expect(content).toContain('announce("Command execution completed. Standard JSON payload results rendered.", "polite");');
    expect(content).toContain('announce(`Command execution failed. Unknown command: \'${trimmed}\'.`, "polite");');
  });

  it("should render [LIVE_VERIFICATION_LINK] with robust focus styles", () => {
    expect(content).toContain('"[VERIFY_SECURITY_LOGS]"');
    expect(content).toContain("focus:outline-none");
    expect(content).toContain("focus:ring-2");
    expect(content).toContain("focus:ring-brand-cyan/50");
    expect(content).toContain("focus:ring-offset-1");
  });
});

describe("SandboxTerminal Parsing & Formatting Logic", () => {
  it("should parse the verification token without a trailing comma", () => {
    const res = highlightValue('"[VERIFY_SECURITY_LOGS]"');
    expect(res).toBeDefined();
    const element = res as any;
    expect(element.type).toBeDefined();
    
    // With no trailing comma, the second child should be falsy
    const children = element.props.children;
    expect(children[0].props.href).toBe("/transparency");
    expect(children[0].props.children).toBe("[LIVE_VERIFICATION_LINK]");
    expect(children[1]).toBeFalsy();
  });

  it("should parse the verification token with a trailing comma", () => {
    const res = highlightValue('"[VERIFY_SECURITY_LOGS]",');
    expect(res).toBeDefined();
    const element = res as any;
    expect(element.type).toBeDefined();
    
    // With a trailing comma, the second child should be ","
    const children = element.props.children;
    expect(children[0].props.href).toBe("/transparency");
    expect(children[0].props.children).toBe("[LIVE_VERIFICATION_LINK]");
    expect(children[1]).toBe(",");
  });

  it("should render non-compliance strings in emerald span with/without trailing commas", () => {
    const res1 = highlightValue('"BRIGHT-01"');
    const res2 = highlightValue('"BRIGHT-01",');
    
    expect((res1 as any).props.className).toContain("text-emerald-400");
    expect((res1 as any).props.children).toBe('"BRIGHT-01"');

    expect((res2 as any).props.className).toContain("text-emerald-400");
    expect((res2 as any).props.children).toBe('"BRIGHT-01",');
  });

  it("should render numbers, booleans, and null correctly", () => {
    const resBool = highlightValue("true");
    expect((resBool as any).props.className).toContain("text-amber-500");

    const resNull = highlightValue("null");
    expect((resNull as any).props.className).toContain("text-red-400");

    const resNum = highlightValue("142,");
    expect((resNum as any).props.className).toContain("text-blue-400");
  });
});

