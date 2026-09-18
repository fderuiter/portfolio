import { NextResponse } from "next/server";
import { resolveBaseUrl } from "@/lib/domain";

export const dynamic = "force-dynamic";

export async function GET() {
  const baseUrl = resolveBaseUrl();
  return NextResponse.redirect(`${baseUrl}/blog/rss.xml`, 301);
}
