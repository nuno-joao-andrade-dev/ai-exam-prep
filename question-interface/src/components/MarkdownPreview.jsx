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
        <strong key={idx} className="font-semibold text-white">
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
        <em key={idx} className="italic text-slate-200">
          {part.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

export function MarkdownPreview({ content, className = '', emptyPlaceholder = 'No markdown content.' }) {
  const trimmed = (content || '').trim();
  if (!trimmed) {
    return (
      <div className={`md-preview text-xs italic text-slate-500 ${className}`}>
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
        <div key={`code-${i}`} className="my-2 overflow-hidden rounded-lg border border-slate-800 bg-slate-950/90">
          {lang && (
            <div className="border-b border-slate-800/80 bg-slate-900/80 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-slate-400">
              {lang}
            </div>
          )}
          <pre className="overflow-x-auto p-3 font-mono text-xs leading-relaxed text-emerald-300">
            <code>{codeLines.join('\n')}</code>
          </pre>
        </div>
      );
      continue;
    }

    if (line.startsWith('### ')) {
      blocks.push(
        <h4 key={`h3-${i}`} className="mt-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-sky-300">
          {renderInlineMarkdown(line.slice(4))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      blocks.push(
        <h3 key={`h2-${i}`} className="mt-3 mb-1.5 text-sm font-bold text-white">
          {renderInlineMarkdown(line.slice(3))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('# ')) {
      blocks.push(
        <h2 key={`h1-${i}`} className="mt-3 mb-2 text-base font-bold text-white">
          {renderInlineMarkdown(line.slice(2))}
        </h2>
      );
      i++;
      continue;
    }

    if (line.trim().startsWith('> ')) {
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className="my-2 border-l-2 border-indigo-400/70 bg-indigo-950/25 py-1.5 pl-3 pr-2 text-xs italic text-indigo-100/90"
        >
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
        <ul key={`ul-${i}`} className="my-1.5 list-disc space-y-1 pl-5 text-xs leading-relaxed text-slate-200">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
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
        <ol key={`ol-${i}`} className="my-1.5 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-slate-200">
          {items.map((item, idx) => (
            <li key={idx}>{renderInlineMarkdown(item)}</li>
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
      <p key={`p-${i}`} className="my-1.5 text-xs leading-relaxed text-slate-200">
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
  defaultMode = 'preview',
  readOnly = false,
  minHeight = '120px',
}) {
  const [mode, setMode] = useState(defaultMode);
  const effectiveMode = readOnly ? 'preview' : mode;

  return (
    <div className="md-box-wrapper">
      <div className="md-box-toolbar">
        <div className="flex items-center gap-2">
          {label && <span className="text-[11px] font-semibold text-slate-300">{label}</span>}
          {badge && (
            <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-sky-300">
              {badge}
            </span>
          )}
        </div>
        {!readOnly && (
          <div className="md-mode-tabs">
            {['preview', 'split', 'edit'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`md-mode-tab ${effectiveMode === tab ? 'active' : ''}`}
              >
                {tab === 'preview' ? 'Markdown Preview' : tab === 'split' ? 'Split' : 'Edit MD'}
              </button>
            ))}
          </div>
        )}
      </div>

      {effectiveMode === 'preview' && (
        <div className="p-3.5" style={{ minHeight }}>
          <MarkdownPreview content={value} emptyPlaceholder={placeholder} />
        </div>
      )}

      {effectiveMode === 'edit' && (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-slate-950/80 p-3.5 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
        />
      )}

      {effectiveMode === 'split' && (
        <div className="grid grid-cols-1 divide-y divide-slate-800 md:grid-cols-2 md:divide-x md:divide-y-0">
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-950/80 p-3.5 font-mono text-xs leading-relaxed text-slate-100 focus:outline-none"
          />
          <div className="p-3.5" style={{ minHeight }}>
            <MarkdownPreview content={value} emptyPlaceholder={placeholder} />
          </div>
        </div>
      )}
    </div>
  );
}
