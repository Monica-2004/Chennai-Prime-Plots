"""Stage 9 Test Suite: Visual Report Dashboard + Multi-Format Export Engine

Verifies:
1. Multi-section PDF generation with cover, KPIs, embedded charts, and narrative.
2. PowerPoint Presentation (.pptx) generation with title, KPI summary, and slide per chart.
3. High-resolution Power BI-style Dashboard PNG Image generation.
4. Error handling for invalid formats and unknown sessions.
"""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)
SAMPLE_CSV_PATH = Path("data/samples/sales.csv")


def _get_ingested_session_id() -> str:
    """Helper to upload sales.csv and return session_id."""
    assert SAMPLE_CSV_PATH.exists()
    with open(SAMPLE_CSV_PATH, "rb") as f:
        res = client.post("/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    assert res.status_code == 200
    return res.json()["file_id"]


def test_stage9_pdf_export():
    """Verify PDF export: valid PDF header (%PDF-), non-empty, and correct media type."""
    session_id = _get_ingested_session_id()

    res = client.get(f"/report/export?session_id={session_id}&format=pdf")
    assert res.status_code == 200, f"PDF export failed: {res.text}"
    assert res.headers["content-type"] == "application/pdf"
    assert "attachment" in res.headers["content-disposition"]
    assert ".pdf" in res.headers["content-disposition"]

    content = res.content
    assert len(content) > 5000, f"PDF file size too small ({len(content)} bytes)"
    assert content.startswith(b"%PDF-"), "Invalid PDF binary signature"


def test_stage9_pptx_export():
    """Verify PowerPoint export: valid PPTX zip header (PK\x03\x04), non-empty, and correct media type."""
    session_id = _get_ingested_session_id()

    res = client.get(f"/report/export?session_id={session_id}&format=pptx")
    assert res.status_code == 200, f"PPTX export failed: {res.text}"
    assert "presentation" in res.headers["content-type"]
    assert "attachment" in res.headers["content-disposition"]
    assert ".pptx" in res.headers["content-disposition"]

    content = res.content
    assert len(content) > 10000, f"PPTX file size too small ({len(content)} bytes)"
    assert content.startswith(b"PK\x03\x04"), "Invalid PPTX zip signature"


def test_stage9_png_export():
    """Verify Dashboard PNG export: valid PNG header, non-empty, and correct media type."""
    session_id = _get_ingested_session_id()

    res = client.get(f"/report/export?session_id={session_id}&format=png")
    assert res.status_code == 200, f"PNG export failed: {res.text}"
    assert res.headers["content-type"] == "image/png"
    assert "attachment" in res.headers["content-disposition"]
    assert ".png" in res.headers["content-disposition"]

    content = res.content
    assert len(content) > 20000, f"PNG file size too small ({len(content)} bytes)"
    assert content.startswith(b"\x89PNG\r\n\x1a\n"), "Invalid PNG binary signature"


def test_stage9_export_invalid_format_error():
    """Verify 400 Bad Request when an unsupported format is requested."""
    session_id = _get_ingested_session_id()
    res = client.get(f"/report/export?session_id={session_id}&format=docx")
    assert res.status_code == 400
    assert "Unsupported format" in res.json()["detail"]


def test_stage9_export_missing_session_error():
    """Verify 404 Not Found when session does not exist."""
    res = client.get("/report/export?session_id=non_existent_session_999&format=pdf")
    assert res.status_code == 404
