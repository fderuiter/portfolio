"use client";

import React, { useState, useEffect } from "react";

export interface BufferedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string | number | undefined;
  onCommit: (value: string) => void;
  transform?: (val: string) => string;
}

/**
 * BufferedInput component for high-frequency input forms (e.g., inspector property inputs).
 * Maintains local component state during typing for sub-16ms response time and zero offscreen re-renders.
 * Synchronizes change back to parent / history stack on input blur (`onBlur`), Enter key press, or focus exit.
 */
export const BufferedInput: React.FC<BufferedInputProps> = ({
  value = "",
  onCommit,
  transform,
  onBlur,
  onKeyDown,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string>(String(value ?? ""));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(String(value ?? ""));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = e.target.value;
    if (transform) {
      newVal = transform(newVal);
    }
    setLocalValue(newVal);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (localValue !== String(value ?? "")) {
      onCommit(localValue);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (localValue !== String(value ?? "")) {
        onCommit(localValue);
      }
    }
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  return (
    <input
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

export interface BufferedTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange" | "value"> {
  value: string | undefined;
  onCommit: (value: string) => void;
  transform?: (val: string) => string;
}

/**
 * BufferedTextarea component for multiline text properties.
 */
export const BufferedTextarea: React.FC<BufferedTextareaProps> = ({
  value = "",
  onCommit,
  transform,
  onBlur,
  ...props
}) => {
  const [localValue, setLocalValue] = useState<string>(value ?? "");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalValue(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newVal = e.target.value;
    if (transform) {
      newVal = transform(newVal);
    }
    setLocalValue(newVal);
  };

  const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (localValue !== (value ?? "")) {
      onCommit(localValue);
    }
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <textarea
      {...props}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
};
