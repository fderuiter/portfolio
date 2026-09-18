/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment jsdom
import { describe, it, expect, vi } from "vitest";
import fs from "fs";
import path from "path";
import React from "react";
import { render } from "@testing-library/react";
import { FALLBACK_CASE_STUDIES } from "@/lib/case-studies-data";
import { FALLBACK_BLOG_POSTS } from "@/lib/fallback-blog-posts";
import { dictionary } from "@/lib/i18n-dictionary";
import { RichNarrative } from "@/components/RichNarrative";
import {
  checkDictionaryDuplication,
  runTerminologyVerification,
} from "@/scripts/verify-terms";

// Mock framer-motion to prevent transition freezes and warnings in jsdom environment
vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  const Component = ({
    children,
    className,
    style,
    onClick,
    ...props
  }: any) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    } = props;
    return (
      <div className={className} style={style} onClick={onClick} {...rest}>
        {children}
      </div>
    );
  };
  const Button = ({
    children,
    className,
    style,
    onClick,
    type,
    ...props
  }: any) => {
    const {
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    } = props;
    return (
      <button
        type={type || "button"}
        className={className}
        style={style}
        onClick={onClick}
        {...rest}
      >
        {children}
      </button>
    );
  };

  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (prop === "button") return Button;
          return Component;
        },
      }
    ),
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
    useInView: () => true,
  };
});

interface TerminologyTag {
  key: string;
  term: string;
  definition: string;
  tagName: string;
  outerHTML: string;
  source: string;
}

/**
 * Extracts strings recursively from any object or dictionary structure
 */
function extractStringsFromObject(obj: any): string[] {
  const result: string[] = [];
  function traverse(current: any) {
    if (typeof current === "string") {
      result.push(current);
    } else if (Array.isArray(current)) {
      for (const item of current) {
        traverse(item);
      }
    } else if (current && typeof current === "object") {
      for (const key of Object.keys(current)) {
        traverse(current[key]);
      }
    }
  }
  traverse(obj);
  return result;
}

/**
 * Extracts string elements/narratives from the prisma/seed.ts file statically
 */
function extractSeedNarratives(fileContent: string): string[] {
  const narratives: string[] = [];

  // Isolate the SEED_PAYLOADS block to avoid matching code in comments or functions
  const payloadsBlockMatch = fileContent.match(
    /const\s+SEED_PAYLOADS\s*=([\s\S]*?);\s*(?:async\s+)?function/
  );
  const blockToParse = payloadsBlockMatch ? payloadsBlockMatch[1] : fileContent;

  // Match all values assigned to architectural_narrative or editorial_content keys
  const fieldRegex =
    /(?:architectural_narrative|editorial_content)\s*:\s*([`"'])([\s\S]*?)\1/g;
  let match;
  while ((match = fieldRegex.exec(blockToParse)) !== null) {
    narratives.push(match[2]);
  }

  return narratives;
}

/**
 * Parses a given HTML string and validates any terminology tags it contains using JSDOM.
 */
function validateHtmlContent(
  html: string,
  source: string,
  collectedTags: TerminologyTag[],
  errorsList: string[]
) {
  const container = document.createElement("div");
  container.innerHTML = html;

  // We query all elements inside the container to make sure we don't miss any tags
  const elements = container.getElementsByTagName("*");

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    const tagName = el.tagName.toLowerCase();

    const hasKey = el.hasAttribute("data-key");
    const hasTerm = el.hasAttribute("data-term");
    const hasDefinition = el.hasAttribute("data-definition");

    const carriesTerminology = hasKey || hasTerm || hasDefinition;

    if (carriesTerminology) {
      // Validate that it is span or abbr
      if (tagName !== "span" && tagName !== "abbr") {
        errorsList.push(
          `[${source}] Tag <${tagName}> carries terminology attributes but must be a <span> or <abbr>. Outer HTML: ${el.outerHTML}`
        );
        continue;
      }

      // Check for non-empty values
      const keyVal = (el.getAttribute("data-key") || "").trim();
      const termVal = (el.getAttribute("data-term") || "").trim();
      const defVal = (el.getAttribute("data-definition") || "").trim();

      const missing: string[] = [];
      if (!keyVal) missing.push("data-key");
      if (!termVal) missing.push("data-term");
      if (!defVal) missing.push("data-definition");

      if (missing.length > 0) {
        errorsList.push(
          `[${source}] Terminology tag <${tagName}> has missing/empty attributes: [${missing.join(", ")}]. Outer HTML: ${el.outerHTML}`
        );
      } else {
        collectedTags.push({
          key: keyVal,
          term: termVal,
          definition: defVal,
          tagName,
          outerHTML: el.outerHTML,
          source,
        });
      }
    }
  }
}

/**
 * Validates consistency of collected terminology keys
 */
function checkKeyConsistency(
  collectedTags: TerminologyTag[],
  errorsList: string[]
) {
  const keyMap = new Map<string, TerminologyTag>();

  for (const tag of collectedTags) {
    if (keyMap.has(tag.key)) {
      const existing = keyMap.get(tag.key)!;
      if (
        existing.term !== tag.term ||
        existing.definition !== tag.definition
      ) {
        errorsList.push(
          `Key Consistency Violation for terminology key "${tag.key}":\n` +
            `  - Location A [${existing.source}]: term="${existing.term}", definition="${existing.definition}"\n` +
            `  - Location B [${tag.source}]: term="${tag.term}", definition="${tag.definition}"`
        );
      }
    } else {
      keyMap.set(tag.key, tag);
    }
  }
}

describe("Build-Time Inline Terminology Validation", () => {
  it("should validate all inline terminology tags in fallback case studies, prisma seed file, and dictionary strings", () => {
    const collectedTags: TerminologyTag[] = [];
    const errorsList: string[] = [];

    // 1. Parse FALLBACK_CASE_STUDIES
    FALLBACK_CASE_STUDIES.forEach((study) => {
      if (study.architectural_narrative) {
        validateHtmlContent(
          study.architectural_narrative,
          `FALLBACK_CASE_STUDIES[slug=${study.slug}].architectural_narrative`,
          collectedTags,
          errorsList
        );
      }
      if (study.editorial_content) {
        validateHtmlContent(
          study.editorial_content,
          `FALLBACK_CASE_STUDIES[slug=${study.slug}].editorial_content`,
          collectedTags,
          errorsList
        );
      }
    });

    // 1b. Parse FALLBACK_BLOG_POSTS
    FALLBACK_BLOG_POSTS.forEach((post) => {
      if (post.body) {
        validateHtmlContent(
          post.body,
          `FALLBACK_BLOG_POSTS[slug=${post.slug}].body`,
          collectedTags,
          errorsList
        );
      }
    });

    // 2. Parse prisma/seed.ts statically
    const seedFilePath = path.resolve(process.cwd(), "prisma/seed.ts");
    if (fs.existsSync(seedFilePath)) {
      const seedFileContent = fs.readFileSync(seedFilePath, "utf-8");
      const seedNarratives = extractSeedNarratives(seedFileContent);
      seedNarratives.forEach((narrative, idx) => {
        validateHtmlContent(
          narrative,
          `prisma/seed.ts[narrative_index=${idx}]`,
          collectedTags,
          errorsList
        );
      });
    }

    // 3. Parse lib/i18n-dictionary.ts
    const dictionaryStrings = extractStringsFromObject(dictionary);
    dictionaryStrings.forEach((str, idx) => {
      // Only parse strings containing potential tags to avoid unnecessary noise, or parse all
      if (str.includes("<span") || str.includes("<abbr")) {
        validateHtmlContent(
          str,
          `lib/i18n-dictionary.ts[string_index=${idx}]`,
          collectedTags,
          errorsList
        );
      }
    });

    // 4. Validate key consistency across all collected tags
    checkKeyConsistency(collectedTags, errorsList);

    // Fail the test if any errors are found, printing descriptive details
    if (errorsList.length > 0) {
      console.error("\n❌ Terminology Validation Failed with errors:");
      errorsList.forEach((err) => console.error(err));
    }
    expect(errorsList).toEqual([]);
  });

  it("should pass validation for a perfectly formatted tag", () => {
    const collected: TerminologyTag[] = [];
    const errors: string[] = [];
    const validHtml = `<span data-key="sdtm" data-term="Standard Data Tables" data-definition="Study Data Tabulation Model">SDTM</span>`;

    validateHtmlContent(validHtml, "test-source", collected, errors);
    expect(errors).toEqual([]);
    expect(collected.length).toBe(1);
    expect(collected[0]).toEqual({
      key: "sdtm",
      term: "Standard Data Tables",
      definition: "Study Data Tabulation Model",
      tagName: "span",
      outerHTML: validHtml,
      source: "test-source",
    });
  });

  it("should fail validation if any required attributes are missing on a span/abbr", () => {
    const collected: TerminologyTag[] = [];
    const errors: string[] = [];

    // Missing data-term
    validateHtmlContent(
      `<span data-key="key1" data-definition="Def 1">Text</span>`,
      "test-source",
      collected,
      errors
    );
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("has missing/empty attributes: [data-term]");

    // Missing data-key
    validateHtmlContent(
      `<abbr data-term="Term 2" data-definition="Def 2">Text</abbr>`,
      "test-source",
      collected,
      errors
    );
    expect(errors.length).toBe(2);
    expect(errors[1]).toContain("has missing/empty attributes: [data-key]");

    // Missing data-definition
    validateHtmlContent(
      `<span data-key="key3" data-term="Term 3">Text</span>`,
      "test-source",
      collected,
      errors
    );
    expect(errors.length).toBe(3);
    expect(errors[2]).toContain(
      "has missing/empty attributes: [data-definition]"
    );
  });

  it("should fail validation if terminology attributes are placed on non-span/non-abbr tags", () => {
    const collected: TerminologyTag[] = [];
    const errors: string[] = [];
    const badHtml = `<div data-key="sdtm" data-term="Standard Data Tables" data-definition="Study Data Tabulation Model">SDTM</div>`;

    validateHtmlContent(badHtml, "test-source", collected, errors);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain("must be a <span> or <abbr>");
  });

  it("should detect key consistency mismatches when identical keys refer to differing terms/definitions", () => {
    const collected: TerminologyTag[] = [];
    const errors: string[] = [];

    validateHtmlContent(
      `<span data-key="common-key" data-term="Term A" data-definition="Definition A">A</span>`,
      "source-a",
      collected,
      errors
    );
    validateHtmlContent(
      `<span data-key="common-key" data-term="Term B" data-definition="Definition A">B</span>`,
      "source-b",
      collected,
      errors
    );

    expect(errors).toEqual([]);
    checkKeyConsistency(collected, errors);
    expect(errors.length).toBe(1);
    expect(errors[0]).toContain(
      'Key Consistency Violation for terminology key "common-key"'
    );
    expect(errors[0]).toContain("Term A");
    expect(errors[0]).toContain("Term B");
  });

  it("should execute client-side RichNarrative components without throwing execution errors", () => {
    const testHtml = `
      <h3>Technical Architecture</h3>
      <p>Standard text with a term <span data-key="gxp-term" data-term="industry-standard" data-definition="Good Practice standards">GxP</span> here.</p>
    `;

    // Render should complete cleanly without errors
    const { container } = render(<RichNarrative html={testHtml} />);
    expect(container).toBeDefined();
    expect(container.textContent).toContain("Technical Architecture");
    expect(container.textContent).toContain("GxP");
  });

  it("should pass dictionary non-duplication verification and runTerminologyVerification", () => {
    const dupErrors = checkDictionaryDuplication();
    expect(dupErrors).toEqual([]);

    const fullResult = runTerminologyVerification();
    expect(fullResult.success).toBe(true);
    expect(fullResult.errors).toEqual([]);
  });
});
