"use client";

import React from "react";
import Link from "next/link";
import { useRouterTransition, isSamePageAnchor } from "@/hooks/useRouterTransition";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface TransitionLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
  label?: string;
  showLoadingIndicator?: boolean;
}

/**
  TransitionLink component wraps Next.js Link to provide hover asset prefetching, concurrent React transition state, and inline loading indicators.
 */
export const TransitionLink = React.forwardRef<
  HTMLAnchorElement,
  TransitionLinkProps
>(
  (
    {
      href,
      children,
      label,
      showLoadingIndicator = true,
      className,
      onClick,
      onMouseEnter,
      onFocus,
      ...rest
    },
    ref
  ) => {
    const { pendingHref, startNavigation, prefetchRoute } = useRouterTransition();
    const pathname = usePathname();

    const isPendingTarget = pendingHref === href || (pendingHref !== null && pendingHref.startsWith(href) && href !== "/");
    const isAnchor = isSamePageAnchor(href, pathname);

    const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
      prefetchRoute(href);
      if (onMouseEnter) onMouseEnter(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLAnchorElement>) => {
      prefetchRoute(href);
      if (onFocus) onFocus(e);
    };

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (onClick) {
        onClick(e);
      }

      if (e.defaultPrevented) return;

      // Check external or new tab
      if (
        rest.target === "_blank" ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        href.startsWith("http:") ||
        href.startsWith("https:") ||
        href.startsWith("mailto:")
      ) {
        return;
      }

      e.preventDefault();
      startNavigation(href, label);
    };

    return (
      <Link
        ref={ref}
        href={href}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onFocus={handleFocus}
        data-loading={isPendingTarget ? "true" : undefined}
        className={cn(
          "inline-flex items-center gap-1.5 transition-all duration-150 relative",
          isPendingTarget && "opacity-90 cursor-wait",
          className
        )}
        {...rest}
      >
        {children}
        {showLoadingIndicator && isPendingTarget && !isAnchor && (
          <span
            className="inline-block w-3 h-3 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin shrink-0 ml-1"
            aria-hidden="true"
            data-testid="inline-loading-spinner"
          />
        )}
      </Link>
    );
  }
);

TransitionLink.displayName = "TransitionLink";
