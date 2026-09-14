import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

/**
 * CI-02 (#733 follow-up): before this policy existed, the targeted
 * non-chromium visual/touch coverage (`visual.spec.ts`, `touch-controls.spec.ts`
 * against Tablet Safari / Mobile Safari / Mobile Chrome) ran only in a
 * `push`-only job (`post-merge-device-smoke`), *after* a squash-merge had
 * already landed the change on `main`. A PR could merge with a device-engine
 * regression nothing had caught yet. These tests pin the fix: that coverage
 * must be part of the pull_request execution graph, and a single required
 * job (`merge-gate`) must be unable to report success unless every job that
 * gates the merge actually succeeded -- not merely "didn't block" by being
 * skipped or cancelled.
 *
 * No YAML parser is used here (js-yaml is present only as a transitive
 * `overrides` pin for eslint, not a direct dependency this repo can rely on
 * having types for), so job blocks are located the same way the sibling
 * ci-*.test.ts files do: by their literal 2-space-indented header line under
 * `jobs:`.
 */
describe("CI Execution Policy", () => {
  const ciPath = path.join(process.cwd(), ".github/workflows/ci.yml");
  const ci = fs.readFileSync(ciPath, "utf8");
  const lines = ci.split("\n");

  const jobsSectionStart = lines.findIndex((line) => line === "jobs:");

  /** Every top-level job id and the line index its header starts at. */
  const jobHeaders = lines
    .map((line, index) => ({ line, index }))
    .filter(
      ({ line, index }) =>
        index > jobsSectionStart && /^ {2}[a-zA-Z0-9_-]+:\s*$/.test(line)
    )
    .map(({ line, index }) => ({
      name: line.trim().replace(/:$/, ""),
      index,
    }));

  it("finds the jobs: section and at least one job in it", () => {
    expect(jobsSectionStart).toBeGreaterThan(-1);
    expect(jobHeaders.length).toBeGreaterThan(0);
  });

  /** Raw text of one job block, from its header to the next job's header. */
  const jobBlock = (name: string): string => {
    const i = jobHeaders.findIndex((h) => h.name === name);
    if (i === -1) return "";
    const start = jobHeaders[i].index;
    const end =
      i + 1 < jobHeaders.length ? jobHeaders[i + 1].index : lines.length;
    return lines.slice(start, end).join("\n");
  };

  /** The single-line value of a `key:` field at 4-space indent in a block. */
  const field = (block: string, key: string): string | undefined =>
    block.match(new RegExp(`^ {4}${key}:\\s*(.+)$`, "m"))?.[1].trim();

  /** Normalizes a `needs:` field (bare id or `[a, b, c]`) to a string array. */
  const needsList = (block: string): string[] => {
    const raw = field(block, "needs");
    if (!raw) return [];
    return raw
      .replace(/^\[/, "")
      .replace(/\]$/, "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  };

  const DEVICE_SPECS = [
    "__tests__/e2e/visual.spec.ts",
    "__tests__/e2e/touch-controls.spec.ts",
  ];

  const NON_CHROMIUM_PROJECTS = [
    '--project="Tablet Safari"',
    '--project="Mobile Safari"',
    '--project="Mobile Chrome"',
  ];

  const jobNames = jobHeaders.map((h) => h.name);

  describe("regression: targeted device coverage is present on pull_request", () => {
    it("finds at least one job that runs both device-engine dependent specs", () => {
      const deviceSpecJobs = jobNames.filter((name) => {
        const block = jobBlock(name);
        return DEVICE_SPECS.every((spec) => block.includes(spec));
      });

      expect(deviceSpecJobs.length).toBeGreaterThan(0);
    });

    it("requires every job running those specs against the non-chromium projects to trigger on pull_request", () => {
      // This is the actual regression guard: whatever job (by whatever name)
      // owns this coverage, it must be reachable from a PR push. A push-only
      // or workflow_dispatch-only `if:` here silently reintroduces the CI-02
      // gap even if the specs and projects are still correct.
      const deviceSpecJobs = jobNames.filter((name) => {
        if (name === "cross-device-matrix") return false; // full matrix is a distinct, deliberately manual concern
        const block = jobBlock(name);
        return (
          DEVICE_SPECS.every((spec) => block.includes(spec)) &&
          NON_CHROMIUM_PROJECTS.every((proj) => block.includes(proj))
        );
      });

      expect(deviceSpecJobs.length).toBeGreaterThan(0);
      for (const name of deviceSpecJobs) {
        const ifCondition = field(jobBlock(name), "if");
        expect(
          ifCondition,
          `job "${name}" carries the targeted device suite but does not gate on pull_request`
        ).toMatch(/\bpull_request\b/);
      }
    });

    it("does not leave a duplicate push-triggered run of the same targeted device suite", () => {
      // Guards the "no duplicate full-matrix execution" constraint: the
      // targeted suite should gate the merge exactly once, not run again on
      // the post-merge push against identical code.
      const pushTriggeredDuplicates = jobNames.filter((name) => {
        if (name === "cross-device-matrix") return false;
        const block = jobBlock(name);
        const hasDeviceSuite = DEVICE_SPECS.every((spec) =>
          block.includes(spec)
        );
        const ifCondition = field(block, "if");
        const runsOnPush =
          ifCondition === undefined || /\bpush\b/.test(ifCondition);
        return hasDeviceSuite && runsOnPush;
      });

      expect(pushTriggeredDuplicates).toEqual([]);
    });
  });

  describe("device-gate", () => {
    const block = jobBlock("device-gate");

    it("exists, needs fast-gate, and gates on pull_request only", () => {
      expect(block).not.toBe("");
      expect(needsList(block)).toEqual(["fast-gate"]);
      expect(field(block, "if")).toBe("github.event_name == 'pull_request'");
    });

    it("scopes to the three non-chromium projects, not chromium", () => {
      for (const proj of NON_CHROMIUM_PROJECTS) {
        expect(block).toContain(proj);
      }
      expect(block).not.toMatch(/--project="?chromium"?/);
    });

    it("declares a timeout so a hang cannot run unbounded", () => {
      const timeout = Number(field(block, "timeout-minutes"));
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe("heavy-gate keeps full chromium PR coverage", () => {
    const block = jobBlock("heavy-gate");

    it("still gates on pull_request only", () => {
      expect(field(block, "if")).toBe("github.event_name == 'pull_request'");
    });

    it("still runs the full e2e suite against chromium", () => {
      expect(block).toMatch(/playwright test --project=chromium\b/);
    });
  });

  describe("cross-device-matrix retains manual full-matrix capability", () => {
    const block = jobBlock("cross-device-matrix");

    it("stays gated behind workflow_dispatch and the cross_device_matrix input", () => {
      expect(field(block, "if")).toBe(
        "github.event_name == 'workflow_dispatch' && inputs.cross_device_matrix"
      );
    });

    it("runs the full suite with no project filter", () => {
      expect(block).toContain("npx playwright test");
      expect(block).not.toMatch(/npx playwright test[^\n]*--project=/);
    });
  });

  describe("merge-gate aggregates every job required for a passing merge", () => {
    const block = jobBlock("merge-gate");

    it("exists and needs every gating job from both the fast and heavy paths", () => {
      expect(block).not.toBe("");
      expect(needsList(block).sort()).toEqual(
        ["device-gate", "fast-gate", "heavy-gate", "security-gate"].sort()
      );
    });

    it("runs with if: always() so it cannot be skipped by a failed or cancelled predecessor", () => {
      expect(field(block, "if")).toMatch(/\balways\(\)/);
    });

    it("does not fire for a bare workflow_dispatch run (the manual full-matrix job has its own gate)", () => {
      const ifCondition = field(block, "if") ?? "";
      expect(ifCondition).toContain("workflow_dispatch");
      expect(ifCondition).toMatch(/!=\s*'workflow_dispatch'/);
    });

    it("inspects every required predecessor's actual .result rather than trusting needs: alone", () => {
      for (const dep of [
        "fast-gate",
        "security-gate",
        "heavy-gate",
        "device-gate",
      ]) {
        expect(block).toContain(`needs.${dep}.result`);
      }
    });

    it("treats any non-success result as fatal, covering failure, cancellation, and skip alike", () => {
      // `!= "success"` catches "failure", "cancelled", and "skipped" in one
      // comparison -- there is no allowlist of "acceptable" non-success
      // states for a required predecessor.
      expect(block).toContain('!= "success"');
      expect(block).toMatch(/exit\s+"?\$\{fail\}"?/);
    });

    it("only requires heavy-gate/device-gate to have succeeded when the event is pull_request", () => {
      const marker = 'if [ "${{ github.event_name }}" = "pull_request" ]; then';
      expect(block).toContain(marker);
      const guardedBlock = block.split(marker)[1];
      expect(guardedBlock).toContain("heavy-gate");
      expect(guardedBlock).toContain("device-gate");
    });

    it("declares a timeout so the summary step itself cannot hang unbounded", () => {
      const timeout = Number(field(block, "timeout-minutes"));
      expect(timeout).toBeGreaterThan(0);
    });
  });

  describe("main-push confirmation stays bounded", () => {
    it("fast-gate and security-gate remain unconditional (the direct-push safety net)", () => {
      expect(field(jobBlock("fast-gate"), "if")).toBeUndefined();
      expect(field(jobBlock("security-gate"), "if")).toBeUndefined();
    });

    it("no job newly runs the full build+Playwright heavy path on a bare push", () => {
      const heavyOnPush = jobNames.filter((name) => {
        if (name === "fast-gate" || name === "security-gate") return false;
        if (name === "cross-device-matrix") return false;
        const block = jobBlock(name);
        const ifCondition = field(block, "if");
        const runsOnPush =
          ifCondition === undefined || /\bpush\b/.test(ifCondition);
        return runsOnPush && block.includes("npm run build");
      });
      expect(heavyOnPush).toEqual([]);
    });
  });
});
