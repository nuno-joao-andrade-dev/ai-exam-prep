import React, { useState } from 'react';
import { MarkdownPreview, MarkdownBox } from './MarkdownPreview';

export function ExamQuestionView({
  area,
  exam,
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

  return (
    <div className="flex flex-col gap-4">
      {/* Exam Generator Controls */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-4 shadow-xl">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
            Step 03 • Exam Generator (`data/{area}/`)
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            POST /api/exam/generate
          </span>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={topic}
            onChange={(e) => onChangeTopic(e.target.value)}
            placeholder={`Topic in data/${area}/...`}
            className="flex-1 rounded-xl border border-slate-700/80 bg-slate-950/90 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={onGenerateExam}
            disabled={isGenerating}
            className="rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-500/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {isGenerating ? 'Generating with Gemma 4...' : 'Generate Question'}
          </button>
        </div>
      </div>

      {/* Generated Question Card (Markdown Previews) */}
      <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
              Area: data/{exam.area || area}/ • Question #{exam.questionNumber || 1}
            </span>
            <h2 className="text-base font-bold text-white">{exam.examTitle}</h2>
          </div>
          <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-semibold text-emerald-300">
            {exam.totalPoints} pts
          </span>
        </div>

        {/* Scenario Context Markdown Preview */}
        <div className="mb-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Scenario Context (Markdown Preview)
          </div>
          <div className="rounded-xl border border-slate-800/90 bg-slate-950/60 p-3.5">
            <MarkdownPreview content={exam.scenarioContext} />
          </div>
        </div>

        {/* Question Prompt Markdown Preview */}
        <div className="mb-4">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-sky-400">
            Question Prompt (Markdown Preview)
          </div>
          <div className="rounded-xl border border-sky-500/20 bg-sky-950/15 p-3.5">
            <MarkdownPreview content={exam.questionPrompt} />
          </div>
        </div>

        {/* Toggleable Key Concepts Preview */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowExpectedConcepts((v) => !v)}
            className="text-xs font-medium text-slate-400 hover:text-sky-300"
          >
            {showExpectedConcepts ? '▼ Hide' : '▶ Show'} Expected Key Concepts (
            {exam.expectedKeyFormulasOrConcepts?.length || 0})
          </button>
          {showExpectedConcepts && (
            <div className="mt-2 rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <MarkdownPreview
                content={(exam.expectedKeyFormulasOrConcepts || [])
                  .map((item) => `- ${item}`)
                  .join('\n')}
              />
            </div>
          )}
        </div>

        {/* Student Answer Box - defaults to Markdown Preview with Split/Edit toggle */}
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-200">
              Your Answer (Markdown Preview / Editor)
            </span>
            <button
              type="button"
              onClick={onLoadSampleAnswer}
              className="rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-[11px] font-medium text-sky-300 hover:border-sky-500/50"
            >
              Load Sample Markdown Answer
            </button>
          </div>

          <MarkdownBox
            label="Student Submission"
            badge={`data/${area}/`}
            value={studentAnswer}
            onChange={onChangeStudentAnswer}
            defaultMode="preview"
            rows={7}
            minHeight="150px"
            placeholder="Click 'Edit MD' or 'Split' above to write your Markdown answer, or click 'Load Sample Markdown Answer'..."
          />
        </div>

        <button
          type="button"
          onClick={onGradeAnswer}
          disabled={isGrading || !studentAnswer.trim()}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-110 disabled:opacity-50"
        >
          {isGrading
            ? 'Evaluating against Rubric with Gemma 4...'
            : 'Evaluate Answer against Rubric (Step 05)'}
        </button>
      </div>
    </div>
  );
}
