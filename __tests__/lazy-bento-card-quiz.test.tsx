import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";

describe("Lazy-Loaded Bento Card Quiz Integration", () => {
  const bentoCardPath = path.resolve(__dirname, "../components/ui/CaseStudyBentoCard.tsx");
  const hiringQuizPath = path.resolve(__dirname, "../components/HiringQuiz.tsx");
  const showcasePath = path.resolve(__dirname, "../components/CaseStudyShowcase.tsx");
  const layoutConfigPath = path.resolve(__dirname, "../lib/layout-config.ts");

  it("should have successfully created the HiringQuiz component with dynamic imports and no heavy framer-motion library inside", () => {
    expect(fs.existsSync(hiringQuizPath)).toBe(true);

    const quizContent = fs.readFileSync(hiringQuizPath, "utf-8");
    // Ensure it uses lightweight transitions and is clean
    expect(quizContent).toContain("HiringQuiz");
    expect(quizContent).toContain("currentStep");
    expect(quizContent).toContain("transition-all duration-150");
    // Ensure we do not load framer-motion inside this chunk, preserving layout footprint
    expect(quizContent).not.toContain('import { motion } from "framer-motion"');
    expect(quizContent).not.toContain('import { motion, AnimatePresence } from "framer-motion"');
  });

  it("should configure the precalculated custom padding height for the quiz in layout-config", () => {
    expect(fs.existsSync(layoutConfigPath)).toBe(true);
    const layoutContent = fs.readFileSync(layoutConfigPath, "utf-8");
    expect(layoutContent).toContain("PADDING_WITH_QUIZ: designManifest.masonry.paddingWithQuiz");
  });

  it("should dynamically import the quiz and manage hover/focus/scroll triggers in CaseStudyBentoCard", () => {
    expect(fs.existsSync(bentoCardPath)).toBe(true);
    const cardContent = fs.readFileSync(bentoCardPath, "utf-8");

    // Dynamic import
    expect(cardContent).toContain('dynamic(() => import("@/components/HiringQuiz")');
    expect(cardContent).toContain("ssr: false");

    // Trigger state and hooks
    expect(cardContent).toContain("shouldLoad");
    expect(cardContent).toContain("triggerLoad");

    // Precalculated custom padding height integration
    expect(cardContent).toContain("study.isQuiz");
    expect(cardContent).toContain("finalPadding");
    expect(cardContent).toContain("PADDING_WITH_QUIZ");

    // Interaction triggers
    expect(cardContent).toContain("onPointerEnter={isQuizCard ? triggerLoad : undefined}");
    expect(cardContent).toContain("onFocus={isQuizCard ? triggerLoad : undefined}");
    expect(cardContent).toContain("new IntersectionObserver");
  });

  it("should inject the Should You Hire Me? quiz card into the CaseStudyShowcase masonry grid", () => {
    expect(fs.existsSync(showcasePath)).toBe(true);
    const showcaseContent = fs.readFileSync(showcasePath, "utf-8");

    expect(showcaseContent).toContain('id: "hiring-quiz-card"');
    expect(showcaseContent).toContain('slug: "hiring-quiz"');
    expect(showcaseContent).toContain('title: "Should You Hire Me?"');
    expect(showcaseContent).toContain("combinedWithQuiz");
    expect(showcaseContent).toContain("useMemo");
  });
});
