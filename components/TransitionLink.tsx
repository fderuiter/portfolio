"use client";

import React from "react";
import Link from "next/link";
import { useInteractiveRouter } from "@/hooks/useInteractiveRouter";
import { cn } from "@/lib/utils";

export interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  title?: string;
  showLoadingSpinner?: boolean;
  children: React.ReactNode;
  activeClassName?: string;
}

/**
 * Interactive Link component with built-in route prefetching on hover,
 * non-blocking React 19 transition handling, inline loading feedback spinner,
 * and screen reader accessibility announcements.
 */
export const TransitionLink = React.forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  (
    {
      href,
      title,
      showLoadingSpinner = true,
      children,
      className,
      activeClassName,
      onClick,
      onMouseEnter,
      onFocus,
      ...props
    },
    ref
  ) => {
    const { isPending, pendingHref, prefetch, navigate } = useInteractiveRouter();

    const isCurrentTargetPending = isPending && pendingHref === href;

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      prefetch(href);
      onMouseEnter?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      prefetch(href);
      onFocus?.(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e);
      if (!e.defaultPrevented) {
        navigate(href, title, e);
      }
    };

    return (
      <Link
        ref={ref}
        href={href}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        onClick={handleClick}
        className={cn(
          className,
          isCurrentTargetPending && (activeClassName || "opacity-80 transition-opacity")
        )}
        {...props}
      >
        <span className="inline-flex items-center gap-1.5">
          {children}
          {showLoadingSpinner && isCurrentTargetPending && (
            <span
              className="inline-block w-3 h-3 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin shrink-0"
              aria-label="Loading destination route"
              role="status"
            />
          )}
        </span>
      </Link>
    );
  }
);

TransitionLink.displayName = "TransitionLink";
