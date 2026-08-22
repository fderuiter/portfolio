import { describe, it, expect } from "vitest";
import { spawnSync } from "child_process";
import path from "path";

const workspaceRoot = path.resolve(__dirname, "..");
const guardrailScript = path.join(workspaceRoot, "scripts", "git-guardrail.sh");

function runGuardrail(
  commandOrJson: string,
  env: Record<string, string> = {},
  useStdin = true
): { exitCode: number | null; stdout: string; stderr: string } {
  if (useStdin) {
    const result = spawnSync("bash", [guardrailScript], {
      input: commandOrJson,
      encoding: "utf-8",
      env: { ...process.env, ...env },
    });
    return {
      exitCode: result.status,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
    };
  }

  const result = spawnSync(
    "bash",
    [guardrailScript, ...commandOrJson.split(" ")],
    {
      encoding: "utf-8",
      env: { ...process.env, ...env },
    }
  );
  return {
    exitCode: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

describe("Git Safety Guardrail Interceptor (scripts/git-guardrail.sh)", () => {
  describe("Dangerous Commands Interception (Exit Code 2)", () => {
    const dangerousCommands = [
      "git push --force",
      "git push origin --force",
      "git push origin feat/test --force",
      "git push -f",
      "git push origin -f",
      "git push origin main",
      "git push main",
      "git reset --hard",
      "git reset --hard HEAD~1",
      "git clean -f",
      "git clean -fd",
      "git clean -f -d",
      "git branch -D feature-branch",
      "git checkout .",
      "git checkout -- .",
      "git restore .",
      "git restore --staged .",
    ];

    dangerousCommands.forEach((cmd) => {
      it(`blocks dangerous raw command: '${cmd}'`, () => {
        const result = runGuardrail(cmd);
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain(
          "BLOCKED: Destructive git operation intercepted"
        );
      });

      it(`blocks dangerous agent tool JSON payload: '${cmd}'`, () => {
        const jsonPayload = JSON.stringify({
          tool_input: {
            command: cmd,
          },
        });
        const result = runGuardrail(jsonPayload);
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain(
          "BLOCKED: Destructive git operation intercepted"
        );
      });

      it(`blocks dangerous command passed as CLI arguments: '${cmd}'`, () => {
        const result = runGuardrail(cmd, {}, false);
        expect(result.exitCode).toBe(2);
        expect(result.stderr).toContain(
          "BLOCKED: Destructive git operation intercepted"
        );
      });
    });
  });

  describe("Safe Commands Pass-Through (Exit Code 0)", () => {
    const safeCommands = [
      "git status",
      "git log -n 5",
      "git diff HEAD~1",
      "git add .",
      "git add src/index.ts",
      "git commit -m 'feat(dx): add git guardrail hook'",
      "git push origin feat/git-guardrails",
      "git push origin dev",
      "git checkout -b feat/experiment",
      "git branch -d feat/merged-branch",
      "git restore src/specific-file.ts",
    ];

    safeCommands.forEach((cmd) => {
      it(`allows safe raw command: '${cmd}'`, () => {
        const result = runGuardrail(cmd);
        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe("");
      });

      it(`allows safe agent tool JSON payload: '${cmd}'`, () => {
        const jsonPayload = JSON.stringify({
          tool_input: {
            command: cmd,
          },
        });
        const result = runGuardrail(jsonPayload);
        expect(result.exitCode).toBe(0);
        expect(result.stderr).toBe("");
      });
    });
  });

  describe("Intentional Override Bypass (ALLOW_DANGEROUS_GIT=1)", () => {
    it("permits git push --force when ALLOW_DANGEROUS_GIT=1 is set", () => {
      const result = runGuardrail("git push --force", {
        ALLOW_DANGEROUS_GIT: "1",
      });
      expect(result.exitCode).toBe(0);
    });

    it("permits git reset --hard when ALLOW_DANGEROUS_GIT=1 is set", () => {
      const result = runGuardrail("git reset --hard", {
        ALLOW_DANGEROUS_GIT: "1",
      });
      expect(result.exitCode).toBe(0);
    });
  });
});
