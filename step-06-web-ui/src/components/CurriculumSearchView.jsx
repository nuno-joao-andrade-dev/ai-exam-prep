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
    <section className="iade-card iade-card-accent-blue">
      <div className="iade-card-header">
        <div>
          <div className="iade-section-kicker">
            <span>Step 02 • Local TF-IDF RAG Search</span>
            <span>•</span>
            <span>data/{area}/</span>
          </div>
          <h2 className="iade-section-title">
            Study Notes Explorer (<code>data/{area}/</code>)
          </h2>
        </div>
        <span className="iade-api-badge">POST /api/rag/search</span>
      </div>

      {files.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '14px',
          }}
        >
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: 'var(--text-muted)',
            }}
          >
            Loaded Files:
          </span>
          {files.map((f) => (
            <span key={f.file} className="md-citation-badge">
              {f.file}
            </span>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSearch();
        }}
        className="iade-topic-generator-row"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => onChangeQuery(e.target.value)}
          placeholder={`Search concepts in data/${area}/...`}
          className="iade-input"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="iade-btn iade-btn-outline"
        >
          {isSearching ? 'Searching...' : 'Search Notes'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {results.map((hit, idx) => (
          <div
            key={idx}
            style={{
              border: '1px solid var(--border-light)',
              background: 'var(--ui02)',
              padding: '14px 16px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginBottom: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="md-citation-badge">{hit.file}</span>
                <strong style={{ fontSize: '13px' }}>{hit.heading}</strong>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--brand3)',
                }}
              >
                score: {hit.score}
              </span>
            </div>
            <MarkdownPreview content={hit.excerpt} />
          </div>
        ))}
      </div>
    </section>
  );
}
