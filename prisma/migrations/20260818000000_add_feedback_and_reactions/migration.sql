-- CreateTable
CREATE TABLE "CaseStudyFeedback" (
    "id" TEXT NOT NULL,
    "caseStudySlug" TEXT NOT NULL,
    "takeaways" TEXT NOT NULL,
    "comments" TEXT NOT NULL,
    "connectionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseStudyFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudyReaction" (
    "id" TEXT NOT NULL,
    "caseStudySlug" TEXT NOT NULL,
    "reactionType" TEXT NOT NULL,
    "connectionHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseStudyReaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CaseStudyFeedback_caseStudySlug_idx" ON "CaseStudyFeedback"("caseStudySlug");

-- CreateIndex
CREATE INDEX "CaseStudyFeedback_connectionHash_idx" ON "CaseStudyFeedback"("connectionHash");

-- CreateIndex
CREATE INDEX "CaseStudyReaction_caseStudySlug_idx" ON "CaseStudyReaction"("caseStudySlug");

-- CreateIndex
CREATE INDEX "CaseStudyReaction_caseStudySlug_reactionType_idx" ON "CaseStudyReaction"("caseStudySlug", "reactionType");

-- CreateIndex
CREATE INDEX "CaseStudyReaction_connectionHash_idx" ON "CaseStudyReaction"("connectionHash");
