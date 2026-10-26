# GDG Lisbon • React Web Question Interface

## Objective
Modern **React 19 + TypeScript + Vite** web interface for the Autonomous Exam Prep & Faculty Simulator workshop.

## Key Capabilities
1. **Interactive Exam Question Paper**:
   - Multiple Choice Questions (MCQs) with instant quorum verification, correct answer explanation, and lecture citations.
   - Open Analytical Questions with LaTeX/code equations, student answer drafting area, and 1-click test buttons (`Exemplar (A)`, `Partial (C)`, `Flawed (F)`).
   - **"Submit for Live AI Grading"** button evaluated against Google ADK analytic rubrics.
2. **Live Rubric Scorecard & Auto-Remediation**:
   - Calculated points, percentage, and letter grade (`A`, `B`, `C`, `F`).
   - Criterion-by-criterion breakdown with matched keywords vs missing concepts.
   - **Automated Lecture Slide Remediation Cards**: clickable slide cards with title, module, and citation so students know exactly what lecture/slide to review!
3. **Socratic Mentor Office Hours Chat**:
   - Conversational assistant with strict pedagogical guardrails.
   - Dynamic 3-stage hint escalator (Level 1 Hint $\rightarrow$ Level 2 Clue $\rightarrow$ Level 3 What-If).
4. **Curriculum RAG Explorer**:
   - Real-time Hybrid Vector Search across lecture slides and formula PDF sheets.

## How to Execute

### Option A: Development Server (Vite)
```bash
cd question-interface
npm run dev
# Opens on http://localhost:5173 (proxies /api to http://localhost:4000)
```

### Option B: Production Build
```bash
cd question-interface
npm run build
# Compiles to question-interface/dist/
```

### Option C: Complete Stack Server (Step 5)
```bash
cd step-05-grading-complete
npm run server
# Serves the compiled React Question Interface + API on http://localhost:4000
```
