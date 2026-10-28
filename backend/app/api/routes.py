"""API routes for dataset ingestion, querying, and system health."""

from typing import List, Optional
from fastapi import APIRouter, File, Form, UploadFile, HTTPException, status, Response
from backend.app.core.llm_client import llm_client, OllamaClientError
from backend.app.pipeline.stage1_ingestion import (
    ingestion_service,
    dataset_store,
    InvalidFileTypeError,
    EmptyFileError,
    CorruptedFileError,
    SQLValidationError,
    DatabaseConnectionError,
)
from backend.app.pipeline.stage2_query_understanding import (
    query_understanding_agent,
    ColumnValidationError,
    JSONExtractionError,
    InvalidOperationError,
)
from backend.app.pipeline.stage3_analyst_agent import analyst_agent
from backend.app.pipeline.stage4_verification import verification_layer
from backend.app.pipeline.stage5_explainability import explainability_agent
from backend.app.pipeline.stage8_report_generator import report_generator
from backend.app.pipeline.stage9_report_exporter import report_exporter
from backend.app.pipeline.orchestrator import run_pipeline
from backend.app.models.schemas import (
    UploadResponse,
    DatasetMetadata,
    DatabaseIngestRequest,
    QueryRequest,
    VeriAnalystResponse,
    QueryUnderstandingResponse,
    AnalystExecuteRequest,
    AnalystResponse,
    VerificationExecuteRequest,
    VerificationResponse,
    ExplainExecuteRequest,
    ExplainResponse,
    AskRequest,
    AskResponse,
    ReportRequest,
    ReportResponse,
)

router = APIRouter()


@router.get("/health", summary="Health Check")
async def health_check():
    """Verify backend status and Ollama qwen2.5:3b availability."""
    ollama_status = await llm_client.check_health()
    return {
        "status": "online",
        "service": "VeriAnalyst Backend",
        "active_datasets": len(dataset_store.list_all()),
        "ollama": ollama_status,
    }


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 1: Ingest Dataset",
)
async def upload_dataset(
    file: UploadFile = File(...),
    session_id: Optional[str] = Form(None),
    upload_id: Optional[str] = Form(None),
):
    """Upload CSV or Excel dataset, inspect schema, compute stats, and store in session.
    
    Accepts: .csv, .xlsx, .xls
    Returns: Ingested DatasetMetadata with columns, inferred types, missing counts, and preview rows.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided in upload payload.",
        )

    assigned_id = session_id or upload_id

    try:
        content = await file.read()
        metadata = ingestion_service.ingest_bytes(
            filename=file.filename,
            content=content,
            file_id=assigned_id,
            session_id=assigned_id,
        )
        return UploadResponse(
            file_id=metadata.file_id,
            session_id=metadata.file_id,
            upload_id=metadata.file_id,
            message=f"Dataset '{file.filename}' successfully ingested and profiled.",
            metadata=metadata,
            filename=metadata.filename,
            row_count=metadata.row_count,
            column_count=metadata.column_count,
            columns=metadata.columns,
            missing_values=metadata.missing_values,
            preview=metadata.preview_rows,
            preview_rows=metadata.preview_rows,
            source_type=metadata.source_type,
            has_structured_tables=metadata.has_structured_tables,
            has_unstructured_text=metadata.has_unstructured_text,
            unstructured_text=metadata.unstructured_text,
            table_count=metadata.table_count,
            warning=metadata.warning,
        )
    except (InvalidFileTypeError, EmptyFileError, CorruptedFileError) as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error processing dataset: {str(e)}",
        )


@router.post(
    "/ingest/database",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 7: Ingest Live Database Table/Query",
)
async def ingest_database_endpoint(request: DatabaseIngestRequest):
    """Connect to live database (PostgreSQL, MySQL, SQLite) and ingest into DataFrame.

    Enforces strict SELECT-only SQL validation and returns normalized DatasetMetadata.
    """
    try:
        metadata = ingestion_service.ingest_database(
            connection_string=request.connection_string,
            table_name=request.table_name,
            query=request.query,
            file_id=request.file_id,
            session_id=request.get_session_id(),
        )
        return UploadResponse(
            file_id=metadata.file_id,
            session_id=metadata.file_id,
            upload_id=metadata.file_id,
            message=f"Database source '{metadata.filename}' successfully ingested and profiled.",
            metadata=metadata,
            filename=metadata.filename,
            row_count=metadata.row_count,
            column_count=metadata.column_count,
            columns=metadata.columns,
            missing_values=metadata.missing_values,
            preview=metadata.preview_rows,
            preview_rows=metadata.preview_rows,
            source_type=metadata.source_type,
            has_structured_tables=metadata.has_structured_tables,
            has_unstructured_text=metadata.has_unstructured_text,
            unstructured_text=metadata.unstructured_text,
            table_count=metadata.table_count,
            warning=metadata.warning,
        )
    except SQLValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"SQL Validation Error: {str(e)}",
        )
    except DatabaseConnectionError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Database Connection Error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during database ingestion: {str(e)}",
        )


@router.get(
    "/datasets/{file_id}",
    response_model=DatasetMetadata,
    summary="Get Dataset Metadata",
)
async def get_dataset_metadata(file_id: str):
    """Retrieve metadata and schema profile for an active dataset session."""
    metadata = ingestion_service.get_metadata(file_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{file_id}' not found.",
        )
    return metadata


@router.get(
    "/datasets",
    response_model=List[str],
    summary="List Active Datasets",
)
async def list_datasets():
    """List IDs of all currently loaded datasets in memory."""
    return dataset_store.list_all()


@router.post(
    "/query/understand",
    response_model=QueryUnderstandingResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 2: Query Understanding",
)
@router.post(
    "/understand",
    response_model=QueryUnderstandingResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 2: Query Understanding (Alias)",
)
async def understand_query(request: QueryRequest):
    """Parse a natural language question into structured intent using Ollama (qwen2.5:3b).

    Requires an active session/upload ID from Stage 1. Validates that referenced
    columns exist in the dataset.
    """
    session_id = request.get_session_id()
    question = request.get_question()

    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing session/upload ID in query payload.",
        )
    if not question:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing question/query in payload.",
        )

    metadata = ingestion_service.get_metadata(session_id)
    if not metadata:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{session_id}' not found in active session store. Please upload a dataset first.",
        )

    try:
        intent = await query_understanding_agent.parse_query(
            query=question,
            metadata=metadata,
        )
        return QueryUnderstandingResponse(
            file_id=session_id,
            session_id=session_id,
            upload_id=session_id,
            operation=intent.operation,
            target_column=intent.target_column,
            group_by_column=intent.group_by_column,
            filter_condition=intent.filter_condition,
            intent=intent,
        )
    except ColumnValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Query understanding column validation error: {str(e)}",
        )
    except (JSONExtractionError, InvalidOperationError) as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Query parsing error: {str(e)}",
        )
    except OllamaClientError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"LLM service error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error during query understanding: {str(e)}",
        )


@router.post(
    "/query/execute",
    response_model=AnalystResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 3: AI Analyst Execution",
)
@router.post(
    "/execute",
    response_model=AnalystResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 3: AI Analyst Execution (Alias)",
)
async def execute_analyst_operation(request: AnalystExecuteRequest):
    """Execute matching deterministic pandas operations based on Stage 2 QueryIntent on real dataset."""
    session_id = request.get_session_id()
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing session/upload ID in execution payload.",
        )

    try:
        df = ingestion_service.load_dataset(session_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{session_id}' not found in active session store. Please upload a dataset first.",
        )

    result = analyst_agent.execute(df, request.intent)
    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.error_message or "Analyst execution failed.",
        )

    return AnalystResponse(
        file_id=session_id,
        session_id=session_id,
        upload_id=session_id,
        operation=result.operation,
        result_value=result.result_value,
        result_table=result.result_table,
        row_count_used=result.row_count_used,
        columns_used=result.columns_used,
        intent=request.intent,
        analyst_result=result,
    )


@router.post(
    "/query/verify",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 4: Verification Layer",
)
@router.post(
    "/verify",
    response_model=VerificationResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 4: Verification Layer (Alias)",
)
async def verify_analyst_result(request: VerificationExecuteRequest):
    """Independently recompute and verify results from Stage 3 against the source dataset."""
    session_id = request.get_session_id()
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing session/upload ID in verification payload.",
        )

    try:
        df = ingestion_service.load_dataset(session_id)
    except KeyError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Dataset with ID '{session_id}' not found in active session store. Please upload a dataset first.",
        )

    verification = verification_layer.verify(
        df=df,
        intent=request.intent,
        analyst_result=request.analyst_result,
    )

    return VerificationResponse(
        file_id=session_id,
        session_id=session_id,
        upload_id=session_id,
        verified=verification.verified,
        discrepancy=verification.discrepancy,
        confidence_note=verification.confidence_note,
        intent=request.intent,
        analyst_result=request.analyst_result,
        verification=verification,
    )


@router.post(
    "/query/explain",
    response_model=ExplainResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 5: Explainability Layer",
)
@router.post(
    "/explain",
    response_model=ExplainResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 5: Explainability Layer (Alias)",
)
async def explain_analysis(request: ExplainExecuteRequest):
    """Generate plain-language explanation of how the answer was computed using Ollama."""
    question = request.get_question()
    try:
        explanation = await explainability_agent.explain(
            query=question,
            intent=request.intent,
            analyst_result=request.analyst_result,
            verification=request.verification,
        )
        return ExplainResponse(
            explanation_text=explanation.explanation_text,
            explanation=explanation,
        )
    except OllamaClientError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"LLM explanation error: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected error generating explanation: {str(e)}",
        )


@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 6: End-to-End Orchestrated Analysis",
)
async def ask_question(request: AskRequest):
    """Execute the complete 6-stage VeriAnalyst pipeline in order:
    Stage 2 (parse intent) -> Stage 3 (execute) -> Stage 4 (verify) -> Stage 5 (explain) -> Stage 6 (format).
    """
    session_id = request.get_session_id()
    question = request.get_question()
    return await run_pipeline(session_id=session_id, question=question)


@router.post(
    "/query",
    response_model=AskResponse,
    summary="Stages 2-6: Conversational Analysis",
)
async def query_dataset(request: QueryRequest):
    """Execute end-to-end analysis on the dataset through Stages 2 to 6."""
    return await run_pipeline(session_id=request.file_id, question=request.query)


@router.post(
    "/report",
    response_model=ReportResponse,
    status_code=status.HTTP_200_OK,
    summary="Stage 8: Full Report Mode",
)
async def generate_full_report(request: ReportRequest):
    """Generate a comprehensive multi-section analytical report for an ingested dataset.

    Sections include:
    - Dataset Overview
    - Descriptive Statistics (numeric and categorical)
    - Key Insights (deterministically verified via Stage 3 execution and Stage 4 verification)
    - Visual Charts
    - Plain-Language Executive Summary (grounded LLM narrative)
    - Document Notes (qualitative summaries for unstructured PDF/PPTX text)
    """
    session_id = request.get_session_id()
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing session_id or file_id in report request.",
        )

    try:
        return await report_generator.generate_report(session_id=session_id)
    except KeyError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {str(e)}",
        )


@router.get(
    "/report/export",
    summary="Stage 9: Visual Report Dashboard + Multi-Format Export",
)
async def export_report_endpoint(
    session_id: str,
    format: str = "pdf",
):
    """Export the dataset report as PDF, PowerPoint (PPTX), or high-res PNG image.

    Args:
        session_id: Ingested dataset session ID.
        format: Export format ('pdf', 'pptx', or 'png').
    """
    if not session_id or not session_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="session_id query parameter is required.",
        )

    fmt = format.lower().strip()
    if fmt not in ("pdf", "pptx", "png"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported format '{format}'. Valid options are 'pdf', 'pptx', and 'png'.",
        )

    try:
        file_bytes, media_type, out_filename = await report_exporter.export_report(
            session_id=session_id.strip(), format_type=fmt
        )
        return Response(
            content=file_bytes,
            media_type=media_type,
            headers={
                "Content-Disposition": f'attachment; filename="{out_filename}"',
                "Access-Control-Expose-Headers": "Content-Disposition",
            },
        )
    except KeyError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Export failed for format '{fmt}': {str(e)}",
        )

