import React, { useState } from 'react';
import { MarkdownPreview, MarkdownBox } from './MarkdownPreview';
import { getAreaDefault } from '../sampleData';

export function ExamQuestionView({
  area,
  exam,
  questionDeck = [],
  activeQuestionIndex = 0,
  onSelectQuestionIndex,
  topic,
  onChangeTopic,
  onGenerateExam,
  isGenerating,
  studentAnswer,
  onChangeStudentAnswer,
  onGradeAnswer,
  isGrading,
  onLoadSampleAnswer,
}) {
  const [showExpectedConcepts, setShowExpectedConcepts] = useState(false);
  const areaMeta = getAreaDefault(area);
  const presets = areaMeta.topicPresets || [];

  return (
    <div className="iade-col">
      {/* 1. Area Question Deck & Live Step 05 Generator */}
      <section className="iade-card iade-card-accent-blue">
        <div className="iade-card-header">
          <div>
            <div className="iade-section-kicker">
              <span>Step 03 &amp; Step 05 API</span>
              <span>•</span>
              <span>data/{area}/</span>
            </div>
            <h2 className="iade-section-title">
              Area Questions &amp; AI Question Generator
            </h2>
          </div>
          <span className="iade-api-badge">POST /api/exam/generate</span>
        </div>

        {/* Question Deck Switcher */}
        <div className="iade-question-deck-bar">
          <div className="iade-question-tabs">
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--ui05)',
                marginRight: '4px',
              }}
            >
              Available Questions ({questionDeck.length}):
            </span>
            {questionDeck.map((q, idx) => (
              <button
                key={`${q.examTitle}-${idx}`}
                type="button"
                onClick={() => onSelectQuestionIndex(idx)}
                className={`iade-q-tab ${
                  idx === activeQuestionIndex ? 'active' : ''
                }`}
              >
                Q{idx + 1}: {q.examTitle?.slice(0, 32)}
                {q.examTitle?.length > 32 ? '…' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Preset Topic Chips */}
        {presets.length > 0 && (
          <div className="iade-topic-chips">
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--text-muted)',
              }}
            >
              Topic Presets:
            </span>
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onChangeTopic(preset)}
                className={`iade-topic-chip ${topic === preset ? 'active' : ''}`}
              >
                {preset}
              </button>
            ))}
          </div>
        )}

        {/* Topic Input + Generate Button */}
        <div className="iade-topic-generator-row" style={{ marginBottom: 0 }}>
          <input
            type="text"
            value={topic}
            onChange={(e) => onChangeTopic(e.target.value)}
            placeholder={`Enter a topic in data/${area}/ to generate a new AI exam question...`}
            className="iade-input"
          />
          <button
            type="button"
            onClick={() => onGenerateExam(topic)}
            disabled={isGenerating}
            className="iade-btn iade-btn-blue"
          >
            {isGenerating
              ? 'Generating with Gemma 4...'
              : 'Generate Question via API'}
          </button>
        </div>
      </section>

      {/* 2. Active Question & Student Answer Card */}
      <section className="iade-card iade-card-accent-top">
        <div className="iade-card-header">
          <div>
            <div className="iade-section-kicker">
              <span>Area: data/{exam.area || area}/</span>
              <span>•</span>
              <span>Question #{activeQuestionIndex + 1}</span>
            </div>
            <h2 className="iade-section-title">{exam.examTitle}</h2>
          </div>
          <span className="iade-points-badge">{exam.totalPoints || 100} PTS</span>
        </div>

        {/* Scenario Context */}
        <div className="iade-scenario-box">
          <div className="iade-box-label">
            <span>Scenario Context</span>
            <span>Grounded in data/{area}/</span>
          </div>
          <MarkdownPreview content={exam.scenarioContext} />
        </div>

        {/* Question Prompt */}
        <div className="iade-prompt-box">
          <div className="iade-box-label">
            <span>Exam Question to Answer</span>
            <span>Read carefully &amp; answer all parts below</span>
          </div>
          <MarkdownPreview content={exam.questionPrompt} />
        </div>

        {/* Toggleable Expected Key Concepts */}
        <div style={{ marginBottom: '18px' }}>
          <button
            type="button"
            onClick={() => setShowExpectedConcepts((v) => !v)}
            className="iade-btn iade-btn-outline iade-btn-sm"
          >
            {showExpectedConcepts ? '▼ Hide' : '▶ Show'} Expected Key Concepts (
            {exam.expectedKeyFormulasOrConcepts?.length || 0})
          </button>
          {showExpectedConcepts && (
            <div
              style={{
                marginTop: '10px',
                padding: '14px 16px',
                background: 'var(--ui02)',
                borderLeft: '4px solid var(--brand2)',
              }}
            >
              <MarkdownPreview
                content={(exam.expectedKeyFormulasOrConcepts || [])
                  .map((item) => `- ${item}`)
                  .join('\n')}
              />
            </div>
          )}
        </div>

        {/* Student Answer Workspace */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              marginBottom: '10px',
            }}
          >
            <span
              style={{
                fontSize: '13px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Student Answer Submission
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onLoadSampleAnswer}
                className="iade-btn iade-btn-outline iade-btn-sm"
              >
                Load Sample Answer
              </button>
              {studentAnswer && (
                <button
                  type="button"
                  onClick={() => onChangeStudentAnswer('')}
                  className="iade-btn iade-btn-outline iade-btn-sm"
                >
                  Clear Answer
                </button>
              )}
            </div>
          </div>

          <MarkdownBox
            label="Your Answer (Markdown Supported)"
            badge={`data/${area}/`}
            value={studentAnswer}
            onChange={onChangeStudentAnswer}
            defaultMode="split"
            rows={8}
            minHeight="160px"
            placeholder="Type your answer here in Markdown (or click 'Load Sample Answer' to test the Step 05 Grader)..."
          />
        </div>

        {/* Submit Answer for Step 05 API Grading */}
        <button
          type="button"
          onClick={onGradeAnswer}
          disabled={isGrading || !studentAnswer.trim()}
          className="iade-btn iade-btn-mint"
          style={{ width: '100%', padding: '14px 24px', fontSize: '14.5px' }}
        >
          {isGrading
            ? 'Evaluating Answer via Step 05 API (POST /api/grade/evaluate)...'
            : 'Submit Answer for AI Grading (Step 05 API)'}
        </button>
      </section>
    </div>
  );
}
