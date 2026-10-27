import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Keep in-memory Socratic runners keyed by sessionId + area
const socraticRunners = new Map();

/**
 * Generates the OpenAPI 3.0.3 (Swagger) specification for the Step 05 Exam Prep API.
 */
export function buildOpenApiSpec(serverUrl = `http://localhost:${process.env.PORT || 3000}`) {
  const availableAreas = listAreas();
  const defaultArea = availableAreas.includes('javascript') ? 'javascript' : availableAreas[0] || 'javascript';

  return {
    openapi: '3.0.3',
    info: {
      title: 'AI Exam Prep API (Google ADK + Local Gemma 4)',
      version: '1.0.0',
      description:
        'Step 05 Express API Server for the AI Exam Prep Workshop (GDG Lisbon & IADE). Connects study notes in `data/[area]/[content files]` with RAG search, structured 20-point exam generation, Socratic study mentoring, and deterministic rubric grading.',
      contact: {
        name: 'Nuno João Andrade (GDG Lisbon)',
        url: 'https://github.com/nuno-joao-andrade-dev/ai-exam-prep',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: 'Local Development API Server',
      },
    ],
    tags: [
      { name: 'System', description: 'Ollama status & available `data/[area]` folders' },
      { name: 'RAG', description: 'Step 02 — Search study notes in `data/[area]/` or `customContent`' },
      { name: 'Exam', description: 'Step 03 — Generate 20-point structured exam questions & rubrics' },
      { name: 'Socratic', description: 'Step 04 — Multi-turn Socratic Study Mentor agent' },
      { name: 'Grading', description: 'Step 05 — Deterministic criterion-by-criterion rubric evaluation' },
    ],
    paths: {
      '/api/status': {
        get: {
          tags: ['System'],
          summary: 'Check Ollama status and list available data/[area] study folders',
          parameters: [
            {
              name: 'area',
              in: 'query',
              required: false,
              description: `Study area folder inside data/ (${availableAreas.join(', ')})`,
              schema: { type: 'string', enum: availableAreas, default: defaultArea },
            },
          ],
          responses: {
            200: {
              description: 'Server status, Ollama reachability, and loaded area files',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/StatusResponse' },
                },
              },
            },
          },
        },
      },
      '/api/rag/search': {
        post: {
          tags: ['RAG'],
          summary: 'Search study notes in data/[area]/ (or customContent parameter)',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RagSearchRequest' },
                example: {
                  area: defaultArea,
                  query: 'microtask queue promise event loop',
                  topK: 3,
                  customContent: '',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Ranked Markdown chunks matching the query',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RagSearchResponse' },
                },
              },
            },
          },
        },
      },
      '/api/exam/generate': {
        post: {
          tags: ['Exam'],
          summary: 'Generate a 20-point structured exam question and rubric for an area',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ExamGenerateRequest' },
                example: {
                  area: defaultArea,
                  topic: 'Event Loop, Microtasks, and Closures',
                  customContent: '',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Generated 20-point exam question and 3-criterion grading rubric',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      exam: { $ref: '#/components/schemas/ExamQuestion' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/api/socratic/chat': {
        post: {
          tags: ['Socratic'],
          summary: 'Ask the Socratic Study Mentor for a conceptual hint without spoiling the answer',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SocraticChatRequest' },
                example: {
                  sessionId: 'swagger-demo-session',
                  area: defaultArea,
                  message: 'Why does Promise.then run before setTimeout(..., 0)?',
                  questionContext: 'Explain the execution order of synchronous code, microtasks, and macrotasks.',
                  customContent: '',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Socratic hint and guiding follow-up question',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/SocraticChatResponse' },
                },
              },
            },
          },
        },
      },
      '/api/grade/evaluate': {
        post: {
          tags: ['Grading'],
          summary: 'Evaluate a student Markdown answer against the 20-point exam rubric',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GradeEvaluateRequest' },
                example: {
                  area: defaultArea,
                  exam: {
                    area: defaultArea,
                    topic: 'Event Loop & Closures',
                    questionTitle: 'Async Queue Priority & Lexical Scope',
                    scenario: 'A timer callback inside a loop logs unexpected values while a Promise resolves first.',
                    questionPrompt: 'Explain why Promise callbacks execute before setTimeout(fn, 0) and how let fixes var loop closures.',
                    totalPoints: 20,
                    rubric: [
                      { id: 'C1', criterion: 'Microtask vs Macrotask Queue priority', maxPoints: 8 },
                      { id: 'C2', criterion: 'Call stack completion before queue draining', maxPoints: 7 },
                      { id: 'C3', criterion: 'Block-scoped let vs function-scoped var in closures', maxPoints: 5 },
                    ],
                    sampleAnswerSummary: 'Synchronous code runs first, then all microtasks (Promise.then), then macrotasks (setTimeout). Using let creates a new lexical binding per iteration.',
                  },
                  studentAnswer:
                    'Synchronous code executes on the Call Stack first. Once empty, the Event Loop drains all Microtasks (`Promise.then`) before picking the next Macrotask (`setTimeout`). Using `let` in a loop creates a per-iteration block binding.',
                  customContent: '',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Deterministic per-criterion score breakdown and feedback',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      evaluation: { $ref: '#/components/schemas/EvaluationResult' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        StatusResponse: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' },
            ollamaReachable: { type: 'boolean', example: true },
            ollamaHost: { type: 'string', example: DEFAULT_OLLAMA_HOST },
            configuredModel: { type: 'string', example: DEFAULT_MODEL },
            availableModels: { type: 'array', items: { type: 'string' }, example: ['gemma4:e2b'] },
            areas: { type: 'array', items: { type: 'string' }, example: availableAreas },
            currentArea: { type: 'string', example: defaultArea },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  file: { type: 'string', example: '01-event-loop-async.md' },
                  preview: { type: 'string' },
                  content: { type: 'string' },
                },
              },
            },
          },
        },
        RagSearchRequest: {
          type: 'object',
          properties: {
            area: { type: 'string', default: defaultArea, description: 'Folder inside data/' },
            query: { type: 'string', description: 'Keywords to search in the area Markdown files' },
            topK: { type: 'integer', default: 4 },
            customContent: { type: 'string', description: 'Optional raw Markdown content override' },
          },
        },
        RagSearchResponse: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            query: { type: 'string' },
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  area: { type: 'string' },
                  file: { type: 'string' },
                  docTitle: { type: 'string' },
                  heading: { type: 'string' },
                  content: { type: 'string' },
                  excerpt: { type: 'string' },
                  score: { type: 'number' },
                },
              },
            },
          },
        },
        ExamGenerateRequest: {
          type: 'object',
          properties: {
            area: { type: 'string', default: defaultArea },
            topic: { type: 'string', description: 'Optional topic focus within the selected area' },
            customContent: { type: 'string', description: 'Optional raw Markdown content override' },
          },
        },
        ExamQuestion: {
          type: 'object',
          properties: {
            area: { type: 'string' },
            topic: { type: 'string' },
            questionTitle: { type: 'string' },
            scenario: { type: 'string' },
            questionPrompt: { type: 'string' },
            totalPoints: { type: 'integer', example: 20 },
            rubric: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'C1' },
                  criterion: { type: 'string' },
                  maxPoints: { type: 'number', example: 8 },
                },
              },
            },
            sampleAnswerSummary: { type: 'string' },
          },
        },
        SocraticChatRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            sessionId: { type: 'string', default: 'web-session' },
            area: { type: 'string', default: defaultArea },
            message: { type: 'string' },
            questionContext: { type: 'string' },
            customContent: { type: 'string' },
          },
        },
        SocraticChatResponse: {
          type: 'object',
          properties: {
            reply: { type: 'string' },
            area: { type: 'string' },
          },
        },
        GradeEvaluateRequest: {
          type: 'object',
          required: ['exam', 'studentAnswer'],
          properties: {
            area: { type: 'string', default: defaultArea },
            exam: { $ref: '#/components/schemas/ExamQuestion' },
            studentAnswer: { type: 'string' },
            customContent: { type: 'string' },
          },
        },
        EvaluationResult: {
          type: 'object',
          properties: {
            totalAwarded: { type: 'number', example: 18 },
            totalPossible: { type: 'number', example: 20 },
            percentage: { type: 'number', example: 90 },
            overallFeedback: { type: 'string' },
            criterionScores: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: 'C1' },
                  awardedPoints: { type: 'number', example: 8 },
                  maxPoints: { type: 'number', example: 8 },
                  justification: { type: 'string' },
                },
              },
            },
            improvementSuggestions: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
    },
  };
}

function renderSwaggerHtml(spec) {
  const specJson = JSON.stringify(spec, null, 2);
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${spec.info.title} — OpenAPI 3.0 (Swagger)</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      :root {
        --g-blue: #4285f4;
        --g-blue-dark: #1a73e8;
        --g-red: #ea4335;
        --g-yellow: #fbbc04;
        --g-green: #34a853;
      }
      body {
        margin: 0;
        font-family: system-ui, -apple-system, sans-serif;
        background: #f8f9fa;
        color: #202124;
      }
      .google-bar {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        height: 4px;
      }
      .google-bar span:nth-child(1) { background: var(--g-blue); }
      .google-bar span:nth-child(2) { background: var(--g-red); }
      .google-bar span:nth-child(3) { background: var(--g-yellow); }
      .google-bar span:nth-child(4) { background: var(--g-green); }
      .top-header {
        background: #ffffff;
        border-bottom: 1px solid #dadce0;
        padding: 14px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
      }
      .top-header h1 {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
      }
      .top-header p {
        margin: 3px 0 0;
        font-size: 13px;
        color: #5f6368;
      }
      .header-links {
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .pill-btn {
        text-decoration: none;
        font-size: 12px;
        font-weight: 600;
        padding: 7px 14px;
        border-radius: 999px;
        border: 1px solid #dadce0;
        background: #ffffff;
        color: #1a73e8;
        cursor: pointer;
      }
      .pill-btn:hover {
        background: #e8f0fe;
        border-color: #4285f4;
      }
      .offline-container {
        max-width: 1140px;
        margin: 24px auto;
        padding: 0 20px;
      }
      .raw-spec-panel {
        display: none;
        max-width: 1140px;
        margin: 16px auto;
        padding: 0 20px;
      }
      .raw-spec-panel.visible {
        display: block;
      }
      .raw-spec-panel pre {
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 12px;
        padding: 16px;
        overflow-x: auto;
        font-size: 12px;
        max-height: 520px;
      }
      /* Offline fallback cards if CDN is unreachable */
      .endpoint-card {
        background: #ffffff;
        border: 1px solid #dadce0;
        border-radius: 12px;
        padding: 16px 20px;
        margin-bottom: 14px;
      }
      .method-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: 6px;
        font-weight: 700;
        font-size: 12px;
        font-family: monospace;
        margin-right: 10px;
      }
      .method-GET { background: #e8f0fe; color: #1a73e8; }
      .method-POST { background: #e6f4ea; color: #188038; }
    </style>
  </head>
  <body>
    <div class="google-bar"><span></span><span></span><span></span><span></span></div>
    <header class="top-header">
      <div>
        <h1>${spec.info.title} — OpenAPI ${spec.openapi} (Swagger)</h1>
        <p>Step 05 Express Server • Areas: <code>${listAreas().join(', ')}</code></p>
      </div>
      <div class="header-links">
        <a class="pill-btn" href="/openapi.json" target="_blank">Raw /openapi.json</a>
        <button class="pill-btn" onclick="document.getElementById('rawSpec').classList.toggle('visible')">
          Toggle OpenAPI JSON
        </button>
        <a class="pill-btn" href="http://localhost:5173" target="_blank">Open React UI (:5173)</a>
      </div>
    </header>

    <section id="rawSpec" class="raw-spec-panel">
      <pre><code>${specJson.replace(/</g, '&lt;')}</code></pre>
    </section>

    <div id="swagger-ui"></div>

    <!-- Offline Fallback Explorer if classroom has no internet for Swagger UI CDN -->
    <div id="offline-fallback" class="offline-container" style="display: none;">
      <h2>Offline OpenAPI 3.0 Explorer (Classroom Mode)</h2>
      <div id="offline-endpoints"></div>
    </div>

    <script>
      window.OPENAPI_SPEC = ${specJson};
    </script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"
      onload="window.SwaggerUIBundle && window.SwaggerUIBundle({ spec: window.OPENAPI_SPEC, dom_id: '#swagger-ui', deepLinking: true, defaultModelsExpandDepth: 1 })"
      onerror="renderOfflineFallback()"></script>
    <script>
      function renderOfflineFallback() {
        const container = document.getElementById('offline-fallback');
        const list = document.getElementById('offline-endpoints');
        container.style.display = 'block';
        const paths = window.OPENAPI_SPEC.paths || {};
        list.innerHTML = Object.entries(paths).map(([route, methods]) =>
          Object.entries(methods).map(([method, meta]) => \`
            <div class="endpoint-card">
              <div>
                <span class="method-badge method-\${method.toUpperCase()}">\${method.toUpperCase()}</span>
                <code><strong>\${route}</strong></code> — \${meta.summary || ''}
              </div>
            </div>
          \`).join('')
        ).join('');
      }
      setTimeout(() => {
        if (!window.SwaggerUIBundle) renderOfflineFallback();
      }, 2500);
    </script>
  </body>
</html>`;
}

// Root ("/") & "/openapi.json" / "/swagger.json": Serve OpenAPI 3.0 (Swagger) Specification
app.get(['/openapi.json', '/swagger.json'], (req, res) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  res.json(buildOpenApiSpec(serverUrl));
});

app.get('/', (req, res) => {
  const serverUrl = `${req.protocol}://${req.get('host')}`;
  const spec = buildOpenApiSpec(serverUrl);
  if (req.query.format === 'json' || req.accepts(['html', 'json']) === 'json') {
    return res.json(spec);
  }
  res.type('html').send(renderSwaggerHtml(spec));
});

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

const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`  Exam Prep API Server running on http://localhost:${PORT}`);
  console.log(`  OpenAPI (Swagger) UI : http://localhost:${PORT}/`);
  console.log(`  OpenAPI JSON Spec    : http://localhost:${PORT}/openapi.json`);
  console.log(`  Available data/[area]: ${listAreas().join(', ')}`);
  console.log(`=============================================================`);
});
