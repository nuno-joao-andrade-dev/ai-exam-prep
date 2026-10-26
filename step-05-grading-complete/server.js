import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { InMemoryRunner } from '@google/adk';

import {
  DEFAULT_MODEL,
  DEFAULT_OLLAMA_HOST,
  ollamaListModels,
  runAgentTurn,
} from '../src/shared/ollama-llm.js';
import {
  listAreas,
  loadAreaContent,
  searchAreaContent,
} from '../src/shared/content-loader.js';
import { generateExamQuestion } from '../step-03-exam-gen/index.js';
import { createSocraticMentorAgent } from '../step-04-socratic-agent/index.js';
import { evaluateStudentAnswer } from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Keep in-memory Socratic runners keyed by sessionId + area
const socraticRunners = new Map();

// 1. Status & Available Content Areas (`data/[area]`)
app.get('/api/status', async (req, res) => {
  const area = req.query.area || 'javascript';
  const areas = listAreas();
  const areaData = loadAreaContent(area);

  let ollamaReachable = false;
  let availableModels = [];
  try {
    const tags = await ollamaListModels(DEFAULT_OLLAMA_HOST);
    ollamaReachable = true;
    availableModels = (tags.models || []).map((m) => m.name);
  } catch {
    ollamaReachable = false;
  }

  res.json({
    status: 'ok',
    ollamaReachable,
    ollamaHost: DEFAULT_OLLAMA_HOST,
    configuredModel: DEFAULT_MODEL,
    availableModels,
    areas,
    currentArea: areaData.area,
    files: areaData.files.map((f) => ({
      file: f.file,
      preview: f.content.slice(0, 300),
      content: f.content,
    })),
  });
});

// 2. Search Area Content (`data/[area]` or customContent parameter)
app.post('/api/rag/search', (req, res) => {
  try {
    const { area = 'javascript', query = '', topK = 4, customContent = '' } = req.body || {};
    const result = searchAreaContent({ area, query, topK, customContent });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Generate Exam Question grounded in `data/[area]` (or customContent parameter)
app.post('/api/exam/generate', async (req, res) => {
  try {
    const { area = 'javascript', topic = '', customContent = '' } = req.body || {};
    const exam = await generateExamQuestion({ area, topic, customContent });
    res.json({ exam });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Socratic Study Mentor Chat grounded in `data/[area]` (or customContent parameter)
app.post('/api/socratic/chat', async (req, res) => {
  try {
    const {
      sessionId = 'web-session',
      area = 'javascript',
      message = '',
      questionContext = '',
      customContent = '',
    } = req.body || {};

    const runnerKey = `${sessionId}:${area}:${customContent ? 'custom' : 'files'}`;
    let runner = socraticRunners.get(runnerKey);
    if (!runner) {
      const agent = createSocraticMentorAgent({ area, customContent });
      runner = new InMemoryRunner({ agent, appName: 'examprep' });
      socraticRunners.set(runnerKey, runner);
    }

    const fullPrompt = questionContext
      ? `[Current Exam Question Context: ${questionContext}]\n\nStudent Question: ${message}`
      : message;

    const reply = await runAgentTurn({
      agent: runner.agent,
      runner,
      sessionId: runnerKey,
      prompt: fullPrompt,
    });

    res.json({ reply, area });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Evaluate Student Answer against Rubric
app.post('/api/grade/evaluate', async (req, res) => {
  try {
    const {
      area = 'javascript',
      exam,
      studentAnswer = '',
      customContent = '',
    } = req.body || {};
    const evaluation = await evaluateStudentAnswer({
      area,
      exam,
      studentAnswer,
      customContent,
    });
    res.json({ evaluation });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve built React Question Interface if present
const uiDistPath = path.resolve(__dirname, '../question-interface/dist');
app.use(express.static(uiDistPath));
app.get('/{*splat}', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(uiDistPath, 'index.html'), (err) => {
    if (err) res.status(200).send('API Server Running. Start UI with: cd question-interface && npm run dev');
  });
});

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`  Exam Prep API Server running on http://localhost:${PORT}`);
  console.log(`  Available data/[area] folders: ${listAreas().join(', ')}`);
  console.log(`=============================================================`);
});
