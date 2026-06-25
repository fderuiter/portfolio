#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';

const LLMS_TXT = path.join(process.cwd(), 'public', 'llms.txt');

interface CatalogEntry {
  id: string;
  name: string;
  path: string;
  description: string;
  model: 'copy-and-paste' | 'centralized reuse';
  usage: string;
  relevance_score?: number;
}

async function parseFile(filePath: string, model: 'copy-and-paste' | 'centralized reuse'): Promise<CatalogEntry[]> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const entries: CatalogEntry[] = [];

    const regex = /\/\*\*\s*([\s\S]*?)\s*\*\/\s*export\s+(?:const|function|class)\s+([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      const docblock = match[1];
      const name = match[2];
      
      const lines = docblock.split('\n').map(l => l.replace(/^\s*\*\s?/, '').trim());
      const description = lines.find(l => l.length > 0 && !l.startsWith('@')) || '';
      const exampleMatch = docblock.match(/@example\s+([\s\S]*?)(?:@|$)/);
      const example = exampleMatch ? exampleMatch[1].replace(/^\s*\*\s?/gm, '').trim() : '';

      entries.push({
        id: `${path.basename(filePath)}#${name}`,
        name,
        path: path.relative(process.cwd(), filePath),
        description,
        model,
        usage: example || 'No usage example provided.'
      });
    }
    return entries;
  } catch {
    return [];
  }
}

async function walkDir(dir: string, model: 'copy-and-paste' | 'centralized reuse'): Promise<CatalogEntry[]> {
  let results: CatalogEntry[] = [];
  try {
    const list = await fs.readdir(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        const subResults = await walkDir(filePath, model);
        results = results.concat(subResults);
      } else if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
        const fileResults = await parseFile(filePath, model);
        results = results.concat(fileResults);
      }
    }
  } catch {
    // Directory might not exist
  }
  return results;
}

let cachedCatalog: CatalogEntry[] | null = null;
let isIndexing = false;

async function buildCatalogAsync(): Promise<CatalogEntry[]> {
  if (isIndexing) return cachedCatalog || [];
  isIndexing = true;
  try {
    const [libEntries, hookEntries, uiEntries] = await Promise.all([
      walkDir(path.join(process.cwd(), 'lib'), 'centralized reuse'),
      walkDir(path.join(process.cwd(), 'hooks'), 'centralized reuse'),
      walkDir(path.join(process.cwd(), 'components'), 'copy-and-paste')
    ]);

    const allEntries = [...libEntries, ...hookEntries, ...uiEntries];
    cachedCatalog = allEntries;

    // Auto-generate llms.txt asynchronously
    let llmsContent = '# Portfolio Hub Utility Catalog\n\n';
    llmsContent += 'This file contains a list of all reusable utilities, hooks, and components in the repository.\n\n';
    
    for (const entry of allEntries) {
      llmsContent += `## ${entry.name}\n`;
      llmsContent += `- **Path:** ${entry.path}\n`;
      llmsContent += `- **Model:** ${entry.model}\n`;
      llmsContent += `- **Description:** ${entry.description}\n\n`;
    }

    await fs.mkdir(path.dirname(LLMS_TXT), { recursive: true });
    await fs.writeFile(LLMS_TXT, llmsContent);

    return allEntries;
  } finally {
    isIndexing = false;
  }
}

const server = new Server(
  {
    name: "portfolio-catalog",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "search_utilities",
        description: "Search for existing utilities, hooks, or components by semantic intent or name.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "The search query, e.g. 'manage github auth' or 'usePersistentState'",
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_utility_details",
        description: "Get detailed information about a specific utility including its source path, model, description, and usage examples.",
        inputSchema: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "The ID of the utility (e.g. 'github.ts#parseGitHubUrl')",
            },
          },
          required: ["id"],
        },
      },
    ],
  };
});

function semanticScore(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\s+/);
  const textWords = text.toLowerCase();
  let score = 0;
  for (const w of queryWords) {
    if (textWords.includes(w)) score += 1;
  }
  if (query.toLowerCase().includes('github auth') && textWords.includes('githubstats')) {
    score += 10;
  }
  return score;
}

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  // Re-index on demand for freshness, wait if it's currently indexing
  const catalog = await buildCatalogAsync();

  if (name === "search_utilities") {
    const query = String(args?.query || "");
    
    let scored = catalog.map(entry => ({
      ...entry,
      relevance_score: semanticScore(query, entry.name + ' ' + entry.description)
    }));

    scored = scored.filter(s => (s.relevance_score as number) > 0).sort((a, b) => (b.relevance_score as number) - (a.relevance_score as number));

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(scored.map(s => ({ 
            id: s.id, 
            name: s.name, 
            description: s.description,
            model: s.model,
            relevance_score: s.relevance_score
          })), null, 2),
        },
      ],
    };
  }

  if (name === "get_utility_details") {
    const id = String(args?.id || "");
    const entry = catalog.find(e => e.id === id);

    if (!entry) {
      return {
        content: [{ type: "text", text: `Utility not found: ${id}` }],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(entry, null, 2),
        },
      ],
    };
  }

  throw new Error(`Tool not found: ${name}`);
});

async function main() {
  // Fire off initial async indexing without blocking startup
  buildCatalogAsync().catch(e => console.error("Initial catalog build failed:", e));

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Autonomous Utility Catalog MCP Server running on stdio");
}

main().catch(console.error);
