import React from 'react';
import { MarkdownPreview } from './MarkdownPreview';

export function RubricScorecardView({ rubric = [], evaluation, isGrading }) {
  const awarded =
    evaluation?.totalAwarded ?? evaluation?.totalScore ?? 0;
  const possible =
    evaluation?.totalPossible ?? evaluation?.maxPossibleScore ?? 100;
  const pct =
    evaluation?.percentage ??
    (possible > 0 ? Math.round((awarded / possible) * 100) : 0);

  return (
    <section className="iade-card iade-card-accent-mint">
      <div className="iade-card-header">
        <div>
          <div className="iade-section-kicker">
            <span>Step 05 • Deterministic Rubric &amp; Grader</span>
          </div>
          <h2 className="iade-section-title">
            Rubric Breakdown &amp; AI Evaluation
          </h2>
        </div>
        <span className="iade-api-badge">POST /api/grade/evaluate</span>
      </div>

      {isGrading && (
        <div
          style={{
            padding: '16px',
            marginBottom: '16px',
            background: 'var(--interactive02Focus)',
            borderLeft: '4px solid var(--brand2)',
            fontSize: '13.5px',
            fontWeight: 700,
          }}
        >
          Grading student answer against rubric criteria with local Gemma 4...
        </div>
      )}

      {/* Overall Score Banner when Evaluation is Ready */}
      {evaluation && (
        <div className="iade-score-banner">
          <div>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--brand2)',
                marginBottom: '4px',
              }}
            >
              Step 05 Official Scorecard
            </div>
            <div className="iade-score-big">
              {awarded} / {possible} PTS ({pct}%)
            </div>
          </div>
          <div className="iade-grade-pill">
            Grade: {evaluation.letterGrade || 'A'}
          </div>
        </div>
      )}

      {/* Rubric Criteria List */}
      <div>
        {rubric.map((item) => {
          const scoreItem = evaluation?.criterionScores?.find(
            (c) => c.criterionId === item.id
          );
          const itemAwarded = scoreItem?.awardedPoints ?? 0;
          const itemMax = scoreItem?.maxPoints ?? item.maxPoints ?? 50;
          const ratio = itemMax > 0 ? (itemAwarded / itemMax) * 100 : 0;

          return (
            <div key={item.id} className="iade-criterion-card">
              <div className="iade-criterion-top">
                <div style={{ fontWeight: 900, fontSize: '14px' }}>
                  <code
                    style={{
                      background: 'var(--ui18)',
                      color: 'var(--brand3)',
                      padding: '2px 6px',
                      marginRight: '8px',
                      fontSize: '12px',
                    }}
                  >
                    [{item.id}]
                  </code>
                  {item.criterion}
                </div>
                <span className="iade-points-badge">
                  {scoreItem
                    ? `${itemAwarded} / ${itemMax} PTS`
                    : `${item.maxPoints} PTS`}
                </span>
              </div>

              {scoreItem && (
                <div className="iade-progress-track">
                  <div
                    className={`iade-progress-fill ${ratio >= 75 ? 'high' : ''}`}
                    style={{ width: `${Math.min(100, Math.max(0, ratio))}%` }}
                  />
                </div>
              )}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: '10px',
                  marginTop: '10px',
                }}
              >
                <div
                  style={{
                    background: 'var(--ui02)',
                    padding: '10px 12px',
                    borderLeft: '3px solid var(--brand2)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      color: 'var(--ui05)',
                    }}
                  >
                    Full Marks Target
                  </div>
                  <MarkdownPreview content={item.fullMarksDescription} />
                </div>
                <div
                  style={{
                    background: 'var(--ui02)',
                    padding: '10px 12px',
                    borderLeft: '3px solid var(--brand3)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      marginBottom: '4px',
                      color: 'var(--brand3)',
                    }}
                  >
                    Partial Marks
                  </div>
                  <MarkdownPreview content={item.partialMarksDescription} />
                </div>
              </div>

              {scoreItem && (
                <div
                  style={{
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-light)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      color: 'var(--brand3)',
                      marginBottom: '4px',
                    }}
                  >
                    Grader Justification:
                  </div>
                  <MarkdownPreview
                    content={scoreItem.justification || scoreItem.feedback}
                  />
                  {scoreItem.improvementTip && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '10px 12px',
                        background: 'var(--interactive02Focus)',
                        borderLeft: '3px solid var(--brand2)',
                      }}
                    >
                      <strong
                        style={{
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          display: 'block',
                          marginBottom: '2px',
                        }}
                      >
                        Improvement Tip:
                      </strong>
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
        <div
          style={{
            marginTop: '16px',
            padding: '16px 18px',
            background: 'var(--ui18)',
            borderLeft: '4px solid var(--brand3)',
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 900,
              textTransform: 'uppercase',
              color: 'var(--brand3)',
              marginBottom: '6px',
            }}
          >
            Overall Instructor Feedback
          </div>
          <MarkdownPreview content={evaluation.overallFeedback} />
        </div>
      )}
    </section>
  );
}
