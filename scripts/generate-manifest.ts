import fs from "fs";
import path from "path";
import { prisma } from "../lib/db.js";

async function generateManifest() {
  try {
    const studies = await prisma.caseStudy.findMany({
      where: { published: true },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    const manifest = studies.map(study => ({
      slug: study.slug,
      title: study.title,
      primary_language: study.primary_language,
      editorial_content: study.editorial_content,
      architectural_narrative: study.architectural_narrative,
      tags: study.tags,
      id: study.id,
      github_url: study.github_url
    }));

    const dir = path.join(process.cwd(), "public");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(
      path.join(dir, "narrative-manifest.json"),
      JSON.stringify(manifest, null, 2)
    );
    console.log("Core Narrative Manifest generated.");
  } catch (error) {
    console.warn("Failed to generate manifest from DB, writing empty fallback manifest:", error);
    const dir = path.join(process.cwd(), "public");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "narrative-manifest.json"), "[]");
  } finally {
    await prisma.$disconnect();
  }
}

generateManifest();
