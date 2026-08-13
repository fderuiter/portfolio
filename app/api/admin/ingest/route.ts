import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseGitHubUrl, getGitHubStats } from "@/lib/github";
import { validateSyncRequest } from "@/lib/security";
import { z } from "zod";

export const dynamic = "force-dynamic";

const IngestPayloadSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  name: z.string().optional(),
  languageBreakdown: z.record(z.string(), z.number()).optional(),
  commitCount: z.number().int().nonnegative().optional(),
  stars: z.number().int().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  // Validate authorization token (requires Bearer <CRON_SECRET> or no token in dev/test if CRON_SECRET is not set)
  const authResult = validateSyncRequest(req);
  if (!authResult.isValid && authResult.errorResponse) {
    return authResult.errorResponse;
  }

  try {
    const body = await req.json();
    const parseResult = IngestPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }

    const { url, name, languageBreakdown: customLanguageBreakdown, commitCount: customCommitCount, stars: customStars } = parseResult.data;

    // Parse owner and repo name from the GitHub URL
    const githubInfo = parseGitHubUrl(url);
    if (!githubInfo) {
      return NextResponse.json(
        { error: "Invalid GitHub repository URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = githubInfo;

    // Fetch live metrics
    const stats = await getGitHubStats(owner, repo);
    if (!stats) {
      return NextResponse.json(
        { error: `Failed to fetch live GitHub metrics for repository ${owner}/${repo}` },
        { status: 400 }
      );
    }

    // Determine values, prioritizing payload inputs, then live stats, then defaults
    const finalName = name || repo;
    
    let finalLanguageBreakdown: Record<string, number> = {};
    if (customLanguageBreakdown) {
      finalLanguageBreakdown = customLanguageBreakdown;
    } else if (stats.languages && stats.languages.length > 0) {
      for (const lang of stats.languages) {
        finalLanguageBreakdown[lang.name] = lang.percentage;
      }
    } else {
      finalLanguageBreakdown = { "Unknown": 100 };
    }

    const finalCommitCount = customCommitCount ?? (stats.commitActivity ? stats.commitActivity.reduce((sum, current) => sum + current, 0) : 0) ?? 100;
    const finalStars = customStars ?? stats.stars ?? 0;

    // Save directly to the database
    const record = await prisma.archivedRepository.upsert({
      where: { url },
      update: {
        name: finalName,
        languageBreakdown: finalLanguageBreakdown,
        commitCount: finalCommitCount,
        stars: finalStars,
      },
      create: {
        url,
        name: finalName,
        languageBreakdown: finalLanguageBreakdown,
        commitCount: finalCommitCount,
        stars: finalStars,
      },
    });

    return NextResponse.json({ success: true, repository: record }, { status: 201 });
  } catch (err: unknown) {
    const errorDetails = err instanceof Error ? err.message : String(err);
    console.error("Failed administrative ingestion of repository:", errorDetails);
    return NextResponse.json(
      { error: "Failed to ingest administrative repository" },
      { status: 500 }
    );
  }
}
