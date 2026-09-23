import React from "react";
import type { RedactedCard } from "@/lib/trial-and-error";

interface CardBackProps {
  /** A face-down card: an opaque slot, with no room for face values. */
  card: RedactedCard;
  className?: string;
}

/**
 * The shared card back, for the draw pile and any face-down card. It takes a
 * `RedactedCard`, so it cannot be handed face data to leak (T&E-08 blinding
 * reuses it).
 */
export function CardBack({ card, className = "" }: CardBackProps) {
  return (
    <span
      aria-hidden="true"
      data-slot={card.slot}
      className={`flex items-center justify-center border border-zinc-700 bg-[color:var(--te-surface-1)] bg-[repeating-linear-gradient(45deg,transparent_0_6px,rgba(255,255,255,0.04)_6px_7px)] ${className}`}
    >
      <span className="border border-zinc-600 px-1 text-[10px] font-bold tracking-widest text-zinc-400">
        T&amp;E
      </span>
    </span>
  );
}
