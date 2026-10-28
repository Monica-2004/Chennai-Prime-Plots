import React, { useState } from 'react';
import AnswerCard from './AnswerCard';

/**
 * ChatInterface Component
 * Conversational thread connecting user queries to the /ask pipeline.
 */
export default function ChatInterface({ dataset, onSendQuestion, messages, isProcessing }) {
  const [inputVal, setInputVal] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputVal.trim() || isProcessing) return;
    onSendQuestion(inputVal.trim());
    setInputVal('');
  };

  const handleChipClick = (suggestion) => {
    if (isProcessing) return;
    onSendQuestion(suggestion);
  };

  return (
    <div className="chat-interface card">
      <div className="chat-header">
        <div>
          <h3>💬 Conversational Analysis</h3>
          <p className="subtitle">
            {dataset
              ? `Querying: ${dataset.filename} (${dataset.row_count} rows)`
              : 'Upload a dataset on the left to start asking questions.'}
          </p>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="messages-stream">
        {messages.length === 0 ? (
          <div className="empty-messages">
            <div className="empty-icon">📊</div>
            <h4>Ask a question about your dataset in plain English</h4>
            <p>VeriAnalyst will parse your intent, compute the answer, independently verify it, and explain the result.</p>
            
            {dataset && (
              <div className="suggestions-container">
                <span className="suggestion-title">Suggested questions:</span>
                <div className="suggestion-chips">
                  <button 
                    type="button" 
                    className="chip-btn"
                    onClick={() => handleChipClick("Which product generated the highest revenue this month?")}
                  >
                    "Which product generated the highest revenue this month?"
                  </button>
                  <button 
                    type="button" 
                    className="chip-btn"
                    onClick={() => handleChipClick("Total revenue by category")}
                  >
                    "Total revenue by category"
                  </button>
                  <button 
                    type="button" 
                    className="chip-btn"
                    onClick={() => handleChipClick("What is the average units sold?")}
                  >
                    "What is the average units sold?"
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map((msg, index) => (
            <AnswerCard key={index} message={msg} />
          ))
        )}

        {isProcessing && (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <div className="loading-text">
              <strong>Running 6-Stage Analysis Pipeline...</strong>
              <span>Understanding query → Computing pandas operation → Independently verifying → Generating explanation</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="query-input-form">
        <input
          type="text"
          placeholder={dataset ? "Ask a question (e.g. Which product generated the highest revenue this month?)..." : "Upload a dataset first..."}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={!dataset || isProcessing}
        />
        <button type="submit" className="btn-send" disabled={!dataset || !inputVal.trim() || isProcessing}>
          {isProcessing ? 'Analyzing...' : 'Ask Agent'}
        </button>
      </form>
    </div>
  );
}
