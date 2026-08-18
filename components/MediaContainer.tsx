"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MediaContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  aspectRatio?: string; // e.g., "16/9", "4/3", "1/1", "aspect-square"
  minHeight?: number | string;
  placeholder?: React.ReactNode;
  isLoading?: boolean;
  children?: React.ReactNode;
}

/**
 * CLS-Safe Media Container Primitive
 * Holds layout dimensions and aspect ratio to prevent Cumulative Layout Shifts (CLS)
 * when below-the-fold media assets resolve into view.
 */
export const MediaContainer = React.forwardRef<HTMLDivElement, MediaContainerProps>(
  (
    {
      aspectRatio,
      minHeight,
      placeholder,
      isLoading = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const containerStyle: React.CSSProperties = {
      ...style,
      ...(aspectRatio ? { aspectRatio } : {}),
      ...(minHeight ? { minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight } : {}),
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative w-full overflow-hidden transition-all duration-300 bg-zinc-900/40 border border-white/5 rounded-2xl",
          className
        )}
        style={containerStyle}
        {...props}
      >
        {isLoading && placeholder ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm animate-pulse">
            {placeholder}
          </div>
        ) : null}
        {children}
      </div>
    );
  }
);

MediaContainer.displayName = "MediaContainer";
