import fs from "node:fs";
import path from "node:path";

export interface MarkdownLinkCheckResult {
  status: "pass" | "fail";
  details: string[];
}

// docs/reference/api/** is machine-generated TypeDoc output (ADR 0023):
// its internal cross-links are produced (and kept internally consistent)
// by typedoc-plugin-markdown itself, and staleness there is already caught
// by the generated-vs-checked-in byte comparison in documentation-drift.ts.
const SKIP_DIRECTORY_NAMES = new Set(["reference"]);

const INLINE_LINK_PATTERN = /\[[^\]]*\]\(([^)]+)\)/g;

function listMarkdownFiles(directory: string): string[] {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return SKIP_DIRECTORY_NAMES.has(entry.name)
        ? []
        : listMarkdownFiles(absolutePath);
    }
    return entry.name.toLowerCase().endsWith(".md") ? [absolutePath] : [];
  });
}

// Any URL scheme (http:, https:, mailto:, etc.), protocol-relative URLs, and
// pure same-page anchors are out of scope for a local file-existence check.
function isCheckableLink(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith("#")) return false;
  if (/^[a-z][a-z0-9+.-]*:/iu.test(trimmed)) return false;
  if (trimmed.startsWith("//")) return false;
  return true;
}

function stripFragmentAndQuery(url: string): string {
  return url.split("#")[0].split("?")[0];
}

/**
 * Validates that relative inline markdown links inside hand-authored docs/
 * quadrants (tutorials/, how-to/, explanation/, agents/, and root-level
 * docs pages) resolve to real files on disk, so a moved or renamed guide
 * doesn't silently orphan a cross-quadrant link (ADR 0023).
 */
export function checkMarkdownLinkIntegrity(
  workspaceRoot: string,
  docsRoot: string = path.join(workspaceRoot, "docs")
): MarkdownLinkCheckResult {
  const details: string[] = [];

  for (const filePath of listMarkdownFiles(docsRoot)) {
    const content = fs.readFileSync(filePath, "utf-8");
    for (const match of content.matchAll(INLINE_LINK_PATTERN)) {
      const rawUrl = match[1].trim();
      if (!isCheckableLink(rawUrl)) continue;

      const cleanUrl = stripFragmentAndQuery(rawUrl);
      if (!cleanUrl) continue;

      const resolvedPath = cleanUrl.startsWith("/")
        ? path.join(workspaceRoot, cleanUrl)
        : path.resolve(path.dirname(filePath), cleanUrl);

      if (!fs.existsSync(resolvedPath)) {
        const relativeFile = path
          .relative(workspaceRoot, filePath)
          .replace(/\\/g, "/");
        details.push(`${relativeFile}: broken link to '${rawUrl}'`);
      }
    }
  }

  return details.length === 0
    ? { status: "pass", details }
    : { status: "fail", details };
}
