-- Preserve the earliest reaction for each visitor, case study, and reaction type.
BEGIN;

-- Prevent reactions from arriving between duplicate cleanup and index creation.
LOCK TABLE "CaseStudyReaction" IN SHARE ROW EXCLUSIVE MODE;

WITH ranked_reactions AS (
    SELECT
        "id",
        ROW_NUMBER() OVER (
            PARTITION BY "caseStudySlug", "reactionType", "connectionHash"
            ORDER BY "createdAt" ASC, "id" ASC
        ) AS duplicate_rank
    FROM "CaseStudyReaction"
)
DELETE FROM "CaseStudyReaction" AS reaction
USING ranked_reactions
WHERE reaction."id" = ranked_reactions."id"
  AND ranked_reactions.duplicate_rank > 1;

CREATE UNIQUE INDEX "CaseStudyReaction_caseStudySlug_reactionType_connectionHash_key"
    ON "CaseStudyReaction"("caseStudySlug", "reactionType", "connectionHash");

COMMIT;
