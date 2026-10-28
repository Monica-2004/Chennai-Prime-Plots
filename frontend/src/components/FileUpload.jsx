import React, { useState } from 'react';

/**
 * FileUpload Component (Stage 1 & Stage 7: Multi-Source Ingestion)
 * Allows users to upload files (CSV, Excel, PDF, PPTX) OR connect to a live relational database.
 */
export default function FileUpload({ onUploadSuccess, onDatabaseSuccess, isUploading }) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' | 'db'
  const [selectedFile, setSelectedFile] = useState(null);

  // Database Connection Form State
  const [connStr, setConnStr] = useState('sqlite:///data/samples/sample_company.db');
  const [tableName, setTableName] = useState('sales');
  const [sqlQuery, setSqlQuery] = useState('');
  const [dbError, setDbError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (selectedFile && onUploadSuccess) {
      onUploadSuccess(selectedFile);
    }
  };

  const handleDbConnect = (e) => {
    e.preventDefault();
    if (!connStr.trim()) {
      setDbError('Connection string is required');
      return;
    }
    setDbError(null);
    if (onDatabaseSuccess) {
      onDatabaseSuccess({
        connectionString: connStr.trim(),
        tableName: tableName.trim() || undefined,
        query: sqlQuery.trim() || undefined,
      });
    }
  };

  return (
    <div className="card file-upload-card">
      <div className="source-tabs">
        <button
          type="button"
          className={`source-tab-btn ${activeTab === 'file' ? 'active' : ''}`}
          onClick={() => setActiveTab('file')}
        >
          📁 File Upload
        </button>
        <button
          type="button"
          className={`source-tab-btn ${activeTab === 'db' ? 'active' : ''}`}
          onClick={() => setActiveTab('db')}
        >
          🗄️ Live Database
        </button>
      </div>

      {activeTab === 'file' ? (
        <div className="tab-content">
          <h3>📁 1. Dataset Ingestion</h3>
          <p className="subtitle">Upload CSV, Excel, PDF, or PowerPoint (.pptx)</p>

          <div className="upload-dropzone">
            <input
              type="file"
              accept=".csv,.xlsx,.xls,.pdf,.pptx"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {selectedFile && <span className="selected-filename">{selectedFile.name}</span>}
          </div>

          <button
            className="btn-primary"
            onClick={handleFileUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Ingesting Dataset...' : 'Upload & Profile Dataset'}
          </button>
        </div>
      ) : (
        <form onSubmit={handleDbConnect} className="tab-content db-connect-form">
          <h3>🗄️ Multi-Source Database</h3>
          <p className="subtitle">Connect to SQLite, PostgreSQL, or MySQL via SQLAlchemy</p>

          {dbError && <div className="db-error-pill">{dbError}</div>}

          <div className="form-group">
            <label>Connection String</label>
            <input
              type="text"
              placeholder="e.g. sqlite:///data/samples/sample_company.db"
              value={connStr}
              onChange={(e) => setConnStr(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label>Table Name (or leave blank to use query)</label>
            <input
              type="text"
              placeholder="e.g. employees"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              disabled={isUploading}
            />
          </div>

          <div className="form-group">
            <label>Optional SELECT Query</label>
            <input
              type="text"
              placeholder="e.g. SELECT * FROM employees WHERE salary > 60000"
              value={sqlQuery}
              onChange={(e) => setSqlQuery(e.target.value)}
              disabled={isUploading}
            />
            <small className="help-text">Strict SELECT-only queries enforced for security</small>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={!connStr.trim() || isUploading}
          >
            {isUploading ? 'Connecting & Ingesting...' : 'Connect & Load Table'}
          </button>
        </form>
      )}
    </div>
  );
}
