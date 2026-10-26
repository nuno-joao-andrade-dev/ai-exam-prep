# GDG Lisbon — AI Exam Prep with Google ADK & Local Gemma 4 (Code-First JavaScript Slides)

**Community:** Google Developer Groups (GDG) Lisbon
**Speaker:** Nuno Andrade
**Theme:** Google Light / White Background (`#FFFFFF` / `#F8F9FA` • `#4285F4` `#EA4335` `#FBBC04` `#34A853`)
**Stack:** Plain JavaScript (ES Modules, Node.js 22+) • `@google/adk` • Local Ollama (`gemma4:e2b`) • React + Vite (`question-interface`)

---

## Slide 1 — Workshop Architecture & Folder Structure

Every step lives in its own folder (`step-01-setup` to `step-05-grading-complete`), study notes live in `data/[area]/[content files]`, and the React UI lives in `question-interface/`:

```text
examprep/
├── data/                         # Pass any <area> folder as a parameter!
│   ├── javascript/
│   │   ├── 01-event-loop-async.md
│   │   └── 02-closures-scopes.md
│   ├── ai-agents/
│   │   ├── 01-adk-fundamentals.md
│   │   └── 02-rag-and-gemma.md
│   └── cloud/
│       ├── 01-containers-and-scaling.md
│       └── 02-caching-and-cdns.md
├── src/shared/
│   ├── content-loader.js         # Loads & searches data/[area]/*.md (or customContent)
│   └── ollama-llm.js             # Minimal ADK BaseLlm adapter for local Ollama
├── step-01-setup/                # cd step-01-setup && node index.js <area>
├── step-02-rag/                  # cd step-02-rag && node index.js <area>
├── step-03-exam-gen/             # cd step-03-exam-gen && node index.js <area>
├── step-04-socratic-agent/       # cd step-04-socratic-agent && node index.js <area>
├── step-05-grading-complete/     # cd step-05-grading-complete && node index.js <area>
└── question-interface/           # React + Vite Web UI (?area=javascript)
```

---

## Slide 2 — Step 0.1: Install Node.js 22+ & Ollama Runtime

```bash
# 1. Verify Node.js 22+ (includes native fetch & ES Modules)
node --version   # v22.x or higher
npm --version

# 2. Install Ollama (Linux)
curl -fsSL https://ollama.com/install.sh | sh

# macOS alternative:
# brew install ollama && ollama serve

# 3. Verify Ollama daemon is listening on 127.0.0.1:11434
curl http://127.0.0.1:11434/api/tags
```

---

## Slide 3 — Step 0.2: Pull Local `gemma4:e2b` & Install Workspace Packages

```bash
# 1. Pull the local Gemma 4 model into Ollama
ollama pull gemma4:e2b

# 2. Quick sanity check in terminal
ollama run gemma4:e2b "Say hello in one sentence."

# 3. Clone / enter the project and install dependencies once at the root
cd examprep
npm install
```

Root `package.json` uses `"type": "module"`, npm workspaces, and convenient scripts for every step and UI server:

```json
{
  "name": "gemma4-adk-examprep-workshop",
  "type": "module",
  "workspaces": [
    "step-01-setup",
    "step-02-rag",
    "step-03-exam-gen",
    "step-04-socratic-agent",
    "step-05-grading-complete",
    "question-interface"
  ],
  "scripts": {
    "dev": "concurrently -n api,ui,slides -c green,cyan,magenta \"npm run server\" \"npm run ui\" \"npm run slides\"",
    "step01": "node step-01-setup/index.js",
    "step02": "node step-02-rag/index.js",
    "step03": "node step-03-exam-gen/index.js",
    "step04": "node step-04-socratic-agent/index.js",
    "step04:web": "adk web step-04-socratic-agent/index.js --compile false --bundle false",
    "step05": "node step-05-grading-complete/index.js",
    "server": "node step-05-grading-complete/server.js",
    "ui": "npm --prefix question-interface run dev",
    "ui:build": "npm --prefix question-interface run build",
    "slides": "node src/shared/serve-slides.js",
    "test:all": "node src/shared/test-all.js"
  }
}
```

And each step folder (`step-01-setup` through `step-05-grading-complete`) has a clean `package.json`:

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

---

## Slide 4 — Adding Content: `data/[area]/[content files]`

Drop any `.md` or `.txt` files inside `data/<area>/`. The loader automatically splits sections by `## ` headings:

```markdown
<!-- data/javascript/01-event-loop-async.md -->
# Event Loop, Microtasks & Async JavaScript

## Slide 1: The Single-Threaded Runtime Model
JavaScript executes code on a single main thread using the Call Stack, Web/Node APIs, and Queues.

## Slide 2: Microtask Queue vs. Macrotask Queue
- **Macrotasks:** `setTimeout`, `setInterval`, I/O callbacks
- **Microtasks:** `Promise.then`, `queueMicrotask`, `await` continuations
- **Priority:** `Sync Code -> All Microtasks -> Next Macrotask`
```

---

## Slide 5 — Shared Helper 1: `src/shared/content-loader.js` (Loading Area Files)

Reads the `<area>` parameter from the CLI (`node index.js <area>`) or accepts a `customContent` Markdown string from the UI:

```javascript
// src/shared/content-loader.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../data');

export function getAreaArg(defaultArea = 'javascript') {
  const args = process.argv.slice(2).filter((a) => a !== '--demo');
  for (const arg of args) {
    if (arg.startsWith('--area=')) return arg.split('=')[1];
    if (!arg.startsWith('-')) return arg;
  }
  return process.env.AREA || defaultArea;
}

export function loadAreaContent(area = 'javascript', customContent = '') {
  const areaPath = path.join(DATA_DIR, area);
  const files = [];
  const chunks = [];

  if (customContent && customContent.trim()) {
    files.push({ file: 'custom-parameter.md', content: customContent.trim() });
    chunks.push(...chunkMarkdownContent(area, 'custom-parameter.md', customContent));
  } else {
    for (const entry of fs.readdirSync(areaPath, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.(md|txt)$/i.test(entry.name)) continue;
      const raw = fs.readFileSync(path.join(areaPath, entry.name), 'utf-8');
      files.push({ file: entry.name, content: raw.trim() });
      chunks.push(...chunkMarkdownContent(area, entry.name, raw));
    }
  }
  return { area, files, chunks };
}
```

---

## Slide 6 — Shared Helper 2: `src/shared/content-loader.js` (Keyword Search)

Scores each Markdown chunk against the search query terms (with a bonus for heading matches):

```javascript
// src/shared/content-loader.js
export function searchAreaContent({ area = 'javascript', query = '', topK = 3, customContent = '' } = {}) {
  const { area: resolvedArea, chunks } = loadAreaContent(area, customContent);
  if (!query || !query.trim()) {
    return { area: resolvedArea, query, results: chunks.slice(0, topK) };
  }

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const scored = chunks.map((chunk) => {
    const haystack = `${chunk.docTitle} ${chunk.heading} ${chunk.content}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 1;
        if (chunk.heading.toLowerCase().includes(term)) score += 1.5;
      }
    }
    return { ...chunk, score: Number(score.toFixed(2)) };
  });

  scored.sort((a, b) => b.score - a.score);
  return { area: resolvedArea, query, results: scored.slice(0, topK) };
}
```

---

## Slide 7 — Shared Helper 3: `src/shared/ollama-llm.js` (ADK `BaseLlm` Adapter)

Connects `@google/adk` to local Ollama (`http://127.0.0.1:11434/api/chat`) using Node's built-in `fetch`:

```javascript
// src/shared/ollama-llm.js
import { BaseLlm, InMemoryRunner } from '@google/adk';

export async function ollamaChat({ model = 'gemma4:e2b', messages, tools, format, options }) {
  const res = await fetch('http://127.0.0.1:11434/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, messages, tools, format, options, stream: false }),
  });
  return res.json();
}

export class OllamaGemmaLlm extends BaseLlm {
  constructor({ model = 'gemma4:e2b', temperature = 0.2 } = {}) {
    super({ model });
    this.model = model;
    this.temperature = temperature;
  }

  async *generateContentAsync(llmRequest) {
    // Converts ADK contents & tool declarations -> Ollama messages & tools
    const response = await ollamaChat({
      model: this.model,
      messages: buildOllamaMessages(llmRequest),
      tools: buildOllamaTools(llmRequest),
      options: { temperature: this.temperature },
    });

    const msg = response.message || {};
    if (msg.tool_calls?.length) {
      yield {
        content: {
          role: 'model',
          parts: msg.tool_calls.map((tc) => ({
            functionCall: { name: tc.function.name, args: tc.function.arguments },
          })),
        },
      };
      return;
    }
    yield { content: { role: 'model', parts: [{ text: msg.content || '' }] } };
  }
}
```

---

## Slide 8 — Step 01: Setup & Hello Gemma 4 (`step-01-setup/index.js`)

Enter `step-01-setup` and pass any area folder name (`javascript`, `ai-agents`, `cloud`):

```bash
cd step-01-setup
npm start javascript        # or: node index.js javascript
# From workspace root: npm run step01 -- javascript
```

```javascript
// step-01-setup/index.js
import { LlmAgent } from '@google/adk';
import { OllamaGemmaLlm, runAgentTurn, ollamaListModels, DEFAULT_MODEL } from '../src/shared/ollama-llm.js';
import { getAreaArg, loadAreaContent } from '../src/shared/content-loader.js';

const area = getAreaArg('javascript');
const { files } = loadAreaContent(area);
const tags = await ollamaListModels();

const agent = new LlmAgent({
  name: 'setup_check_agent',
  model: new OllamaGemmaLlm({ model: DEFAULT_MODEL, temperature: 0.2 }),
  instruction: `You are a concise study assistant for the "${area}" topic area.
Loaded files from data/${area}/: ${files.map((f) => f.file).join(', ')}.`,
});

const reply = await runAgentTurn({
  agent,
  prompt: `Hello! Confirm you are online and mention one concept we can study in "${area}".`,
});
console.log(reply);
```

---

## Slide 9 — Step 02: Area Content RAG Tool (`step-02-rag/index.js`)

Wraps `searchAreaContent` inside a Google ADK `FunctionTool` with a Zod schema:

```bash
cd ../step-02-rag
npm start javascript        # or: node index.js cloud "horizontal scaling cache-aside"
# From workspace root: npm run step02 -- javascript
```

```javascript
// step-02-rag/index.js
import { FunctionTool, LlmAgent } from '@google/adk';
import { z } from 'zod';
import { OllamaGemmaLlm, runAgentTurn } from '../src/shared/ollama-llm.js';
import { getAreaArg, searchAreaContent } from '../src/shared/content-loader.js';

export function createAreaSearchTool(area = 'javascript', customContent = '') {
  return new FunctionTool({
    name: 'search_area_content',
    description: `Searches the study notes in data/${area}/ for relevant sections.`,
    parameters: z.object({
      query: z.string().describe('Keywords or topic to search in the area markdown files'),
    }),
    execute: async ({ query }) => searchAreaContent({ area, query, topK: 3, customContent }),
  });
}

const area = getAreaArg('javascript');
const ragAgent = new LlmAgent({
  name: 'area_rag_assistant',
  model: new OllamaGemmaLlm({ temperature: 0.2 }),
  tools: [createAreaSearchTool(area)],
  instruction: `Always call "search_area_content" first to retrieve notes from data/${area}/ and cite the file name.`,
});
```

---

## Slide 10 — Step 03: Structured Exam & Rubric Generator (`step-03-exam-gen/index.js`)

Retrieves chunks from `data/[area]/` and forces Gemma 4 to output a validated 20-point JSON exam + rubric:

```bash
cd ../step-03-exam-gen
npm start javascript        # or: node index.js javascript "Event Loop and Closures"
# From workspace root: npm run step03 -- javascript
```

```javascript
// step-03-exam-gen/index.js
export async function generateExamQuestion({ area = 'javascript', topic = '', customContent = '' } = {}) {
  const rag = searchAreaContent({ area, query: topic || area, topK: 4, customContent });
  const contextText = rag.results
    .map((r) => `[Source: ${r.file} - ${r.heading}]\n${r.excerpt}`)
    .join('\n\n');

  const response = await ollamaChat({
    model: DEFAULT_MODEL,
    messages: [
      {
        role: 'system',
        content: 'You are an exam designer. Return valid JSON matching the schema grounded strictly in the notes.',
      },
      {
        role: 'user',
        content: `Create a 20-point exam question for area "${area}" on "${topic || area}".\n\nNotes:\n${contextText}`,
      },
    ],
    format: EXAM_JSON_SCHEMA,
    options: { temperature: 0.2 },
  });

  return ExamQuestionSchema.parse(JSON.parse(response.message.content));
}
```

---

## Slide 11 — Step 04: Socratic Study Mentor Agent (`step-04-socratic-agent/index.js`)

Uses `InMemoryRunner` + `createAreaSearchTool(area)` to give multi-turn hints without spoiling the final answer:

```bash
cd ../step-04-socratic-agent
npm start javascript        # or: node index.js javascript
npm run web                 # Launch Google ADK Web UI on http://localhost:8000
# From workspace root: npm run step04 -- javascript (or npm run step04:web)
```

```javascript
// step-04-socratic-agent/index.js
import { InMemoryRunner, LlmAgent } from '@google/adk';
import { OllamaGemmaLlm, runAgentTurn } from '../src/shared/ollama-llm.js';
import { loadAreaContent } from '../src/shared/content-loader.js';
import { createAreaSearchTool } from '../step-02-rag/index.js';

export function createSocraticMentorAgent({ area = 'javascript', customContent = '' } = {}) {
  const { files } = loadAreaContent(area, customContent);
  return new LlmAgent({
    name: 'socratic_study_mentor',
    model: new OllamaGemmaLlm({ temperature: 0.3 }),
    tools: [createAreaSearchTool(area, customContent)],
    instruction: `You are a Socratic Study Mentor for "${area}" (files: ${files.map((f) => f.file).join(', ')}).
1. NEVER give the complete final exam answer immediately.
2. Use "search_area_content" to check the study notes in data/${area}/.
3. Give a brief hint (2-4 sentences) and end with ONE guiding question.`,
  });
}

// Exported for `adk web` (Google ADK DevTools Web UI)
export const rootAgent = createSocraticMentorAgent({
  area: process.env.AREA || 'javascript',
});
```

---

## Slide 12 — Step 05: Deterministic Rubric Grader (`step-05-grading-complete/index.js`)

Grades any student Markdown answer against the rubric criteria and reference chunks from `data/[area]/`:

```bash
cd ../step-05-grading-complete
npm start javascript        # or: node index.js javascript
# From workspace root: npm run step05 -- javascript
```

```javascript
// step-05-grading-complete/index.js
export async function evaluateStudentAnswer({ area = 'javascript', exam, studentAnswer, customContent = '' }) {
  const rag = searchAreaContent({ area, query: exam.questionPrompt, topK: 3, customContent });
  const referenceNotes = rag.results.map((r) => `[${r.file} - ${r.heading}]\n${r.excerpt}`).join('\n\n');

  const response = await ollamaChat({
    model: DEFAULT_MODEL,
    messages: [
      { role: 'system', content: 'You are a fair, deterministic technical exam grader. Return valid JSON.' },
      {
        role: 'user',
        content: `QUESTION:\n${exam.questionPrompt}\n\nRUBRIC:\n${JSON.stringify(exam.rubric)}\n\nNOTES:\n${referenceNotes}\n\nSTUDENT ANSWER:\n${studentAnswer}`,
      },
    ],
    format: EVALUATION_JSON_SCHEMA,
    options: { temperature: 0.1 },
  });

  return EvaluationSchema.parse(JSON.parse(response.message.content));
}
```

---

## Slide 13 — Step 05 Express Server (`step-05-grading-complete/server.js`)

Exposes REST endpoints that accept `area` (`data/[area]/`) and optional `customContent` parameters:

```bash
cd step-05-grading-complete
npm run server
# Listening on http://localhost:3000
```

```javascript
// step-05-grading-complete/server.js
app.get('/api/status', async (req, res) => {
  const area = req.query.area || 'javascript';
  const areaData = loadAreaContent(area);
  res.json({ areas: listAreas(), currentArea: areaData.area, files: areaData.files });
});

app.post('/api/rag/search', (req, res) => {
  const { area = 'javascript', query = '', topK = 4, customContent = '' } = req.body;
  res.json(searchAreaContent({ area, query, topK, customContent }));
});

app.post('/api/exam/generate', async (req, res) => {
  const { area = 'javascript', topic = '', customContent = '' } = req.body;
  res.json({ exam: await generateExamQuestion({ area, topic, customContent }) });
});

app.post('/api/socratic/chat', async (req, res) => { /* ... */ });
app.post('/api/grade/evaluate', async (req, res) => { /* ... */ });
```

---

## Slide 14 — React Web Interface: Passing `area` & `customContent` Parameters

In `question-interface/src/App.jsx`, the active `area` and optional `customContent` are read from URL query parameters (`?area=javascript&content=...`) and synced with the Header controls:

```jsx
// question-interface/src/App.jsx
function getInitialAreaFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('area') || 'javascript';
}

export function App() {
  const [area, setArea] = useState(getInitialAreaFromUrl);
  const [customContent, setCustomContent] = useState(
    () => new URLSearchParams(window.location.search).get('content') || ''
  );

  const handleSelectArea = (nextArea) => {
    setArea(nextArea);
    const url = new URL(window.location.href);
    url.searchParams.set('area', nextArea);
    window.history.replaceState({}, '', url.toString());
  };
  // Passes { area, customContent } to /api/rag/search, /api/exam/generate, /api/socratic/chat, /api/grade/evaluate
}
```

---

## Slide 15 — React Web Interface: `<MarkdownPreview />` & `<MarkdownBox />`

Most boxes in the UI render formatted Markdown by default, with `Markdown Preview | Split | Edit MD` tabs on editable boxes:

```jsx
// question-interface/src/components/MarkdownPreview.jsx
export function MarkdownBox({
  label,
  badge,
  value,
  onChange,
  defaultMode = 'preview',
  readOnly = false,
}) {
  const [mode, setMode] = useState(defaultMode);
  const effectiveMode = readOnly ? 'preview' : mode;

  return (
    <div className="md-box-wrapper">
      <div className="md-box-toolbar">
        <span>{label}</span>
        {!readOnly && (
          <div className="md-mode-tabs">
            {['preview', 'split', 'edit'].map((tab) => (
              <button key={tab} onClick={() => setMode(tab)}>
                {tab === 'preview' ? 'Markdown Preview' : tab === 'split' ? 'Split' : 'Edit MD'}
              </button>
            ))}
          </div>
        )}
      </div>
      {effectiveMode === 'preview' && <MarkdownPreview content={value} />}
      {effectiveMode === 'edit' && <textarea value={value} onChange={(e) => onChange(e.target.value)} />}
    </div>
  );
}
```

---

## Slide 16 — Running Everything End-to-End

```bash
# Run any step from its folder:
cd step-01-setup && npm start javascript
cd ../step-02-rag && npm start javascript
cd ../step-03-exam-gen && npm start javascript
cd ../step-04-socratic-agent && npm start javascript
cd ../step-05-grading-complete && npm start javascript

# Or run from the root package.json scripts:
npm run step01 -- javascript
npm run step02 -- ai-agents
npm run step03 -- cloud
npm run step04 -- javascript
npm run step05 -- javascript
npm run test:all -- javascript

# Run Web UI + API Server + Slides together with concurrently:
npm run dev
```
