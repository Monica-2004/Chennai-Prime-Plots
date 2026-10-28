import React from 'react';

/**
 * ChartRenderer Component
 * Renders bar charts, line trends, or single-value metric callouts based on Stage 6 & 8 chart specs.
 */
export default function ChartRenderer({ chartSpec }) {
  if (!chartSpec) return null;

  // Single KPI / Metric Callout
  if (chartSpec.chart_type === 'metric') {
    return (
      <div className="metric-callout-card">
        <div className="metric-title">{chartSpec.title || 'Metric Result'}</div>
        <div className="metric-value">
          {typeof chartSpec.value === 'number'
            ? `$${chartSpec.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
            : String(chartSpec.value)}
        </div>
        {chartSpec.label && <div className="metric-label">{chartSpec.label}</div>}
      </div>
    );
  }

  // Interactive / Visual Bar Chart
  if (chartSpec.chart_type === 'bar' && Array.isArray(chartSpec.data)) {
    const { x_key, y_key, data, title } = chartSpec;
    
    // Calculate max value for bar scaling
    const validValues = data
      .map((d) => (typeof d[y_key] === 'number' ? d[y_key] : 0))
      .filter((v) => !isNaN(v));
    const maxValue = validValues.length > 0 ? Math.max(...validValues) : 1;

    return (
      <div className="chart-renderer-card">
        <h4 className="chart-title">📊 {title || 'Comparison Breakdown'}</h4>
        <div className="bar-chart-container">
          {data.map((item, idx) => {
            const label = String(item[x_key] || `Item ${idx + 1}`);
            const rawVal = item[y_key];
            const numVal = typeof rawVal === 'number' ? rawVal : 0;
            const pct = Math.min(100, Math.max(0, (numVal / (maxValue || 1)) * 100));
            const displayVal = rawVal === null || rawVal === undefined 
              ? 'null' 
              : typeof rawVal === 'number' 
                ? `$${rawVal.toLocaleString()}` 
                : String(rawVal);

            return (
              <div key={idx} className="bar-row">
                <div className="bar-label" title={label}>{label}</div>
                <div className="bar-track">
                  <div 
                    className="bar-fill" 
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="bar-value">{displayVal}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Time-Series / Trend Line Chart (SVG rendered)
  if (chartSpec.chart_type === 'line' && Array.isArray(chartSpec.data) && chartSpec.data.length > 0) {
    const { x_key, y_key, data, title } = chartSpec;
    const values = data.map((d) => (typeof d[y_key] === 'number' ? d[y_key] : 0));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    const width = 500;
    const height = 180;
    const padding = 35;

    const points = data.map((d, i) => {
      const x = padding + (i / Math.max(1, data.length - 1)) * (width - 2 * padding);
      const val = typeof d[y_key] === 'number' ? d[y_key] : minVal;
      const y = height - padding - ((val - minVal) / range) * (height - 2 * padding);
      return { x, y, label: d[x_key], val };
    });

    const pathD = points.length === 1
      ? `M ${points[0].x} ${points[0].y}`
      : points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

    return (
      <div className="chart-renderer-card line-chart-card">
        <h4 className="chart-title">📈 {title || 'Trend Progression'}</h4>
        <div className="line-chart-container">
          <svg viewBox={`0 0 ${width} ${height}`} className="line-chart-svg">
            {/* Grid line */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" strokeWidth="1" />
            <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" strokeWidth="1" />

            {/* Path line */}
            <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="5" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
                <text x={p.x} y={height - 12} textAnchor="middle" fill="#94a3b8" fontSize="11">
                  {p.label}
                </text>
                <text x={p.x} y={p.y - 10} textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">
                  {typeof p.val === 'number' ? p.val.toLocaleString() : p.val}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  }

  return null;
}
