# Google ADK for Node.js & Agent Orchestration

## Slide 1: Core Primitives of Google ADK
- **`BaseLlm`**: The model adapter interface that connects Google ADK to any local or cloud LLM (such as **Gemma 4** running on **Ollama**).
- **`LlmAgent`**: Defines an autonomous agent with a `name`, `model`, `instruction` (system prompt), and `tools` array.
- **`FunctionTool`**: Wraps a JavaScript function with a `zod` parameter schema so the LLM can invoke deterministic code.
- **`InMemoryRunner`**: Manages `session.state`, executes the ReAct tool-calling loop, and yields streaming events via `runner.runAsync()`.

## Slide 2: The ReAct Loop (Reason + Act)
- Instead of answering from static weights alone, an ADK agent follows a multi-step loop:
  1. **Thought / Tool Selection**: The model inspects user input and emits a structured `functionCall` matching the tool's `zod` schema.
  2. **Deterministic Execution**: ADK validates the arguments, runs `execute(args, toolContext)`, and stores state in `toolContext.state`.
  3. **Observation & Final Answer**: ADK feeds the `functionResponse` back to the model to synthesize a grounded answer.

## Slide 3: Socratic Guardrails & Session State
- **Pedagogical Guardrail**: A Socratic Mentor agent is instructed **never** to hand over the direct answer.
- **Progressive Hint State**: Using `toolContext.state.set('hintLevel', level)`, the agent tracks whether the student needs:
  - **Level 1**: High-level conceptual question + slide citation.
  - **Level 2**: Specific formula or code pattern pointer.
  - **Level 3**: Step-by-step decomposition of the problem.
