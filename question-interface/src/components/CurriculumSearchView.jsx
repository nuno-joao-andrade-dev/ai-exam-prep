import React from 'react';
import { MarkdownPreview } from './MarkdownPreview';

export function CurriculumSearchView({
  area,
  files = [],
  query,
  onChangeQuery,
  onSearch,
  results = [],
  isSearching,
}) {
  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            Step 02 • Area Content RAG Search (`data/{area}/`)
          </span>
          <h3 className="text-sm font-bold text-white">
            Loaded Files from <code className="text-sky-300">data/{area}/</code>
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {files.map((f) => (
            <span
              key={f.file}
              className="rounded-md border border-slate-700 bg-slate-950 px-2 py-0.5 font-mono text-[11px] text-sky-300"
            >
              {f.file}
            </span>
          ))}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="mb-4 flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={`Search keywords in data/${area}/...`}
          className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-xl border border-amber-500/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-300 transition hover:bg-amber-500/25 disabled:opacity-50"
        >
          {isSearching ? 'Searching...' : 'Search Area'}
        </button>
      </form>

      <div className="space-y-3">
        {results.map((hit, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded bg-sky-500/15 px-2 py-0.5 font-mono text-[11px] text-sky-300">
                  {hit.file}
                </span>
                <span className="text-xs font-bold text-white">{hit.heading}</span>
              </div>
              <span className="font-mono text-[11px] text-emerald-400">
                score: {hit.score}
              </span>
            </div>
            <MarkdownPreview content={hit.excerpt} />
          </div>
        ))}
      </div>
    </div>
  );
}
