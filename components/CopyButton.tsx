"use client";

import React, { useCallback } from "react";
import { IconCopy, IconCheck } from "@tabler/icons-react";
import { useClipboard } from "@/hooks/useClipboard";

export interface CopyButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "value"> {
  /**
   * String content to copy, or a function that returns the string content at copy time.
   */
  text?: string | (() => string);
  /**
   * Alias for `text` string content.
   */
  value?: string;
  /**
   * Standard label when not copied.
   */
  label?: React.ReactNode;
  /**
   * Label displayed when copied.
   */
  copiedLabel?: React.ReactNode;
  /**
   * Icon displayed when not copied.
   */
  icon?: React.ReactNode;
  /**
   * Icon displayed when copied.
   */
  copiedIcon?: React.ReactNode;
  /**
   * Custom polite announcement message on success.
   */
  successMessage?: string;
  /**
   * Custom assertive announcement message on error.
   */
  errorMessage?: string;
  /**
   * Duration in ms before resetting copied state back to initial state. Defaults to 2000ms.
   */
  timeout?: number;
  /**
   * Callback executed after a successful copy action.
   */
  onCopySuccess?: () => void;
  /**
   * Callback executed after a failed copy action.
   */
  onCopyError?: (err: string) => void;
  /**
   * Optional children render prop or React node.
   */
  children?: React.ReactNode | ((state: { copied: boolean; error: string | null }) => React.ReactNode);
  /**
   * Optional custom audio or side-effect function when clicked.
   */
  onCopy?: () => void;
}

export const CopyButton = React.forwardRef<HTMLButtonElement, CopyButtonProps>(
  (
    {
      text,
      value,
      label,
      copiedLabel,
      icon = <IconCopy className="w-4 h-4" aria-hidden="true" />,
      copiedIcon = <IconCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />,
      successMessage,
      errorMessage,
      timeout = 2000,
      onCopySuccess,
      onCopyError,
      children,
      onCopy,
      onClick,
      className = "",
      disabled,
      "aria-label": ariaLabel,
      ...props
    },
    ref
  ) => {
    const { copy, copied, error } = useClipboard({
      successMessage,
      errorMessage,
      timeout,
      onSuccess: onCopySuccess,
      onError: onCopyError,
    });

    const handleClick = useCallback(
      async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (onClick) {
          onClick(e);
        }
        if (onCopy) {
          try {
            onCopy();
          } catch {}
        }

        const stringToCopy = typeof text === "function" ? text() : text ?? value ?? "";
        if (stringToCopy) {
          await copy(stringToCopy);
        }
      },
      [onClick, onCopy, text, value, copy]
    );

    const effectiveAriaLabel =
      ariaLabel ??
      (copied
        ? typeof copiedLabel === "string"
          ? copiedLabel
          : "Copied"
        : typeof label === "string"
        ? label
        : "Copy to clipboard");

    if (typeof children === "function") {
      return (
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-label={effectiveAriaLabel}
          className={className}
          {...props}
        >
          {children({ copied, error })}
        </button>
      );
    }

    if (children) {
      return (
        <button
          ref={ref}
          type="button"
          onClick={handleClick}
          disabled={disabled}
          aria-label={effectiveAriaLabel}
          className={className}
          {...props}
        >
          {children}
        </button>
      );
    }

    const currentIcon = copied ? copiedIcon : icon;
    const currentLabel = copied ? copiedLabel ?? (label ? "Copied!" : undefined) : label;

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-label={effectiveAriaLabel}
        className={className}
        {...props}
      >
        {currentIcon}
        {currentLabel && <span>{currentLabel}</span>}
      </button>
    );
  }
);

CopyButton.displayName = "CopyButton";
