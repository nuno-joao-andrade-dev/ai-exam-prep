import 'dotenv/config';
import { z } from 'zod';
import { ollamaChat, DEFAULT_MODEL } from '../src/shared/ollama-llm.js';
import { getAreaArg, searchAreaContent } from '../src/shared/content-loader.js';

export const EvaluationSchema = z.object({
  totalAwarded: z.number(),
  totalPossible: z.number(),
  percentage: z.number(),
  letterGrade: z.string(),
  overallFeedback: z.string(),
  criterionScores: z.array(
    z.object({
      criterionId: z.string(),
      awardedPoints: z.number(),
      maxPoints: z.number(),
      justification: z.string(),
      improvementTip: z.string(),
    })
  ),
});

export const EVALUATION_JSON_SCHEMA = {
  type: 'object',
  properties: {
    totalAwarded: { type: 'number' },
    totalPossible: { type: 'number' },
    percentage: { type: 'number' },
    letterGrade: { type: 'string' },
    overallFeedback: { type: 'string' },
    criterionScores: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          criterionId: { type: 'string' },
          awardedPoints: { type: 'number' },
          maxPoints: { type: 'number' },
          justification: { type: 'string' },
          improvementTip: { type: 'string' },
        },
        required: [
          'criterionId',
          'awardedPoints',
          'maxPoints',
          'justification',
          'improvementTip',
        ],
      },
    },
  },
  required: [
    'totalAwarded',
    'totalPossible',
    'percentage',
    'letterGrade',
    'overallFeedback',
    'criterionScores',
  ],
};

/**
 * Evaluates a student's Markdown answer against the exam rubric and data/[area]/ notes.
 */
export async function evaluateStudentAnswer({
  area = 'javascript',
  exam,
  studentAnswer,
  customContent = '',
}) {
  const rag = searchAreaContent({
    area,
    query: exam.questionPrompt,
    topK: 3,
    customContent,
  });
  const referenceNotes = rag.results
    .map((r) => `[${r.file} - ${r.heading}]\n${r.excerpt}`)
    .join('\n\n');

  const prompt = `Grade the following student answer against the rubric and reference notes from data/${area}/.

EXAM QUESTION:
${exam.questionPrompt}

RUBRIC:
${JSON.stringify(exam.rubric, null, 2)}

REFERENCE NOTES (data/${area}/):
${referenceNotes}

STUDENT ANSWER:
${studentAnswer}

Return JSON matching the evaluation schema. Ensure criterionScores has one entry per rubric item and totalAwarded equals the sum of awardedPoints.`;

  const response = await ollamaChat({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a fair, deterministic technical exam grader. Return only valid JSON matching the schema.',
      },
      { role: 'user', content: prompt },
    ],
    format: EVALUATION_JSON_SCHEMA,
    options: { temperature: 0.1 },
  });

  const parsed = JSON.parse(response.message.content);
  const totalPossible = (exam.rubric || []).reduce((acc, r) => acc + r.maxPoints, 0) || 20;
  const totalAwarded = (parsed.criterionScores || []).reduce(
    (acc, c) => acc + Number(c.awardedPoints || 0),
    0
  );
  parsed.totalAwarded = totalAwarded;
  parsed.totalPossible = totalPossible;
  parsed.percentage = Math.round((totalAwarded / totalPossible) * 100);

  return EvaluationSchema.parse(parsed);
}

async function main() {
  const area = getAreaArg('javascript');

  console.log('=============================================================');
  console.log('  STEP 05: Deterministic Rubric Grader (`data/[area]/`)');
  console.log('=============================================================');
  console.log(`Area Parameter: data/${area}/\n`);

  const sampleExam = {
    examTitle: `Core ${area.toUpperCase()} Assessment`,
    area,
    questionNumber: 1,
    totalPoints: 20,
    scenarioContext: `Testing core concepts from data/${area}/.`,
    questionPrompt:
      area === 'javascript'
        ? 'Explain why Promise callbacks run before setTimeout(..., 0) and how a closure retains access to outer variables.'
        : `Explain the two main concepts covered in the data/${area}/ study notes with concrete examples.`,
    expectedKeyFormulasOrConcepts: ['Core concept 1', 'Core concept 2'],
    rubric: [
      {
        id: 'C1',
        criterion: 'Primary Concept Accuracy',
        maxPoints: 10,
        fullMarksDescription: 'Accurately explains the first concept using terminology from the notes.',
        partialMarksDescription: 'Partially explains the concept with minor gaps.',
        zeroMarksDescription: 'Missing or incorrect explanation.',
      },
      {
        id: 'C2',
        criterion: 'Secondary Concept & Example',
        maxPoints: 10,
        fullMarksDescription: 'Accurately explains the second concept and provides a clear example.',
        partialMarksDescription: 'Mentions the concept without explaining how it works.',
        zeroMarksDescription: 'Missing explanation.',
      },
    ],
  };

  const sampleStudentAnswer =
    area === 'javascript'
      ? 'Promise callbacks go into the Microtask Queue, which is drained completely after the synchronous call stack empties and before the Event Loop takes the next Macrotask (like setTimeout). A closure is formed when an inner function remembers variables from its outer lexical scope even after the outer function returns.'
      : `In ${area}, the first file covers the core architecture and execution flow, while the second file covers performance and reliability patterns.`;

  console.log('Grading sample student answer...\n');
  const evaluation = await evaluateStudentAnswer({
    area,
    exam: sampleExam,
    studentAnswer: sampleStudentAnswer,
  });

  console.log(JSON.stringify(evaluation, null, 2));
  console.log('\n✅ Step 05 CLI grading complete! Run `npm run server` to start the Web API.');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error('\n❌ Step 05 failed:', err.message);
    process.exit(1);
  });
}
