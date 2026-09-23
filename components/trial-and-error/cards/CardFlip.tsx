"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardFlipProps {
  faceUp: boolean;
  front: React.ReactNode;
  back: React.ReactNode;
  /** Animate the turn. When false (reduced motion) the card just shows its side. */
  animate: boolean;
  /** Start face down and turn up on mount, as when a card is dealt. */
  dealt?: boolean;
  delay?: number;
}

/**
 * A 3D card turn (rotateY, transform only). Dealt cards turn face up; T&E-08
 * blinding and pack openings reuse it.
 */
export function CardFlip({
  faceUp,
  front,
  back,
  animate,
  dealt = false,
  delay = 0,
}: CardFlipProps) {
  const angle = faceUp ? 0 : 180;
  return (
    <motion.span
      className="relative block h-full w-full [transform-style:preserve-3d]"
      initial={animate && dealt ? { rotateY: 180 } : false}
      animate={{ rotateY: angle }}
      transition={
        animate ? { duration: 0.35, delay, ease: "easeOut" } : { duration: 0 }
      }
      data-face-up={faceUp}
    >
      <span className="block h-full w-full [backface-visibility:hidden]">
        {front}
      </span>
      <span className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {back}
      </span>
    </motion.span>
  );
}
