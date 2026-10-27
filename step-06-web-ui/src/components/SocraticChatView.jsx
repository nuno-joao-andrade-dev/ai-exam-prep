import React, { useState } from 'react';
import { MarkdownPreview, MarkdownBox } from './MarkdownPreview';

export function SocraticChatView({
  area,
  messages,
  onSendMessage,
  isSending,
  onResetSession,
}) {
  const [draft, setDraft] = useState(
    `Can you give me a Socratic hint on how to approach this \`data/${area}/\` question without giving away the answer?`
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim() || isSending) return;
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <section className="iade-card iade-card-accent-magenta">
      <div className="iade-card-header">
        <div>
          <div className="iade-section-kicker">
            <span>Step 04 • Google ADK Socratic Mentor</span>
            <span>•</span>
            <span>data/{area}/</span>
          </div>
          <h2 className="iade-section-title">
            Need a Hint? Ask the Socratic Coach
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="iade-api-badge">POST /api/socratic/chat</span>
          <button
            type="button"
            onClick={onResetSession}
            className="iade-btn iade-btn-outline iade-btn-sm"
          >
            Reset Chat
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="iade-chat-log">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`iade-chat-bubble ${
              msg.role === 'user' ? 'user' : 'model'
            }`}
          >
            <div className="iade-chat-role">
              {msg.role === 'user'
                ? 'Student'
                : 'IADE Socratic Mentor (ADK + Gemma 4)'}
            </div>
            <MarkdownPreview content={msg.text} />
          </div>
        ))}

        {isSending && (
          <div className="iade-chat-bubble model">
            <div className="iade-chat-role">IADE Socratic Mentor</div>
            Searching <code>data/{area}/</code> via ADK <code>FunctionTool</code> and formulating a guiding question...
          </div>
        )}
      </div>

      {/* Quick Hint Buttons */}
      <div className="iade-topic-chips" style={{ marginBottom: '12px' }}>
        <button
          type="button"
          className="iade-topic-chip"
          onClick={() =>
            onSendMessage(
              `What is the first key concept from data/${area}/ I should mention in my answer?`
            )
          }
          disabled={isSending}
        >
          💡 Hint on Part 1
        </button>
        <button
          type="button"
          className="iade-topic-chip"
          onClick={() =>
            onSendMessage(
              `Which common pitfall or edge case in data/${area}/ does the rubric test for?`
            )
          }
          disabled={isSending}
        >
          🎯 Common Pitfalls
        </button>
      </div>

      {/* Message Composer */}
      <form onSubmit={handleSubmit}>
        <MarkdownBox
          label="Ask for a Guided Socratic Hint"
          badge="ADK LlmAgent"
          value={draft}
          onChange={setDraft}
          defaultMode="edit"
          rows={3}
          minHeight="76px"
          placeholder="Ask the Socratic Mentor a question about the exam problem..."
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="iade-btn iade-btn-blue"
          style={{ width: '100%' }}
        >
          {isSending ? 'Consulting ADK Socratic Mentor...' : 'Ask Socratic Mentor'}
        </button>
      </form>
    </section>
  );
}
