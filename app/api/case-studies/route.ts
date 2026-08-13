import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Enforce standard dynamic route behavior in Next.js 16 to query live datastores safely
export const dynamic = "force-dynamic";

export async function GET() {
  const isOffline = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes("dummy");
  
  if (isOffline) {
    return NextResponse.json([
      {
        id: "mock-1",
        slug: "schemaflow",
        title: "SchemaFlow: Reactive Node Engine",
        primary_language: "TypeScript",
        tags: "TypeScript, React, Flow"
      },
      {
        id: "mock-2",
        slug: "clinical-data-mapper",
        title: "Clinical Data Standards Engine",
        primary_language: "Python",
        tags: "Python, SDTM, Pipeline"
      }
    ]);
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

    return NextResponse.json(studies);
  } catch (err) {
    console.warn("API Case Studies search data fetch failed, using fallback:", err);
    return NextResponse.json([
      {
        id: "mock-1",
        slug: "schemaflow",
        title: "SchemaFlow: Reactive Node Engine",
        primary_language: "TypeScript",
        tags: "TypeScript, React, Flow"
      },
      {
        id: "mock-2",
        slug: "clinical-data-mapper",
        title: "Clinical Data Standards Engine",
        primary_language: "Python",
        tags: "Python, SDTM, Pipeline"
      }
    ]);
  }
}
