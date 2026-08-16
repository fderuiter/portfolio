"use client";

import { useState, useCallback } from "react";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import { copyToClipboard } from "@/lib/clipboard";

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
}

export function useClipboard(options: UseClipboardOptions = {}) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announce } = useAnnouncer();

  const copy = useCallback(async (text: string) => {
    try {
      setError(null);
      setCopied(false);
      
      await copyToClipboard(text);
      
      setCopied(true);
      const successMsg = options.successMessage || "Copied to clipboard successfully";
      announce(successMsg, "polite");
      
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      
      const errorMsg = options.errorMessage 
        ? `${options.errorMessage}: ${message}`
        : `Failed to copy to clipboard: ${message}`;
        
      announce(errorMsg, "assertive");
      
      const timer = setTimeout(() => {
        setError(null);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [announce, options.successMessage, options.errorMessage]);

  return { copy, copied, error };
}
