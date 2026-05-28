import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { prisma } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Fetch all published case studies to use as RAG context
  const caseStudies = await prisma.caseStudy.findMany({
    where: { published: true },
    select: {
      title: true,
      slug: true,
      architectural_narrative: true,
    },
  });

  const contextText = caseStudies
    .map(
      (study) =>
        `Project: ${study.title} (Slug: ${study.slug})\nNarrative:\n${study.architectural_narrative}`
    )
    .join("\n\n---\n\n");

  const systemMessage = `You are a technical AI assistant integrated into a developer's portfolio terminal. Your job is to answer questions from recruiters and hiring managers about the developer's technical experience.

You MUST follow these rules:
1. ONLY answer questions using the provided Context below.
2. If the answer is not in the context, say "I cannot find information about that in my portfolio case studies." Do NOT invent or hallucinate answers.
3. Cite the project name when providing information (e.g. "In the SchemaFlow project, ...").
4. Keep answers concise, technical, and formatted clearly for a terminal interface.

Context:
${contextText}`;

  const result = streamText({
    model: openai("gpt-4o-mini"),
    system: systemMessage,
    messages,
  });

  return result.toTextStreamResponse();
}
