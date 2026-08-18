[**fderuiter-portfolio**](../../../../README.md)

***

[fderuiter-portfolio](../../../../modules.md) / [lib/services/case-study-service](../README.md) / CaseStudyService

# Class: CaseStudyService

Defined in: [lib/services/case-study-service.ts:106](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L106)

## Constructors

### Constructor

> **new CaseStudyService**(): `CaseStudyService`

#### Returns

`CaseStudyService`

## Methods

### getFeedback()

> `static` **getFeedback**(`slug`, `connectionHash`): `Promise`\<\{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \}\>

Defined in: [lib/services/case-study-service.ts:192](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L192)

Fetches user feedback for a given case study slug.

#### Parameters

##### slug

`string`

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `caseStudySlug`: `string`; `feedback`: `object`[]; `hasSubmitted`: `boolean`; `success`: `boolean`; `totalFeedback`: `number`; \}\>

***

### getPublishedCaseStudies()

> `static` **getPublishedCaseStudies**(): `Promise`\<`object`[]\>

Defined in: [lib/services/case-study-service.ts:110](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L110)

Retrieves all published case studies for public search/discovery.

#### Returns

`Promise`\<`object`[]\>

***

### getReactions()

> `static` **getReactions**(`slug`, `connectionHash`): `Promise`\<\{ `caseStudySlug`: `string`; `counts`: `Record`\<`string`, `number`\>; `success`: `boolean`; `userReactions`: `string`[]; \}\>

Defined in: [lib/services/case-study-service.ts:381](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L381)

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

Defined in: [lib/services/case-study-service.ts:159](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L159)

Sanitizes rich text / HTML content submissions and persists draft case study.

#### Parameters

##### input

[`CaseStudySubmissionInput`](../interfaces/CaseStudySubmissionInput.md)

#### Returns

`Promise`\<\{ `architectural_narrative`: `string`; `commands_json`: `string` \| `null`; `created_at`: `Date`; `editorial_content`: `string`; `github_url`: `string` \| `null`; `id`: `string`; `playback_json`: `string` \| `null`; `primary_language`: `string`; `published`: `boolean`; `simulated_telemetry`: `boolean`; `slug`: `string`; `tags`: `string`; `title`: `string`; `updated_at`: `Date`; \}\>

***

### submitFeedback()

> `static` **submitFeedback**(`input`, `connectionHash`): `Promise`\<\{ `feedback?`: `undefined`; `message`: `string`; `rateLimited`: `boolean`; `success?`: `undefined`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `Date`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \} \| \{ `feedback`: \{ `caseStudySlug`: `string`; `comments`: `string`; `createdAt`: `string`; `id`: `string`; `takeaways`: `string`[]; \}; `message`: `string`; `rateLimited`: `boolean`; `success`: `boolean`; \}\>

Defined in: [lib/services/case-study-service.ts:278](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L278)

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

> `static` **submitReaction**(`input`, `connectionHash`): `Promise`\<\{ `caseStudySlug`: `string`; `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \} \| \{ `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \}\>

Defined in: [lib/services/case-study-service.ts:471](https://github.com/fderuiter/portfolio/blob/main/lib/services/case-study-service.ts#L471)

Submits a reaction for a case study.

#### Parameters

##### input

[`ReactionSubmissionInput`](../interfaces/ReactionSubmissionInput.md)

##### connectionHash

`string`

#### Returns

`Promise`\<\{ `caseStudySlug`: `string`; `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \} \| \{ `counts`: `Record`\<`string`, `number`\>; `reactionType`: `string`; `success`: `boolean`; `userReactions`: `string`[]; \}\>
