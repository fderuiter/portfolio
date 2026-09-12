import { afterEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { checkMarkdownLinkIntegrity } from "../scripts/markdown-link-check";

const temporaryDirectories: string[] = [];

function createDocsFixture(): string {
  const root = fs.mkdtempSync(
    path.join(os.tmpdir(), "portfolio-markdown-link-check-")
  );
  temporaryDirectories.push(root);
  const docs = path.join(root, "docs");
  fs.mkdirSync(docs, { recursive: true });
  return docs;
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("markdown link integrity checking (ADR 0023)", () => {
  it("passes when every relative link resolves to a real file", () => {
    const docs = createDocsFixture();
    fs.mkdirSync(path.join(docs, "how-to"), { recursive: true });
    fs.writeFileSync(
      path.join(docs, "tutorials.md"),
      "See the [how-to guide](how-to/guide.md) for details.\n",
      "utf8"
    );
    fs.writeFileSync(
      path.join(docs, "how-to", "guide.md"),
      "# Guide\n",
      "utf8"
    );

    const result = checkMarkdownLinkIntegrity(path.dirname(docs), docs);

    expect(result).toEqual({ status: "pass", details: [] });
  });

  it("reports a broken cross-quadrant relative link", () => {
    const docs = createDocsFixture();
    fs.writeFileSync(
      path.join(docs, "tutorials.md"),
      "See the [missing guide](how-to/does-not-exist.md) for details.\n",
      "utf8"
    );

    const result = checkMarkdownLinkIntegrity(path.dirname(docs), docs);

    expect(result.status).toBe("fail");
    expect(result.details).toEqual([
      "docs/tutorials.md: broken link to 'how-to/does-not-exist.md'",
    ]);
  });

  it("skips external, mailto, and same-page anchor links", () => {
    const docs = createDocsFixture();
    fs.writeFileSync(
      path.join(docs, "index.md"),
      [
        "[External](https://example.com/does-not-exist)",
        "[Email](mailto:someone@example.com)",
        "[Anchor](#some-section)",
      ].join("\n") + "\n",
      "utf8"
    );

    const result = checkMarkdownLinkIntegrity(path.dirname(docs), docs);

    expect(result).toEqual({ status: "pass", details: [] });
  });

  it("skips the machine-generated reference/ subtree", () => {
    const docs = createDocsFixture();
    fs.mkdirSync(path.join(docs, "reference", "api"), { recursive: true });
    fs.writeFileSync(
      path.join(docs, "reference", "api", "modules.md"),
      "[Broken](./does-not-exist.md)\n",
      "utf8"
    );

    const result = checkMarkdownLinkIntegrity(path.dirname(docs), docs);

    expect(result).toEqual({ status: "pass", details: [] });
  });

  it("resolves a leading-slash link relative to the workspace root", () => {
    const docs = createDocsFixture();
    const root = path.dirname(docs);
    fs.writeFileSync(
      path.join(root, "ARCHITECTURE.md"),
      "# Architecture\n",
      "utf8"
    );
    fs.writeFileSync(
      path.join(docs, "explanation.md"),
      "[Architecture](/ARCHITECTURE.md)\n",
      "utf8"
    );

    const result = checkMarkdownLinkIntegrity(root, docs);

    expect(result).toEqual({ status: "pass", details: [] });
  });
});
