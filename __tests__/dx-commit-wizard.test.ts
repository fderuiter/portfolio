import { describe, it, expect, vi, beforeEach } from "vitest";
import readline from "readline";

const { mockExecFileSync } = vi.hoisted(() => {
  return {
    mockExecFileSync: vi.fn(),
  };
});

vi.mock("child_process", () => {
  return {
    execFileSync: mockExecFileSync,
    execSync: vi.fn(),
    default: {
      execFileSync: mockExecFileSync,
      execSync: vi.fn(),
    },
  };
});

import { handleCommitCommand } from "../scripts/dx";

describe("DX Commit Wizard Direct Array Execution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("executes git commit via execFileSync with discrete argument array when user inputs metacharacters", async () => {
    const answers = ["fix", "dx", "support `backticks` & $(whoami); unescaped", "N"];
    let answerIdx = 0;

    const mockRl = {
      question: vi.fn((_q: string, cb: (ans: string) => void) => {
        cb(answers[answerIdx++] || "");
      }),
      close: vi.fn(),
    };

    const rlSpy = vi.spyOn(readline, "createInterface").mockReturnValue(mockRl as unknown as readline.Interface);

    await handleCommitCommand();

    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
    expect(mockExecFileSync).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "fix(dx): support `backticks` & $(whoami); unescaped"],
      { stdio: "inherit" }
    );

    rlSpy.mockRestore();
  });

  it("handles breaking changes and scopes correctly", async () => {
    const answers = ["feat", "auth", "replace session cookie format", "y"];
    let answerIdx = 0;

    const mockRl = {
      question: vi.fn((_q: string, cb: (ans: string) => void) => {
        cb(answers[answerIdx++] || "");
      }),
      close: vi.fn(),
    };

    const rlSpy = vi.spyOn(readline, "createInterface").mockReturnValue(mockRl as unknown as readline.Interface);

    await handleCommitCommand();

    expect(mockExecFileSync).toHaveBeenCalledTimes(1);
    expect(mockExecFileSync).toHaveBeenCalledWith(
      "git",
      ["commit", "-m", "feat(auth)!: replace session cookie format"],
      { stdio: "inherit" }
    );

    rlSpy.mockRestore();
  });
});
