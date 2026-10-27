export const AREA_DEFAULTS = {
  javascript: {
    label: 'JavaScript & Runtime Engineering',
    facultyTag: 'Licenciatura • Engenharia & Web',
    description:
      'Event Loop, Microtasks vs Macrotasks, Lexical Closures, Promises, and Asynchronous Runtime Patterns.',
    defaultTopic: 'Event Loop, Microtasks vs Macrotasks, and Closures',
    topicPresets: [
      'Event Loop, Microtasks vs Macrotasks, and Closures',
      'Promises, Async/Await Error Handling & Promise.all vs allSettled',
      'Lexical Scope, Hoisting, Temporal Dead Zone & Memory Leaks',
    ],
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
      totalPoints: 100,
      scenarioContext:
        'You are debugging a Node.js service where `Promise.then` callbacks and `setTimeout` timers execute in an unexpected order, and a loop of asynchronous handlers logs stale loop counter values (`01-event-loop-async.md`, `02-closures-scopes.md`).',
      questionPrompt:
        '1. **(50 pts)** Explain the difference between the **Microtask Queue** and the **Macrotask Queue** in the JavaScript Event Loop, including the exact console output order for mixed `Promise.resolve().then(...)` and `setTimeout(..., 0)` calls.\n2. **(50 pts)** Explain what a **lexical closure** is, why `for (var i = 0; i < 3; i++)` with `setTimeout` prints `3, 3, 3`, and how `let` or an IIFE fixes it.',
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
          maxPoints: 50,
          fullMarksDescription:
            'Explains that the call stack empties first, then the entire Microtask Queue (Promises) drains completely before the Event Loop takes the next Macrotask (setTimeout).',
          partialMarksDescription:
            'Mentions Promises and setTimeout but confuses which queue drains completely between ticks.',
          zeroMarksDescription: 'Incorrect execution order or missing explanation.',
        },
        {
          id: 'C2',
          criterion: 'Lexical Closures & Loop Scope Fix',
          maxPoints: 50,
          fullMarksDescription:
            'Defines lexical closure accurately and contrasts shared function-scoped var with per-iteration block-scoped let.',
          partialMarksDescription:
            'Fixes the loop with let but does not explain lexical environment capture.',
          zeroMarksDescription: 'Does not explain closures or scope bindings.',
        },
      ],
    },
    questionDeck: [
      {
        examTitle: 'JavaScript Runtime & Closures Assessment',
        area: 'javascript',
        questionNumber: 1,
        totalPoints: 100,
        scenarioContext:
          'You are debugging a Node.js service where `Promise.then` callbacks and `setTimeout` timers execute in an unexpected order, and a loop of asynchronous handlers logs stale loop counter values (`01-event-loop-async.md`, `02-closures-scopes.md`).',
        questionPrompt:
          '1. **(50 pts)** Explain the difference between the **Microtask Queue** and the **Macrotask Queue** in the JavaScript Event Loop, including the exact console output order for mixed `Promise.resolve().then(...)` and `setTimeout(..., 0)` calls.\n2. **(50 pts)** Explain what a **lexical closure** is, why `for (var i = 0; i < 3; i++)` with `setTimeout` prints `3, 3, 3`, and how `let` or an IIFE fixes it.',
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
            maxPoints: 50,
            fullMarksDescription:
              'Explains that the call stack empties first, then the entire Microtask Queue (Promises) drains completely before the Event Loop takes the next Macrotask (setTimeout).',
            partialMarksDescription:
              'Mentions Promises and setTimeout but confuses which queue drains completely between ticks.',
            zeroMarksDescription: 'Incorrect execution order or missing explanation.',
          },
          {
            id: 'C2',
            criterion: 'Lexical Closures & Loop Scope Fix',
            maxPoints: 50,
            fullMarksDescription:
              'Defines lexical closure accurately and contrasts shared function-scoped var with per-iteration block-scoped let.',
            partialMarksDescription:
              'Fixes the loop with let but does not explain lexical environment capture.',
            zeroMarksDescription: 'Does not explain closures or scope bindings.',
          },
        ],
      },
      {
        examTitle: 'Promise Concurrency: Promise.all vs Promise.allSettled',
        area: 'javascript',
        questionNumber: 2,
        totalPoints: 100,
        scenarioContext:
          'A dashboard fetches three microservices in parallel. When one non-critical service rejects, the entire page fails to render (`01-event-loop-async.md`).',
        questionPrompt:
          '1. **(50 pts)** Contrast `Promise.all` with `Promise.allSettled` when one of the input promises rejects.\n2. **(50 pts)** Write a short `async/await` snippet that runs multiple tasks concurrently while gracefully handling partial failures.',
        expectedKeyFormulasOrConcepts: [
          'Promise.all short-circuits and rejects immediately on the first rejection',
          'Promise.allSettled waits for all promises and returns { status: "fulfilled" | "rejected" } objects',
          'try/catch with async/await and concurrent execution',
        ],
        rubric: [
          {
            id: 'C1',
            criterion: 'Fail-Fast vs All-Settled Semantics',
            maxPoints: 50,
            fullMarksDescription:
              'Clearly explains fail-fast rejection in Promise.all vs status descriptor array in Promise.allSettled.',
            partialMarksDescription: 'Describes Promise.all but misses Promise.allSettled structure.',
            zeroMarksDescription: 'Missing comparison.',
          },
          {
            id: 'C2',
            criterion: 'Async/Await Concurrency Implementation',
            maxPoints: 50,
            fullMarksDescription:
              'Provides clean async/await code that starts promises concurrently and inspects settled results.',
            partialMarksDescription: 'Awaits promises sequentially in a loop instead of concurrently.',
            zeroMarksDescription: 'No code or explanation provided.',
          },
        ],
      },
    ],
  },
  'ai-agents': {
    label: 'AI Agents & Google ADK Architecture',
    facultyTag: 'Creative Tech • Inteligência Artificial',
    description:
      'Google ADK LlmAgent, FunctionTool with Zod schemas, BaseLlm adapters for Ollama Gemma 4, and Local TF-IDF RAG.',
    defaultTopic: 'Google ADK LlmAgent, FunctionTool, and Local RAG with Gemma 4',
    topicPresets: [
      'Google ADK LlmAgent, FunctionTool, and Local RAG with Gemma 4',
      'Socratic Prompt Engineering vs Direct Answer Generation',
      'Deterministic Rubric Grading with Structured JSON Schemas',
    ],
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
      totalPoints: 100,
      scenarioContext:
        'You are building an offline exam prep workflow using `@google/adk` and a local Ollama `gemma4:e2b` model (`01-adk-fundamentals.md`, `02-rag-and-gemma.md`).',
      questionPrompt:
        '1. **(50 pts)** Describe the roles of `LlmAgent`, `FunctionTool`, and `InMemoryRunner` in `@google/adk`, and explain why `BaseLlm` is extended for local Ollama models.\n2. **(50 pts)** Explain how local **Retrieval-Augmented Generation (RAG)** over `data/[area]/` prevents hallucination and why structured JSON schemas are used for grading.',
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
          maxPoints: 50,
          fullMarksDescription:
            'Clearly explains LlmAgent, FunctionTool (with Zod schema), InMemoryRunner, and how BaseLlm bridges ADK to local Ollama chat calls.',
          partialMarksDescription:
            'Names the ADK classes but misses how tool calls or sessions are orchestrated.',
          zeroMarksDescription: 'No explanation of ADK components.',
        },
        {
          id: 'C2',
          criterion: 'Local RAG Grounding & Structured Output',
          maxPoints: 50,
          fullMarksDescription:
            'Explains chunk retrieval + keyword scoring over data/[area]/ files and how JSON schema validation guarantees deterministic grading output.',
          partialMarksDescription:
            'Mentions RAG generally without connecting it to local files or structured schemas.',
          zeroMarksDescription: 'Missing RAG and structured output explanation.',
        },
      ],
    },
    questionDeck: [
      {
        examTitle: 'AI Agents with Google ADK & Local Gemma 4',
        area: 'ai-agents',
        questionNumber: 1,
        totalPoints: 100,
        scenarioContext:
          'You are building an offline exam prep workflow using `@google/adk` and a local Ollama `gemma4:e2b` model (`01-adk-fundamentals.md`, `02-rag-and-gemma.md`).',
        questionPrompt:
          '1. **(50 pts)** Describe the roles of `LlmAgent`, `FunctionTool`, and `InMemoryRunner` in `@google/adk`, and explain why `BaseLlm` is extended for local Ollama models.\n2. **(50 pts)** Explain how local **Retrieval-Augmented Generation (RAG)** over `data/[area]/` prevents hallucination and why structured JSON schemas are used for grading.',
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
            maxPoints: 50,
            fullMarksDescription:
              'Clearly explains LlmAgent, FunctionTool (with Zod schema), InMemoryRunner, and how BaseLlm bridges ADK to local Ollama chat calls.',
            partialMarksDescription:
              'Names the ADK classes but misses how tool calls or sessions are orchestrated.',
            zeroMarksDescription: 'No explanation of ADK components.',
          },
          {
            id: 'C2',
            criterion: 'Local RAG Grounding & Structured Output',
            maxPoints: 50,
            fullMarksDescription:
              'Explains chunk retrieval + keyword scoring over data/[area]/ files and how JSON schema validation guarantees deterministic grading output.',
            partialMarksDescription:
              'Mentions RAG generally without connecting it to local files or structured schemas.',
            zeroMarksDescription: 'Missing RAG and structured output explanation.',
          },
        ],
      },
      {
        examTitle: 'Socratic Tutoring Agent & Guardrails',
        area: 'ai-agents',
        questionNumber: 2,
        totalPoints: 100,
        scenarioContext:
          'A student asks your AI study agent: "Just give me the final answer to Question 1 so I can copy it." (`01-adk-fundamentals.md`).',
        questionPrompt:
          '1. **(50 pts)** How do you design the `LlmAgent` system instruction and tool-calling workflow so the agent acts as a **Socratic Tutor** rather than an answer generator?\n2. **(50 pts)** Why should the agent invoke `search_area_notes` before formulating its guiding question?',
        expectedKeyFormulasOrConcepts: [
          'System instructions enforce Socratic rules: never reveal the final solution directly',
          'Break complex problems into smaller guiding questions',
          'Tool call search_area_notes grounds hints in verified course concepts',
        ],
        rubric: [
          {
            id: 'C1',
            criterion: 'Socratic System Prompt & Pedagogical Guardrails',
            maxPoints: 50,
            fullMarksDescription:
              'Explains explicit negative constraints against spoiling answers and scaffolding hints via guiding questions.',
            partialMarksDescription: 'Mentions system prompts generally without Socratic constraints.',
            zeroMarksDescription: 'Missing explanation.',
          },
          {
            id: 'C2',
            criterion: 'Grounded Hint Generation via Tool Calling',
            maxPoints: 50,
            fullMarksDescription:
              'Explains how calling search_area_notes retrieves exact definitions from data/[area] to craft accurate hints.',
            partialMarksDescription: 'Mentions tools without connecting to curriculum grounding.',
            zeroMarksDescription: 'Missing tool-calling explanation.',
          },
        ],
      },
    ],
  },
  cloud: {
    label: 'Cloud Computing, Scaling & Distributed Caching',
    facultyTag: 'Tecnologia • Sistemas Distribuídos',
    description:
      'Containers, Horizontal vs Vertical Scaling, Stateless Load Balancing, Cache-Aside vs Write-Through, and Stampede Mitigation.',
    defaultTopic: 'Containers, Horizontal Scaling, Load Balancing, and Caching Strategies',
    topicPresets: [
      'Containers, Horizontal Scaling, Load Balancing, and Caching Strategies',
      'Cache-Aside vs Write-Through & Thundering Herd Mitigation',
      'Stateless Microservices, Health Checks (/healthz) & L7 Routing',
    ],
    defaultSearchQuery: 'horizontal scaling load balancer cache-aside TTL thundering herd',
    sampleAnswer: `### 1. Horizontal Scaling & Stateless Load Balancing

- **Horizontal Scaling (Scale Out)** adds more container instances behind a load balancer, avoiding the hardware ceiling and single point of failure of vertical scaling.
- Services must remain **stateless** (storing sessions in Redis or a database) so any replica can handle any request, while \`/healthz\` probes remove unhealthy containers automatically.

### 2. Cache-Aside Pattern & Thundering Herd Mitigation

1. Application checks cache first: on a **cache hit**, return immediately; on a **cache miss**, query the database, populate the cache with a **TTL**, and return.
2. To prevent a **thundering herd (cache stampede)** when a hot key expires, add **random jitter** to TTLs or use **request coalescing (singleflight)** so only one worker recomputes the value.`,
    exam: {
      examTitle: 'Cloud Containers, Scaling & Caching Assessment',
      area: 'cloud',
      questionNumber: 1,
      totalPoints: 100,
      scenarioContext:
        'A web API deployed in containers experiences traffic spikes and database overload whenever popular cached keys expire simultaneously (`01-containers-and-scaling.md`, `02-caching-and-cdns.md`).',
      questionPrompt:
        '1. **(50 pts)** Compare **Vertical Scaling** vs **Horizontal Scaling**, and explain why horizontal scaling requires **stateless services** and `/healthz` health checks.\n2. **(50 pts)** Contrast **Cache-Aside** vs **Write-Through** caching, and describe how to prevent a **Thundering Herd (Cache Stampede)** when a hot cache key expires.',
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
          maxPoints: 50,
          fullMarksDescription:
            'Contrasts scale-up vs scale-out, explains why in-memory session state breaks load balancing, and describes health check routing.',
          partialMarksDescription:
            'Defines horizontal scaling but omits statelessness or health checks.',
          zeroMarksDescription: 'Incorrect or missing scaling explanation.',
        },
        {
          id: 'C2',
          criterion: 'Caching Patterns & Thundering Herd Prevention',
          maxPoints: 50,
          fullMarksDescription:
            'Accurately compares Cache-Aside and Write-Through and proposes TTL jitter or request coalescing (singleflight) to stop cache stampedes.',
          partialMarksDescription:
            'Explains cache hit/miss but does not address thundering herd mitigation.',
          zeroMarksDescription: 'Missing caching and stampede explanation.',
        },
      ],
    },
    questionDeck: [
      {
        examTitle: 'Cloud Containers, Scaling & Caching Assessment',
        area: 'cloud',
        questionNumber: 1,
        totalPoints: 100,
        scenarioContext:
          'A web API deployed in containers experiences traffic spikes and database overload whenever popular cached keys expire simultaneously (`01-containers-and-scaling.md`, `02-caching-and-cdns.md`).',
        questionPrompt:
          '1. **(50 pts)** Compare **Vertical Scaling** vs **Horizontal Scaling**, and explain why horizontal scaling requires **stateless services** and `/healthz` health checks.\n2. **(50 pts)** Contrast **Cache-Aside** vs **Write-Through** caching, and describe how to prevent a **Thundering Herd (Cache Stampede)** when a hot cache key expires.',
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
            maxPoints: 50,
            fullMarksDescription:
              'Contrasts scale-up vs scale-out, explains why in-memory session state breaks load balancing, and describes health check routing.',
            partialMarksDescription:
              'Defines horizontal scaling but omits statelessness or health checks.',
            zeroMarksDescription: 'Incorrect or missing scaling explanation.',
          },
          {
            id: 'C2',
            criterion: 'Caching Patterns & Thundering Herd Prevention',
            maxPoints: 50,
            fullMarksDescription:
              'Accurately compares Cache-Aside and Write-Through and proposes TTL jitter or request coalescing (singleflight) to stop cache stampedes.',
            partialMarksDescription:
              'Explains cache hit/miss but does not address thundering herd mitigation.',
            zeroMarksDescription: 'Missing caching and stampede explanation.',
          },
        ],
      },
      {
        examTitle: 'CDN Edge Caching & Cache Hit Ratio Optimization',
        area: 'cloud',
        questionNumber: 2,
        totalPoints: 100,
        scenarioContext:
          'An international media platform serves static assets and regional API responses with high latency for users on other continents (`02-caching-and-cdns.md`).',
        questionPrompt:
          '1. **(50 pts)** Define **Cache Hit Ratio** and calculate the hit ratio when an edge CDN serves $850$ cache hits and $150$ origin misses.\n2. **(50 pts)** Explain how `Cache-Control` headers and versioned asset URLs allow long edge TTLs without serving stale code on deployment.',
        expectedKeyFormulasOrConcepts: [
          'Cache Hit Ratio = Hits / (Hits + Misses) = 850 / 1000 = 85%',
          'Cache-Control max-age and immutable directives',
          'Content-hashed filenames (cache busting) for instant invalidation',
        ],
        rubric: [
          {
            id: 'C1',
            criterion: 'Cache Hit Ratio Formula & Calculation',
            maxPoints: 50,
            fullMarksDescription:
              'States Hits / (Hits + Misses) and computes 850 / (850 + 150) = 0.85 (85%).',
            partialMarksDescription: 'Correct formula but arithmetic error.',
            zeroMarksDescription: 'Incorrect formula.',
          },
          {
            id: 'C2',
            criterion: 'Edge TTL & Cache Busting Strategy',
            maxPoints: 50,
            fullMarksDescription:
              'Explains combining long Cache-Control max-age with content-hashed asset filenames.',
            partialMarksDescription: 'Mentions CDN caching without invalidation strategy.',
            zeroMarksDescription: 'Missing explanation.',
          },
        ],
      },
    ],
  },
};

export function getAreaDefault(area) {
  if (AREA_DEFAULTS[area]) return AREA_DEFAULTS[area];
  return {
    label: `${area.toUpperCase()} (\`data/${area}/\`)`,
    facultyTag: 'IADE • Custom Study Area',
    description: `Study notes and exam questions dynamically loaded from data/${area}/ via Step 05 API.`,
    defaultTopic: `Core concepts in ${area}`,
    topicPresets: [`Core concepts in ${area}`, `Practical architecture in ${area}`],
    defaultSearchQuery: area,
    sampleAnswer: `### Key Concepts in ${area}\n\nWrite your structured Markdown answer here and click **Evaluate Answer (Step 05 API)**.`,
    exam: AREA_DEFAULTS.javascript.exam,
    questionDeck: [AREA_DEFAULTS.javascript.exam],
  };
}
