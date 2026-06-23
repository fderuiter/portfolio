"use client";

import React, { useState } from "react";
import { m as motion, AnimatePresence } from "framer-motion";

export const Tooltip = ({
  children,
  text,
}: {
  children: React.ReactNode;
  text: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <span
      className="relative inline-block cursor-help group"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
    >
      <span className="border-b border-dashed border-zinc-500">{children}</span>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs font-sans text-neutral-200 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-50 pointer-events-none"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};
