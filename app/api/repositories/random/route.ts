import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = await prisma.archivedRepository.count();
    if (count === 0) {
      return NextResponse.json({ success: true, repository: null });
    }

    const skip = Math.floor(Math.random() * count);
    const repository = await prisma.archivedRepository.findFirst({
      skip,
    });

    return NextResponse.json({ success: true, repository });
  } catch (err: unknown) {
    console.error("Failed to fetch random archived repository:", err);
    // Graceful error fallback
    return NextResponse.json({ success: false, repository: null }, { status: 500 });
  }
}
