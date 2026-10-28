import 'dotenv/config';
import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';
import { OllamaGemmaLlm, runAgentTurn, DEFAULT_MODEL } from '../src/shared/ollama-llm.js';
import {
  getAreaArg,
  loadAreaContent,
  searchAreaContent,
} from '../src/shared/content-loader.js';

/**
 * Creates a Google ADK FunctionTool that searches `data/[area]/[content files]`
 * (or customContent if passed directly).
 */
export function createAreaSearchTool(area = 'javascript', customContent = '') {
  return new FunctionTool({
    name: 'search_area_content',
    description: `Searches the study notes in data/${area}/ for relevant sections and examples.`,
    parameters: z.object({
      query: z.string().describe('Keywords or topic to search in the area markdown files'),
    }),
    execute: async ({ query }) => {
      return searchAreaContent({ area, query, topK: 3, customContent });
    },
  });
}

async function main() {
  const area = getAreaArg('javascript');
  const query =
    process.argv[3] ||
    (area === 'javascript'
      ? 'microtask queue promise setTimeout closure'
      : area === 'ai-agents'
        ? 'LlmAgent FunctionTool RAG'
        : 'horizontal scaling cache-aside TTL');

  const { files } = loadAreaContent(area);

  console.log('=============================================================');
  console.log('  STEP 02: Area Content RAG Tool (`data/[area]/[files]`)');
  console.log('=============================================================');
  console.log(`Area Parameter : data/${area}/ (${files.map((f) => f.file).join(', ')})`);
  console.log(`Search Query   : "${query}"\n`);

  // 1. Direct search preview
  const ragResult = searchAreaContent({ area, query, topK: 3 });
  console.log('Top Retrieved Sections:');
  for (const hit of ragResult.results) {
    console.log(`  • [${hit.file}] ${hit.heading} (score: ${hit.score})`);
  }

  // 2. ADK LlmAgent equipped with the `search_area_content` FunctionTool
  const searchTool = createAreaSearchTool(area);
  const ragAgent = new LlmAgent({
    name: 'area_rag_assistant',
    model: new OllamaGemmaLlm({ model: DEFAULT_MODEL, temperature: 0.2 }),
    description: 'Answers study questions using retrieved chunks from data/[area]/.',
    tools: [searchTool],
    instruction: `You are a technical study assistant for the "${area}" area.
Always call the "search_area_content" tool first to retrieve notes from data/${area}/ before answering.
Cite the source file name in your explanation and keep your answer concise.`,
  });

  console.log('\nRunning ADK Agent with search_area_content tool...');
  const reply = await runAgentTurn({
    agent: ragAgent,
    prompt: `Using the notes in data/${area}/, summarize the key points about: ${query}`,
  });

  console.log('\n--- Grounded Agent Answer ---');
  console.log(reply);
  console.log('-----------------------------');
  console.log('\n✅ Step 02 complete!');
}

main().catch((err) => {
  console.error('\n❌ Step 02 failed:', err.message);
  process.exit(1);
});
