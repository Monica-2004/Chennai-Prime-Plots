import React from 'react';

/**
 * DatasetPreview Component (Stub)
 * Displays columns, inferred data types, missing value counts, and row preview.
 */
export default function DatasetPreview({ metadata }) {
  if (!metadata) {
    return (
      <div className="card empty-state">
        <p>No dataset loaded. Upload a file to see dataset profile.</p>
      </div>
    );
  }

  return (
    <div className="card dataset-preview-card">
      <div className="preview-header">
        <h3>📊 Dataset Overview: {metadata.filename}</h3>
        <span className="badge">
          {metadata.row_count} rows × {metadata.column_count} columns
        </span>
      </div>

      <div className="columns-grid">
        <h4>Columns & Types</h4>
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Data Type</th>
              <th>Missing Values</th>
            </tr>
          </thead>
          <tbody>
            {(metadata.columns || []).map((col) => (
              <tr key={col.name}>
                <td><code>{col.name}</code></td>
                <td>{col.dtype}</td>
                <td>
                  {col.missing_count} ({col.missing_percentage.toFixed(1)}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
