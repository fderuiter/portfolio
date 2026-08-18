"use client";

import React, {
  createContext,
  useContext,
  useState,
  useTransition,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAnnouncer } from "@/components/providers/A11yProvider";
import { TopProgressBar } from "@/components/ui/TopProgressBar";

export interface NavigationContextType {
  /**
   * Indicates whether a client-side route transition is currently active.
   */
  isNavigating: boolean;
  /**
   * The destination href currently being navigated to, or null if idle.
   */
  pendingHref: string | null;
  /**
   * Triggers client-side route navigation within a non-blocking React transition.
   */
  startNavigation: (href: string, label?: string) => void;
  /**
   * Asynchronously prefetches destination route assets.
   */
  prefetchRoute: (href: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

/**
 * Derives a human-readable title for speech announcements from a route path or custom label.
 */
export function formatRouteLabel(href: string, customLabel?: string): string {
  if (customLabel && customLabel.trim()) return customLabel.trim();
  const cleanPath = href.split("#")[0].replace(/^\//, "");
  if (!cleanPath) return "Home";
  const segments = cleanPath.split("/");
  const lastSegment = segments[segments.length - 1];
  return lastSegment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Determines if a given href is a same-page anchor link relative to the current pathname.
 */
export function isSamePageAnchor(href: string, currentPathname: string): boolean {
  if (!href) return false;
  if (href.startsWith("#")) return true;
  if (href.startsWith("/#")) {
    return currentPathname === "/";
  }
  if (href.includes("#")) {
    const [path] = href.split("#");
    return path === currentPathname;
  }
  return false;
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (ctx) {
    return ctx;
  }

  let router: ReturnType<typeof useRouter> | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    router = useRouter();
  } catch (_e) {
    // Fallback when useRouter is not defined in partial test mocks
  }

  return {
    isNavigating: false,
    pendingHref: null,
    startNavigation: (href: string, _label?: string) => {
      if (!href) return;
      if (typeof window !== "undefined" && isSamePageAnchor(href, window.location.pathname)) {
        const hashIndex = href.indexOf("#");
        if (hashIndex !== -1 && typeof document !== "undefined") {
          const elementId = href.slice(hashIndex + 1);
          document.getElementById(elementId)?.scrollIntoView({ behavior: "smooth" });
        }
        return;
      }
      if (router && typeof router.push === "function") {
        router.push(href);
      } else if (typeof window !== "undefined") {
        window.location.href = href;
      }
    },
    prefetchRoute: (href: string) => {
      if (router && typeof router.prefetch === "function" && href && !href.startsWith("#")) {
        try {
          router.prefetch(href.split("#")[0]);
        } catch (_e) {}
      }
    },
  };
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { announce } = useAnnouncer();

  const [isPending, startTransition] = useTransition();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const navigatingLabelRef = useRef<string | null>(null);

  const prefetchRoute = useCallback(
    (href: string) => {
      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http:") ||
        href.startsWith("https:") ||
        href.startsWith("mailto:")
      ) {
        return;
      }

      const targetPath = href.split("#")[0];
      if (!targetPath) return;

      if (typeof window !== "undefined") {
        const doPrefetch = () => {
          try {
            router.prefetch(targetPath);
          } catch (_e) {
            // Defensive prefetch fallback
          }
        };

        if (
          typeof window !== "undefined" &&
          "requestIdleCallback" in window &&
          typeof (window as unknown as { requestIdleCallback?: unknown }).requestIdleCallback === "function"
        ) {
          (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void }).requestIdleCallback(doPrefetch, { timeout: 2000 });
        } else {
          setTimeout(doPrefetch, 0);
        }
      }
    },
    [router]
  );

  const startNavigation = useCallback(
    (href: string, label?: string) => {
      if (!href) return;

      // Check same-page anchor bypass guardrail
      if (isSamePageAnchor(href, pathname)) {
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
          const hashIndex = href.indexOf("#");
          if (hashIndex !== -1) {
            const elementId = href.slice(hashIndex + 1);
            const targetEl = document.getElementById(elementId);
            if (targetEl) {
              targetEl.scrollIntoView({ behavior: "smooth" });
            }
          }
        }
        return;
      }

      const derivedLabel = formatRouteLabel(href, label);
      navigatingLabelRef.current = derivedLabel;

      // Synchronous tactile loading feedback (<16ms)
      setPendingHref(href);

      // Speech announcement for navigation start
      announce(`Navigating to ${derivedLabel}...`, "polite");

      // React transition client navigation
      startTransition(() => {
        router.push(href);
      });
    },
    [pathname, router, announce]
  );

  // Completion effect when pathname updates
  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname;
      if (pendingHref || navigatingLabelRef.current) {
        const label = navigatingLabelRef.current || formatRouteLabel(pathname);
        announce(`Navigated to ${label}`, "polite");
        queueMicrotask(() => setPendingHref(null));
        navigatingLabelRef.current = null;
      }
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    }
  }, [pathname, pendingHref, announce]);

  // Completion fallback when React transition completes
  useEffect(() => {
    if (!isPending && pendingHref) {
      const targetPath = pendingHref.split("#")[0];
      if (pathname === targetPath || pathname === pendingHref) {
        const label = navigatingLabelRef.current || formatRouteLabel(pendingHref);
        announce(`Navigated to ${label}`, "polite");
        queueMicrotask(() => setPendingHref(null));
        navigatingLabelRef.current = null;
        if (typeof document !== "undefined") {
          document.body.style.overflow = "";
        }
      }
    }
  }, [isPending, pendingHref, pathname, announce]);

  const activeNavigating = isPending || Boolean(pendingHref);

  const contextValue = React.useMemo(
    () => ({
      isNavigating: activeNavigating,
      pendingHref,
      startNavigation,
      prefetchRoute,
    }),
    [activeNavigating, pendingHref, startNavigation, prefetchRoute]
  );

  return (
    <NavigationContext.Provider value={contextValue}>
      <TopProgressBar isNavigating={activeNavigating} />
      {children}
    </NavigationContext.Provider>
  );
}
