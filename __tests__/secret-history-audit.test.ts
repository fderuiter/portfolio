import { describe, expect, it } from "vitest";
import type { ScanMatch } from "@/lib/validation-scanner";
import { formatRedactedMatch } from "@/scripts/validate-commit";
import { isKnownFixture, scanCandidate } from "@/scripts/audit-secret-history";

describe("secret audit output", () => {
  it("never echoes a detected value or its source line", () => {
    const match: ScanMatch = {
      lineNumber: 12,
      category: "GitHub token",
      matchedText: "ghp_do_not_echo_this_value_1234567890",
      lineContent: "TOKEN=ghp_do_not_echo_this_value_1234567890",
    };

    const output = formatRedactedMatch(match);
    expect(output).toContain("Line 12");
    expect(output).toContain("value redacted");
    expect(output).not.toContain(match.matchedText);
    expect(output).not.toContain(match.lineContent);
  });

  it("allows explicit local examples but not realistic remote credentials", () => {
    expect(
      isKnownFixture(
        "postgresql://postgres:postgres@localhost:5432/portfolio_ci",
        ".github/workflows/ci.yml"
      )
    ).toBe(true);
    const remoteCredential = [
      "postgresql://owner:",
      "realistic-secret@remote.example.net/database",
    ].join("");
    expect(isKnownFixture(remoteCredential, "docs/leak.md")).toBe(false);
  });

  it("reports only redacted metadata for a candidate", () => {
    const detectedToken = ["ghp_", "abcdefghijklmnopqrstuvwxyz1234567890"].join(
      ""
    );
    const findings = scanCandidate(
      { commit: "a".repeat(40), file: "src/config.ts" },
      {
        category: "GitHub token",
        gitPattern: "ghp_[A-Za-z0-9]{30,}",
        regex: /ghp_[A-Za-z0-9]{30,}/g,
      },
      `const token = '${detectedToken}';`
    );

    expect(findings).toEqual([
      {
        commit: "a".repeat(40),
        file: "src/config.ts",
        category: "GitHub token",
        line: 1,
      },
    ]);
    expect(JSON.stringify(findings)).not.toContain(detectedToken);
  });
});
