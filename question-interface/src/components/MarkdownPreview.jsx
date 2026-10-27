import React, { useState } from 'react';

function renderInlineMarkdown(text) {
  if (!text) return null;
  const tokenRegex =
    /(\*\*[^*]+\*\*|`[^`]+`|\$[^$\n]+\$|\*[^*\n]+\*|\[[a-zA-Z0-9_-]+\.md\])/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="md-strong">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      return (
        <code key={idx} className="md-inline-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      return (
        <span key={idx} className="md-math-inline">
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith('[') && part.endsWith('.md]')) {
      return (
        <span key={idx} className="md-citation-badge">
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return (
        <em key={idx} className="md-em">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownPreview({
  content,
  className = '',
  emptyPlaceholder = 'No markdown content.',
}) {
  const trimmed = (content || '').trim();
  if (!trimmed) {
    return (
      <div
        className={`md-preview ${className}`}
        style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}
      >
        {emptyPlaceholder}
      </div>
    );
  }

  const lines = trimmed.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <div key={`code-${i}`} className="md-code-block">
          {lang && <div className="md-code-lang">{lang}</div>}
          <pre>
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} className="md-heading md-h3">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="md-heading md-h2">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} className="md-heading md-h1">
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('> ')) {
      blocks.push(
        <blockquote key={`quote-${i}`} className="md-blockquote">
          {renderInlineMarkdown(line.trim().slice(2))}
        </blockquote>
      );
      i++;
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="md-list">
          {items.map((item, idx) => (
            <li key={idx} className="md-li">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    if (/^\s*\d+\.\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={`ol-${i}`} className="md-list">
          {items.map((item, idx) => (
            <li key={idx} className="md-li">
              {renderInlineMarkdown(item)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    blocks.push(
      <p key={`p-${i}`} className="md-p">
        {renderInlineMarkdown(line)}
      </p>
    );
    i++;
  }

  return <div className={`md-preview ${className}`}>{blocks}</div>;
}

export function MarkdownBox({
  label,
  badge,
  value,
  onChange,
  placeholder = 'Write Markdown here...',
  rows = 6,
  defaultMode = 'edit',
  readOnly = false,
  minHeight = '130px',
}) {
  const [mode, setMode] = useState(defaultMode);
  const effectiveMode = readOnly ? 'preview' : mode;

  return (
    <div className="md-box-wrapper">
      <div className="md-box-toolbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {label && <span className="md-box-label">{label}</span>}
          {badge && <span className="md-citation-badge">{badge}</span>}
        </div>
        {!readOnly && (
          <div className="md-mode-tabs">
            {['edit', 'split', 'preview'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`md-mode-btn ${effectiveMode === tab ? 'active' : ''}`}
              >
                {tab === 'edit'
                  ? 'Write Answer (MD)'
                  : tab === 'split'
                    ? 'Split View'
                    : 'Preview'}
              </button>
            ))}
          </div>
        )}
      </div>

      {effectiveMode === 'preview' && (
        <div className="md-box-preview-surface" style={{ minHeight }}>
          <MarkdownPreview content={value} emptyPlaceholder={placeholder} />
        </div>
      )}

      {effectiveMode === 'edit' && (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="md-box-textarea"
        />
      )}

      {effectiveMode === 'split' && (
        <div className="md-box-body md-box-split">
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="md-box-textarea"
          />
          <div className="md-box-preview-surface" style={{ minHeight }}>
            <MarkdownPreview content={value} emptyPlaceholder={placeholder} />
          </div>
        </div>
      )}
    </div>
  );
}
