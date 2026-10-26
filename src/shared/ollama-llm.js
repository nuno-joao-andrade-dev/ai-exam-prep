import { BaseLlm, InMemoryRunner } from '@google/adk';

export const DEFAULT_OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
export const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'gemma4:e2b';

/**
 * Minimal native fetch wrapper for Ollama /api/tags
 */
export async function ollamaListModels(host = DEFAULT_OLLAMA_HOST) {
  const res = await fetch(`${host}/api/tags`);
  if (!res.ok) {
    throw new Error(`Ollama /api/tags HTTP ${res.status}`);
  }
  return res.json();
}

/**
 * Minimal native fetch wrapper for Ollama /api/chat
 */
export async function ollamaChat({
  model = DEFAULT_MODEL,
  messages,
  tools,
  format,
  options = { temperature: 0.2 },
  host = DEFAULT_OLLAMA_HOST,
}) {
  const body = {
    model,
    messages,
    stream: false,
    options,
  };
  if (tools && tools.length > 0) body.tools = tools;
  if (format) body.format = format;

  const res = await fetch(`${host}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Ollama /api/chat HTTP ${res.status}: ${errText}`);
  }
  return res.json();
}

/**
 * Simple JavaScript adapter that connects Google ADK's BaseLlm to a local Ollama model.
 */
export class OllamaGemmaLlm extends BaseLlm {
  constructor({
    model = DEFAULT_MODEL,
    host = DEFAULT_OLLAMA_HOST,
    temperature = 0.2,
  } = {}) {
    super({ model });
    this.model = model;
    this.host = host;
    this.temperature = temperature;
  }

  async *generateContentAsync(llmRequest) {
    const messages = [];

    // 1. System instruction
    const sysInstruction = llmRequest.config?.systemInstruction;
    if (sysInstruction) {
      const sysText =
        typeof sysInstruction === 'string'
          ? sysInstruction
          : (sysInstruction.parts || []).map((p) => p.text || '').join('\n');
      if (sysText.trim()) {
        messages.push({ role: 'system', content: sysText.trim() });
      }
    }

    // 2. Conversation history & tool outputs
    for (const content of llmRequest.contents || []) {
      const role = content.role === 'model' ? 'assistant' : 'user';
      for (const part of content.parts || []) {
        if (part.text) {
          messages.push({ role, content: part.text });
        } else if (part.functionCall) {
          messages.push({
            role: 'assistant',
            content: '',
            tool_calls: [
              {
                function: {
                  name: part.functionCall.name,
                  arguments: part.functionCall.args || {},
                },
              },
            ],
          });
        } else if (part.functionResponse) {
          messages.push({
            role: 'tool',
            content: JSON.stringify(part.functionResponse.response || {}),
          });
        }
      }
    }

    // 3. Convert ADK FunctionDeclarations to Ollama tools format
    const tools = [];
    for (const toolGroup of llmRequest.config?.tools || []) {
      for (const decl of toolGroup.functionDeclarations || []) {
        tools.push({
          type: 'function',
          function: {
            name: decl.name,
            description: decl.description || '',
            parameters: decl.parameters || { type: 'object', properties: {} },
          },
        });
      }
    }

    const response = await ollamaChat({
      model: this.model,
      host: this.host,
      messages,
      tools: tools.length > 0 ? tools : undefined,
      options: { temperature: this.temperature },
    });

    const msg = response.message || {};

    if (msg.tool_calls && msg.tool_calls.length > 0) {
      const parts = msg.tool_calls.map((tc) => ({
        functionCall: {
          name: tc.function.name,
          args:
            typeof tc.function.arguments === 'string'
              ? JSON.parse(tc.function.arguments)
              : tc.function.arguments || {},
        },
      }));
      yield { content: { role: 'model', parts } };
      return;
    }

    yield {
      content: {
        role: 'model',
        parts: [{ text: msg.content || '' }],
      },
    };
  }

  async connect() {
    throw new Error('Live streaming connection is not needed for this workshop.');
  }
}

/**
 * Helper to run a single prompt through an ADK LlmAgent and return the text reply.
 */
export async function runAgentTurn({
  agent,
  prompt,
  runner: existingRunner,
  userId = 'student',
  sessionId = 'default-session',
}) {
  const runner = existingRunner || new InMemoryRunner({ agent, appName: 'examprep' });

  const existing = await runner.sessionService.getSession({
    appName: 'examprep',
    userId,
    sessionId,
  });
  if (!existing) {
    await runner.sessionService.createSession({
      appName: 'examprep',
      userId,
      sessionId,
    });
  }

  let finalReply = '';
  const events = runner.runAsync({
    userId,
    sessionId,
    newMessage: { role: 'user', parts: [{ text: prompt }] },
  });

  for await (const event of events) {
    for (const part of event?.content?.parts || []) {
      if (part.text) {
        finalReply += part.text;
      }
    }
  }

  return finalReply.trim();
}
