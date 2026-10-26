import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = path.resolve(__dirname, '../../data');

/**
 * Reads CLI arguments to get the target area folder (e.g. `node index.js ai-agents` or `--area=cloud`).
 */
export function getAreaArg(defaultArea = 'javascript') {
  const args = process.argv.slice(2).filter((a) => a !== '--demo');
  for (const arg of args) {
    if (arg.startsWith('--area=')) return arg.split('=')[1];
    if (!arg.startsWith('-')) return arg;
  }
  return process.env.AREA || defaultArea;
}

/**
 * Lists all available area folders inside `data/[area]/`.
 */
export function listAreas() {
  try {
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
      .map((e) => e.name)
      .sort();
  } catch {
    return [];
  }
}

/**
 * Splits markdown content into chunks by `## ` section headings.
 */
export function chunkMarkdownContent(area, fileName, rawText) {
  const lines = rawText.split('\n');
  let docTitle = fileName.replace(/\.(md|txt)$/i, '');
  const sections = [];
  let currentTitle = 'Overview';
  let currentLines = [];

  for (const line of lines) {
    if (line.startsWith('# ')) {
      docTitle = line.replace(/^#\s+/, '').trim();
    } else if (line.startsWith('## ')) {
      if (currentLines.join('\n').trim()) {
        sections.push({ title: currentTitle, text: currentLines.join('\n').trim() });
      }
      currentTitle = line.replace(/^##\s+/, '').trim();
      currentLines = [line];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.join('\n').trim()) {
    sections.push({ title: currentTitle, text: currentLines.join('\n').trim() });
  }

  return sections.map((sec, idx) => ({
    id: `${area}/${fileName}#${idx + 1}`,
    area,
    file: fileName,
    docTitle,
    heading: sec.title,
    sectionTitle: sec.title,
    citation: `${area}/${fileName} — ${sec.title}`,
    excerpt: sec.text,
    content: sec.text,
  }));
}

/**
 * Loads all content files inside `data/[area]/[content files]` (plus optional customContent passed as parameter).
 */
export function loadAreaContent(area = 'javascript', customContent = '') {
  const areas = listAreas();
  const targetArea = areas.includes(area) ? area : areas[0] || area;
  const areaPath = path.join(DATA_DIR, targetArea);

  const files = [];
  const chunks = [];

  if (customContent && customContent.trim()) {
    files.push({
      file: 'custom-parameter.md',
      name: 'custom-parameter.md',
      content: customContent.trim(),
    });
    chunks.push(...chunkMarkdownContent(targetArea, 'custom-parameter.md', customContent));
  } else {
    try {
      const entries = fs.readdirSync(areaPath, { withFileTypes: true });
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (!entry.isFile() || !/\.(md|txt)$/i.test(entry.name)) continue;
        const fullPath = path.join(areaPath, entry.name);
        const raw = fs.readFileSync(fullPath, 'utf-8');
        files.push({
          file: entry.name,
          name: entry.name,
          content: raw.trim(),
        });
        chunks.push(...chunkMarkdownContent(targetArea, entry.name, raw));
      }
    } catch {
      // Ignore missing directory if custom area
    }
  }

  return {
    area: targetArea,
    files,
    chunks,
    fullMarkdown: files.map((f) => `<!-- ${f.file} -->\n${f.content}`).join('\n\n---\n\n'),
  };
}

/**
 * Searches chunks inside `data/[area]/` using keyword + heading scoring.
 */
export function searchAreaContent({ area = 'javascript', query = '', topK = 3, customContent = '' } = {}) {
  const { area: resolvedArea, chunks } = loadAreaContent(area, customContent);
  if (!query || !query.trim()) {
    const results = chunks.slice(0, topK).map((c) => ({ ...c, score: 1 }));
    return { area: resolvedArea, query, results };
  }

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 2);

  const scored = chunks.map((chunk) => {
    const haystack = `${chunk.docTitle} ${chunk.heading} ${chunk.content}`.toLowerCase();
    let score = 0;
    for (const term of terms) {
      if (haystack.includes(term)) {
        score += 1;
        if (chunk.heading.toLowerCase().includes(term)) score += 1.5;
      }
    }
    return { ...chunk, score: Number(score.toFixed(2)) };
  });

  scored.sort((a, b) => b.score - a.score);
  return {
    area: resolvedArea,
    query,
    results: scored.slice(0, topK),
  };
}
