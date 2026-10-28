"""Tests for Stage 4: Verification Layer."""

from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.models.schemas import QueryIntent, AnalystExecutionResult
from backend.app.pipeline.stage3_analyst_agent import analyst_agent
from backend.app.pipeline.stage4_verification import verification_layer

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"


@pytest.fixture
def sample_sales_df() -> pd.DataFrame:
    """Fixture providing the sample sales DataFrame."""
    return pd.read_csv(SAMPLE_CSV_PATH)


def test_stage4_max_revenue_product_verified_true(sample_sales_df):
    """Test 1 (Passing case):
    Run verification on Stage 3 output for:
    'Which product generated the highest revenue this month?'
    Confirm verified: True and confidence note confirms grounding.
    """
    intent = QueryIntent(
        raw_query="Which product generated the highest revenue this month?",
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )

    # 1. Run Stage 3
    analyst_result = analyst_agent.execute(sample_sales_df, intent)
    assert analyst_result.success is True
    assert analyst_result.result_value["product_name"] == "Coffee Maker"
    assert analyst_result.result_value["revenue"] == 600.0

    # 2. Run Stage 4 Verification
    verification = verification_layer.verify(sample_sales_df, intent, analyst_result)

    assert verification.verified is True
    assert verification.status == "exact_match"
    assert verification.discrepancy is None
    assert "Grounded" in verification.confidence_note
    assert len(verification.deterministic_steps) > 0
    assert any("Coffee Maker" in s for s in verification.deterministic_steps)


def test_stage4_deliberately_corrupted_value_detected(sample_sales_df):
    """Test 2 (Deliberately broken case):
    Deliberately corrupt Stage 3's result (e.g. wrong entity and value)
    and confirm Stage 4 catches the mismatch and sets verified: False.
    """
    intent = QueryIntent(
        raw_query="Which product generated the highest revenue this month?",
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )

    # Deliberately fake/corrupt Stage 3's output
    corrupted_analyst_result = AnalystExecutionResult(
        success=True,
        operation="max",
        result_value={
            "product_name": "Running Shoes",  # Hallucinated max! (Running shoes had null)
            "revenue": 9999.0,                # Fabricated revenue!
        },
        result_table=[],
        row_count_used=2,
        columns_used=["month", "revenue", "product_name"],
        pandas_snippet="corrupted snippet",
    )

    # Run Stage 4 Verification
    verification = verification_layer.verify(sample_sales_df, intent, corrupted_analyst_result)

    # Assert Verification Layer caught the hallucination/corruption
    assert verification.verified is False
    assert verification.status == "mismatch"
    assert verification.discrepancy is not None
    assert "mismatch" in verification.discrepancy.lower()
    assert "9999" in verification.discrepancy or "Running Shoes" in verification.discrepancy


def test_stage4_deliberately_corrupted_row_count(sample_sales_df):
    """Test structural grounding catches fake row counts."""
    intent = QueryIntent(
        raw_query="Which product generated the highest revenue this month?",
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )

    # Corrupt row_count_used from 2 to 999
    corrupted_analyst_result = AnalystExecutionResult(
        success=True,
        operation="max",
        result_value={"product_name": "Coffee Maker", "revenue": 600.0},
        row_count_used=999,  # False row count!
        columns_used=["month", "revenue", "product_name"],
    )

    verification = verification_layer.verify(sample_sales_df, intent, corrupted_analyst_result)

    assert verification.verified is False
    assert verification.status == "mismatch"
    assert "Row count mismatch" in verification.discrepancy


def test_stage4_deliberately_corrupted_sum_value(sample_sales_df):
    """Test independent recomputation catches corrupted sum results."""
    intent = QueryIntent(
        raw_query="Total revenue",
        operation="sum",
        target_column="revenue",
        group_by_column=None,
        filter_condition=None,
    )

    # Real sum is 1250.5 + 840 + 450 + 320 + 600 = 3460.5
    corrupted_analyst_result = AnalystExecutionResult(
        success=True,
        operation="sum",
        result_value=50000.0,  # Corrupted sum!
        row_count_used=6,
        columns_used=["revenue"],
    )

    verification = verification_layer.verify(sample_sales_df, intent, corrupted_analyst_result)

    assert verification.verified is False
    assert verification.status == "mismatch"
    assert "Sum mismatch" in verification.discrepancy
    assert verification.recomputed_value == 3460.5


def test_stage4_endpoint_live_pipeline():
    """Live HTTP API endpoint test for Stage 4 (/api/query/verify):
    Tests both passing case and corrupted case through FastAPI endpoints.
    """
    with open(SAMPLE_CSV_PATH, "rb") as f:
        up = client.post("/api/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    assert up.status_code == 200
    file_id = up.json()["file_id"]

    # 1. Understand
    und = client.post(
        "/api/query/understand",
        json={"file_id": file_id, "query": "Which product generated the highest revenue this month?"},
    )
    assert und.status_code == 200
    intent = und.json()["intent"]

    # 2. Execute Stage 3
    exec_res = client.post("/api/query/execute", json={"file_id": file_id, "intent": intent})
    assert exec_res.status_code == 200
    analyst_result = exec_res.json()["analyst_result"]

    # 3. Verify via Stage 4 Endpoint (Passing case)
    ver_res = client.post(
        "/api/query/verify",
        json={
            "file_id": file_id,
            "intent": intent,
            "analyst_result": analyst_result,
        },
    )
    assert ver_res.status_code == 200
    ver_data = ver_res.json()["verification"]
    assert ver_data["verified"] is True
    assert ver_data["discrepancy"] is None

    # 4. Verify via Stage 4 Endpoint (Corrupted case)
    bad_analyst_result = dict(analyst_result)
    bad_analyst_result["result_value"] = {"product_name": "Fake Product", "revenue": 1.0}

    bad_ver_res = client.post(
        "/api/query/verify",
        json={
            "file_id": file_id,
            "intent": intent,
            "analyst_result": bad_analyst_result,
        },
    )
    assert bad_ver_res.status_code == 200
    bad_ver_data = bad_ver_res.json()["verification"]
    assert bad_ver_data["verified"] is False
    assert bad_ver_data["discrepancy"] is not None
