INSERT INTO "CaseStudy" (
  "id",
  "slug",
  "title",
  "primary_language",
  "editorial_content",
  "architectural_narrative",
  "published",
  "tags",
  "created_at",
  "updated_at"
)
SELECT
  'baseline-' || value,
  'baseline-' || value,
  'Baseline fixture ' || value,
  'TypeScript',
  'Existing production-compatible content',
  'Existing production-compatible narrative',
  true,
  'migration,baseline',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM generate_series(1, 4) AS value;
