import * as fs from "fs";
import * as path from "path";
import { zodToOpenApi } from "../lib/zod-to-openapi";
import {
  MaintenanceSummarySchema,
  CaseStudySummarySchema,
  CaseStudySubmissionSchema,
  CaseStudyPostResponseSchema,
  BlogDraftCreateSchema,
  BlogDraftUpdateSchema,
  BlogDraftSchema,
  BlogDraftCollectionSchema,
  BlogDraftCreateResponseSchema,
  BlogDraftReadResponseSchema,
  BlogDraftUpdateResponseSchema,
  ErrorResponseSchema,
  TelemetryEventSchema,
  TelemetryPostResponseSchema,
  TelemetrySyncResponseSchema,
  RateLimitParamsSchema,
  FallbackMemorySchema,
  SyncParamsSchema,
  ValidationErrorSchema,
  FeedbackSubmissionSchema,
  FeedbackItemSchema,
  FeedbackGetResponseSchema,
  FeedbackPostResponseSchema,
  ReactionSubmissionSchema,
  ReactionCountsSchema,
  ReactionGetResponseSchema,
  ReactionPostResponseSchema,
  ContactSubmissionSchema,
  ContactPostResponseSchema,
  NewsletterSubmissionSchema,
  NewsletterResponseSchema,
  ResendWebhookEventSchema,
  ResendWebhookResponseSchema,
} from "../lib/schemas";

// Helper to recursively find API route files
function findRouteFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const results: string[] = [];
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findRouteFiles(fullPath));
    } else if (/^route\.(ts|js)$/.test(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

export function getExpectedApiRoutes(workspaceRoot: string): string[] {
  const apiDir = path.join(workspaceRoot, "app", "api");
  const routeFiles = findRouteFiles(apiDir);
  return routeFiles.map((file) => {
    const rel = path
      .relative(apiDir, path.dirname(file))
      .replace(/\\/g, "/")
      .replace(/\[([^\]/]+)\]/g, "{$1}");
    return rel === "" ? "/api" : `/api/${rel}`;
  });
}

// Construct OpenAPI 3.0.0 specification using canonical Zod schemas
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Portfolio Service API",
    description:
      "Declarative Zod Validated & Programmatically Generated API Spec",
    version: "1.0.0",
  },
  paths: {
    "/api/case-studies": {
      get: {
        summary: "Retrieve published case studies",
        description:
          "Fetches a list of published case studies including title, slug, primary language, and tags.",
        responses: {
          200: {
            description: "Successful retrieval of case studies",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/CaseStudySummary",
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Submit draft technical post-mortem case study",
        description:
          "Submits a new technical case study or prototype post-mortem as an unpublished draft record.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CaseStudySubmission",
              },
            },
          },
        },
        responses: {
          201: {
            description:
              "Case study submitted successfully in unpublished draft state",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CaseStudyPostResponse",
                },
              },
            },
          },
          400: {
            description:
              "Missing or malformed payload fields or duplicate slug",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/case-studies/feedback": {
      get: {
        summary: "Query case study learning feedback",
        description: "Retrieves learning feedback for a case study slug.",
        parameters: [
          {
            name: "slug",
            in: "query",
            required: false,
            description:
              "Case study slug identifier (interchangeable with caseStudySlug)",
            schema: { type: "string" },
          },
          {
            name: "caseStudySlug",
            in: "query",
            required: false,
            description:
              "Case study slug identifier (interchangeable with slug)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Successful retrieval of feedback",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FeedbackGetResponse",
                },
              },
            },
          },
          400: {
            description: "Missing required query parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Submit structured learning feedback",
        description:
          "Validates and persists structured learning takeaways and free-form constructive text.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/FeedbackSubmission",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Feedback submitted successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/FeedbackPostResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error on payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          429: {
            description: "Rate limit or duplicate submission limit reached",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/case-studies/reactions": {
      get: {
        summary: "Retrieve case study reaction counts",
        description:
          "Fetches aggregate quick reaction counts for a case study slug.",
        parameters: [
          {
            name: "slug",
            in: "query",
            required: false,
            description:
              "Case study slug identifier (interchangeable with caseStudySlug)",
            schema: { type: "string" },
          },
          {
            name: "caseStudySlug",
            in: "query",
            required: false,
            description:
              "Case study slug identifier (interchangeable with slug)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Successful retrieval of reaction counts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReactionGetResponse",
                },
              },
            },
          },
          400: {
            description: "Missing required query parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Submit quick reaction badge",
        description:
          "Increments quick reaction badge count for a case study slug.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ReactionSubmission",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Reaction registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReactionPostResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error on payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/blog/reactions": {
      get: {
        summary: "Retrieve blog post reaction counts",
        description:
          "Fetches aggregate quick reaction counts for a blog post slug.",
        parameters: [
          {
            name: "slug",
            in: "query",
            required: false,
            description:
              "Blog post slug identifier (interchangeable with blogPostSlug)",
            schema: { type: "string" },
          },
          {
            name: "blogPostSlug",
            in: "query",
            required: false,
            description:
              "Blog post slug identifier (interchangeable with slug)",
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Successful retrieval of reaction counts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BlogPostReactionGetResponse",
                },
              },
            },
          },
          400: {
            description: "Missing required query parameter",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Submit blog post reaction badge",
        description:
          "Increments quick reaction badge count for a published blog post slug.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/BlogPostReactionSubmission",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Reaction registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ReactionPostResponse",
                },
              },
            },
          },
          400: {
            description: "Validation error on payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          404: {
            description: "Blog post not found or unpublished",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/telemetry": {
      get: {
        summary: "Retrieve compiled telemetry metrics",
        description:
          "Perform dynamic grouping aggregates on TelemetryEvents to sum view & click metrics.",
        responses: {
          200: {
            description: "Successful retrieval of aggregated statistics",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  additionalProperties: {
                    type: "object",
                    properties: {
                      views: { type: "integer" },
                      clicks: { type: "integer" },
                    },
                    required: ["views", "clicks"],
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
          },
        },
      },
      post: {
        summary: "Ingest telemetry event",
        description:
          "Buffers telemetry transaction events for asynchronous synchronization to the primary datastore. The Redis buffer is the only store in front of the sync job, so a failed enqueue drops the event: such a request is answered with 202 and durable=false rather than being reported as stored.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TelemetryEvent",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Event buffered durably",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TelemetryPostResponse",
                },
              },
            },
          },
          202: {
            description:
              "Event accepted but not durably buffered; the buffer write failed and the event was dropped. Clients must not retry.",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TelemetryPostResponse",
                },
              },
            },
          },
          400: {
            description: "Validation failure detailing verification mismatch",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          429: {
            description: "Rate limited",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/api/cron/maintenance": {
      get: {
        summary: "Run the unified daily maintenance pipeline",
        description:
          "Authenticated Vercel Hobby cron route that drains telemetry and reaction buffers, processes a bounded email retry batch, and rolls raw telemetry older than 30 days into daily aggregates before pruning it. Returns isolated per-phase outcomes under an eight-second overall deadline.",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            description: "Bearer authorization secret token",
            schema: { type: "string" },
          },
          {
            name: "batch",
            in: "query",
            required: false,
            description: "Maximum telemetry and reaction items to drain",
            schema: { $ref: "#/components/schemas/SyncParams" },
          },
        ],
        responses: {
          200: {
            description:
              "Complete or partial execution summary with isolated phase counts, durations, and errors",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/MaintenanceSummary" },
              },
            },
          },
          400: { description: "Invalid batch parameters" },
          401: { description: "Unauthorized" },
        },
      },
    },
    "/api/telemetry/sync": {
      get: {
        summary: "Cron synchronization of buffered events",
        description:
          "Backward-compatible alias for the unified daily maintenance pass. Pulls buffered telemetry events from the secondary Redis cache and flushes them to the primary datastore in batches, then drains the case-study reaction write-buffer into Postgres.",
        parameters: [
          {
            name: "Authorization",
            in: "header",
            required: true,
            description: "Bearer authorization secret token",
            schema: {
              type: "string",
            },
          },
          {
            name: "batch",
            in: "query",
            required: false,
            description: "Batch parameters for loading buffered items",
            schema: {
              $ref: "#/components/schemas/SyncParams",
            },
          },
        ],
        responses: {
          200: {
            description: "Successful batch sync",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/TelemetrySyncResponse",
                },
              },
            },
          },
          400: {
            description: "Invalid batch parameters",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
          },
          500: {
            description: "Internal server error",
          },
        },
      },
    },
    "/api/contact": {
      post: {
        summary: "Submit visitor contact and collaboration inquiry",
        description:
          "Validates and processes inbound contact form submissions, evaluates spam protection gates, and dispatches notification emails.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ContactSubmission",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Contact inquiry dispatched successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ContactPostResponse",
                },
              },
            },
          },
          400: {
            description:
              "Validation or tone policy violation on submission payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          429: {
            description: "Too many contact submission attempts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error delivering message",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/newsletter": {
      post: {
        summary:
          "Subscribe email address to the systems engineering dispatch newsletter",
        description:
          "Validates email address, verifies spam and duration gates, registers subscriber, and delivers a welcome confirmation receipt.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/NewsletterSubmission",
              },
            },
          },
        },
        responses: {
          201: {
            description: "Newsletter subscription registered successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/NewsletterResponse",
                },
              },
            },
          },
          400: {
            description: "Invalid request payload or malformed email address",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ValidationError",
                },
              },
            },
          },
          429: {
            description: "Too many subscription attempts",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error registering subscription",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/webhooks/resend": {
      post: {
        summary: "Ingest Resend deliverability webhook events",
        description:
          "Cryptographically verifies Svix webhook signatures and processes email lifecycle events (bounces, complaints, delivery status) to maintain suppression lists.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ResendWebhookEvent",
              },
            },
          },
        },
        responses: {
          200: {
            description: "Webhook event processed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ResendWebhookResponse",
                },
              },
            },
          },
          400: {
            description:
              "Missing required Svix headers or invalid JSON payload",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          401: {
            description: "Invalid Svix signature",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          422: {
            description: "Payload does not match Resend webhook schema",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
          500: {
            description: "Internal server error processing webhook",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ErrorResponse",
                },
              },
            },
          },
        },
      },
    },
    "/api/admin/blog": {
      get: {
        summary: "List unpublished blog drafts",
        description:
          "Returns persisted unpublished BlogPost rows for authorized administrators only. Public fallback content is never used for this inventory.",
        parameters: [
          {
            name: "page",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 10000, default: 1 },
          },
          {
            name: "pageSize",
            in: "query",
            required: false,
            schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        ],
        responses: {
          200: {
            description: "Authenticated draft collection",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogDraftCollection" },
              },
            },
          },
          400: {
            description: "Invalid bounded pagination request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Unable to load drafts from persistence",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create an unpublished sanitized blog draft",
        description:
          "Creates a persisted BlogPost in server-owned unpublished state for an authorized administrator. Publication, identity, and timestamp fields are rejected.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BlogDraftCreate" },
            },
          },
        },
        responses: {
          201: {
            description: "Sanitized unpublished draft created",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BlogDraftCreateResponse",
                },
              },
            },
          },
          400: {
            description:
              "Invalid body, taxonomy, field bounds, or mass-assignment attempt",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "A draft with the slug already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          500: {
            description: "Unable to create draft",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/blog/{id}": {
      get: {
        summary: "Read an unpublished blog draft",
        description:
          "Returns one persisted unpublished BlogPost row for an authorized administrator. Published records and public fallback content are not available through this endpoint.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 191 },
          },
        ],
        responses: {
          200: {
            description: "Authenticated unpublished draft",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BlogDraftReadResponse" },
              },
            },
          },
          400: {
            description: "Invalid draft identifier",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Unpublished draft not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Unable to load draft",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        summary: "Edit an unpublished sanitized blog draft",
        description:
          "Partially updates a persisted BlogPost only while it remains unpublished. Publication, identity, and timestamp fields are rejected, changed HTML is sanitized, and old and new slug caches are invalidated only after persistence succeeds.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 191 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/BlogDraftUpdate" },
            },
          },
        },
        responses: {
          200: {
            description: "Sanitized unpublished draft updated",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/BlogDraftUpdateResponse",
                },
              },
            },
          },
          400: {
            description:
              "Invalid body, empty edit, taxonomy, field bounds, or mass-assignment attempt",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description:
              "Unpublished draft not found or no longer editable after concurrent publication",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          409: {
            description: "A draft with the requested slug already exists",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          500: {
            description: "Unable to update draft",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Delete a blog post or draft",
        description:
          "Deletes a persisted BlogPost or draft record by ID and evicts associated caches.",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 191 },
          },
        ],
        responses: {
          200: {
            description: "Blog post or draft deleted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid draft identifier",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ValidationError" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          404: {
            description: "Blog draft not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          500: {
            description: "Unable to delete blog post",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/api/admin/projects/{slug}/image": {
      post: {
        summary: "Upload and link project hero image",
        description:
          "Stores a validated media asset and updates the target case study hero image URL for authorized administrators.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 100 },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: {
                    type: "string",
                    format: "binary",
                    description:
                      "Image file buffer (PNG, JPEG, WebP, GIF, SVG, AVIF; max 5MB)",
                  },
                },
                required: ["file"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Image asset uploaded and persisted successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        slug: { type: "string" },
                        hero_image_url: { type: "string" },
                        key: { type: "string" },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation or payload error",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          401: {
            description: "Authentication required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          403: {
            description: "Administrator access required",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        summary: "Clear project hero image",
        description:
          "Clears the hero image URL associated with a project for authorized administrators.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", minLength: 1, maxLength: 100 },
          },
        ],
        responses: {
          200: {
            description: "Hero image cleared successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: {
                        slug: { type: "string" },
                        hero_image_url: { type: "null" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Authentication required",
          },
          403: {
            description: "Administrator access required",
          },
        },
      },
    },
    "/api/media/{key}": {
      get: {
        summary: "Retrieve media asset by key",
        description:
          "Serves stored media asset binary with strict Content-Type and security headers.",
        parameters: [
          {
            name: "key",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Media asset content stream",
            content: {
              "image/png": { schema: { type: "string", format: "binary" } },
              "image/jpeg": { schema: { type: "string", format: "binary" } },
              "image/webp": { schema: { type: "string", format: "binary" } },
              "image/gif": { schema: { type: "string", format: "binary" } },
              "image/svg+xml": { schema: { type: "string", format: "binary" } },
              "image/avif": { schema: { type: "string", format: "binary" } },
            },
          },
          404: {
            description: "Media asset not found",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      MaintenanceSummary: zodToOpenApi(MaintenanceSummarySchema),
      CaseStudySummary: zodToOpenApi(CaseStudySummarySchema),
      CaseStudySubmission: zodToOpenApi(CaseStudySubmissionSchema),
      CaseStudyPostResponse: zodToOpenApi(CaseStudyPostResponseSchema),
      BlogDraftCreate: zodToOpenApi(BlogDraftCreateSchema),
      BlogDraftUpdate: zodToOpenApi(BlogDraftUpdateSchema),
      BlogDraft: zodToOpenApi(BlogDraftSchema),
      BlogDraftCollection: zodToOpenApi(BlogDraftCollectionSchema),
      BlogDraftCreateResponse: zodToOpenApi(BlogDraftCreateResponseSchema),
      BlogDraftReadResponse: zodToOpenApi(BlogDraftReadResponseSchema),
      BlogDraftUpdateResponse: zodToOpenApi(BlogDraftUpdateResponseSchema),
      ErrorResponse: zodToOpenApi(ErrorResponseSchema),
      TelemetryEvent: zodToOpenApi(TelemetryEventSchema),
      TelemetryPostResponse: zodToOpenApi(TelemetryPostResponseSchema),
      TelemetrySyncResponse: zodToOpenApi(TelemetrySyncResponseSchema),
      RateLimitParams: zodToOpenApi(RateLimitParamsSchema),
      FallbackMemory: zodToOpenApi(FallbackMemorySchema),
      SyncParams: zodToOpenApi(SyncParamsSchema),
      ValidationError: zodToOpenApi(ValidationErrorSchema),
      FeedbackSubmission: zodToOpenApi(FeedbackSubmissionSchema),
      FeedbackItem: zodToOpenApi(FeedbackItemSchema),
      FeedbackGetResponse: zodToOpenApi(FeedbackGetResponseSchema),
      FeedbackPostResponse: zodToOpenApi(FeedbackPostResponseSchema),
      ReactionSubmission: zodToOpenApi(ReactionSubmissionSchema),
      ReactionCounts: zodToOpenApi(ReactionCountsSchema),
      ReactionGetResponse: zodToOpenApi(ReactionGetResponseSchema),
      ReactionPostResponse: zodToOpenApi(ReactionPostResponseSchema),
      ContactSubmission: zodToOpenApi(ContactSubmissionSchema),
      ContactPostResponse: zodToOpenApi(ContactPostResponseSchema),
      NewsletterSubmission: zodToOpenApi(NewsletterSubmissionSchema),
      NewsletterResponse: zodToOpenApi(NewsletterResponseSchema),
      ResendWebhookEvent: zodToOpenApi(ResendWebhookEventSchema),
      ResendWebhookResponse: zodToOpenApi(ResendWebhookResponseSchema),
    },
  },
};

export function generateOpenApi(
  workspaceRoot: string = path.resolve(__dirname, "..")
): {
  generatedJson: string;
  missingRoutes: string[];
  hasDrift: boolean;
} {
  const specFilePath = path.join(workspaceRoot, "openapi.json");
  const expectedRoutes = getExpectedApiRoutes(workspaceRoot);
  const documentedRoutes = Object.keys(openApiSpec.paths);

  const missingRoutes = expectedRoutes.filter(
    (r) => !documentedRoutes.includes(r)
  );
  const generatedJson = JSON.stringify(openApiSpec, null, 2);

  let existingJson = "";
  if (fs.existsSync(specFilePath)) {
    existingJson = fs.readFileSync(specFilePath, "utf8");
  }

  const hasDrift = existingJson !== generatedJson;

  return {
    generatedJson,
    missingRoutes,
    hasDrift,
  };
}

function main() {
  const root = path.resolve(__dirname, "..");
  const { generatedJson, missingRoutes, hasDrift } = generateOpenApi(root);
  const specFilePath = path.join(root, "openapi.json");

  if (missingRoutes.length > 0) {
    console.error(
      `❌ [OPENAPI ERROR] The following app/api routes are not documented in OpenAPI spec:`
    );
    for (const r of missingRoutes) {
      console.error(`  • ${r}`);
    }
    process.exit(1);
  }

  const isCI =
    process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

  if (hasDrift) {
    if (isCI) {
      console.error(
        "❌ ERROR: The API schemas have been modified, but openapi.json is not updated!"
      );
      console.error(
        "Please run the generation script locally ('npx tsx scripts/generate-openapi.ts') and commit the updated 'openapi.json' file."
      );
      process.exit(1);
    } else {
      fs.writeFileSync(specFilePath, generatedJson, "utf8");
      console.log("✅ Successfully updated openapi.json in the repository.");
    }
  } else {
    console.log(
      "✅ openapi.json is fully up-to-date with current schemas and all API routes are covered."
    );
  }
}

if (typeof process.env.VITEST === "undefined" && require.main === module) {
  main();
}
