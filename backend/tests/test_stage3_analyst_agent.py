"""Tests for Stage 3: AI Analyst Agent."""

from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.models.schemas import QueryIntent
from backend.app.pipeline.stage3_analyst_agent import analyst_agent, parse_and_apply_filter

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"


@pytest.fixture
def sample_sales_df() -> pd.DataFrame:
    """Fixture providing the sample sales DataFrame."""
    return pd.read_csv(SAMPLE_CSV_PATH)


def test_stage3_max_revenue_product_this_month(sample_sales_df):
    """Test the exact question from requirements:
    'Which product generated the highest revenue this month?'
    In sales.csv, latest month is '2024-03'.
    The products in '2024-03' are:
    - Running Shoes: revenue is NaN
    - Coffee Maker: revenue is 600.0
    Therefore, Coffee Maker with 600.0 is the highest revenue product.
    """
    intent = QueryIntent(
        raw_query="Which product generated the highest revenue this month?",
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition="month == 'this month'",
    )

    result = analyst_agent.execute(sample_sales_df, intent)

    assert result.success is True
    assert result.operation == "max"
    assert result.result_value is not None
    assert result.result_value["product_name"] == "Coffee Maker"
    assert result.result_value["revenue"] == 600.0
    assert result.row_count_used == 2
    assert "revenue" in result.columns_used
    assert "product_name" in result.columns_used
    assert "month" in result.columns_used


def test_stage3_max_revenue_product_all_time(sample_sales_df):
    """Test max revenue product across all rows (no month filter).
    Wireless Headphones has revenue 1250.5.
    """
    intent = QueryIntent(
        raw_query="Which product generated the highest revenue?",
        operation="max",
        target_column="revenue",
        group_by_column="product_name",
        filter_condition=None,
    )

    result = analyst_agent.execute(sample_sales_df, intent)

    assert result.success is True
    assert result.result_value["product_name"] == "Wireless Headphones"
    assert result.result_value["revenue"] == 1250.5
    assert result.row_count_used == 6


def test_stage3_operations(sample_sales_df):
    """Test handlers for sum, average, min, count, compare, and filter."""
    # 1. Sum revenue by category
    sum_intent = QueryIntent(
        raw_query="Total revenue by category",
        operation="sum",
        target_column="revenue",
        group_by_column="category",
        filter_condition=None,
    )
    sum_res = analyst_agent.execute(sample_sales_df, sum_intent)
    assert sum_res.success is True
    assert len(sum_res.result_table) == 3
    # Electronics revenue sum: 1250.5 + 840 + 450 = 2540.5
    electronics_row = next(r for r in sum_res.result_table if r["category"] == "Electronics")
    assert electronics_row["revenue"] == 2540.5

    # 2. Average scalar units_sold
    avg_intent = QueryIntent(
        raw_query="Average units sold",
        operation="average",
        target_column="units_sold",
        group_by_column=None,
        filter_condition=None,
    )
    avg_res = analyst_agent.execute(sample_sales_df, avg_intent)
    assert avg_res.success is True
    # (25 + 12 + 15 + 32 + 18 + 10) / 6 = 112 / 6 = 18.6667
    assert round(avg_res.result_value, 2) == 18.67

    # 3. Min scalar revenue
    min_intent = QueryIntent(
        raw_query="Lowest revenue",
        operation="min",
        target_column="revenue",
        group_by_column=None,
        filter_condition=None,
    )
    min_res = analyst_agent.execute(sample_sales_df, min_intent)
    assert min_res.success is True
    assert min_res.result_value == 320.0  # Cotton T-Shirt

    # 4. Count by category
    count_intent = QueryIntent(
        raw_query="Count of products by category",
        operation="count",
        target_column="product_name",
        group_by_column="category",
        filter_condition=None,
    )
    count_res = analyst_agent.execute(sample_sales_df, count_intent)
    assert count_res.success is True
    electronics_cnt = next(r for r in count_res.result_table if r["category"] == "Electronics")
    assert electronics_cnt["product_name"] == 3

    # 5. Compare revenue across categories (sorted descending)
    compare_intent = QueryIntent(
        raw_query="Compare category revenues",
        operation="compare",
        target_column="revenue",
        group_by_column="category",
        filter_condition=None,
    )
    comp_res = analyst_agent.execute(sample_sales_df, compare_intent)
    assert comp_res.success is True
    assert comp_res.result_table[0]["category"] == "Electronics"

    # 6. Filter operation
    filter_intent = QueryIntent(
        raw_query="Show products in Apparel",
        operation="filter",
        target_column=None,
        group_by_column=None,
        filter_condition="category == 'Apparel'",
    )
    filter_res = analyst_agent.execute(sample_sales_df, filter_intent)
    assert filter_res.success is True
    assert filter_res.row_count_used == 2
    assert len(filter_res.result_table) == 2


def test_stage3_edge_cases(sample_sales_df):
    """Test edge cases: empty filter result, all null target, unparseable filter, non-numeric sum."""
    # 1. Empty filter
    empty_intent = QueryIntent(
        raw_query="Sales in 1999",
        operation="sum",
        target_column="revenue",
        group_by_column=None,
        filter_condition="month == '1999-01'",
    )
    empty_res = analyst_agent.execute(sample_sales_df, empty_intent)
    assert empty_res.success is True
    assert empty_res.row_count_used == 0
    assert any("empty" in w.lower() for w in empty_res.warnings)

    # 2. Target column has all nulls
    null_df = pd.DataFrame({"colA": ["X", "Y"], "all_null": [None, None]})
    null_intent = QueryIntent(
        raw_query="Max all_null",
        operation="max",
        target_column="all_null",
        group_by_column=None,
        filter_condition=None,
    )
    null_res = analyst_agent.execute(null_df, null_intent)
    assert null_res.success is True
    assert null_res.result_value is None
    assert any("all null" in w.lower() for w in null_res.warnings)

    # 3. Unparseable filter condition notes warning without crashing or guessing
    unparseable_intent = QueryIntent(
        raw_query="Sales with custom filter",
        operation="sum",
        target_column="revenue",
        group_by_column=None,
        filter_condition="some complicated custom function(x)",
    )
    unparseable_res = analyst_agent.execute(sample_sales_df, unparseable_intent)
    assert unparseable_res.success is True
    assert any("could not be parsed" in w.lower() for w in unparseable_res.warnings)

    # 4. Non-numeric sum
    non_num_intent = QueryIntent(
        raw_query="Sum product_name",
        operation="sum",
        target_column="product_name",
        group_by_column=None,
        filter_condition=None,
    )
    non_num_res = analyst_agent.execute(sample_sales_df, non_num_intent)
    assert non_num_res.success is False
    assert "non-numeric" in non_num_res.error_message.lower()


def test_stage3_group_cardinality_cap():
    """Verify group-by with >50 unique values is capped to top 50 with warning."""
    large_df = pd.DataFrame({
        "item": [f"item_{i}" for i in range(100)],
        "val": list(range(100)),
    })
    intent = QueryIntent(
        raw_query="Sum val by item",
        operation="sum",
        target_column="val",
        group_by_column="item",
        filter_condition=None,
    )
    res = analyst_agent.execute(large_df, intent)
    assert res.success is True
    assert len(res.result_table) == 50
    assert any("capping" in w.lower() for w in res.warnings)


def test_stage3_endpoint_integration():
    """Full HTTP API test: Upload -> Understand -> Execute endpoint."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        upload_res = client.post("/api/upload", files={"file": ("sales.csv", f.read(), "text/csv")})
    assert upload_res.status_code == 200
    session_id = upload_res.json()["session_id"]

    # Stage 2 Understand
    understand_res = client.post(
        "/api/query/understand",
        json={"session_id": session_id, "question": "Which product generated the highest revenue this month?"},
    )
    assert understand_res.status_code == 200
    intent_data = understand_res.json()["intent"]

    # Stage 3 Execute on /api/query/execute
    exec_res = client.post(
        "/api/query/execute",
        json={"session_id": session_id, "intent": intent_data},
    )
    assert exec_res.status_code == 200
    data = exec_res.json()

    assert data["session_id"] == session_id
    assert data["operation"] == "max"
    assert data["row_count_used"] == 2
    assert "revenue" in data["columns_used"]
    assert "product_name" in data["columns_used"]
    assert data["result_value"]["product_name"] == "Coffee Maker"
    assert data["result_value"]["revenue"] == 600.0

    # Also test root /execute endpoint alias
    root_exec_res = client.post(
        "/execute",
        json={"session_id": session_id, "intent": intent_data},
    )
    assert root_exec_res.status_code == 200
    root_data = root_exec_res.json()
    assert root_data["result_value"]["product_name"] == "Coffee Maker"
