"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import { copyToClipboard } from "@/lib/clipboard";

export interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announce } = useAnnouncer();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const clearActiveTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(async (text: string) => {
    try {
      clearActiveTimer();
      setError(null);
      setCopied(false);
      
      await copyToClipboard(text);
      
      setCopied(true);
      const successMsg = options.successMessage || "Copied to clipboard successfully";
      announce(successMsg, "polite");
      
      timerRef.current = setTimeout(() => {
        setCopied(false);
        timerRef.current = null;
      }, 2000);
    } catch (err) {
      clearActiveTimer();
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      
      const errorMsg = options.errorMessage 
        ? `${options.errorMessage}: ${message}`
        : `Failed to copy to clipboard: ${message}`;
        
      announce(errorMsg, "assertive");
      
      timerRef.current = setTimeout(() => {
        setError(null);
        timerRef.current = null;
      }, 4000);
    }
  }, [announce, options.successMessage, options.errorMessage, clearActiveTimer]);

  return { copy, copied, error };
}
