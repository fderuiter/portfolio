import CaseStudyPage, { generateMetadata as generateCSMetadata } from "@/app/case-studies/[slug]/page";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const baseMeta = await generateCSMetadata({
    params: Promise.resolve({ slug: "promptops" }),
  });

  return {
    ...baseMeta,
    title: "PromptOps: AI Prompt Engineering & Multi-Agent Orchestration Framework",
    description:
      "A schema-driven, enterprise-grade framework that applies DevOps and software engineering principles to prompt engineering, multi-agent LLM orchestration, and Model Context Protocol (MCP) tooling.",
    alternates: {
      canonical: "/projects/promptops",
    },
    openGraph: {
      ...baseMeta.openGraph,
      title: "PromptOps: AI Prompt Engineering & Multi-Agent Orchestration Framework",
      description:
        "A schema-driven, enterprise-grade framework that applies DevOps and software engineering principles to prompt engineering, multi-agent LLM orchestration, and Model Context Protocol (MCP) tooling.",
      url: "/projects/promptops",
    },
  };
}

export default async function PromptOpsProjectPage() {
  return <CaseStudyPage params={Promise.resolve({ slug: "promptops" })} />;
}
