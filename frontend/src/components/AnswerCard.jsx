import React from 'react';
import ExplanationPanel from './ExplanationPanel';
import ChartRenderer from './ChartRenderer';

/**
 * AnswerCard Component
 * Displays the verified answer card with answer_text, table, chart,
 * explanation panel, and status/warning badges.
 */
export default function AnswerCard({ message }) {
  const {
    question,
    answer_text,
    result_table,
    chart,
    explanation_text,
    verified,
    warning,
  } = message;

  return (
    <div className={`answer-card ${verified ? 'card-verified' : 'card-unverified'}`}>
      {/* Question Header */}
      {question && (
        <div className="card-question-header">
          <span className="question-prefix">Q:</span>
          <span className="question-text">{question}</span>
        </div>
      )}

      {/* Main Answer Header & Status Badge */}
      <div className="answer-header-row">
        <div className={`status-badge-pill ${verified ? 'badge-verified' : 'badge-unverified'}`}>
          {verified ? '✓ Grounded & Verified' : '⚠️ Unverified Result'}
        </div>
      </div>

      {/* Answer Text */}
      <div className="answer-text-banner">
        <p>{answer_text}</p>
      </div>

      {/* Prominent Warning Badge if verified is false or warning present */}
      {(!verified || warning) && (
        <div className={`warning-callout ${verified ? 'callout-info' : 'callout-danger'}`}>
          <span className="warning-icon">{verified ? 'ℹ️' : '⚠️'}</span>
          <span className="warning-text">
            {!verified 
              ? (warning || 'This result could not be verified against the source dataset.')
              : warning}
          </span>
        </div>
      )}

      {/* Visual Chart if present */}
      {chart && (
        <div className="card-chart-section">
          <ChartRenderer chartSpec={chart} />
        </div>
      )}

      {/* Tabular Data Preview if present */}
      {Array.isArray(result_table) && result_table.length > 0 && (
        <div className="card-table-section">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {Object.keys(result_table[0]).map((headerKey) => (
                    <th key={headerKey}>{headerKey.replace('_', ' ').toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result_table.map((row, rowIdx) => (
                  <tr key={rowIdx}>
                    {Object.keys(result_table[0]).map((colKey) => (
                      <td key={colKey}>
                        {row[colKey] === null || row[colKey] === undefined
                          ? <span className="null-val">null</span>
                          : String(row[colKey])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Expandable Explanation Panel */}
      <ExplanationPanel 
        explanationText={explanation_text} 
        verified={verified} 
        warning={warning} 
      />
    </div>
  );
}
