import React from 'react';
import { MarkdownPreview } from './MarkdownPreview';

export function RubricScorecardView({ rubric = [], evaluation, isGrading }) {
  return (
    <div className="rounded-2xl border border-slate-800/90 bg-slate-900/60 p-5 shadow-xl">
      <div className="mb-3 flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Step 05 • Deterministic Rubric & Grader
          </span>
          <h3 className="text-sm font-bold text-white">
            Rubric Breakdown & Structured Evaluation
          </h3>
        </div>
        {evaluation && (
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-emerald-500/20 px-2.5 py-1 font-mono text-xs font-bold text-emerald-300">
              {evaluation.totalAwarded} / {evaluation.totalPossible} pts (
              {evaluation.percentage}%)
            </span>
            <span className="rounded-lg border border-sky-500/40 bg-sky-500/15 px-2.5 py-1 font-mono text-xs font-bold text-sky-300">
              {evaluation.letterGrade}
            </span>
          </div>
        )}
      </div>

      {isGrading && (
        <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 text-xs text-emerald-200">
          Grading submission with local Gemma 4 using structured JSON schema...
        </div>
      )}

      {/* Rubric Criteria Previews */}
      <div className="space-y-3">
        {rubric.map((item) => {
          const scoreItem = evaluation?.criterionScores?.find(
            (c) => c.criterionId === item.id
          );
          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  <code className="mr-1.5 text-sky-400">[{item.id}]</code>
                  {item.criterion}
                </span>
                <span className="font-mono text-xs font-semibold text-emerald-300">
                  {scoreItem
                    ? `${scoreItem.awardedPoints} / ${scoreItem.maxPoints} pts`
                    : `${item.maxPoints} pts`}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-[11px] md:grid-cols-2">
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/10 p-2.5">
                  <div className="mb-1 font-semibold text-emerald-400">Full Marks</div>
                  <MarkdownPreview content={item.fullMarksDescription} />
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-950/10 p-2.5">
                  <div className="mb-1 font-semibold text-amber-400">Partial Marks</div>
                  <MarkdownPreview content={item.partialMarksDescription} />
                </div>
              </div>

              {scoreItem && (
                <div className="mt-2.5 space-y-1.5 border-t border-slate-800/80 pt-2.5">
                  <div className="text-[11px] font-semibold text-sky-300">
                    Grader Justification (Markdown Preview):
                  </div>
                  <MarkdownPreview content={scoreItem.justification} />
                  {scoreItem.improvementTip && (
                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-950/20 p-2">
                      <span className="text-[10px] font-bold uppercase text-indigo-300">
                        Improvement Tip:
                      </span>
                      <MarkdownPreview content={scoreItem.improvementTip} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {evaluation?.overallFeedback && (
        <div className="mt-4 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5">
          <div className="mb-1 text-xs font-bold text-sky-300">
            Overall Feedback (Markdown Preview)
          </div>
          <MarkdownPreview content={evaluation.overallFeedback} />
        </div>
      )}
    </div>
  );
}
