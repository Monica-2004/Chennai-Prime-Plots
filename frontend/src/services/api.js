/**
 * API Service for interacting with VeriAnalyst backend.
 */

const API_BASE_URL = process.env.REACT_APP_API_URL !== undefined
  ? process.env.REACT_APP_API_URL
  : (typeof window !== 'undefined' && window.location.port === '3000' ? 'http://localhost:8000' : '');

/**
 * Health check endpoint for API and Ollama.
 */
export async function checkHealth() {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
}

/**
 * Stage 1 & 7: Upload CSV, Excel, PDF, or PPTX file and get dataset metadata.
 */
export async function uploadDataset(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Upload failed');
  }

  return response.json();
}

/**
 * Stage 7: Ingest data directly from a live relational database (SQLite, PostgreSQL, MySQL).
 */
export async function connectDatabase({ connectionString, tableName, query, sessionId }) {
  const payload = {
    connection_string: connectionString,
    table_name: tableName || null,
    query: query || null,
    session_id: sessionId || null,
  };

  const response = await fetch(`${API_BASE_URL}/ingest/database`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Database connection failed');
  }

  return response.json();
}

/**
 * Stage 6: Orchestrated /ask endpoint running full Stages 2-6 pipeline.
 */
export async function askQuestion(sessionId, question) {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, question }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Question processing failed');
  }

  return response.json();
}

/**
 * Stage 8: Generate comprehensive verified report for loaded dataset.
 */
export async function generateReport(sessionId) {
  const response = await fetch(`${API_BASE_URL}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Report generation failed');
  }

  return response.json();
}

/**
 * Stage 9: Get direct URL to download report in PDF, PPTX, or PNG.
 */
export function getExportUrl(sessionId, format = 'pdf') {
  return `${API_BASE_URL}/report/export?session_id=${encodeURIComponent(sessionId)}&format=${encodeURIComponent(format)}`;
}

/**
 * Stage 9: Trigger download of report file in browser.
 */
export async function downloadReportFile(sessionId, format = 'pdf') {
  const url = getExportUrl(sessionId, format);
  const response = await fetch(url);
  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Export download failed' }));
    throw new Error(err.detail || `Export failed with status ${response.status}`);
  }
  const blob = await response.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.setAttribute('download', `VeriAnalyst_Report_${sessionId}.${format}`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(blobUrl);
}

