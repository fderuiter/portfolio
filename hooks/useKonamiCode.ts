"use client";

import { useEffect, useRef, useState } from "react";
import { unlockAchievement, setVaultUnlocked } from "@/lib/meme-data";
import { playMemeSound } from "@/lib/meme-audio";

const KONAMI_SEQUENCE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

export function useKonamiCode(onSuccess?: () => void) {
  const [isActivated, setIsActivated] = useState(false);
  const bufferRef = useRef<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, or contentEditable element
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      bufferRef.current.push(key);

      if (bufferRef.current.length > KONAMI_SEQUENCE.length) {
        bufferRef.current.shift();
      }

      const isMatch = bufferRef.current.every(
        (val, index) => val === KONAMI_SEQUENCE[index]
      );

      if (isMatch && bufferRef.current.length === KONAMI_SEQUENCE.length) {
        bufferRef.current = [];
        setIsActivated(true);
        unlockAchievement("konami-hero");
        setVaultUnlocked(true);
        playMemeSound("fanfare");

        if (typeof onSuccess === "function") {
          onSuccess();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onSuccess]);

  return {
    isActivated,
    resetActivation: () => setIsActivated(false),
    triggerManually: () => {
      setIsActivated(true);
      unlockAchievement("konami-hero");
      setVaultUnlocked(true);
      playMemeSound("fanfare");
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    },
  };
}
