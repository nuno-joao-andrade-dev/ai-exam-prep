# AI Exam Prep with Google ADK & Local Gemma 4 (JavaScript Workshop)

A simple, code-first **JavaScript (ES Modules)** workshop demonstrating how to build an offline AI Exam Prep system using **`@google/adk`** and local **Ollama (`gemma4:e2b`)**.

## Directory Structure

All study materials live in **`data/[area]/[content files]`** and are passed as an `<area>` parameter to each step or to the React web interface:

```text
examprep/
├── data/
│   ├── javascript/               # Area: "javascript"
│   │   ├── 01-event-loop-async.md
│   │   └── 02-closures-scopes.md
│   ├── ai-agents/                # Area: "ai-agents"
│   │   ├── 01-adk-fundamentals.md
│   │   └── 02-rag-and-gemma.md
│   └── cloud/                    # Area: "cloud"
│       ├── 01-containers-and-scaling.md
│       └── 02-caching-and-cdns.md
├── src/shared/
│   ├── content-loader.js         # Loads & searches data/[area]/*.md (or customContent param)
│   └── ollama-llm.js             # Minimal ADK BaseLlm adapter for local Ollama Gemma 4
├── step-01-setup/                # Step 1: Verify Ollama + ADK LlmAgent
├── step-02-rag/                  # Step 2: ADK FunctionTool over data/[area]/
├── step-03-exam-gen/             # Step 3: Structured JSON exam + rubric generator
├── step-04-socratic-agent/       # Step 4: Multi-turn Socratic Study Mentor agent
├── step-05-grading-complete/     # Step 5: Deterministic grader + Express API + OpenAPI/Swagger
└── step-06-web-ui/               # Step 6 (Optional): IADE-inspired React Student Web UI (:5173)
```

---

## Step 0: Installation

```bash
# 1. Install Ollama & pull the local Gemma 4 model
ollama pull gemma4:e2b

# 2. Install workspace dependencies
npm install
```

### Offline Classroom Model Setup (`OLLAMAMODEL` USB Drive)

To install `gemma4:e2b` from the **`OLLAMAMODEL`** USB drive without downloading from the internet (full details in **[OFFLINE-MODEL-SETUP.md](OFFLINE-MODEL-SETUP.md)**):

- **Windows (PowerShell):**
  ```powershell
  $usb = (Get-Volume -FileSystemLabel "OLLAMAMODEL").DriveLetter + ":"
  New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.ollama\models"
  Copy-Item -Path "$usb\models\*" -Destination "$env:USERPROFILE\.ollama\models\" -Recurse -Force
  ollama list
  ```
- **macOS (Terminal):**
  ```bash
  mkdir -p ~/.ollama/models
  cp -rv /Volumes/OLLAMAMODEL/models/* ~/.ollama/models/
  ollama list
  ```
- **Linux (Terminal):**
  ```bash
  # Systemd service install (/usr/share/ollama/.ollama/models):
  sudo mkdir -p /usr/share/ollama/.ollama/models
  sudo cp -rv /run/media/$USER/OLLAMAMODEL/models/* /usr/share/ollama/.ollama/models/
  sudo chown -R ollama:ollama /usr/share/ollama/.ollama/models

  # Or user install (~/.ollama/models):
  mkdir -p ~/.ollama/models && cp -rv /run/media/$USER/OLLAMAMODEL/models/* ~/.ollama/models/
  ollama list
  ```

---

## Running Each Step (`npm start <area>` or `npm run step0X -- <area>`)

You can pass any folder name inside `data/` (`javascript`, `ai-agents`, `cloud`, or your own folder) as a CLI parameter either from inside each step folder or from the root `package.json`:

### Option A: Inside Each Step Folder
```bash
cd step-01-setup && npm start javascript
cd ../step-02-rag && npm start javascript
cd ../step-03-exam-gen && npm start javascript
cd ../step-04-socratic-agent && npm start javascript
cd ../step-04-socratic-agent && npm run web     # Launch ADK DevTools Web UI (http://localhost:8000)
cd ../step-05-grading-complete && npm start javascript
cd ../step-06-web-ui && npm start javascript    # Optional Step 6: IADE React Student UI + Step 5 API
```

### Option B: From Root `package.json` Scripts
```bash
npm run step01 -- javascript
npm run step02 -- ai-agents
npm run step03 -- cloud "Horizontal Scaling and Caching"
npm run step04 -- javascript
npm run step04:web                              # Launch ADK DevTools Web UI (http://localhost:8000)
npm run step05 -- javascript
npm run step06 -- javascript                    # Optional Step 6: Starts Step 5 API (:3000) + IADE React UI (:5173)
npm run test:all -- javascript
```

---

## Running Web UI + API Server + Slides (`concurrently`)

```bash
# Launch Express API (3000) + React UI (5173) + Slides (3030) together:
npm run dev

# Or run each service individually:
npm run server     # Express API backend + OpenAPI/Swagger UI (http://localhost:3000)
npm run ui         # React Vite dev server (http://localhost:5173)
npm run slides     # Slide Deck (http://localhost:3030)
```

- **OpenAPI / Swagger UI (Root)**: Visit `http://localhost:3000/` for interactive Swagger UI documentation (or `http://localhost:3000/openapi.json` / `http://localhost:3000/?format=json` for the raw OpenAPI 3.0.3 JSON spec).
- **Area Parameter**: Pass the area parameter via URL (`http://localhost:5173/?area=javascript`, `?area=ai-agents`, `?area=cloud`), select it in the top header dropdown, or click **"+ Pass Custom Content Parameter"** to pass raw Markdown directly as a parameter.
