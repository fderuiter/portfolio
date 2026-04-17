-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "primary_language" TEXT NOT NULL,
    "github_url" TEXT,
    "editorial_content" TEXT NOT NULL,
    "architectural_narrative" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");
