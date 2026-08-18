import { NextRequest, NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/db";
import { CaseStudySubmissionSchema } from "@/lib/schemas";
import { sanitizeError } from "@/lib/error-sanitization";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

const SANITIZE_OPTIONS = {
  ALLOWED_TAGS: [
    "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "code", "pre", "strong", "em", "b", "i",
    "a", "ul", "ol", "li", "span", "abbr", "blockquote", "br", "div"
  ],
  ALLOWED_ATTR: [
    "href", "target", "rel", "class",
    "data-term", "data-definition", "data-key",
    "role", "tabindex", "aria-label", "aria-describedby", "aria-hidden"
  ]
};

export async function GET() {
  if (process.env.PLAYWRIGHT_TEST === "true") {
    return NextResponse.json([
      {
        id: "clinical-data-mapper",
        slug: "clinical-data-mapper",
        title: "Clinical Data Mapper",
        primary_language: "TypeScript",
        tags: "clinical, edc, mapping"
      },
      {
        id: "cadence-clinical",
        slug: "cadence-clinical",
        title: "Cadence Clinical",
        primary_language: "TypeScript",
        tags: "clinical, telemetry, real-time"
      },
      {
        id: "imednet-python-sdk",
        slug: "imednet-python-sdk",
        title: "iMedNet Python SDK",
        primary_language: "Python",
        tags: "sdk, clinical, integration"
      }
    ], {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  }
  try {
    const studies = await prisma.caseStudy.findMany({
      where: { published: true },
      select: {
        id: true,
        slug: true,
        title: true,
        primary_language: true,
        tags: true
      }
    });

    return NextResponse.json(studies, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    });
  } catch (err) {
    console.error("API Case Studies search data fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to load case studies telemetry data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON payload",
          details: [{ path: "body", message: "Request body must be valid JSON" }],
        },
        { status: 400 }
      );
    }

    const validation = CaseStudySubmissionSchema.safeParse(body);
    if (!validation.success) {
      const details = validation.error.issues.map((issue) => ({
        path: issue.path.join(".") || "payload",
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: "Missing or invalid case study submission fields",
          details,
        },
        { status: 400 }
      );
    }

    const {
      title,
      slug,
      primary_language,
      editorial_content,
      architectural_narrative,
      tags,
      github_url,
    } = validation.data;

    // Sanitize rich text content and HTML narrative to strip unsafe tags and execution scripts
    const sanitizedEditorial = DOMPurify.sanitize(editorial_content, SANITIZE_OPTIONS);
    const sanitizedNarrative = DOMPurify.sanitize(architectural_narrative, SANITIZE_OPTIONS);

    // Persist as unpublished draft case study record in database
    const newCaseStudy = await prisma.caseStudy.create({
      data: {
        title,
        slug,
        primary_language,
        editorial_content: sanitizedEditorial,
        architectural_narrative: sanitizedNarrative,
        tags,
        github_url: github_url || null,
        published: false,
        simulated_telemetry: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newCaseStudy,
        caseStudy: newCaseStudy,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const errorObj = err as { code?: string; message?: string };
    if (errorObj?.code === "P2002" || (typeof errorObj?.message === "string" && errorObj.message.includes("Unique constraint failed"))) {
      return NextResponse.json(
        {
          error: "A case study with this slug already exists",
          details: [{ path: "slug", message: "A case study with this slug already exists" }],
        },
        { status: 400 }
      );
    }

    const sanitized = sanitizeError(err);
    console.error("API Case Study submission failed:", sanitized);
    return NextResponse.json(
      { error: "Failed to submit case study" },
      { status: 500 }
    );
  }
}

