# Workshop Guide: AI Exam Prep in Plain JavaScript

## 1. Content Folder Convention (`data/[area]/[content files]`)

Add any new study topic simply by creating a folder under `data/` with `.md` files inside:

```text
data/
├── javascript/
│   ├── 01-event-loop-async.md
│   └── 02-closures-scopes.md
├── ai-agents/
│   ├── 01-adk-fundamentals.md
│   └── 02-rag-and-gemma.md
└── cloud/
    ├── 01-containers-and-scaling.md
    └── 02-caching-and-cdns.md
```

## 2. Passing the Content Parameter

### In the CLI Steps
Pass the `<area>` folder name as the first CLI argument to any step:
```bash
cd step-01-setup && node index.js javascript
cd ../step-02-rag && node index.js ai-agents "FunctionTool RAG"
cd ../step-03-exam-gen && node index.js cloud "Horizontal Scaling and Caching"
cd ../step-04-socratic-agent && node index.js javascript
cd ../step-05-grading-complete && node index.js javascript
```

### In the React Web Interface (`question-interface`)
1. **URL Query Parameter**: Open `http://localhost:5173/?area=javascript` (or `?area=ai-agents`, `?area=cloud`).
2. **Header Area Selector**: Switch between `data/[area]/` folders in the header dropdown.
3. **Custom Content Parameter (`customContent`)**: Click **"+ Pass Custom Content Parameter"** in the header (or pass `?content=...` in the URL) to send custom Markdown notes directly to the backend API endpoints (`/api/rag/search`, `/api/exam/generate`, `/api/socratic/chat`, `/api/grade/evaluate`).
