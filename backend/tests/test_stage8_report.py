"""Tests for Stage 8: Full Report Mode

Covers:
1. End-to-end full report generation on tabular CSV data (sales.csv)
2. Verification checks under the hood for all auto-generated insights (Stage 4 verification)
3. Descriptive statistics generation across numeric and categorical columns
4. Structured charts (bar/line) adhering to Stage 6 specifications
5. Executive narrative summary grounded in verified facts via Ollama qwen2.5:3b
6. Document Notes handling for unstructured PDF/PPTX sources with unverified flag
7. Live database source report generation (SQLite via SQLAlchemy)
8. Graceful error handling for missing/invalid sessions
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.pipeline.stage1_ingestion import ingestion_service

client = TestClient(app)

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "samples"
SAMPLE_CSV_PATH = SAMPLES_DIR / "sales.csv"
SAMPLE_PDF_TEXT_PATH = SAMPLES_DIR / "sample_unstructured.pdf"
SAMPLE_SQLITE_PATH = SAMPLES_DIR / "sample_company.db"


def test_stage8_csv_full_report():
    """Verify full report generation on sales.csv:
    - Overview with row/column counts and source_type='csv'
    - Descriptive statistics (numeric mean/median/std and categorical distributions)
    - Auto-generated key insights verified under the hood via Stage 3 & 4
    - Charts formatted for visual display
    - Grounded executive narrative summary
    - Structured sections array
    """
    assert SAMPLE_CSV_PATH.exists()

    # 1. Ingest sample CSV
    with open(SAMPLE_CSV_PATH, "rb") as f:
        up_res = client.post("/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    assert up_res.status_code == 200
    file_id = up_res.json()["file_id"]

    # 2. Request Full Report
    rep_res = client.post("/report", json={"session_id": file_id})
    assert rep_res.status_code == 200, f"Report failed: {rep_res.text}"
    report = rep_res.json()

    print("\n=== STAGE 8 FULL REPORT OUTPUT ===")
    print("Session ID:", report["session_id"])
    print("Overview:", report["dataset_overview"])
    print("Stats numeric cols:", list(report["descriptive_statistics"]["numeric_columns"].keys()))
    print("Number of insights:", len(report["key_insights"]))
    print("All insights verified flag:", report["all_insights_verified"])
    print("Executive Narrative:\n", report["narrative_summary"])

    # 1. Dataset Overview Validation
    overview = report["dataset_overview"]
    assert overview["source_type"] == "csv"
    assert overview["row_count"] == 6
    assert overview["column_count"] == 5
    assert "revenue" in overview["data_types"]
    assert overview["has_structured_tables"] is True

    # 2. Descriptive Statistics Validation
    stats = report["descriptive_statistics"]
    assert "numeric_columns" in stats
    assert "revenue" in stats["numeric_columns"]
    rev_stats = stats["numeric_columns"]["revenue"]
    assert "mean" in rev_stats
    assert "median" in rev_stats
    assert "min" in rev_stats
    assert "max" in rev_stats
    assert "std" in rev_stats
    assert rev_stats["max"] == 1250.5
    assert rev_stats["min"] == 320.0

    assert "categorical_columns" in stats
    assert "product_name" in stats["categorical_columns"] or "category" in stats["categorical_columns"]

    # 3. Key Insights Validation (Confirming Stage 4 Verification ran under the hood!)
    insights = report["key_insights"]
    assert len(insights) >= 1
    assert report["all_insights_verified"] is True

    top_rev_insight = next((i for i in insights if i["target_column"] == "revenue" and i["operation"] == "max"), None)
    assert top_rev_insight is not None, "Expected top revenue insight"
    assert top_rev_insight["verified"] is True
    assert top_rev_insight["verification_status"] in ("exact_match", "tolerance_match")
    assert "Wireless Headphones" in top_rev_insight["insight_text"] or top_rev_insight["result_value"] == 1250.5

    # Ensure EVERY single insight in the report was confirmed verified
    for ins in insights:
        assert ins["verified"] is True, f"Insight '{ins['title']}' failed verification under the hood!"

    # 4. Charts Validation
    charts = report["charts"]
    assert len(charts) >= 1
    for chart in charts:
        assert "chart_type" in chart
        assert chart["chart_type"] in ("bar", "line", "metric")
        assert "title" in chart
        assert "data" in chart

    # 5. Narrative Validation (3-5 sentences, grounded in facts)
    narrative = report["narrative_summary"]
    assert len(narrative) > 20
    # Confirm it mentions grounded figures
    assert any(num in narrative for num in ("6", "600", "sales", "revenue"))

    # 6. Sections Array Validation
    sections = report["sections"]
    section_types = [s["type"] for s in sections]
    assert "overview" in section_types
    assert "stat" in section_types
    assert "insight" in section_types
    assert "chart" in section_types
    assert "narrative" in section_types


def test_stage8_unstructured_document_notes_report():
    """Verify document notes for an unstructured text-only PDF source:
    - Sets document_notes with is_verified=False and clear qualitative disclaimer
    - Includes 'document_notes' section in sections array
    - Narrative acknowledges qualitative nature without hallucinated tabular numbers
    """
    assert SAMPLE_PDF_TEXT_PATH.exists()

    with open(SAMPLE_PDF_TEXT_PATH, "rb") as f:
        up_res = client.post("/upload", files={"file": ("unstructured.pdf", f.read(), "application/pdf")})
    assert up_res.status_code == 200
    file_id = up_res.json()["file_id"]

    rep_res = client.post("/report", json={"session_id": file_id})
    assert rep_res.status_code == 200
    report = rep_res.json()

    assert report["dataset_overview"]["has_structured_tables"] is False
    assert report["dataset_overview"]["has_unstructured_text"] is True

    # Document notes must be present and flagged as unverified / qualitative
    doc_notes = report["document_notes"]
    assert doc_notes is not None
    assert doc_notes["is_verified"] is False
    assert "unverified" in doc_notes["disclaimer"].lower() or "qualitative" in doc_notes["disclaimer"].lower()
    assert len(doc_notes["summary"]) > 10

    # Sections array must include document_notes
    section_types = [s["type"] for s in report["sections"]]
    assert "document_notes" in section_types


def test_stage8_database_source_report():
    """Verify full report generation on an ingested SQLite database table."""
    assert SAMPLE_SQLITE_PATH.exists()
    conn_str = f"sqlite:///{SAMPLE_SQLITE_PATH.as_posix()}"

    db_res = client.post("/ingest/database", json={"connection_string": conn_str, "table_name": "sales"})
    assert db_res.status_code == 200
    file_id = db_res.json()["file_id"]

    rep_res = client.post("/api/report", json={"file_id": file_id})
    assert rep_res.status_code == 200
    report = rep_res.json()

    assert report["dataset_overview"]["source_type"] == "db"
    assert report["dataset_overview"]["row_count"] == 4
    assert report["all_insights_verified"] is True
    assert len(report["key_insights"]) >= 1


def test_stage8_missing_session_error():
    """Verify error handling for invalid or missing session IDs."""
    # Missing session_id
    res_empty = client.post("/report", json={})
    assert res_empty.status_code == 400

    # Non-existent session_id
    res_not_found = client.post("/report", json={"session_id": "non_existent_12345"})
    assert res_not_found.status_code == 404
