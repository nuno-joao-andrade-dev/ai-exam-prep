import 'dotenv/config';
import { LlmAgent } from '@google/adk';
import {
  OllamaGemmaLlm,
  runAgentTurn,
  ollamaListModels,
  DEFAULT_MODEL,
  DEFAULT_OLLAMA_HOST,
} from '../src/shared/ollama-llm.js';
import { getAreaArg, listAreas, loadAreaContent } from '../src/shared/content-loader.js';

async function main() {
  const area = getAreaArg('javascript');
  const availableAreas = listAreas();
  const { files } = loadAreaContent(area);

  console.log('=============================================================');
  console.log('  STEP 01: Setup & Hello Gemma 4 (Google ADK + Ollama)');
  console.log('=============================================================');
  console.log(`Available data/[area] folders : ${availableAreas.join(', ')}`);
  console.log(`Selected area parameter       : "${area}" (${files.length} files loaded)`);
  files.forEach((f) => console.log(`  - data/${area}/${f.file}`));

  // 1. Check Ollama server & available models
  const tags = await ollamaListModels(DEFAULT_OLLAMA_HOST);
  const modelNames = (tags.models || []).map((m) => m.name);
  console.log(`\nOllama Host  : ${DEFAULT_OLLAMA_HOST}`);
  console.log(`Active Model : ${DEFAULT_MODEL}`);
  console.log(`Local Models : ${modelNames.join(', ') || 'none'}`);

  // 2. Create a minimal Google ADK LlmAgent backed by local Gemma 4
  const fileNames = files.map((f) => f.file).join(', ');
  const agent = new LlmAgent({
    name: 'setup_check_agent',
    model: new OllamaGemmaLlm({ model: DEFAULT_MODEL, temperature: 0.2 }),
    description: 'Verifies local Gemma 4 connection and summarizes loaded area files.',
    instruction: `You are a concise study assistant for the "${area}" topic area.
The student has loaded the following files from data/${area}/: ${fileNames}.
Reply in 2 short sentences confirming you are ready to help with ${area}.`,
  });

  console.log('\nSending test prompt to ADK LlmAgent...');
  const reply = await runAgentTurn({
    agent,
    prompt: `Hello! Confirm you are online and mention one concept we can study in the "${area}" area.`,
  });

  console.log('\n--- Gemma 4 Response ---');
  console.log(reply);
  console.log('------------------------');
  console.log('\n✅ Step 01 complete!');
}

main().catch((err) => {
  console.error('\n❌ Step 01 failed:', err.message);
  process.exit(1);
});
