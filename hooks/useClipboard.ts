"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import { copyToClipboard } from "@/lib/clipboard";

export interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  timeout?: number;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const { successMessage, errorMessage, timeout, onSuccess, onError } = options;
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

  const timeoutMs = timeout ?? 2000;

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        clearActiveTimer();
        setError(null);
        setCopied(false);

        await copyToClipboard(text);

        setCopied(true);
        const successMsg = successMessage || "Copied to clipboard successfully";
        announce(successMsg, "polite");
        onSuccess?.();

        timerRef.current = setTimeout(() => {
          setCopied(false);
          timerRef.current = null;
        }, timeoutMs);
        return true;
      } catch (err) {
        clearActiveTimer();
        const message = err instanceof Error ? err.message : String(err);
        setError(message);

        const errorMsg = errorMessage
          ? `${errorMessage}: ${message}`
          : `Failed to copy to clipboard: ${message}`;

        announce(errorMsg, "assertive");
        onError?.(message);

        timerRef.current = setTimeout(() => {
          setError(null);
          timerRef.current = null;
        }, timeoutMs);
        return false;
      }
    },
    [
      announce,
      successMessage,
      errorMessage,
      onSuccess,
      onError,
      timeoutMs,
      clearActiveTimer,
    ]
  );

  return { copy, copied, error };
}
