"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface TopProgressBarProps {
  /**
   * Indicates whether client-side route navigation is currently in progress.
   */
  isNavigating: boolean;
}

/**
  TopProgressBar component renders a fixed cyan progress bar at the upper viewport boundary during route transitions.
 */
export const TopProgressBar: React.FC<TopProgressBarProps> = ({ isNavigating }) => {
  const [progress, setProgress] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isNavigating) {
      const initTimer = setTimeout(() => {
        setIsExiting(false);
        setProgress(15);
      }, 0);

      const updateProgress = () => {
        setProgress((prev) => {
          if (prev >= 85) return prev;
          return prev + Math.random() * 15;
        });
      };

      timer = setInterval(updateProgress, 200);

      return () => {
        clearTimeout(initTimer);
        clearInterval(timer);
      };
    } else {
      const exitTimer1 = setTimeout(() => {
        setIsExiting(true);
        setProgress(100);
      }, 0);

      const exitTimer2 = setTimeout(() => {
        setIsExiting(false);
        setProgress(0);
      }, 250);

      return () => {
        clearTimeout(exitTimer1);
        clearTimeout(exitTimer2);
      };
    }
  }, [isNavigating]);

  const isVisible = isNavigating || isExiting;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 z-[100] h-1 pointer-events-none bg-zinc-950/20"
          role="progressbar"
          aria-label="Page transition progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-brand-cyan via-cyan-400 to-teal-300 shadow-[0_0_12px_#06b6d4]"
            style={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
