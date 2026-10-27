import React from 'react';
import { getAreaDefault } from '../sampleData';

export function AreaSelectorHero({
  area,
  areas,
  onSelectArea,
  onGenerateExam,
  isGenerating,
  questionCount,
}) {
  const areaList = areas?.length ? areas : ['javascript', 'ai-agents', 'cloud'];

  return (
    <section className="iade-hero">
      <div className="iade-hero-inner">
        <div className="iade-hero-top">
          <div>
            <div className="iade-hero-kicker">
              <span>IADE • Design, Tecnologia e Comunicação</span>
              <span>•</span>
              <span>Step 06 Web Interface</span>
            </div>
            <h1 className="iade-hero-title">
              Select Your <strong>Study Area</strong> &amp; Solve AI Exam Questions
            </h1>
            <p className="iade-hero-subtitle">
              Choose a curriculum folder below (<code>data/[area]</code>) to load its exam questions, generate new questions live via the <strong>Step 05 Express API</strong>, request Socratic hints, and receive instant rubric grading.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onGenerateExam()}
              disabled={isGenerating}
              className="iade-btn iade-btn-mint"
            >
              {isGenerating
                ? 'Generating via Step 05 API...'
                : `+ Generate New Question (${area.toUpperCase()})`}
            </button>
          </div>
        </div>

        {/* IADE Highlighted Degree / Area Cards */}
        <div className="iade-area-grid">
          {areaList.map((a) => {
            const meta = getAreaDefault(a);
            const selected = a === area;
            return (
              <div
                key={a}
                role="button"
                tabIndex={0}
                onClick={() => onSelectArea(a)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectArea(a);
                }}
                className={`iade-area-card ${selected ? 'selected' : ''}`}
              >
                <div>
                  <div className="iade-area-card-header">
                    <span className="iade-area-faculty-tag">
                      {meta.facultyTag || 'IADE • Study Area'}
                    </span>
                    <span className="iade-area-folder-code">data/{a}/</span>
                  </div>
                  <h2 className="iade-area-card-title">{meta.label}</h2>
                  <p className="iade-area-card-desc">{meta.description}</p>
                </div>

                <div
                  style={{
                    marginTop: '14px',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--ui02)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    fontWeight: 900,
                    color: selected ? 'var(--brand3)' : 'var(--text-muted)',
                  }}
                >
                  <span>
                    {selected
                      ? `● Active Area (${questionCount} Questions Ready)`
                      : 'Click to Select Area & Load Questions →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
