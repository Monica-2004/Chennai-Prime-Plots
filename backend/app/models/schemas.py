"""Pydantic schemas and data contracts across all 6 pipeline stages."""

from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


# ==========================================
# Stage 1: Data Ingestion Schemas
# ==========================================
class ColumnInfo(BaseModel):
    """Metadata describing a single column in the dataset."""
    name: str
    dtype: str
    missing_count: int
    missing_percentage: float
    sample_values: List[Any] = Field(default_factory=list)


class DatasetMetadata(BaseModel):
    """Summary of ingested dataset file or external source."""
    file_id: str
    filename: str
    row_count: int
    column_count: int
    columns: List[ColumnInfo]
    preview_rows: List[Dict[str, Any]] = Field(default_factory=list)
    missing_values: Dict[str, int] = Field(default_factory=dict)

    # Stage 7 Multi-Source Ingestion Extensions
    source_type: Literal["csv", "excel", "db", "pdf", "pptx"] = "csv"
    has_structured_tables: bool = True
    has_unstructured_text: bool = False
    unstructured_text: Optional[str] = None
    unstructured_notes: List[Dict[str, Any]] = Field(default_factory=list)
    tables: List[Dict[str, Any]] = Field(default_factory=list)
    table_count: int = 1
    warning: Optional[str] = None


class DatabaseIngestRequest(BaseModel):
    """Request payload for live database connection ingestion (Stage 7)."""
    connection_string: str = Field(
        ...,
        description="SQLAlchemy database connection URI (e.g., postgresql://..., mysql://..., sqlite:///...)"
    )
    table_name: Optional[str] = Field(
        default=None,
        description="Database table name to load"
    )
    query: Optional[str] = Field(
        default=None,
        description="Validated SELECT-only SQL query"
    )
    session_id: Optional[str] = None
    file_id: Optional[str] = None
    upload_id: Optional[str] = None

    def get_session_id(self) -> str:
        sid = self.session_id or self.upload_id or self.file_id
        return (sid or "").strip()


# ==========================================
# Stage 2: Query Understanding Schemas
# ==========================================
class FilterCondition(BaseModel):
    """Specification of filtering logic."""
    column: str
    operator: str  # e.g., '==', '!=', '>', '<', '>=', '<=', 'contains', 'in'
    value: Any


class QueryIntent(BaseModel):
    """Structured representation of the user query parsed by LLM."""
    raw_query: str
    operation: str = Field(
        ...,
        description="Core operation: sum, average, max, min, count, compare, filter"
    )
    target_column: Optional[str] = Field(
        default=None,
        description="The primary metric or target column from the dataset, or null"
    )
    group_by_column: Optional[str] = Field(
        default=None,
        description="Column used for grouping or comparison, or null"
    )
    filter_condition: Optional[str] = Field(
        default=None,
        description="Plain description of filter condition, or null"
    )


class QueryUnderstandingResponse(BaseModel):
    """Response payload for Stage 2 Query Understanding."""
    operation: str
    target_column: Optional[str] = None
    group_by_column: Optional[str] = None
    filter_condition: Optional[str] = None
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    file_id: str
    intent: QueryIntent


# ==========================================
# Stage 3: AI Analyst Agent Schemas
# ==========================================
class AnalystExecutionResult(BaseModel):
    """Result of running matching pandas operations on real data."""
    success: bool
    operation: str
    result_value: Optional[Any] = None
    result_table: Optional[List[Dict[str, Any]]] = None
    row_count_used: int = 0
    columns_used: List[str] = Field(default_factory=list)
    pandas_snippet: Optional[str] = None
    execution_time_ms: float = 0.0
    warnings: List[str] = Field(default_factory=list)
    error_message: Optional[str] = None


class AnalystExecuteRequest(BaseModel):
    """Request payload for executing Stage 3 on an existing intent."""
    file_id: Optional[str] = None
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    intent: QueryIntent

    def get_session_id(self) -> str:
        sid = self.session_id or self.upload_id or self.file_id
        return (sid or "").strip()


class AnalystResponse(BaseModel):
    """Response payload for Stage 3 AI Analyst Execution."""
    file_id: str
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    operation: str
    result_value: Optional[Any] = None
    result_table: Optional[List[Dict[str, Any]]] = None
    row_count_used: int = 0
    columns_used: List[str] = Field(default_factory=list)
    intent: QueryIntent
    analyst_result: AnalystExecutionResult


# ==========================================
# Stage 4: Verification Layer Schemas
# ==========================================
class VerificationResult(BaseModel):
    """Independent deterministic recomputation to ensure grounding."""
    verified: bool = Field(..., description="Whether the result was successfully verified and grounded")
    discrepancy: Optional[str] = Field(default=None, description="Details of any mismatch or validation failure")
    confidence_note: str = Field(..., description="Short explanation of verification outcome")
    status: Literal["exact_match", "tolerance_match", "mismatch", "failed"] = Field(default="exact_match")
    original_value: Optional[Any] = None
    recomputed_value: Optional[Any] = None
    deterministic_steps: List[str] = Field(default_factory=list)

    @property
    def is_verified(self) -> bool:
        return self.verified


class VerificationExecuteRequest(BaseModel):
    """Request payload for Stage 4 Verification."""
    file_id: Optional[str] = None
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    intent: QueryIntent
    analyst_result: AnalystExecutionResult

    def get_session_id(self) -> str:
        sid = self.session_id or self.upload_id or self.file_id
        return (sid or "").strip()


class VerificationResponse(BaseModel):
    """Response payload for Stage 4 Verification."""
    file_id: str
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    verified: bool
    discrepancy: Optional[str] = None
    confidence_note: str
    intent: QueryIntent
    analyst_result: AnalystExecutionResult
    verification: VerificationResult


# ==========================================
# Stage 5: Explainability Layer Schemas
# ==========================================
class ExplanationResult(BaseModel):
    """Plain-language explanation of how the result was computed."""
    explanation_text: str = Field(
        ...,
        description="Short 2-3 sentence plain-language explanation of reasoning"
    )
    summary: Optional[str] = None
    step_by_step_rationale: List[str] = Field(default_factory=list)
    caveats_or_filters: List[str] = Field(default_factory=list)


class ExplainExecuteRequest(BaseModel):
    """Request payload for Stage 5 Explainability."""
    file_id: Optional[str] = None
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    query: Optional[str] = None
    question: Optional[str] = None
    intent: QueryIntent
    analyst_result: AnalystExecutionResult
    verification: VerificationResult

    def get_question(self) -> str:
        q = self.question or self.query
        return (q or "").strip()

    def get_session_id(self) -> str:
        sid = self.session_id or self.upload_id or self.file_id
        return (sid or "").strip()


class ExplainResponse(BaseModel):
    """Response payload for Stage 5 Explainability."""
    explanation_text: str
    explanation: Optional[ExplanationResult] = None


# ==========================================
# Stage 6: Output Formatter Schemas
# ==========================================
class ChartSpecification(BaseModel):
    """Visualization metadata for frontend rendering."""
    chart_type: Literal["bar", "line", "pie", "scatter", "none"]
    title: str
    x_axis: Optional[str] = None
    y_axis: Optional[str] = None
    data: List[Dict[str, Any]] = Field(default_factory=list)


class TableData(BaseModel):
    """Tabular preview for frontend display."""
    columns: List[str]
    rows: List[Dict[str, Any]]


class VeriAnalystResponse(BaseModel):
    """Unified API response for conversational analysis."""
    file_id: str
    query: str
    intent: QueryIntent
    answer_text: str
    table: Optional[TableData] = None
    chart: Optional[ChartSpecification] = None
    verification: VerificationResult
    explanation: ExplanationResult


class AskRequest(BaseModel):
    """Orchestration request accepting session_id/file_id and question/query."""
    session_id: Optional[str] = None
    file_id: Optional[str] = None
    question: Optional[str] = None
    query: Optional[str] = None

    def get_session_id(self) -> str:
        sid = self.session_id or self.file_id
        return sid or ""

    def get_question(self) -> str:
        q = self.question or self.query
        return q or ""


class AskResponse(BaseModel):
    """Stage 6 End-to-end orchestrated answer payload."""
    answer_text: str
    result_table: Optional[List[Dict[str, Any]]] = None
    chart: Optional[Dict[str, Any]] = None
    explanation_text: str
    verified: bool
    warning: Optional[str] = None


# ==========================================
# Stage 8: Full Report Mode Schemas
# ==========================================
class ReportSection(BaseModel):
    """Section within the full structured report."""
    type: Literal["overview", "stat", "insight", "chart", "narrative", "document_notes"]
    title: str
    data: Any


class KeyInsightItem(BaseModel):
    """Auto-generated insight verified via Stage 3 & 4."""
    title: str
    operation: str
    target_column: Optional[str] = None
    group_by_column: Optional[str] = None
    result_value: Optional[Any] = None
    insight_text: str
    verified: bool = True
    verification_status: str = "exact_match"
    discrepancy: Optional[str] = None
    chart: Optional[Dict[str, Any]] = None


class ReportRequest(BaseModel):
    """Request payload for generating a full analysis report."""
    session_id: Optional[str] = None
    file_id: Optional[str] = None
    upload_id: Optional[str] = None

    def get_session_id(self) -> str:
        sid = self.session_id or self.file_id or self.upload_id
        return (sid or "").strip()


class ReportResponse(BaseModel):
    """Full analysis report payload for Stage 8."""
    session_id: str
    dataset_overview: Dict[str, Any]
    descriptive_statistics: Dict[str, Any]
    key_insights: List[KeyInsightItem] = Field(default_factory=list)
    charts: List[Dict[str, Any]] = Field(default_factory=list)
    narrative_summary: str
    document_notes: Optional[Dict[str, Any]] = None
    sections: List[ReportSection] = Field(default_factory=list)
    all_insights_verified: bool = True


# ==========================================
# API Request / Response Wrappers
# ==========================================
class QueryRequest(BaseModel):
    """User query payload for query understanding and downstream stages."""
    file_id: Optional[str] = None
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    query: Optional[str] = None
    question: Optional[str] = None

    def get_session_id(self) -> str:
        sid = self.session_id or self.upload_id or self.file_id
        return (sid or "").strip()

    def get_question(self) -> str:
        q = self.question or self.query
        return (q or "").strip()


class UploadResponse(BaseModel):
    """Dataset upload response payload."""
    file_id: str
    message: str
    metadata: DatasetMetadata

    # Direct top-level access to Stage 1 ingestion fields
    session_id: Optional[str] = None
    upload_id: Optional[str] = None
    filename: Optional[str] = None
    row_count: Optional[int] = None
    column_count: Optional[int] = None
    columns: Optional[List[ColumnInfo]] = None
    missing_values: Optional[Dict[str, int]] = None
    preview: Optional[List[Dict[str, Any]]] = None
    preview_rows: Optional[List[Dict[str, Any]]] = None

    # Stage 7 Multi-Source top-level access
    source_type: Optional[str] = None
    has_structured_tables: Optional[bool] = None
    has_unstructured_text: Optional[bool] = None
    unstructured_text: Optional[str] = None
    table_count: Optional[int] = None
    warning: Optional[str] = None

