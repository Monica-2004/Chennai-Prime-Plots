"""Tests for Stage 5: Explainability Layer."""

from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.models.schemas import (
    QueryIntent,
    AnalystExecutionResult,
    VerificationResult,
)
from backend.app.pipeline.stage5_explainability import explainability_agent

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"


@pytest.mark.anyio
async def test_stage5_max_revenue_explanation():
    """Test 1: Run Stage 5 on the max-revenue example's Stage 3 + Stage 4 output.
    Confirm the explanation text correctly mentions:
    - the actual product name ('Coffee Maker')
    - the actual revenue value (600 or 600.0)
    - the operation used ('max' or 'highest')
    """
    query = "Which product generated the highest revenue this month?"
    intent = QueryIntent(
        raw_query=query,
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )
    analyst_result = AnalystExecutionResult(
        success=True,
        operation="max",
        result_value={"product_name": "Coffee Maker", "revenue": 600.0},
        result_table=[
            {"product_name": "Coffee Maker", "revenue": 600.0},
            {"product_name": "Running Shoes", "revenue": None},
        ],
        row_count_used=2,
        columns_used=["month", "revenue", "product_name"],
        pandas_snippet="df[df['month'] == '2024-03'].groupby('product_name')['revenue'].max()",
    )
    verification = VerificationResult(
        verified=True,
        status="exact_match",
        discrepancy=None,
        confidence_note="Grounded: Result independently confirmed against actual dataset.",
        original_value=analyst_result.result_value,
        recomputed_value={"product_name": "Coffee Maker", "revenue": 600.0},
        deterministic_steps=[
            "Confirmed all referenced columns exist.",
            "Independently sorted rows by revenue descending; confirmed Coffee Maker at 600.0.",
        ],
    )

    explanation = await explainability_agent.explain(
        query=query,
        intent=intent,
        analyst_result=analyst_result,
        verification=verification,
    )

    text = explanation.explanation_text
    print("\n[TEST RESULT] Generated Explanation:\n", text)

    assert isinstance(text, str)
    assert len(text) > 10

    # Confirm key facts are present in explanation
    assert "Coffee Maker" in text
    assert "600" in text
    assert any(w in text.lower() for w in ("max", "highest", "revenue"))


@pytest.mark.anyio
async def test_stage5_unverified_explanation():
    """Test 2: When Stage 4 verification has verified: false,
    confirm explanation states the result could not be confirmed/verified.
    """
    query = "Which product generated the highest revenue this month?"
    intent = QueryIntent(
        raw_query=query,
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )
    analyst_result = AnalystExecutionResult(
        success=True,
        operation="max",
        result_value={"product_name": "Running Shoes", "revenue": 9999.0},
        row_count_used=2,
        columns_used=["month", "revenue", "product_name"],
    )
    verification = VerificationResult(
        verified=False,
        status="mismatch",
        discrepancy="Max value mismatch: Analyst reported 9999.0, but independent sort confirms true max is 600.0.",
        confidence_note="Max value verification discrepancy.",
        original_value=analyst_result.result_value,
        recomputed_value={"product_name": "Coffee Maker", "revenue": 600.0},
    )

    explanation = await explainability_agent.explain(
        query=query,
        intent=intent,
        analyst_result=analyst_result,
        verification=verification,
    )

    text = explanation.explanation_text
    print("\n[TEST RESULT] Generated Unverified Explanation:\n", text)

    # Must clearly warn user that result could not be confirmed / verified
    assert any(
        phrase in text.lower()
        for phrase in ("could not be verified", "could not be confirmed", "cannot confirm", "discrepancy", "not confirmed", "unverified")
    )


def test_stage5_endpoint_integration():
    """Test POST /api/query/explain endpoint via FastAPI client."""
    query = "Which product generated the highest revenue this month?"
    intent_data = {
        "raw_query": query,
        "operation": "max",
        "target_column": "revenue",
        "group_by_column": "product_name",
        "filter_condition": "month == 'this month'",
    }
    analyst_data = {
        "success": True,
        "operation": "max",
        "result_value": {"product_name": "Coffee Maker", "revenue": 600.0},
        "row_count_used": 2,
        "columns_used": ["month", "revenue", "product_name"],
    }
    verification_data = {
        "verified": True,
        "status": "exact_match",
        "confidence_note": "Grounded: Result independently confirmed against actual dataset.",
    }

    res = client.post(
        "/api/query/explain",
        json={
            "query": query,
            "intent": intent_data,
            "analyst_result": analyst_data,
            "verification": verification_data,
        },
    )

    assert res.status_code == 200
    data = res.json()
    assert "explanation" in data
    assert "Coffee Maker" in data["explanation"]["explanation_text"]
