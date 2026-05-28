import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

export async function GET() {
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

    return NextResponse.json(studies);
  } catch (err) {
    console.error("API Case Studies search data fetch failed:", err);
    return NextResponse.json(
      { error: "Failed to load case studies telemetry data" },
      { status: 500 }
    );
  }
}
