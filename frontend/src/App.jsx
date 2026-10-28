import React, { useState, useEffect } from 'react';
import './App.css';
import FileUpload from './components/FileUpload';
import DatasetPreview from './components/DatasetPreview';
import ChatInterface from './components/ChatInterface';
import ReportView from './components/ReportView';
import { checkHealth, uploadDataset, connectDatabase, askQuestion, generateReport } from './services/api';

function App() {
  const [healthStatus, setHealthStatus] = useState({ backend: 'checking', ollama: 'checking' });
  const [dataset, setDataset] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' | 'report'
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [errorNotification, setErrorNotification] = useState(null);

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setHealthStatus({
          backend: data.status,
          ollama: data.ollama?.status === 'connected' ? 'connected' : 'disconnected',
        });
      })
      .catch(() => {
        setHealthStatus({ backend: 'disconnected', ollama: 'disconnected' });
      });
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setErrorNotification(null);
    try {
      const response = await uploadDataset(file);
      setDataset(response.metadata);
      setMessages([]);
      setReportData(null);
    } catch (err) {
      setErrorNotification(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDatabaseConnect = async (dbParams) => {
    setIsUploading(true);
    setErrorNotification(null);
    try {
      const response = await connectDatabase(dbParams);
      setDataset(response.metadata);
      setMessages([]);
      setReportData(null);
    } catch (err) {
      setErrorNotification(`Database connection failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async (question) => {
    if (!dataset) return;
    setIsProcessing(true);
    setErrorNotification(null);
    try {
      const sessionId = dataset.session_id || dataset.file_id;
      const response = await askQuestion(sessionId, question);
      setMessages((prev) => [...prev, { question, ...response }]);
    } catch (err) {
      setErrorNotification(`Query failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!dataset) return;
    setIsGeneratingReport(true);
    setErrorNotification(null);
    setViewMode('report');
    try {
      const sessionId = dataset.session_id || dataset.file_id;
      const response = await generateReport(sessionId);
      setReportData(response);
    } catch (err) {
      setErrorNotification(`Report generation failed: ${err.message}`);
    } finally {
      setIsGeneratingReport(false);
    }
  };

  return (
    <div className="verianalyst-app">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <h1>⚡ VeriAnalyst</h1>
          <span className="tagline">Explainable AI Agent for Conversational Data Analysis</span>
        </div>

        {/* View Mode Navigation Switcher */}
        <div className="view-mode-tabs">
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'chat' ? 'active' : ''}`}
            onClick={() => setViewMode('chat')}
          >
            💬 Conversational Chat
          </button>
          <button
            type="button"
            className={`view-tab-btn ${viewMode === 'report' ? 'active' : ''}`}
            onClick={() => {
              setViewMode('report');
              if (!reportData && dataset && !isGeneratingReport) {
                handleGenerateReport();
              }
            }}
          >
            📑 Full Report Mode
          </button>
        </div>

        <div className="system-status">
          <span className={`status-pill ${healthStatus.backend}`}>
            Backend: {healthStatus.backend}
          </span>
          <span className={`status-pill ${healthStatus.ollama}`}>
            Ollama (qwen2.5:3b): {healthStatus.ollama}
          </span>
        </div>
      </header>

      {/* Error notification banner */}
      {errorNotification && (
        <div className="error-banner">
          <span>{errorNotification}</span>
          <button onClick={() => setErrorNotification(null)}>✕</button>
        </div>
      )}

      {/* Main Workspace */}
      <main className="app-workspace">
        <aside className="sidebar">
          <FileUpload
            onUploadSuccess={handleUpload}
            onDatabaseSuccess={handleDatabaseConnect}
            isUploading={isUploading}
          />

          {dataset && (
            <div className="card report-trigger-card">
              <h4>📑 Automated Analysis</h4>
              <p className="subtitle">Run full dataset audit with Stage 4 mathematical verification</p>
              <button
                className="btn-primary"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
              >
                {isGeneratingReport ? '⚡ Generating Report...' : '📊 Generate Full Report'}
              </button>
            </div>
          )}

          <DatasetPreview metadata={dataset} />
        </aside>

        <section className="main-content-pane">
          {viewMode === 'chat' ? (
            <ChatInterface
              dataset={dataset}
              messages={messages}
              onSendQuestion={handleAskQuestion}
              isProcessing={isProcessing}
            />
          ) : (
            <ReportView
              report={reportData}
              isLoading={isGeneratingReport}
              onRefresh={handleGenerateReport}
              datasetName={dataset?.filename}
            />
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
