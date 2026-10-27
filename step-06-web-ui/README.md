# Step 06 (Optional): React Student Web Interface (IADE Edition)

An optional **React + Vite** student portal inspired by the [IADE — Faculdade de Design, Tecnologia e Comunicação](https://www.iade.europeia.pt/) visual identity (`#000000` Stark Black, `#3cdbc0` Electric Mint, `#0047bb` Cobalt Blue, `#f000ff` Creative Magenta, and `Lato` typography).

It connects directly to the **Step 05 Express API (`step-05-grading-complete/server.js`)** on `http://localhost:3000`:

- **`GET /api/status`** — Discovers all available `data/[area]` folders (`javascript`, `ai-agents`, `cloud`) and checks local Ollama (`gemma4:e2b`) status.
- **`POST /api/exam/generate`** — Generates new exam questions and 100-point grading rubrics grounded in the selected `data/[area]`.
- **`POST /api/socratic/chat`** — Invokes the Step 04 Google ADK `LlmAgent` Socratic Coach for hints without spoiling the solution.
- **`POST /api/grade/evaluate`** — Evaluates the student's Markdown answer against the rubric criteria.
- **`POST /api/rag/search`** — Searches local Markdown chunks in `data/[area]`.

## Quick Start

From the repository root:

```bash
# Automatically starts Step 05 API (:3000) if needed + Step 06 React UI (:5173)
npm run step06

# Or launch with a specific initial study area:
npm run step06 -- ai-agents
```

Then open **`http://localhost:5173/?area=javascript`** in your browser.
