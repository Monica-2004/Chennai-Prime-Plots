"""Main entrypoint for the VeriAnalyst FastAPI application."""
from fastapi.responses import HTMLResponse
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.routes import router as api_router

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Explainable AI Agent for Conversational Data Analysis",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust to React dev server port (e.g., http://localhost:3000 / 5173) in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Optional
from fastapi import UploadFile, File, Form
from backend.app.models.schemas import (
    AskRequest,
    AskResponse,
    UploadResponse,
    QueryRequest,
    QueryUnderstandingResponse,
    AnalystExecuteRequest,
    AnalystResponse,
    VerificationExecuteRequest,
    VerificationResponse,
    ExplainExecuteRequest,
    ExplainResponse,
    DatabaseIngestRequest,
    ReportRequest,
    ReportResponse,
)
from backend.app.pipeline.orchestrator import run_pipeline
from backend.app.api.routes import (
    health_check,
    upload_dataset,
    ingest_database_endpoint,
    understand_query,
    execute_analyst_operation,
    verify_analyst_result,
    explain_analysis,
    generate_full_report,
    export_report_endpoint,
)

# Include API endpoints under /api
app.include_router(api_router, prefix="/api")


@app.get("/health", summary="Health Check (Root)")
async def root_health():
    """Direct root health check matching /api/health."""
    return await health_check()


@app.get("/report/export", summary="Stage 9: Export Report (Root)")
async def root_export_report(session_id: str, format: str = "pdf"):
    """Direct root export matching /api/report/export."""
    return await export_report_endpoint(session_id=session_id, format=format)



@app.post("/upload", response_model=UploadResponse, summary="Stage 1: Ingest Dataset (Root)")
async def root_upload(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    upload_id: Optional[str] = Form(None),
):
    """Direct root /upload endpoint matching /api/upload."""
    return await upload_dataset(file=file, session_id=session_id, upload_id=upload_id)


@app.post("/ingest/database", response_model=UploadResponse, summary="Stage 7: Ingest Database (Root)")
async def root_ingest_database(request: DatabaseIngestRequest):
    """Direct root endpoint for database ingestion matching /api/ingest/database."""
    return await ingest_database_endpoint(request=request)


@app.post(
    "/query/understand",
    response_model=QueryUnderstandingResponse,
    summary="Stage 2: Query Understanding (Root)",
)
@app.post(
    "/understand",
    response_model=QueryUnderstandingResponse,
    summary="Stage 2: Query Understanding (Root Alias)",
)
async def root_understand(request: QueryRequest):
    """Direct root endpoint matching /api/query/understand."""
    return await understand_query(request=request)


@app.post(
    "/query/execute",
    response_model=AnalystResponse,
    summary="Stage 3: AI Analyst Execution (Root)",
)
@app.post(
    "/execute",
    response_model=AnalystResponse,
    summary="Stage 3: AI Analyst Execution (Root Alias)",
)
async def root_execute(request: AnalystExecuteRequest):
    """Direct root endpoint matching /api/query/execute."""
    return await execute_analyst_operation(request=request)


@app.post(
    "/query/verify",
    response_model=VerificationResponse,
    summary="Stage 4: Verification Layer (Root)",
)
@app.post(
    "/verify",
    response_model=VerificationResponse,
    summary="Stage 4: Verification Layer (Root Alias)",
)
async def root_verify(request: VerificationExecuteRequest):
    """Direct root endpoint matching /api/query/verify."""
    return await verify_analyst_result(request=request)


@app.post(
    "/query/explain",
    response_model=ExplainResponse,
    summary="Stage 5: Explainability Layer (Root)",
)
@app.post(
    "/explain",
    response_model=ExplainResponse,
    summary="Stage 5: Explainability Layer (Root Alias)",
)
async def root_explain(request: ExplainExecuteRequest):
    """Direct root endpoint matching /api/query/explain."""
    return await explain_analysis(request=request)


@app.post("/ask", response_model=AskResponse, summary="Root End-to-End Analysis")
async def root_ask(request: AskRequest):
    return await run_pipeline(session_id=request.get_session_id(), question=request.get_question())


@app.post("/report", response_model=ReportResponse, summary="Stage 8: Full Report Mode (Root)")
async def root_report(request: ReportRequest):
    """Direct root endpoint for full report generation matching /api/report."""
    return await generate_full_report(request=request)


from pathlib import Path
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles

BUILD_DIR = Path(__file__).resolve().parent.parent / "frontend" / "build"
STATIC_DIR = BUILD_DIR / "static"

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


def get_simple_html() -> str:
    return """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>VeriAnalyst — Explainable AI Agent</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body class="bg-gray-50 h-screen flex flex-col font-sans">
    <header class="bg-white shadow p-4 flex justify-between items-center z-10">
        <div>
            <h1 class="text-xl font-bold text-gray-800">⚡ VeriAnalyst</h1>
            <p class="text-xs text-gray-500">Explainable AI Agent for Conversational Data Analysis</p>
        </div>
        <div class="flex items-center space-x-2">
            <input type="file" id="fileInput" class="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" accept=".csv,.xlsx,.xls,.pdf,.pptx">
            <button onclick="uploadFile()" class="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 font-medium">Upload Data</button>
        </div>
    </header>

    <main id="chatbox" class="flex-1 p-4 overflow-y-auto space-y-6 container mx-auto max-w-4xl"></main>

    <footer class="bg-white p-4 border-t">
        <div class="container mx-auto max-w-4xl flex space-x-2">
            <input type="text" id="queryInput" placeholder="Ask a question (e.g. Which product generated the highest revenue this month?)..." class="flex-1 border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-500" onkeypress="if(event.key === 'Enter') askQuestion()">
            <button onclick="askQuestion()" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 font-medium">Ask Agent</button>
        </div>
    </footer>

    <script>
        let sessionId = null;
        let chartIdCounter = 0;

        async function uploadFile() {
            const file = document.getElementById('fileInput').files[0];
            if (!file) return alert("Please select a file first.");
            const formData = new FormData();
            formData.append("file", file);

            try {
                addMessage("System", "Uploading file and profiling schema, please wait...");
                
                const res = await fetch('/upload', { method: 'POST', body: formData });
                const data = await res.json();
                
                if (res.ok) {
                    sessionId = (data.dataset_info && data.dataset_info.session_id) ? data.dataset_info.session_id : (data.session_id || data.file_id);
                    
                    if (!sessionId) {
                        addMessage("System", "Error: File uploaded, but no session ID was returned.", true);
                        return;
                    }
                    
                    const fileName = (data.dataset_info && data.dataset_info.filename) ? data.dataset_info.filename : (data.filename || file.name);
                    const rowCount = data.row_count || (data.metadata && data.metadata.row_count) || '';
                    const colList = (data.columns || (data.metadata && data.metadata.columns) || []).map(c => c.name).join(', ');
                    addMessage("System", `Dataset loaded: <b>${fileName}</b> (${rowCount} rows).<br>Columns: <code>${colList}</code><br>Ready for questions!`);
                } else {
                    const errMsg = data.detail || JSON.stringify(data);
                    addMessage("System", `Error: ${errMsg}`, true);
                }
            } catch (error) {
                addMessage("System", `Upload Error: ${error.message}`, true);
            }
        }

        async function askQuestion() {
            const input = document.getElementById('queryInput');
            const query = input.value.trim();
            if (!query || !sessionId) return alert(!sessionId ? "Please upload a dataset first." : "Please enter a question.");
            
            input.value = "";
            addMessage("You", query);

            try {
                const res = await fetch('/ask', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ session_id: sessionId, question: query })
                });
                
                const data = await res.json();
                renderAgentResponse(data);
            } catch (err) {
                addMessage("System", `Query error: ${err.message}`, true);
            }
        }

        function addMessage(sender, text, isError=false) {
            const box = document.getElementById('chatbox');
            const div = document.createElement('div');
            const align = sender === 'You' ? 'text-right' : 'text-left';
            const bg = sender === 'You' ? 'bg-blue-100 text-blue-900' : (isError ? 'bg-red-100 text-red-900' : 'bg-white text-gray-800 border');
            
            div.className = `${align}`;
            div.innerHTML = `<div class="inline-block p-4 rounded-lg shadow-sm max-w-[80%] ${bg}"><b>${sender}:</b><div class="mt-1">${text}</div></div>`;
            box.appendChild(div);
            box.scrollTop = box.scrollHeight;
        }

        function renderAgentResponse(response) {
            const box = document.getElementById('chatbox');
            const wrapper = document.createElement('div');
            wrapper.className = "text-left";
            
            const bubble = document.createElement('div');
            bubble.className = "inline-block p-5 rounded-xl shadow-sm max-w-[90%] bg-white border border-gray-200 text-gray-800 w-full";
            
            let html = `<div class="flex items-center justify-between border-b pb-2 mb-3">`;
            html += `<span class="font-bold text-gray-900">VeriAnalyst Response</span>`;
            if (!response.verified) {
                html += `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">⚠️ Unverified</span>`;
            } else {
                html += `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-300">✓ Grounded & Verified</span>`;
            }
            html += `</div>`;

            html += `<p class="text-lg font-semibold text-gray-900">${response.answer_text}</p>`;

            if (!response.verified) {
                html += `<div class="mt-3 p-3 bg-red-50 text-red-800 text-sm rounded-lg border border-red-200"><b>⚠️ Verification Notice:</b> ${response.warning || 'Result could not be independently confirmed against the dataset.'}</div>`;
            } else if (response.warning) {
                html += `<div class="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200"><b>ℹ️ Note:</b> ${response.warning}</div>`;
            }

            const chartType = response.chart ? (response.chart.chart_type || response.chart.type) : null;
            const chartContainerId = 'chart-' + chartIdCounter++;

            if (chartType === 'bar' && response.chart.data) {
                html += `<div class="mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200 h-64"><h4 class="text-xs font-semibold text-gray-600 mb-2">${response.chart.title || 'Comparison Breakdown'}</h4><canvas id="${chartContainerId}"></canvas></div>`;
            } else if (chartType === 'metric') {
                html += `
                <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                        <p class="text-xs font-semibold text-blue-600 uppercase tracking-wide">${response.chart.title || 'Key Metric'}</p>
                        <p class="text-2xl font-bold text-gray-900 mt-1">${response.chart.label ? response.chart.label + ': ' : ''}${response.chart.value != null ? response.chart.value : 'N/A'}</p>
                    </div>
                    <div class="text-2xl text-blue-500">📊</div>
                </div>`;
            }

            if (response.result_table && response.result_table.length > 0) {
                let tableHtml = '<div class="mt-4 overflow-x-auto rounded-lg border border-gray-200"><table class="min-w-full text-sm text-left">';
                const headers = Object.keys(response.result_table[0]);
                tableHtml += '<thead class="bg-gray-100 text-gray-700 border-b border-gray-200"><tr>';
                headers.forEach(header => {
                    tableHtml += `<th class="py-2 px-4 font-semibold">${header.replace('_', ' ').toUpperCase()}</th>`;
                });
                tableHtml += '</tr></thead><tbody class="divide-y divide-gray-100">';
                response.result_table.forEach(row => {
                    tableHtml += '<tr class="hover:bg-gray-50 bg-white">';
                    headers.forEach(header => {
                        let cellValue = row[header];
                        if (cellValue === null || cellValue === undefined) cellValue = "null";
                        else if (typeof cellValue === 'number' && !Number.isInteger(cellValue)) cellValue = cellValue.toFixed(2);
                        tableHtml += `<td class="py-2 px-4 text-gray-600">${cellValue}</td>`;
                    });
                    tableHtml += '</tr>';
                });
                tableHtml += '</tbody></table></div>';
                html += tableHtml;
            }

            html += `
            <details class="mt-4 cursor-pointer group rounded-lg border border-gray-200 bg-gray-50 p-3" open>
                <summary class="text-sm font-semibold text-blue-600 hover:text-blue-800 focus:outline-none">💡 View Reasoning &amp; Explanation</summary>
                <p class="mt-2 text-sm text-gray-700 leading-relaxed">${response.explanation_text}</p>
            </details>`;

            bubble.innerHTML = html;
            wrapper.appendChild(bubble);
            box.appendChild(wrapper);
            box.scrollTop = box.scrollHeight;

            if (chartType === 'bar' && response.chart.data) {
                const canvasElem = document.getElementById(chartContainerId);
                if (canvasElem) {
                    const ctx = canvasElem.getContext('2d');
                    const xKey = response.chart.x_key || response.chart.x_col || 'label';
                    const yKey = response.chart.y_key || response.chart.y_col || 'value';
                    const labels = response.chart.data.map(row => String(row[xKey] ?? 'N/A'));
                    const values = response.chart.data.map(row => (typeof row[yKey] === 'number' ? row[yKey] : 0));
                    new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: labels,
                            datasets: [{
                                label: response.chart.title || yKey,
                                data: values,
                                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                                borderColor: 'rgb(59, 130, 246)',
                                borderWidth: 1
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true } }
                        }
                    });
                }
            }
        }
    </script>
</body>
</html>"""


@app.get("/")
async def serve_ui():
    index_file = BUILD_DIR / "index.html"
    if index_file.exists():
        return FileResponse(str(index_file))
    return HTMLResponse(content=get_simple_html())


@app.get("/simple")
async def serve_simple_ui():
    return HTMLResponse(content=get_simple_html())


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)