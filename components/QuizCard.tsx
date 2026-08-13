"use client";

import React, { useState, useEffect } from "react";
import { Card, CardTitle, CardDescription } from "@/components/BentoGrid";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useAudio } from "@/components/providers/AudioProvider";
import { motion, AnimatePresence } from "framer-motion";

interface Question {
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
}

const QUESTIONS: Question[] = [
  {
    questionText: "How do you prevent React hydration mismatches when utilizing client-side persistent state?",
    options: [
      "Access localStorage inside a useEffect hook after mounting.",
      "Access localStorage directly inside the state initializer.",
      "Disable server-side rendering for the entire application.",
      "Add unique randomized keys to all server-rendered components."
    ],
    correctAnswerIndex: 0,
  },
  {
    questionText: "What is the primary layout strategy to guarantee zero Cumulative Layout Shift (CLS)?",
    options: [
      "Enforce fixed-height layout constraints on dynamic elements.",
      "Apply margins to all sibling components dynamically.",
      "Load custom styles and layouts asynchronously.",
      "Utilize CSS table structures for all content grids."
    ],
    correctAnswerIndex: 0,
  },
  {
    questionText: "Which core Web Vital metric measures visual stability during initial load?",
    options: [
      "First Input Delay (FID)",
      "Time to Interactive (TTI)",
      "Cumulative Layout Shift (CLS)",
      "Largest Contentful Paint (LCP)"
    ],
    correctAnswerIndex: 2,
  }
];

interface QuizProgress {
  currentQuestionIndex: number;
  answers: number[];
}

export const QuizCard: React.FC = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { playHover, playSkillHover, playSuccess } = useAudio();

  const [progress, setProgress] = usePersistentState<QuizProgress>("fdr-quiz-progress", {
    currentQuestionIndex: -1,
    answers: [],
  });

  // Track mounting on client to bypass SSR/hydration mismatches
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleStartQuiz = () => {
    setProgress({
      currentQuestionIndex: 0,
      answers: [],
    });
    try {
      playSkillHover();
    } catch {}
  };

  const handleSelectAnswer = (optionIndex: number) => {
    const nextAnswers = [...progress.answers];
    nextAnswers[progress.currentQuestionIndex] = optionIndex;

    const nextIndex = progress.currentQuestionIndex + 1;
    const isCompleted = nextIndex === QUESTIONS.length;

    setProgress({
      currentQuestionIndex: nextIndex,
      answers: nextAnswers,
    });

    try {
      if (isCompleted) {
        playSuccess();
      } else {
        playSkillHover();
      }
    } catch {}
  };

  const handleResetQuiz = () => {
    setProgress({
      currentQuestionIndex: -1,
      answers: [],
    });
    try {
      playSkillHover();
    } catch {}
  };

  // Compute active state: render identical cover screen on server & client hydration paint
  const activeIndex = isMounted ? progress.currentQuestionIndex : -1;

  // Calculate score upon completion
  const score = progress.answers.reduce((acc, ans, idx) => {
    return acc + (ans === QUESTIONS[idx]?.correctAnswerIndex ? 1 : 0);
  }, 0);

  return (
    <Card
      className="relative w-full overflow-hidden select-none border border-border hover:border-brand-cyan/20 transition-all duration-300"
      style={{
        height: "360px",
      }}
    >
      <AnimatePresence mode="wait">
        {activeIndex === -1 && (
          <motion.div
            key="cover"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col h-full justify-between p-6"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse" />
                <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest font-bold">
                  Interactive Assessment
                </span>
              </div>
              <CardTitle className="text-lg font-bold text-neutral-100">
                Systems Rigor Challenge
              </CardTitle>
              <CardDescription className="text-xs text-muted-strong leading-relaxed mt-2">
                Test your expertise on React hydration, layout stability, and premium performance engineering. Fully preserves progress across sessions with zero layout shift.
              </CardDescription>
              <div className="mt-4 flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  3 Questions
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  Rigor Scorecard
                </span>
                <span className="px-2 py-0.5 text-[9px] font-mono rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  Persistent State
                </span>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              onMouseEnter={() => {
                try {
                  playHover();
                } catch {}
              }}
              className="w-full py-2.5 bg-brand-cyan/10 hover:bg-brand-cyan/20 border border-brand-cyan/20 hover:border-brand-cyan/40 text-brand-cyan font-mono text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer text-center"
            >
              START CHALLENGE
            </button>
          </motion.div>
        )}

        {activeIndex >= 0 && activeIndex < QUESTIONS.length && (
          <motion.div
            key={`question-${activeIndex}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col h-full justify-between p-6"
          >
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-[10px] font-mono text-brand-cyan uppercase tracking-widest font-bold">
                  Question {activeIndex + 1} of {QUESTIONS.length}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  Progress: {Math.round((activeIndex / QUESTIONS.length) * 100)}%
                </span>
              </div>
              <h4 className="text-sm font-sans font-bold text-neutral-100 leading-snug mb-4">
                {QUESTIONS[activeIndex].questionText}
              </h4>

              <div className="space-y-2">
                {QUESTIONS[activeIndex].options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectAnswer(idx)}
                    onMouseEnter={() => {
                      try {
                        playHover();
                      } catch {}
                    }}
                    className="w-full p-2.5 text-left font-sans text-xs rounded-xl bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/60 hover:border-brand-cyan/30 text-neutral-300 transition-all cursor-pointer flex items-start gap-2.5"
                  >
                    <span className="w-4 h-4 rounded-full border border-zinc-700 hover:border-brand-cyan/50 flex items-center justify-center text-[9px] font-mono font-bold text-zinc-400 shrink-0 mt-0.5">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="text-[9px] font-mono text-zinc-600 self-end">
              State synced to local storage
            </div>
          </motion.div>
        )}

        {activeIndex === QUESTIONS.length && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col h-full justify-between p-6"
          >
            <div className="text-center my-auto">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl">🏆</span>
              </div>
              <h3 className="text-base font-bold text-neutral-100 mb-1">
                Challenge Completed!
              </h3>
              <p className="text-xs font-mono text-brand-cyan mb-3">
                YOUR SCORE: {score} / {QUESTIONS.length} ({Math.round((score / QUESTIONS.length) * 100)}%)
              </p>
              <p className="text-xs text-muted-strong leading-relaxed max-w-sm mx-auto">
                {score === QUESTIONS.length
                  ? "Flawless technical performance! You have exceptional mastery over systems rigor, layout physics, and React hydration."
                  : "Excellent effort! You understand high-performance frontend engineering. Review the concepts to achieve a perfect score."}
              </p>
            </div>

            <button
              onClick={handleResetQuiz}
              onMouseEnter={() => {
                try {
                  playHover();
                } catch {}
              }}
              className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-mono text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer text-center"
            >
              RESET CHALLENGE
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};
