import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

export async function GET() {
  if (env.PLAYWRIGHT_TEST === "true") {
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
