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
    `Can you give me a hint on how to structure my answer using the notes in \`data/${area}/\`?`
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!draft.trim() || isSending) return;
    onSendMessage(draft);
    setDraft('');
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
            Step 04 • Socratic Study Mentor (`data/{area}/`)
          </span>
          <h2 className="text-sm font-bold text-white">
            Guided Hints Without Giving Away the Final Solution
          </h2>
        </div>
        <button
          type="button"
          onClick={onResetSession}
          className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] text-slate-300 hover:border-slate-600"
        >
          Reset Session
        </button>
      </div>

      {/* Chat Messages - Rendered with MarkdownPreview */}
      <div className="mb-4 flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: '420px' }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`rounded-xl border p-3.5 ${
              msg.role === 'user'
                ? 'ml-6 border-sky-500/30 bg-sky-950/25'
                : 'mr-4 border-slate-800 bg-slate-950/75'
            }`}
          >
            <div className="mb-1.5 flex items-center justify-between">
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  msg.role === 'user' ? 'text-sky-400' : 'text-emerald-400'
                }`}
              >
                {msg.role === 'user' ? 'You (Student)' : 'Socratic Mentor (Gemma 4)'}
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                Markdown Preview
              </span>
            </div>
            <MarkdownPreview content={msg.text} />
          </div>
        ))}

        {isSending && (
          <div className="mr-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 text-xs text-slate-400">
            Socratic Mentor is searching <code className="text-sky-300">data/{area}/</code> and formulating a guiding question...
          </div>
        )}
      </div>

      {/* Message Composer with Markdown Preview / Edit tabs */}
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <MarkdownBox
          label="Ask the Socratic Mentor"
          badge="Markdown Preview / Edit"
          value={draft}
          onChange={setDraft}
          defaultMode="preview"
          rows={3}
          minHeight="72px"
          placeholder="Click 'Edit MD' to type a question for the Socratic Mentor..."
        />
        <button
          type="submit"
          disabled={isSending || !draft.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {isSending ? 'Asking Mentor...' : 'Ask Socratic Mentor'}
        </button>
      </form>
    </div>
  );
}
