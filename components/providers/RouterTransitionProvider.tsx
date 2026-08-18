"use client";

import React, { createContext, useContext, useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAnnouncer } from "@/hooks/useAnnouncer";
import { getRouteTitle, isSamePageAnchor } from "@/lib/router-transition-utils";
import { NavigationProgress } from "@/components/NavigationProgress";

export interface RouterTransitionContextType {
  /** True when a React transition or route navigation is currently pending */
  isPending: boolean;
  /** Href target of the active pending transition, or null if idle */
  pendingHref: string | null;
  /** Asynchronously prefetches assets for destination route */
  prefetch: (href: string) => void;
  /** Executes client navigation wrapped in a non-blocking React transition */
  navigate: (href: string, title?: string, event?: React.MouseEvent) => void;
  /** Event handler helper for hover/focus asset prefetching */
  onHover: (href: string) => void;
}

const RouterTransitionContext = createContext<RouterTransitionContextType | null>(null);

export function useInteractiveRouter(): RouterTransitionContextType {
  const ctx = useContext(RouterTransitionContext);
  let router: ReturnType<typeof useRouter> | null = null;
  let pathname = "/";

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch {
    // Safe fallback if useRouter is omitted in legacy test mocks
  }

  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    pathname = usePathname() || "/";
  } catch {
    // Safe fallback if usePathname is omitted in legacy test mocks
  }

  // Defensive fallback if used outside RouterTransitionProvider (e.g. standalone test harnesses)
  if (!ctx) {
    return {
      isPending: false,
      pendingHref: null,
      prefetch: (href: string) => {
        if (!href || href.startsWith("#") || href.startsWith("http")) return;
        try {
          router?.prefetch?.(href);
        } catch {
          // Ignore prefetch exceptions in test environments
        }
      },
      navigate: (href: string, _title?: string, event?: React.MouseEvent) => {
        if (event && isSamePageAnchor(href, pathname)) {
          event.preventDefault();
          const targetId = href.startsWith("/#") ? href.substring(2) : href.substring(1);
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth" });
          if (typeof document !== "undefined") document.body.style.overflow = "";
          return;
        }
        if (href && !href.startsWith("http")) {
          try {
            router?.push?.(href);
          } catch {
            // Ignore
          }
        }
      },
      onHover: (href: string) => {
        if (!href || href.startsWith("#") || href.startsWith("http")) return;
        try {
          router?.prefetch?.(href);
        } catch {
          // Ignore
        }
      },
    };
  }

  return ctx;
}

export function RouterTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { announce } = useAnnouncer();

  const [isTransitionPending, startReactTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const prevPathnameRef = useRef(pathname);
  const prefetchedHrefsRef = useRef<Set<string>>(new Set());

  // Prefetch route assets asynchronously
  const prefetch = useCallback((href: string) => {
    if (!href || href.startsWith("#") || href.startsWith("http")) return;
    const cleanHref = href.split("#")[0].split("?")[0];
    if (!cleanHref || prefetchedHrefsRef.current.has(cleanHref)) return;

    try {
      prefetchedHrefsRef.current.add(cleanHref);
      router.prefetch(cleanHref);
    } catch {
      // Ignore prefetch failures
    }
  }, [router]);

  const onHover = useCallback((href: string) => {
    prefetch(href);
  }, [prefetch]);

  // Execute client route navigation in React transition
  const navigate = useCallback((href: string, title?: string, event?: React.MouseEvent) => {
    if (!href) return;

    const currentPath = pathname || "/";

    // 1. Same-page anchor handling -> bypass transition & execute smooth scroll
    if (isSamePageAnchor(href, currentPath)) {
      if (event) event.preventDefault();
      const hash = href.includes("#") ? href.substring(href.indexOf("#") + 1) : "";
      if (hash) {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
      return;
    }

    // 2. External links -> default browser navigation
    if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("//")) {
      return;
    }

    // 3. Prevent redundant navigation if already on destination path without hash
    const targetCleanPath = href.split("#")[0].split("?")[0];
    if (targetCleanPath === currentPath && !href.includes("#")) {
      if (event) event.preventDefault();
      return;
    }

    if (event) {
      event.preventDefault();
    }

    const targetTitle = title || getRouteTitle(href);

    // Announce navigation start immediately
    announce(`Navigating to ${targetTitle}...`, "polite");

    // Immediately trigger pending tactile state (<16ms)
    setPendingHref(href);

    // Execute React transition
    startReactTransition(() => {
      router.push(href);
    });
  }, [pathname, router, announce]);

  // Sync completion when pathname updates
  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      const destinationTitle = getRouteTitle(pathname);
      announce(`Navigated to ${destinationTitle}`, "polite");

      prevPathnameRef.current = pathname;
      setPendingHref(null);

      // Clear body scroll lock and reset mobile menus
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }
  }, [pathname, announce]);

  // Reset pending state if transition finishes
  useEffect(() => {
    if (!isTransitionPending && pendingHref && pathname === prevPathnameRef.current) {
      // Transition finished on same pathname (or cancelled)
      const timer = setTimeout(() => {
        setPendingHref(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isTransitionPending, pendingHref, pathname]);

  const isPending = isTransitionPending || pendingHref !== null;

  const contextValue = React.useMemo(() => ({
    isPending,
    pendingHref,
    prefetch,
    navigate,
    onHover,
  }), [isPending, pendingHref, prefetch, navigate, onHover]);

  return (
    <RouterTransitionContext.Provider value={contextValue}>
      <NavigationProgress isPending={isPending} />
      {children}
    </RouterTransitionContext.Provider>
  );
}
