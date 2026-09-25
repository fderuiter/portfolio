import { NextResponse } from "next/server";
import { escapeHtml } from "@/lib/email-templates";

/**
 * Minimal HTML result page for a newsletter link opened from an email. It is
 * never cached or indexed, because each response reflects one token.
 */
export function newsletterLinkPage(
  status: number,
  heading: string,
  message: string
): NextResponse {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex" />
  <title>${escapeHtml(heading)} | Systems Dispatch</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0d0e11;color:#f4f4f6;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;padding:16px;">
  <main style="max-width:28rem;border:1px solid rgba(255,255,255,0.08);border-radius:16px;background:#13151a;padding:24px;">
    <h1 style="margin:0 0 12px;font-size:20px;">${escapeHtml(heading)}</h1>
    <p style="margin:0 0 20px;line-height:1.6;color:#d4d4d8;">${escapeHtml(message)}</p>
    <a href="/" style="color:#22d3ee;">Back to deruiter.dev</a>
  </main>
</body>
</html>`;
  return new NextResponse(html, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
