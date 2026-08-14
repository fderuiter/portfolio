/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useSyncExternalStore } from "react";
import DOMPurify from "isomorphic-dompurify";
import { Tooltip } from "@/components/ui/Tooltip";
import { usePersistentState } from "@/hooks/usePersistentState";

const emptySubscribe = () => () => {};

interface RichNarrativeProps {
  html: string;
  className?: string;
}

export function RichNarrative({ html, className }: RichNarrativeProps) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const [simplified] = usePersistentState("simplified-terminology", false);

  // Enforce a strict security allowlist to prevent Stored XSS injections while maintaining beautiful layout aesthetics.
  const cleanHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "h2",
        "h3",
        "h4",
        "p",
        "code",
        "pre",
        "strong",
        "em",
        "a",
        "ul",
        "ol",
        "li",
        "span",
        "abbr"
      ],
      ALLOWED_ATTR: [
        "href",
        "target",
        "rel",
        "class",
        "data-term",
        "data-definition",
        "data-key"
      ]
    });
  }, [html]);

  // On the client, parse the HTML and rehydrate it to React components once mounted
  const rehydratedContent = useMemo(() => {
    if (!mounted || typeof window === "undefined") {
      return null;
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(`<div>${cleanHtml}</div>`, "text/html");
      const root = doc.body.firstChild;
      if (!root) return null;

      // Map DOM children to React components recursively
      const domToReact = (node: Node, index: number): React.ReactNode => {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent;
        }

        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          const tagName = element.tagName.toLowerCase();

          // Check if it is a terminology tag
          const isTermTag =
            (tagName === "span" || tagName === "abbr") &&
            (element.hasAttribute("data-term") ||
              element.hasAttribute("data-definition") ||
              element.hasAttribute("data-key"));

          if (isTermTag) {
            const term = element.getAttribute("data-term") || "";
            const definition = element.getAttribute("data-definition") || "";
            const termKey = element.getAttribute("data-key") || "";
            const originalContent = element.textContent || "";

            // If simplified is true and a simplified term exists, show it. Otherwise original content.
            const visibleText = (simplified && term) ? term : originalContent;

            return (
              <Tooltip key={`${termKey || tagName}-${index}`} text={definition}>
                {visibleText}
              </Tooltip>
            );
          }

          // Recursive mapping of children
          const children = Array.from(node.childNodes).map((child, idx) =>
            domToReact(child, idx)
          );

          // Build safe attributes
          const props: Record<string, any> = { key: `${tagName}-${index}` };
          if (element.hasAttribute("class")) {
            props.className = element.getAttribute("class");
          }
          if (element.hasAttribute("href")) {
            props.href = element.getAttribute("href");
          }
          if (element.hasAttribute("target")) {
            props.target = element.getAttribute("target");
          }
          if (element.hasAttribute("rel")) {
            props.rel = element.getAttribute("rel");
          }

          return React.createElement(tagName, props, children);
        }

        return null;
      };

      return Array.from(root.childNodes).map((child, idx) => domToReact(child, idx));
    } catch (e) {
      console.error("Error rehydrating rich narrative terminology tags:", e);
      return null;
    }
  }, [cleanHtml, mounted, simplified]);

  // Fallback to basic dangerouslySetInnerHTML for SSR and initial client hydration
  if (!mounted || !rehydratedContent) {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: cleanHtml }}
      />
    );
  }

  return (
    <div className={className}>
      {rehydratedContent}
    </div>
  );
}
