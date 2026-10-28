"""Tests for Stage 2: Query Understanding."""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.pipeline.stage2_query_understanding import (
    clean_and_extract_json,
    validate_and_build_intent,
    build_query_understanding_prompt,
    JSONExtractionError,
    ColumnValidationError,
    InvalidOperationError,
)
from backend.app.models.schemas import ColumnInfo

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"
SAMPLE_COLUMNS = ["product_name", "category", "revenue", "units_sold", "month"]


def test_clean_and_extract_json_markdown_fences():
    """Verify JSON cleanup strips markdown code blocks and preamble/postscript text."""
    raw = '```json\n{\n  "operation": "max",\n  "target_column": "revenue"\n}\n```'
    extracted = clean_and_extract_json(raw)
    assert extracted["operation"] == "max"
    assert extracted["target_column"] == "revenue"


def test_clean_and_extract_json_with_chatter():
    """Verify cleanup when LLM outputs conversational chatter around the JSON."""
    raw = 'Sure, here is your parsed query result:\n{"operation": "sum", "target_column": "revenue", "group_by_column": null, "filter_condition": null}\nLet me know if you need anything else!'
    extracted = clean_and_extract_json(raw)
    assert extracted["operation"] == "sum"
    assert extracted["target_column"] == "revenue"
    assert extracted["group_by_column"] is None


def test_clean_and_extract_json_missing_braces():
    """Verify JSONExtractionError is raised when no JSON braces are present."""
    with pytest.raises(JSONExtractionError):
        clean_and_extract_json("There is no JSON in this response.")


def test_build_query_understanding_prompt_uses_actual_columns():
    """Verify prompt builder uses actual dataset column names and types, not hardcoded ones."""
    cols = [
        ColumnInfo(name="col_x", dtype="float64", missing_count=0, missing_percentage=0.0),
        ColumnInfo(name="col_y", dtype="int64", missing_count=2, missing_percentage=10.0),
    ]
    prompt = build_query_understanding_prompt(query="Sum of col_x", columns=cols)
    assert "- col_x (float64)" in prompt
    assert "- col_y (int64)" in prompt
    assert "Sum of col_x" in prompt
    assert '"operation": "sum|average|max|min|count|compare|filter"' in prompt


def test_validate_and_build_intent_valid():
    """Verify successful validation against real columns."""
    parsed = {
        "operation": "max",
        "target_column": "revenue",
        "group_by_column": "product_name",
        "filter_condition": "month == '2024-03'",
    }
    intent = validate_and_build_intent(parsed, SAMPLE_COLUMNS, "Highest revenue product in March?")
    assert intent.operation == "max"
    assert intent.target_column == "revenue"
    assert intent.group_by_column == "product_name"
    assert intent.filter_condition == "month == '2024-03'"


def test_validate_and_build_intent_case_insensitive():
    """Verify case-insensitivity mapping to exact column names."""
    parsed = {
        "operation": "average",
        "target_column": "REVENUE",
        "group_by_column": "Category",
        "filter_condition": None,
    }
    intent = validate_and_build_intent(parsed, SAMPLE_COLUMNS, "Average revenue by category")
    assert intent.target_column == "revenue"
    assert intent.group_by_column == "category"


def test_validate_and_build_intent_rejects_hallucinated_column():
    """Verify rejection when the model hallucinates a non-existent column name."""
    parsed = {
        "operation": "sum",
        "target_column": "profit_margin",  # Hallucinated!
        "group_by_column": None,
        "filter_condition": None,
    }
    with pytest.raises(ColumnValidationError) as exc_info:
        validate_and_build_intent(parsed, SAMPLE_COLUMNS, "What was the total profit margin?")
    assert "profit_margin" in str(exc_info.value)
    assert "does not exist in dataset" in str(exc_info.value)


def test_validate_and_build_intent_rejects_invalid_operation():
    """Verify rejection when operation is not one of the allowed operations."""
    parsed = {
        "operation": "delete_all_rows",  # Invalid operation!
        "target_column": "revenue",
        "group_by_column": None,
        "filter_condition": None,
    }
    with pytest.raises(InvalidOperationError):
        validate_and_build_intent(parsed, SAMPLE_COLUMNS, "Delete everything")


def test_stage2_endpoint_with_live_ollama():
    """Live integration test: upload dataset then ask Stage 2 query understanding endpoint.
    
    Uses sales.csv and asks: "Which product generated the highest revenue this month?"
    Confirms valid, correctly-parsed JSON referencing real columns from the dataset.
    """
    with open(SAMPLE_CSV_PATH, "rb") as f:
        upload_res = client.post(
            "/api/upload",
            files={"file": ("sales.csv", f.read(), "text/csv")},
        )
    assert upload_res.status_code == 200
    session_id = upload_res.json()["session_id"]

    # Ask the exact user question using session_id and question fields
    question = "Which product generated the highest revenue this month?"
    query_res = client.post(
        "/api/query/understand",
        json={"session_id": session_id, "question": question},
    )

    assert query_res.status_code == 200, f"Failed: {query_res.text}"
    data = query_res.json()

    assert data["session_id"] == session_id
    assert data["file_id"] == session_id

    # Validate top-level schema fields
    assert data["operation"] in {"max", "compare", "filter", "sum", "average", "min", "count"}
    assert data["operation"] == "max"
    assert data["target_column"] in SAMPLE_COLUMNS
    assert data["target_column"] == "revenue"
    assert data["group_by_column"] in SAMPLE_COLUMNS
    assert data["group_by_column"] == "product_name"

    # Validate intent object
    intent = data["intent"]
    assert intent["raw_query"] == question
    assert intent["operation"] == "max"
    assert intent["target_column"] == "revenue"
    assert intent["group_by_column"] == "product_name"
    assert intent["filter_condition"] is not None


def test_stage2_root_endpoint_and_aliases():
    """Verify /understand and /query/understand aliases."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        upload_res = client.post(
            "/upload",
            files={"file": ("sales.csv", f.read(), "text/csv")},
        )
    assert upload_res.status_code == 200
    upload_id = upload_res.json()["upload_id"]

    # Test /understand
    res1 = client.post(
        "/understand",
        json={"upload_id": upload_id, "question": "Total units sold?"},
    )
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["target_column"] == "units_sold"
    assert data1["operation"] in {"sum", "count"}

    # Test /api/understand
    res2 = client.post(
        "/api/understand",
        json={"file_id": upload_id, "query": "Average revenue by category?"},
    )
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["target_column"] == "revenue"
    assert data2["group_by_column"] == "category"
    assert data2["operation"] == "average"


def test_stage2_endpoint_unknown_dataset():
    """Verify 404 when querying an unknown session ID."""
    res = client.post(
        "/api/query/understand",
        json={"session_id": "non-existent-session-id", "question": "Total revenue?"},
    )
    assert res.status_code == 404


def test_stage2_endpoint_missing_parameters():
    """Verify 400 when missing required session ID or question."""
    res1 = client.post(
        "/api/query/understand",
        json={"session_id": "", "question": "Total revenue?"},
    )
    assert res1.status_code == 400

    res2 = client.post(
        "/api/query/understand",
        json={"session_id": "some_id", "question": ""},
    )
    assert res2.status_code == 400
