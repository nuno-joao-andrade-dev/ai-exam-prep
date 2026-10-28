import 'dotenv/config';
import { InMemoryRunner, LlmAgent } from '@google/adk';
import { OllamaGemmaLlm, runAgentTurn, DEFAULT_MODEL } from '../src/shared/ollama-llm.js';
import { getAreaArg, loadAreaContent } from '../src/shared/content-loader.js';
import { createAreaSearchTool } from '../step-02-rag/index.js';

/**
 * Creates a Socratic Study Mentor ADK LlmAgent grounded in `data/[area]/`
 * (or customContent if provided).
 */
export function createSocraticMentorAgent({ area = 'javascript', customContent = '' } = {}) {
  const { files } = loadAreaContent(area, customContent);
  const fileList = files.map((f) => f.file).join(', ');
  const searchTool = createAreaSearchTool(area, customContent);

  return new LlmAgent({
    name: 'socratic_study_mentor',
    model: new OllamaGemmaLlm({ model: DEFAULT_MODEL, temperature: 0.3 }),
    description: 'Socratic Study Mentor that guides students with hints and questions.',
    tools: [searchTool],
    instruction: `You are a Socratic Study Mentor for the "${area}" study area (files: ${fileList}).
Rules:
1. NEVER give the complete final exam answer immediately.
2. Use the "search_area_content" tool to check the study notes in data/${area}/ when needed.
3. Give a brief, encouraging conceptual hint (2-4 sentences) and end with ONE guiding question that helps the student reason to the next step.`,
  });
}

// Exported for `adk web` (Google ADK DevTools Web UI)
export const rootAgent = createSocraticMentorAgent({
  area: process.env.AREA || 'javascript',
});

async function main() {
  const area = getAreaArg('javascript');
  const agent = createSocraticMentorAgent({ area });
  const runner = new InMemoryRunner({ agent, appName: 'examprep' });
  const sessionId = `socratic-${area}-demo`;

  console.log('=============================================================');
  console.log('  STEP 04: Socratic Study Mentor Agent (`data/[area]/`)');
  console.log('=============================================================');
  console.log(`Area Parameter: data/${area}/\n`);

  const studentQuestions =
    area === 'javascript'
      ? [
          'I am confused about why Promise.resolve().then(...) runs before setTimeout(..., 0). Can you just give me the answer?',
          'Okay, so the call stack runs synchronous code first, and then the Microtask Queue is checked before the Macrotask Queue?',
        ]
      : [
          `Can you give me a hint on the main concepts in data/${area}/ without giving away the full answer?`,
          `Thanks! How do those two mechanisms work together in practice?`,
        ];

  for (let i = 0; i < studentQuestions.length; i++) {
    console.log(`[Student Turn ${i + 1}]: ${studentQuestions[i]}`);
    const reply = await runAgentTurn({
      agent,
      runner,
      sessionId,
      prompt: studentQuestions[i],
    });
    console.log(`\n[Socratic Mentor]:\n${reply}\n`);
  }

  console.log('✅ Step 04 complete!');
}

  main().catch((err) => {
    console.error('\n❌ Step 04 failed:', err.message);
    process.exit(1);
  });
