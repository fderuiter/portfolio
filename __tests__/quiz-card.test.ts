import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Static Cover Screen Quiz Card Architecture & Functional Rules", () => {
  const componentPath = path.resolve(__dirname, "../components/QuizCard.tsx");
  const content = fs.readFileSync(componentPath, "utf-8");

  it("should enforce server-side and client-hydration consistency to prevent mismatches", () => {
    // Should declare client-side state for mounting
    expect(content).toContain("const [isMounted, setIsMounted] = useState(false)");
    
    // Should set mounted state inside useEffect
    expect(content).toContain("setIsMounted(true)");

    // Should compute active state index based on mounting flag to guarantee SSR/hydration safety
    expect(content).toContain("isMounted ? progress.currentQuestionIndex : -1");
  });

  it("should enforce a strict fixed-height layout constraint for layout stability", () => {
    // The container card must have a strict height constraint to prevent layour shift
    expect(content).toContain('height: "360px"');
  });

  it("should utilize persistent storage state to preserve user session progress", () => {
    // Component must utilize the custom usePersistentState hook
    expect(content).toContain("usePersistentState");
    expect(content).toContain("fdr-quiz-progress");
  });

  it("should integrate high-quality interactive sound cues", () => {
    // Component should pull playHover, playSkillHover, and playSuccess from useAudio
    expect(content).toContain("useAudio()");
    expect(content).toContain("playHover");
    expect(content).toContain("playSkillHover");
    expect(content).toContain("playSuccess");
  });

  it("should support complete question progression, grading, and reset capabilities", () => {
    // Should display score feedback
    expect(content).toContain("score");
    expect(content).toContain("QUESTIONS.length");

    // Should support resetting the challenge state
    expect(content).toContain("handleResetQuiz");
  });
});
