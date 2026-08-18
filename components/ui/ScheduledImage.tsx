"use client";

import React from "react";
import { useViewportMedia } from "@/hooks/useViewportMedia";
import { MEDIA_PRIORITY, type MediaPriority } from "@/lib/media-scheduler";

export interface ScheduledImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  isAboveTheFold?: boolean;
  priority?: MediaPriority;
  aspectRatio?: string; // e.g. '16/9', '4/3', '1/1'
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
}

/**
 * Viewport-Aware Scheduled Image Component
 * Deferral and connection-aware scheduling with reserved layout bounds to guarantee Zero CLS.
 */
export const ScheduledImage: React.FC<ScheduledImageProps> = ({
  src,
  alt,
  isAboveTheFold = false,
  priority = isAboveTheFold ? MEDIA_PRIORITY.CRITICAL_ABOVE_THE_FOLD : MEDIA_PRIORITY.MEDIUM,
  aspectRatio = "16/9",
  containerClassName = "",
  className = "",
  fallbackIcon,
  style,
  ...restProps
}) => {
  const { containerRef, status, isLoaded, connectionInfo } = useViewportMedia(src, {
    isAboveTheFold,
    priority,
  });

  return (
    <div
      ref={containerRef}
      style={{ aspectRatio, ...style }}
      className={`relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 ${containerClassName}`}
    >
      {/* Reserved Layout Skeleton Placeholder to Prevent CLS */}
      {!isLoaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/90 text-zinc-500 p-4 transition-opacity duration-300">
          <div className="w-full h-full bg-gradient-to-r from-zinc-900 via-zinc-800/60 to-zinc-900 animate-pulse rounded-lg flex items-center justify-center">
            {fallbackIcon || (
              <div className="flex flex-col items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="text-lg">🖼️</span>
                <span>
                  {status === "DEFERRED" && connectionInfo.isConstrained
                    ? "Deferred (Slow Connection)"
                    : status === "LOADING"
                    ? "Loading Image..."
                    : "Queued"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actual Image Element loaded after scheduler approves */}
      {isLoaded && (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ease-in-out ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${className}`}
          {...restProps}
        />
      )}
    </div>
  );
};
