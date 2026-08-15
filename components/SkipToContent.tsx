"use client";

import React from "react";

export interface SkipToContentProps {
  /**
   * Target DOM element ID to jump to when activated.
   * Defaults to 'main-content'.
   */
  targetId?: string;
  /**
   * Custom label text for the skip link.
   * Defaults to 'Skip to main content'.
   */
  label?: string;
}

/**
 * High-contrast, keyboard-accessible skip link component.
 *
 * Positioned at the root DOM level to allow screen reader and keyboard-only users
 * to bypass navigation menus directly to the primary page content.
 */
export function SkipToContent({
  targetId = "main-content",
  label = "Skip to main content",
}: SkipToContentProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-cyan-400 focus:text-slate-950 focus:font-semibold focus:text-sm focus:rounded-md focus:shadow-xl focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none transition-all duration-150"
    >
      {label}
    </a>
  );
}
