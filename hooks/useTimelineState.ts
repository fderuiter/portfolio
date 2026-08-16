"use client";

import { useState } from "react";

export type TimelineMode = "recruiter" | "reality";

export function useTimelineState() {
  const [globalMode, setGlobalMode] = useState<TimelineMode>("reality");
  const [cardOverrides, setCardOverrides] = useState<Record<number, TimelineMode>>({});

  const handleGlobalToggle = (mode: TimelineMode) => {
    setGlobalMode(mode);
    setCardOverrides({});
  };

  const handleCardToggle = (idx: number) => {
    const currentCardMode = cardOverrides[idx] ?? globalMode;
    const nextMode: TimelineMode = currentCardMode === "recruiter" ? "reality" : "recruiter";
    setCardOverrides((prev) => ({
      ...prev,
      [idx]: nextMode,
    }));
  };

  const getCardMode = (idx: number): TimelineMode => {
    return cardOverrides[idx] ?? globalMode;
  };

  return {
    globalMode,
    cardOverrides,
    handleGlobalToggle,
    handleCardToggle,
    getCardMode,
  };
}
