import DOMPurify from "isomorphic-dompurify";

interface RichNarrativeProps {
  html: string;
  className?: string;
}

export function RichNarrative({ html, className }: RichNarrativeProps) {
  // Enforce a strict security allowlist to prevent Stored XSS injections while maintaining beautiful layout aesthetics.
  const cleanHtml = DOMPurify.sanitize(html, {
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
      "div",
      "span"
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"]
  });

  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
