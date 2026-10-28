"""End-to-End tests for Stage 6: Output Layer and /ask orchestration."""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"


def test_stage6_end_to_end_ask_flow():
    """End-to-end test:
    1. Upload the sample CSV
    2. Ask 'Which product generated the highest revenue this month?' through /ask
    3. Confirm final response has correct answer, verified: True, and coherent explanation.
    """
    assert SAMPLE_CSV_PATH.exists()

    # 1. Upload sample CSV (Stage 1)
    with open(SAMPLE_CSV_PATH, "rb") as f:
        up_res = client.post("/api/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    assert up_res.status_code == 200
    file_id = up_res.json()["file_id"]

    # 2. Call full /ask endpoint
    question = "Which product generated the highest revenue this month?"
    ask_res = client.post(
        "/ask",
        json={"session_id": file_id, "question": question},
    )

    assert ask_res.status_code == 200, f"Failed: {ask_res.text}"
    data = ask_res.json()

    print("\n=== /ask RESPONSE ===")
    print("Answer Text:", data.get("answer_text"))
    print("Verified:", data.get("verified"))
    print("Explanation:", data.get("explanation_text"))
    print("Chart:", data.get("chart"))
    print("Table:", data.get("result_table"))
    print("Warning:", data.get("warning"))

    # Assert correct response shape
    assert "answer_text" in data
    assert "result_table" in data
    assert "chart" in data
    assert "explanation_text" in data
    assert "verified" in data
    assert "warning" in data

    # Assert Grounded Truth
    assert data["verified"] is True
    assert "Coffee Maker" in data["answer_text"]
    assert "600" in data["answer_text"]

    # Assert Coherent Explanation from Stage 5
    assert len(data["explanation_text"]) > 10
    assert "Coffee Maker" in data["explanation_text"]

    # Assert Chart is generated
    assert data["chart"] is not None
    assert data["chart"]["chart_type"] in ("metric", "bar")


def test_stage6_api_ask_alias():
    """Verify /api/ask also works identically with file_id and query aliases."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        up_res = client.post("/api/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    file_id = up_res.json()["file_id"]

    ask_res = client.post(
        "/api/ask",
        json={"file_id": file_id, "query": "Which product generated the highest revenue this month?"},
    )
    assert ask_res.status_code == 200
    data = ask_res.json()
    assert data["verified"] is True
    assert "Coffee Maker" in data["answer_text"]


def test_stage6_graceful_error_handling_unknown_session():
    """Verify unknown session ID does not crash and returns the standard response shape."""
    res = client.post(
        "/ask",
        json={"session_id": "nonexistent-session-id", "question": "Total revenue?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is False
    assert data["warning"] is not None
    assert "not found" in data["warning"].lower()
    assert "answer_text" in data
    assert "explanation_text" in data


def test_stage6_graceful_error_handling_empty_question():
    """Verify empty question returns standard response shape without crashing."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        up_res = client.post("/api/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    file_id = up_res.json()["file_id"]

    res = client.post(
        "/ask",
        json={"session_id": file_id, "question": ""},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is False
    assert "warning" in data
