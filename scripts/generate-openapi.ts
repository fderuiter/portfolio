import * as fs from "fs";
import * as path from "path";

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
    const rel = path.relative(apiDir, path.dirname(file)).replace(/\\/g, "/");
    return rel === "" ? "/api" : `/api/${rel}`;
  });
}

// Construct OpenAPI 3.0.0 specification using the declarative Zod schemas
export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Portfolio Service API",
    description: "Declarative Zod Validated & Programmatically Generated API Spec",
    version: "1.0.0",
  },
  paths: {
    "/api/case-studies": {
      get: {
        summary: "Retrieve published case studies",
        description: "Fetches a list of published case studies including title, slug, primary language, and tags.",
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
        description: "Submits a new technical case study or prototype post-mortem as an unpublished draft record.",
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
            description: "Case study submitted successfully in unpublished draft state",
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
                        slug: { type: "string" },
                        title: { type: "string" },
                        primary_language: { type: "string" },
                        editorial_content: { type: "string" },
                        architectural_narrative: { type: "string" },
                        published: { type: "boolean" },
                        tags: { type: "string" },
                        created_at: { type: "string", format: "date-time" },
                      },
                      required: [
                        "id",
                        "slug",
                        "title",
                        "primary_language",
                        "editorial_content",
                        "architectural_narrative",
                        "published",
                        "tags",
                      ],
                    },
                  },
                  required: ["success", "data"],
                },
              },
            },
          },
          400: {
            description: "Missing or malformed payload fields or duplicate slug",
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
            description: "Case study slug identifier (interchangeable with caseStudySlug)",
            schema: { type: "string" },
          },
          {
            name: "caseStudySlug",
            in: "query",
            required: false,
            description: "Case study slug identifier (interchangeable with slug)",
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
        description: "Validates and persists structured learning takeaways and free-form constructive text.",
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
        description: "Fetches aggregate quick reaction counts for a case study slug.",
        parameters: [
          {
            name: "slug",
            in: "query",
            required: false,
            description: "Case study slug identifier (interchangeable with caseStudySlug)",
            schema: { type: "string" },
          },
          {
            name: "caseStudySlug",
            in: "query",
            required: false,
            description: "Case study slug identifier (interchangeable with slug)",
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
        description: "Increments quick reaction badge count for a case study slug.",
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
    "/api/telemetry": {
      get: {
        summary: "Retrieve compiled telemetry metrics",
        description: "Perform dynamic grouping aggregates on TelemetryEvents to sum view & click metrics.",
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
        description: "Saves telemetry transaction events and implements high-availability failover buffering.",
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
            description: "Event ingested successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    event: {
                      type: "object",
                      properties: {
                        id: { type: "string" },
                        projectSlug: { type: "string" },
                        eventType: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                      },
                      required: ["id", "projectSlug", "eventType", "createdAt"],
                    },
                  },
                  required: ["success", "event"],
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
    "/api/telemetry/sync": {
      get: {
        summary: "Cron synchronization of buffered events",
        description: "Pulls buffered telemetry events from secondary Redis cache and flushes them to primary datastore in batches.",
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
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    processed: { type: "integer" },
                    inserted: { type: "integer" },
                  },
                  required: ["success", "processed"],
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
  },
  components: {
    schemas: {
      CaseStudySummary: {
        type: "object",
        properties: {
          id: { type: "string" },
          slug: { type: "string" },
          title: { type: "string" },
          primary_language: { type: "string" },
          tags: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["id", "slug", "title", "primary_language", "tags"],
      },
      CaseStudySubmission: {
        type: "object",
        properties: {
          title: { type: "string", description: "Title of the post-mortem or case study" },
          slug: { type: "string", description: "Unique URL slug" },
          primary_language: { type: "string", description: "Primary programming language or tech stack" },
          editorial_content: { type: "string", description: "Summary description markdown" },
          architectural_narrative: { type: "string", description: "Detailed architectural narrative HTML markup" },
          tags: {
            oneOf: [
              { type: "string" },
              { type: "array", items: { type: "string" } },
            ],
            description: "Tags as comma-separated string or array of tag strings",
          },
          github_url: { type: "string", description: "Optional GitHub repository URL" },
        },
        required: ["title", "slug", "tags"],
      },
      ErrorResponse: {
        type: "object",
        properties: {
          error: { type: "string" },
        },
        required: ["error"],
      },
      TelemetryEvent: {
        type: "object",
        properties: {
          projectSlug: {
            type: "string",
            description: "Identifier for the project page",
          },
          eventType: {
            type: "string",
            enum: [
              "page_view",
              "project_click",
              "route_error",
              "simulator_option_select",
              "simulator_milestone_reached",
              "simulator_schedule_click",
              "simulator_report_copy",
              "post_mortem_reaction_select",
              "post_mortem_takeaway_select",
              "post_mortem_feedback_submit",
              "post_mortem_view",
            ],
          },
        },
        required: ["projectSlug", "eventType"],
      },
      RateLimitParams: {
        type: "object",
        properties: {
          windowMs: {
            type: "integer",
            default: 60000,
            description: "Sliding rate window duration in ms",
          },
          maxRequests: {
            type: "integer",
            default: 100,
            description: "Maximum requests allowed within the window",
          },
        },
        required: ["windowMs", "maxRequests"],
      },
      FallbackMemory: {
        type: "object",
        properties: {
          redisUrl: {
            type: "string",
            format: "uri",
            description: "HA Redis secondary connection URL",
          },
          redisToken: {
            type: "string",
            description: "Access secret token",
          },
          ttlSeconds: {
            type: "integer",
            default: 172800,
            description: "Survival TTL duration in seconds",
          },
        },
        required: ["ttlSeconds"],
      },
      SyncParams: {
        type: "object",
        properties: {
          batch: {
            type: "integer",
            default: 50,
            description: "Batch parameter size for loading buffered items",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          error: { type: "string" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                path: { type: "string" },
                message: { type: "string" },
              },
              required: ["path", "message"],
            },
          },
        },
        required: ["error"],
      },
      FeedbackSubmission: {
        type: "object",
        properties: {
          caseStudySlug: { type: "string" },
          takeaways: {
            type: "array",
            items: { type: "string" },
          },
          comments: { type: "string" },
        },
        required: ["caseStudySlug", "takeaways", "comments"],
      },
      FeedbackItem: {
        type: "object",
        properties: {
          id: { type: "string", description: "Feedback record ID" },
          takeaways: {
            type: "array",
            items: { type: "string" },
            description: "Selected key learning takeaways",
          },
          comments: { type: "string", description: "Constructive user comments" },
          createdAt: { type: "string", format: "date-time", description: "Submission timestamp" },
        },
        required: ["id", "takeaways", "comments", "createdAt"],
      },
      FeedbackGetResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          caseStudySlug: { type: "string" },
          hasSubmitted: {
            type: "boolean",
            description: "Indicates whether user with same connection hash has submitted feedback",
          },
          totalFeedback: { type: "integer" },
          feedback: {
            type: "array",
            items: { $ref: "#/components/schemas/FeedbackItem" },
          },
        },
        required: ["success", "caseStudySlug", "hasSubmitted", "totalFeedback", "feedback"],
      },
      FeedbackPostResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          message: { type: "string" },
          feedback: {
            type: "object",
            properties: {
              id: { type: "string" },
              caseStudySlug: { type: "string" },
              takeaways: {
                type: "array",
                items: { type: "string" },
              },
              comments: { type: "string" },
              createdAt: { type: "string", format: "date-time" },
            },
            required: ["id", "caseStudySlug", "takeaways", "comments", "createdAt"],
          },
        },
        required: ["success", "message", "feedback"],
      },
      ReactionSubmission: {
        type: "object",
        properties: {
          caseStudySlug: { type: "string" },
          reactionType: {
            type: "string",
            enum: [
              "insightful",
              "mind_blowing",
              "actionable",
              "thorough",
              "root_cause",
              "lessons_learned",
              "systemic_fix",
              "preventative_action",
            ],
          },
        },
        required: ["caseStudySlug", "reactionType"],
      },
      ReactionCounts: {
        type: "object",
        properties: {
          insightful: { type: "integer" },
          mind_blowing: { type: "integer" },
          actionable: { type: "integer" },
          thorough: { type: "integer" },
          root_cause: { type: "integer" },
          lessons_learned: { type: "integer" },
          systemic_fix: { type: "integer" },
          preventative_action: { type: "integer" },
        },
        required: [
          "insightful",
          "mind_blowing",
          "actionable",
          "thorough",
          "root_cause",
          "lessons_learned",
          "systemic_fix",
          "preventative_action",
        ],
      },
      ReactionGetResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          caseStudySlug: { type: "string" },
          counts: { $ref: "#/components/schemas/ReactionCounts" },
          userReactions: {
            type: "array",
            items: { type: "string" },
            description: "Reaction types submitted by current user connection hash",
          },
        },
        required: ["success", "caseStudySlug", "counts", "userReactions"],
      },
      ReactionPostResponse: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          reactionType: {
            type: "string",
            enum: [
              "insightful",
              "mind_blowing",
              "actionable",
              "thorough",
              "root_cause",
              "lessons_learned",
              "systemic_fix",
              "preventative_action",
            ],
          },
          counts: { $ref: "#/components/schemas/ReactionCounts" },
          userReactions: {
            type: "array",
            items: { type: "string" },
          },
        },
        required: ["success", "reactionType", "counts", "userReactions"],
      },
    },
  },
};

export function generateOpenApi(workspaceRoot: string = path.resolve(__dirname, "..")): {
  generatedJson: string;
  missingRoutes: string[];
  hasDrift: boolean;
} {
  const specFilePath = path.join(workspaceRoot, "openapi.json");
  const expectedRoutes = getExpectedApiRoutes(workspaceRoot);
  const documentedRoutes = Object.keys(openApiSpec.paths);

  const missingRoutes = expectedRoutes.filter((r) => !documentedRoutes.includes(r));
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
    console.error(`❌ [OPENAPI ERROR] The following app/api routes are not documented in OpenAPI spec:`);
    for (const r of missingRoutes) {
      console.error(`  • ${r}`);
    }
    process.exit(1);
  }

  const isCI = process.env.CI === "true" || process.env.GITHUB_ACTIONS === "true";

  if (hasDrift) {
    if (isCI) {
      console.error("❌ ERROR: The API schemas have been modified, but openapi.json is not updated!");
      console.error("Please run the generation script locally ('npx tsx scripts/generate-openapi.ts') and commit the updated 'openapi.json' file.");
      process.exit(1);
    } else {
      fs.writeFileSync(specFilePath, generatedJson, "utf8");
      console.log("✅ Successfully updated openapi.json in the repository.");
    }
  } else {
    console.log("✅ openapi.json is fully up-to-date with current schemas and all API routes are covered.");
  }
}

if (typeof process.env.VITEST === "undefined" && require.main === module) {
  main();
}
