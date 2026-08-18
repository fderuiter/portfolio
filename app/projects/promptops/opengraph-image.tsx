import { createSocialImageResponse, OG_IMAGE_SIZE, OG_IMAGE_CONTENT_TYPE } from "@/lib/og-image";

export const runtime = "nodejs";
export const alt = "PromptOps AI Prompt Engineering & Workflow Orchestration | Frederick de Ruiter";
export const size = OG_IMAGE_SIZE;
export const contentType = OG_IMAGE_CONTENT_TYPE;

export default function Image() {
  return createSocialImageResponse({
    category: "LLMOPS & AGENT ORCHESTRATION FRAMEWORK",
    title: "PromptOps: AI Prompt Engineering & Multi-Agent DAG Engine",
    description:
      "Schema-driven enterprise framework bringing DevOps principles, Draft-07 JSON Schema validation, MCP tool servers, and signed compliance audit trails to generative AI.",
    badge: "PROMPTOPS // FRAMEWORK",
    tags: ["Python", "LLMOps", "Model Context Protocol", "Streamlit", "Pydantic", "JSON Schema"],
    systemStatus: "FRAMEWORK READY",
  });
}
