export const AREA_DEFAULTS = {
  javascript: {
    label: 'JavaScript (`data/javascript/`)',
    defaultTopic: 'Event Loop, Microtasks vs Macrotasks, and Closures',
    defaultSearchQuery: 'microtask queue promise setTimeout closure',
    sampleAnswer: `### 1. Microtasks vs Macrotasks Execution Order

When the synchronous call stack empties, the JavaScript **Event Loop** drains **all** queued microtasks (\`Promise.then\`, \`queueMicrotask\`) before picking the next macrotask (\`setTimeout\`, \`setInterval\`).

\`\`\`javascript
console.log('1: sync');
setTimeout(() => console.log('2: macrotask'), 0);
Promise.resolve().then(() => console.log('3: microtask'));
console.log('4: sync');
// Output: 1: sync -> 4: sync -> 3: microtask -> 2: macrotask
\`\`\`

### 2. Lexical Closures & Loop Trap Fix

A **closure** retains references to its outer lexical scope even after the outer function returns. Using \`var\` in a \`for\` loop shares a single function-scoped binding across callbacks, whereas \`let\` creates a fresh block-scoped binding per iteration.`,
    exam: {
      examTitle: 'JavaScript Runtime & Closures Assessment',
      area: 'javascript',
      questionNumber: 1,
      totalPoints: 20,
      scenarioContext:
        'You are debugging a Node.js service where `Promise.then` callbacks and `setTimeout` timers execute in an unexpected order, and a loop of asynchronous handlers logs stale loop counter values (`01-event-loop-async.md`, `02-closures-scopes.md`).',
      questionPrompt:
        '1. **(10 pts)** Explain the difference between the **Microtask Queue** and the **Macrotask Queue** in the JavaScript Event Loop, including the exact console output order for mixed `Promise.resolve().then(...)` and `setTimeout(..., 0)` calls.\n2. **(10 pts)** Explain what a **lexical closure** is, why `for (var i = 0; i < 3; i++)` with `setTimeout` prints `3, 3, 3`, and how `let` or an IIFE fixes it.',
      expectedKeyFormulasOrConcepts: [
        'Call stack executes synchronous code first (LIFO)',
        'All microtasks (Promise.then, queueMicrotask) run before the next macrotask (setTimeout)',
        'Closure = function + retained reference to outer lexical environment',
        'var is function-scoped (shared binding) vs let is block-scoped (per-iteration binding)',
      ],
      rubric: [
        {
          id: 'C1',
          criterion: 'Event Loop & Microtask vs Macrotask Order',
          maxPoints: 10,
          fullMarksDescription:
            'Explains that the call stack empties first, then the entire Microtask Queue (Promises) drains completely before the Event Loop takes the next Macrotask (setTimeout).',
          partialMarksDescription:
            'Mentions Promises and setTimeout but confuses which queue drains completely between ticks.',
          zeroMarksDescription: 'Incorrect execution order or missing explanation.',
        },
        {
          id: 'C2',
          criterion: 'Lexical Closures & Loop Scope Fix',
          maxPoints: 10,
          fullMarksDescription:
            'Defines lexical closure accurately and contrasts shared function-scoped var with per-iteration block-scoped let.',
          partialMarksDescription:
            'Fixes the loop with let but does not explain lexical environment capture.',
          zeroMarksDescription: 'Does not explain closures or scope bindings.',
        },
      ],
    },
  },
  'ai-agents': {
    label: 'AI Agents (`data/ai-agents/`)',
    defaultTopic: 'Google ADK LlmAgent, FunctionTool, and Local RAG with Gemma 4',
    defaultSearchQuery: 'LlmAgent FunctionTool BaseLlm RAG grounding',
    sampleAnswer: `### 1. Google ADK Components (\`LlmAgent\`, \`FunctionTool\`, \`InMemoryRunner\`)

- **\`LlmAgent\`**: Defines the agent identity, system \`instruction\`, \`model\` adapter (\`OllamaGemmaLlm\`), and available \`tools\`.
- **\`FunctionTool\`**: Wraps a JavaScript function with a **Zod \`parameters\` schema** so the model can emit structured tool calls.
- **\`InMemoryRunner\`**: Manages session state and executes the agent turn loop (sending tool outputs back to the model).

### 2. Local RAG Grounding with \`data/[area]\`

Before generating an exam or grading, the agent calls \`searchAreaContent({ area, query })\` to retrieve matching Markdown chunks from \`data/ai-agents/\` so responses stay grounded in the local files rather than hallucinating.`,
    exam: {
      examTitle: 'AI Agents with Google ADK & Local Gemma 4',
      area: 'ai-agents',
      questionNumber: 1,
      totalPoints: 20,
      scenarioContext:
        'You are building an offline exam prep workflow using `@google/adk` and a local Ollama `gemma4:e2b` model (`01-adk-fundamentals.md`, `02-rag-and-gemma.md`).',
      questionPrompt:
        '1. **(10 pts)** Describe the roles of `LlmAgent`, `FunctionTool`, and `InMemoryRunner` in `@google/adk`, and explain why `BaseLlm` is extended for local Ollama models.\n2. **(10 pts)** Explain how local **Retrieval-Augmented Generation (RAG)** over `data/[area]/` prevents hallucination and why structured JSON schemas are used for grading.',
      expectedKeyFormulasOrConcepts: [
        'LlmAgent configures instruction, model, and tools',
        'FunctionTool exposes Zod-typed parameters to the LLM',
        'InMemoryRunner manages sessions and the tool-execution loop',
        'RAG grounds generation in retrieved local Markdown chunks from data/[area]/',
      ],
      rubric: [
        {
          id: 'C1',
          criterion: 'Google ADK Architecture & Custom BaseLlm',
          maxPoints: 10,
          fullMarksDescription:
            'Clearly explains LlmAgent, FunctionTool (with Zod schema), InMemoryRunner, and how BaseLlm bridges ADK to local Ollama chat calls.',
          partialMarksDescription:
            'Names the ADK classes but misses how tool calls or sessions are orchestrated.',
          zeroMarksDescription: 'No explanation of ADK components.',
        },
        {
          id: 'C2',
          criterion: 'Local RAG Grounding & Structured Output',
          maxPoints: 10,
          fullMarksDescription:
            'Explains chunk retrieval + keyword scoring over data/[area]/ files and how JSON schema validation guarantees deterministic grading output.',
          partialMarksDescription:
            'Mentions RAG generally without connecting it to local files or structured schemas.',
          zeroMarksDescription: 'Missing RAG and structured output explanation.',
        },
      ],
    },
  },
  cloud: {
    label: 'Cloud (`data/cloud/`)',
    defaultTopic: 'Containers, Horizontal Scaling, Load Balancing, and Caching Strategies',
    defaultSearchQuery: 'horizontal scaling load balancer cache-aside TTL thundering herd',
    sampleAnswer: `### 1. Horizontal Scaling & Stateless Load Balancing

- **Horizontal Scaling (Scale Out)** adds more container instances behind a load balancer, avoiding the hardware ceiling and single point of failure of vertical scaling.
- Services must remain **stateless** (storing sessions in Redis or a database) so any replica can handle any request, while `/healthz` probes remove unhealthy containers automatically.

### 2. Cache-Aside Pattern & Thundering Herd Mitigation

1. Application checks cache first: on a **cache hit**, return immediately; on a **cache miss**, query the database, populate the cache with a **TTL**, and return.
2. To prevent a **thundering herd (cache stampede)** when a hot key expires, add **random jitter** to TTLs or use **request coalescing (singleflight)** so only one worker recomputes the value.`,
    exam: {
      examTitle: 'Cloud Containers, Scaling & Caching Assessment',
      area: 'cloud',
      questionNumber: 1,
      totalPoints: 20,
      scenarioContext:
        'A web API deployed in containers experiences traffic spikes and database overload whenever popular cached keys expire simultaneously (`01-containers-and-scaling.md`, `02-caching-and-cdns.md`).',
      questionPrompt:
        '1. **(10 pts)** Compare **Vertical Scaling** vs **Horizontal Scaling**, and explain why horizontal scaling requires **stateless services** and `/healthz` health checks.\n2. **(10 pts)** Contrast **Cache-Aside** vs **Write-Through** caching, and describe how to prevent a **Thundering Herd (Cache Stampede)** when a hot cache key expires.',
      expectedKeyFormulasOrConcepts: [
        'Horizontal scaling adds replicas behind a load balancer; requires statelessness',
        'Health checks (/healthz) remove failing instances from rotation',
        'Cache-Aside (lazy loading on miss) vs Write-Through (synchronous cache + DB write)',
        'Thundering Herd mitigated via TTL jitter or singleflight request coalescing',
      ],
      rubric: [
        {
          id: 'C1',
          criterion: 'Horizontal vs Vertical Scaling & Statelessness',
          maxPoints: 10,
          fullMarksDescription:
            'Contrasts scale-up vs scale-out, explains why in-memory session state breaks load balancing, and describes health check routing.',
          partialMarksDescription:
            'Defines horizontal scaling but omits statelessness or health checks.',
          zeroMarksDescription: 'Incorrect or missing scaling explanation.',
        },
        {
          id: 'C2',
          criterion: 'Caching Patterns & Thundering Herd Prevention',
          maxPoints: 10,
          fullMarksDescription:
            'Accurately compares Cache-Aside and Write-Through and proposes TTL jitter or request coalescing (singleflight) to stop cache stampedes.',
          partialMarksDescription:
            'Explains cache hit/miss but does not address thundering herd mitigation.',
          zeroMarksDescription: 'Missing caching and stampede explanation.',
        },
      ],
    },
  },
};

export function getAreaDefault(area) {
  return AREA_DEFAULTS[area] || AREA_DEFAULTS.javascript;
}
