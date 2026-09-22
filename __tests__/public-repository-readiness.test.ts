import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (file: string): string =>
  fs.readFileSync(path.join(root, file), "utf8");

describe("public repository readiness contracts", () => {
  it("keeps public documentation on the main-only workflow", () => {
    const readme = read("README.md");
    const security = read("SECURITY.md");

    expect(readme).not.toContain("portfolio/tree/dev");
    expect(readme).not.toContain("portfolio/blob/dev");
    expect(readme).not.toContain("rigor-pipeline");
    expect(security).not.toContain("targeting `dev`");
  });

  it("ships public contribution and private security-reporting guidance", () => {
    expect(fs.existsSync(path.join(root, "CODE_OF_CONDUCT.md"))).toBe(true);
    expect(
      fs.existsSync(path.join(root, ".github/ISSUE_TEMPLATE/bug_report.yml"))
    ).toBe(true);
    expect(read("SECURITY.md")).toContain("Report a vulnerability");
    expect(read(".github/ISSUE_TEMPLATE/config.yml")).toContain(
      "/security/advisories/new"
    );
  });

  it("uses the canonical apex for scheduled production probes", () => {
    const workflow = read(".github/workflows/synthetic-probes.yml");
    expect(workflow).toContain('DEFAULT_PROBE_TARGET: "https://deruiter.dev"');
    expect(workflow).not.toContain(
      'DEFAULT_PROBE_TARGET: "https://www.deruiter.dev"'
    );
  });

  it("runs the redacted secret audit against full history in CI", () => {
    const workflow = read(".github/workflows/ci.yml");
    expect(workflow).toContain("fetch-depth: 0");
    expect(workflow).toContain("run: npm run audit:secrets");
  });

  it("licenses the application source separately from brand assets", () => {
    const license = read("LICENSE");
    expect(license).toContain("Apache License");
    expect(license).toContain("Version 2.0, January 2004");
    expect(license).toContain("Copyright 2026 Frederick de Ruiter");

    // Section 6 is why Apache-2.0 was chosen over MIT for a personal-brand
    // deployment: reusing the engineering must not imply reusing the identity.
    expect(license).toContain("6. Trademarks.");

    const notice = read("NOTICE");
    expect(notice).toContain("public/files/LICENSE.txt");
    expect(notice).toContain("all rights reserved");

    // The pre-existing asset license stays scoped to the artwork.
    expect(read("public/files/LICENSE.txt")).toContain("CC BY 4.0");
  });

  it("states inbound = outbound contribution terms", () => {
    expect(read("CONTRIBUTING.md")).toContain("inbound = outbound");
    expect(read("README.md")).toContain("## License");
  });

  it("declares public repository metadata without enabling npm publication", () => {
    const packageJson = JSON.parse(read("package.json")) as {
      private: boolean;
      description?: string;
      homepage?: string;
      license?: string;
      repository?: { url?: string };
      bugs?: { url?: string };
    };

    expect(packageJson.private).toBe(true);
    expect(packageJson.license).toBe("Apache-2.0");
    expect(packageJson.description).toBeTruthy();
    expect(packageJson.homepage).toBe("https://deruiter.dev");
    expect(packageJson.repository?.url).toContain("fderuiter/portfolio");
    expect(packageJson.bugs?.url).toContain("fderuiter/portfolio/issues");
  });
});
