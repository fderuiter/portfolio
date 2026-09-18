-- CreateTable
CREATE TABLE "BlogPostReaction" (
    "id" TEXT NOT NULL,
    "blogPostSlug" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "connectionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlogPostReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlogPostReaction_blogPostSlug_reactionType_connectionHash_key" ON "BlogPostReaction"("blogPostSlug", "reactionType", "connectionHash");

-- CreateIndex
CREATE INDEX "BlogPostReaction_blogPostSlug_idx" ON "BlogPostReaction"("blogPostSlug");

-- CreateIndex
CREATE INDEX "BlogPostReaction_blogPostSlug_reactionType_idx" ON "BlogPostReaction"("blogPostSlug", "reactionType");

-- CreateIndex
CREATE INDEX "BlogPostReaction_connectionHash_idx" ON "BlogPostReaction"("connectionHash");
