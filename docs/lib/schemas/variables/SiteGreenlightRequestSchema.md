[**fderuiter-portfolio**](../../../README.md)

***

[fderuiter-portfolio](../../../modules.md) / [lib/schemas](../README.md) / SiteGreenlightRequestSchema

# Variable: SiteGreenlightRequestSchema

> `const` **SiteGreenlightRequestSchema**: `ZodObject`\<\{ `countryCode`: `ZodDefault`\<`ZodEnum`\<\{ `EU`: `"EU"`; `GB`: `"GB"`; `Global`: `"Global"`; `JP`: `"JP"`; `US`: `"US"`; \}\>\>; `ctaExecuted`: `ZodOptional`\<`ZodBoolean`\>; `ctaExecutionDate`: `ZodOptional`\<`ZodString`\>; `doaPiSignatureDate`: `ZodOptional`\<`ZodString`\>; `doaSignedByPi`: `ZodOptional`\<`ZodBoolean`\>; `eIsfComplete`: `ZodOptional`\<`ZodBoolean`\>; `eIsfMissingDocuments`: `ZodOptional`\<`ZodArray`\<`ZodString`\>\>; `euCtisRegistered`: `ZodOptional`\<`ZodBoolean`\>; `form1572Signed`: `ZodOptional`\<`ZodBoolean`\>; `ipReleaseAuthorized`: `ZodOptional`\<`ZodBoolean`\>; `ipReleaseDate`: `ZodOptional`\<`ZodString`\>; `irbApprovalDate`: `ZodOptional`\<`ZodString`\>; `irbExpirationDate`: `ZodOptional`\<`ZodString`\>; `mhraApprovalReceived`: `ZodOptional`\<`ZodBoolean`\>; `pmdaNotificationFiled`: `ZodOptional`\<`ZodBoolean`\>; `siteId`: `ZodString`; `studyId`: `ZodString`; `trainingCompletionPercent`: `ZodOptional`\<`ZodNumber`\>; \}, `$strip`\>

Defined in: [lib/schemas.ts:448](https://github.com/fderuiter/portfolio/blob/main/lib/schemas.ts#L448)

Schema for Site Governance Greenlight Evaluation request payload validation
