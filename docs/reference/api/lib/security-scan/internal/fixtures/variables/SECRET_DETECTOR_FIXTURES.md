[**fderuiter-portfolio**](../../../../../README.md)

***

[fderuiter-portfolio](../../../../../modules.md) / [lib/security-scan/internal/fixtures](../README.md) / SECRET\_DETECTOR\_FIXTURES

# Variable: SECRET\_DETECTOR\_FIXTURES

> `const` **SECRET\_DETECTOR\_FIXTURES**: `Record`\<*typeof* [`SECRET_DETECTORS`](../../catalog/variables/SECRET_DETECTORS.md)\[`number`\]\[`"id"`\], [`SecretDetectorFixtureSet`](../../../types/interfaces/SecretDetectorFixtureSet.md)\>

Safe, non-functional positive and negative fixtures for every detector.

Positive fixtures are structurally shaped like the secret they exercise
but are invented filler (sequential alphabet/number runs) that never
authenticated against any real system. Negative fixtures are near-misses
(too short, wrong prefix) or legitimately safe examples (a publishable
key, a localhost connection string) that a detector must not flag.

This file is registered as a known-safe source in `internal/allowlist.ts`
(keyed by its own repo-relative path) so the positive fixtures below do
not trip the very detectors they exist to exercise when this file itself
is scanned.
