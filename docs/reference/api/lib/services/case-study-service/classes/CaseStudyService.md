[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/case-study-service](../README.md) / CaseStudyService

# Class: CaseStudyService

## Constructors

### Constructor

> **new CaseStudyService**(): `CaseStudyService`

#### Returns

`CaseStudyService`

## Methods

### getAllPublishedCaseStudies()

> `static` **getAllPublishedCaseStudies**(): `Promise`\<[`CaseStudyData`](../../../case-studies-data/interfaces/CaseStudyData.md)[]\>

Retrieves all published case studies combining database records with static fallbacks.
Prioritizes live database records and seamlessly appends missing static case studies.

#### Returns

`Promise`\<[`CaseStudyData`](../../../case-studies-data/interfaces/CaseStudyData.md)[]\>

***

### getAllPublishedSlugs()

> `static` **getAllPublishedSlugs**(): `Promise`\<`string`[]\>

Retrieves all published case study slugs for static route generation and sitemaps.

#### Returns

`Promise`\<`string`[]\>

***

### getCaseStudyBySlug()

> `static` **getCaseStudyBySlug**(`slug`): `Promise`\<[`CaseStudyData`](../../../case-studies-data/interfaces/CaseStudyData.md) \| `null`\>

Retrieves a single published case study by slug, falling back to static data if absent from database.
Returns null if not found in database or static fallbacks.

#### Parameters

##### slug

`string`

#### Returns

`Promise`\<[`CaseStudyData`](../../../case-studies-data/interfaces/CaseStudyData.md) \| `null`\>

***

### getFeedback()

> `static` **getFeedback**(`slug`, `connectionHash`): `Promise`\<\{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \} \| \{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \}\>

Fetches user feedback for a given case study slug.

#### Parameters

##### slug

`string`

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \} \| \{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \}\>

***

### getPublishedCaseStudies()

> `static` **getPublishedCaseStudies**(): `Promise`\<`object`[]\>

Retrieves all published case studies for public search/discovery.

#### Returns

`Promise`\<`object`[]\>

***

### getReactions()

> `static` **getReactions**(`slug`, `connectionHash`): `Promise`\<\{ `caseStudySlug`: `string`; `counts`: `Record`\<`string`, `number`\>; `success`: `boolean`; `userReactions`: `string`[]; \}\>

Gets aggregated reactions for a case study.

#### Parameters

##### slug

`string`

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `caseStudySlug`: `string`; `counts`: `Record`\<`string`, `number`\>; `success`: `boolean`; `userReactions`: `string`[]; \}\>

***

### submitCaseStudy()

> `static` **submitCaseStudy**(`input`): `Promise`\<\{ `architectural_narrative`: `string`; `commands_json`: `string` \| `null`; `created_at`: `Date`; `editorial_content`: `string`; `github_url`: `string` \| `null`; `id`: `string`; `playback_json`: `string` \| `null`; `primary_language`: `string`; `published`: `boolean`; `simulated_telemetry`: `boolean`; `slug`: `string`; `tags`: `string`; `title`: `string`; `updated_at`: `Date`; \}\>

Sanitizes rich text / HTML content submissions and persists draft case study.

#### Parameters

##### input

[`CaseStudySubmissionInput`](../interfaces/CaseStudySubmissionInput.md)

#### Returns

`Promise`\<\{ `architectural_narrative`: `string`; `commands_json`: `string` \| `null`; `created_at`: `Date`; `editorial_content`: `string`; `github_url`: `string` \| `null`; `id`: `string`; `playback_json`: `string` \| `null`; `primary_language`: `string`; `published`: `boolean`; `simulated_telemetry`: `boolean`; `slug`: `string`; `tags`: `string`; `title`: `string`; `updated_at`: `Date`; \}\>

***

### submitFeedback()

> `static` **submitFeedback**(`input`, `connectionHash`): `Promise`\<\{ `feedback?`: `undefined`; `message`: `string`; `rateLimited`: `boolean`; `success?`: `undefined`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `Date`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `string`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \}\>

Submits feedback for a case study with duplicate rate-limiting.

#### Parameters

##### input

[`FeedbackSubmissionInput`](../interfaces/FeedbackSubmissionInput.md)

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `feedback?`: `undefined`; `message`: `string`; `rateLimited`: `boolean`; `success?`: `undefined`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `Date`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `string`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \}\>

***

### submitReaction()

> `static` **submitReaction**(`input`, `connectionHash`): `Promise`\<\{ `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \}\>

Submits a reaction for a case study.

#### Parameters

##### input

[`ReactionSubmissionInput`](../interfaces/ReactionSubmissionInput.md)

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \}\>
