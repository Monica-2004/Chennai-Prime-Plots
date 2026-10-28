import React, { useState } from 'react';

/**
 * ExplanationPanel Component
 * Expandable drawer under each answer showing plain-language explanation_text,
 * grounding audit details, and verification status.
 */
export default function ExplanationPanel({ explanationText, verified, warning }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!explanationText && !warning) return null;

  return (
    <div className={`explanation-panel ${isOpen ? 'expanded' : 'collapsed'}`}>
      <button 
        type="button" 
        className="explanation-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="toggle-label">
          <span className="toggle-arrow">{isOpen ? '▼' : '▶'}</span>
          <span>{isOpen ? 'Hide Explanation' : 'View Plain-Language Explanation'}</span>
        </span>
        <span className={`verification-badge ${verified ? 'verified' : 'unverified'}`}>
          {verified ? '✓ Mathematically Verified' : '⚠ Verification Failed'}
        </span>
      </button>

      {isOpen && (
        <div className="explanation-body">
          <div className="explanation-section">
            <h4>💡 How this answer was derived:</h4>
            <p className="explanation-text-content">{explanationText}</p>
          </div>

          {warning && (
            <div className={`explanation-warning-box ${verified ? 'info' : 'danger'}`}>
              <strong>{verified ? 'ℹ️ Note:' : '⚠️ Warning:'}</strong> {warning}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
