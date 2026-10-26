import React from 'react';
import { MarkdownBox } from './MarkdownPreview';

export function Header({
  status,
  area,
  areas,
  onSelectArea,
  customContent,
  onChangeCustomContent,
  showCustomParamBox,
  onToggleCustomParamBox,
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 font-bold text-white shadow-lg shadow-sky-500/20">
            G4
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-sky-400">
                data/{area}/
              </span>
              <h1 className="text-base font-bold tracking-tight text-white">
                AI Exam Prep — Google ADK + Local Gemma 4
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Simple JavaScript Agents • Area parameter:{' '}
              <code className="text-sky-300">?area={area}</code>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
            <label htmlFor="area-select" className="font-semibold text-slate-400">
              Area Parameter:
            </label>
            <select
              id="area-select"
              value={area}
              onChange={(e) => onSelectArea(e.target.value)}
              className="rounded border border-slate-700 bg-slate-950 px-2.5 py-1 font-mono text-xs text-sky-300 focus:border-sky-500 focus:outline-none"
            >
              {(areas.length ? areas : ['javascript', 'ai-agents', 'cloud']).map((a) => (
                <option key={a} value={a}>
                  data/{a}/
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleCustomParamBox}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              customContent?.trim()
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
            }`}
          >
            {customContent?.trim()
              ? 'Custom Content Parameter (Active)'
              : showCustomParamBox
                ? 'Hide Content Parameter'
                : '+ Pass Custom Content Parameter'}
          </button>

          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                status?.ollamaReachable
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-amber-400'
              }`}
            />
            <span className="font-medium text-slate-300">
              {status?.ollamaReachable ? 'Ollama Connected' : 'Checking Ollama...'}
            </span>
            <code className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] text-sky-300">
              {status?.configuredModel || 'gemma4:e2b'}
            </code>
          </div>
        </div>
      </div>

      {showCustomParamBox && (
        <div className="mx-auto max-w-[1600px] px-6 pb-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-slate-300">
                Optional <code className="text-sky-300">customContent</code> parameter (passed directly to RAG, Exam Generator, Socratic Mentor & Grader):
              </span>
              {customContent?.trim() && (
                <button
                  type="button"
                  onClick={() => onChangeCustomContent('')}
                  className="text-xs text-rose-400 hover:underline"
                >
                  Clear custom content (use data/{area}/ files)
                </button>
              )}
            </div>
            <MarkdownBox
              label="Custom Markdown Content Parameter"
              badge="customContent"
              value={customContent}
              onChange={onChangeCustomContent}
              defaultMode="split"
              rows={4}
              minHeight="80px"
              placeholder={`# Custom Study Notes\n\nPaste Markdown here to override data/${area}/ files, or leave empty to load files from data/${area}/...`}
            />
          </div>
        </div>
      )}
    </header>
  );
}
