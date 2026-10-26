import 'dotenv/config';
import { z } from 'zod';
import { ollamaChat, DEFAULT_MODEL } from '../src/shared/ollama-llm.js';
import { getAreaArg, searchAreaContent } from '../src/shared/content-loader.js';

export const ExamQuestionSchema = z.object({
  examTitle: z.string(),
  area: z.string(),
  questionNumber: z.number(),
  totalPoints: z.number(),
  scenarioContext: z.string(),
  questionPrompt: z.string(),
  expectedKeyFormulasOrConcepts: z.array(z.string()),
  rubric: z.array(
    z.object({
      id: z.string(),
      criterion: z.string(),
      maxPoints: z.number(),
      fullMarksDescription: z.string(),
      partialMarksDescription: z.string(),
      zeroMarksDescription: z.string(),
    })
  ),
});

export const EXAM_JSON_SCHEMA = {
  type: 'object',
  properties: {
    examTitle: { type: 'string' },
    area: { type: 'string' },
    questionNumber: { type: 'number' },
    totalPoints: { type: 'number' },
    scenarioContext: { type: 'string' },
    questionPrompt: { type: 'string' },
    expectedKeyFormulasOrConcepts: {
      type: 'array',
      items: { type: 'string' },
    },
    rubric: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          criterion: { type: 'string' },
          maxPoints: { type: 'number' },
          fullMarksDescription: { type: 'string' },
          partialMarksDescription: { type: 'string' },
          zeroMarksDescription: { type: 'string' },
        },
        required: [
          'id',
          'criterion',
          'maxPoints',
          'fullMarksDescription',
          'partialMarksDescription',
          'zeroMarksDescription',
        ],
      },
    },
  },
  required: [
    'examTitle',
    'area',
    'questionNumber',
    'totalPoints',
    'scenarioContext',
    'questionPrompt',
    'expectedKeyFormulasOrConcepts',
    'rubric',
  ],
};

/**
 * Generates a structured 20-point exam question and rubric grounded in data/[area]/
 * (or in customContent if passed directly).
 */
export async function generateExamQuestion({ area = 'javascript', topic = '', customContent = '' } = {}) {
  const searchQuery = topic || area;
  const rag = searchAreaContent({ area, query: searchQuery, topK: 4, customContent });
  const contextText = rag.results
    .map((r) => `[Source: ${r.file} - ${r.heading}]\n${r.excerpt}`)
    .join('\n\n');

  const prompt = `Create a 20-point technical exam question for area "${area}"${
    topic ? ` focused on "${topic}"` : ''
  }.
Use ONLY the following study notes from data/${area}/:

${contextText}

Requirements:
- totalPoints MUST be 20.
- Include 2 rubric criteria (id "C1" and "C2") whose maxPoints sum to 20 (e.g. 10 and 10).
- Use clear Markdown formatting in scenarioContext and questionPrompt.`;

  const response = await ollamaChat({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are an exam designer. Return valid JSON matching the requested schema grounded strictly in the provided notes.',
      },
      { role: 'user', content: prompt },
    ],
    format: EXAM_JSON_SCHEMA,
    options: { temperature: 0.2 },
  });

  const parsed = JSON.parse(response.message.content);
  parsed.area = area;
  parsed.totalPoints = 20;
  return ExamQuestionSchema.parse(parsed);
}

async function main() {
  const area = getAreaArg('javascript');
  const topic = process.argv[3] || '';

  console.log('=============================================================');
  console.log('  STEP 03: Structured Exam & Rubric Generator (Gemma 4 JSON)');
  console.log('=============================================================');
  console.log(`Area Parameter  : data/${area}/`);
  console.log(`Topic Parameter : "${topic || '(auto from area notes)'}"\n`);

  const exam = await generateExamQuestion({ area, topic });
  console.log(JSON.stringify(exam, null, 2));
  console.log('\n✅ Step 03 complete!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n❌ Step 03 failed:', err.message);
    process.exit(1);
  });
}
