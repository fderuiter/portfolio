"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProgressProps {
  isPending: boolean;
}

/**
 * Top-of-viewport progress bar indicating active client-side route transitions.
 * Fixed at the upper boundary without shifting page layout elements.
 */
export const NavigationProgress: React.FC<NavigationProgressProps> = ({ isPending }) => {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let timer3: NodeJS.Timeout;

    if (isPending) {
      // Synchronously initiate progress bar within 16ms
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(15);

      // Increment progress towards 85% during pending asset resolution
      timer1 = setTimeout(() => setProgress(45), 100);
      timer2 = setTimeout(() => setProgress(75), 300);
      timer3 = setTimeout(() => setProgress(88), 600);
    } else {
      if (visible) {
        setProgress(100);
        const hideTimer = setTimeout(() => {
          setVisible(false);
          setProgress(0);
        }, 200);
        return () => clearTimeout(hideTimer);
      }
    }

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isPending, visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed top-0 left-0 right-0 h-1 z-[60] pointer-events-none overflow-hidden bg-zinc-950/20"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-brand-cyan via-blue-500 to-emerald-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 20,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
