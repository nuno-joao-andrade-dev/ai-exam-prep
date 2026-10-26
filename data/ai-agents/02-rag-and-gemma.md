# Local LLM Inference with Gemma 4, Ollama & RAG

## Slide 1: Why Run Gemma 4 Locally with Ollama?
- **Zero API Token Costs**: Unlimited exam generation, RAG indexing, and Socratic tutoring with $0.00 cloud billing.
- **100% Data Privacy**: Course documents, unpublished exams, and student submissions never leave `127.0.0.1:11434`.
- **Quantization (`Q4_K_M`)**: Compresses model weights from 16-bit (`FP16`) to 4-bit integers, reducing RAM usage by ~3.5x while preserving reasoning quality.

## Slide 2: Retrieval-Augmented Generation (RAG)
- **Chunking by Slide / Heading**: Splitting `.md` files by `## ` headings keeps each concept self-contained with its source filename and section title.
- **Lexical + Semantic Retrieval**:
  - **Keyword / TF-IDF Matching**: Captures exact function names, formulas, and identifiers (e.g., `InMemoryRunner`, `Promise.allSettled`).
  - **Dense Embeddings**: Captures semantic meaning when a student paraphrases a question.

## Slide 3: Rubric-Based Automated Grading
- **Analytic Rubric**: Breaks an open-ended question into explicit criteria, each with `maxPoints`, `requiredKeywords`, and a `citation`.
- **Targeted Remediation**: When a student misses criteria in their submission, the grader queries the `data/<area>` knowledge base and returns the exact markdown sections they need to review.
