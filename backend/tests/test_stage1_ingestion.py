"""Tests for Stage 1: Data Ingestion endpoint and services."""

import io
from pathlib import Path
import pandas as pd
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.pipeline.stage1_ingestion import dataset_store, ingestion_service

client = TestClient(app)

SAMPLE_CSV_PATH = Path(__file__).resolve().parent.parent.parent / "data" / "samples" / "sales.csv"


def test_upload_valid_sample_csv():
    """Test uploading the sales.csv sample file and verify extracted schema and statistics."""
    assert SAMPLE_CSV_PATH.exists(), f"Sample CSV file missing at {SAMPLE_CSV_PATH}"

    with open(SAMPLE_CSV_PATH, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/api/upload",
        files={"file": ("sales.csv", file_bytes, "text/csv")},
    )

    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
    data = response.json()

    assert "file_id" in data
    assert data["file_id"] is not None
    assert data["session_id"] == data["file_id"]
    assert data["upload_id"] == data["file_id"]

    # Verify top-level convenience fields
    assert data["row_count"] == 6
    assert data["column_count"] == 5
    assert len(data["columns"]) == 5
    assert len(data["preview"]) == 5
    assert data["missing_values"]["revenue"] == 1
    assert data["missing_values"]["units_sold"] == 0

    # Verify metadata dictionary
    metadata = data["metadata"]
    assert metadata["filename"] == "sales.csv"
    assert metadata["row_count"] == 6
    assert metadata["column_count"] == 5

    # Verify column names
    col_names = [col["name"] for col in metadata["columns"]]
    expected_cols = ["product_name", "category", "revenue", "units_sold", "month"]
    assert col_names == expected_cols

    # Verify column data types and missing value detection
    col_dict = {col["name"]: col for col in metadata["columns"]}
    
    # revenue has 1 missing value in the 5th row
    assert col_dict["revenue"]["missing_count"] == 1
    assert round(col_dict["revenue"]["missing_percentage"], 1) == 16.7
    assert "float" in col_dict["revenue"]["dtype"].lower()

    # units_sold has 0 missing values and integer type
    assert col_dict["units_sold"]["missing_count"] == 0
    assert "int" in col_dict["units_sold"]["dtype"].lower()

    # product_name has 0 missing values and object/string type
    assert col_dict["product_name"]["missing_count"] == 0
    assert any(t in col_dict["product_name"]["dtype"].lower() for t in ("object", "str", "string"))

    # Verify preview rows (exactly first 5 rows)
    assert len(metadata["preview_rows"]) == 5
    assert metadata["preview_rows"][0]["product_name"] == "Wireless Headphones"
    assert metadata["preview_rows"][0]["revenue"] == 1250.50

    # Verify dataset is stored in memory and accessible by ID
    stored_df = dataset_store.get_dataframe(data["file_id"])
    assert stored_df is not None
    assert len(stored_df) == 6
    assert list(stored_df.columns) == expected_cols

    # Verify dataset can be referenced as "the currently loaded dataset" without ID
    current_df = dataset_store.get_dataframe()
    assert current_df is not None
    assert len(current_df) == 6

    service_current_df = ingestion_service.get_current_dataset()
    assert len(service_current_df) == 6

    # Test GET /api/datasets/{file_id}
    get_res = client.get(f"/api/datasets/{data['file_id']}")
    assert get_res.status_code == 200
    assert get_res.json()["file_id"] == data["file_id"]


def test_upload_root_endpoint():
    """Test uploading to the root /upload endpoint."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/upload",
        files={"file": ("sales.csv", file_bytes, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["row_count"] == 6
    assert data["column_count"] == 5
    assert [c["name"] for c in data["columns"]] == ["product_name", "category", "revenue", "units_sold", "month"]


def test_upload_with_custom_session_id():
    """Test uploading a file with a specified session_id / upload_id."""
    with open(SAMPLE_CSV_PATH, "rb") as f:
        file_bytes = f.read()

    response = client.post(
        "/api/upload",
        data={"session_id": "session-custom-456"},
        files={"file": ("sales.csv", file_bytes, "text/csv")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["file_id"] == "session-custom-456"
    assert data["session_id"] == "session-custom-456"

    # Verify retrievable via custom session_id
    stored_df = dataset_store.get_dataframe("session-custom-456")
    assert stored_df is not None
    assert len(stored_df) == 6


def test_upload_excel_file():
    """Test uploading an Excel (.xlsx) file and verifying parsing."""
    df_excel = pd.DataFrame({
        "item": ["Apple", "Banana", "Cherry"],
        "price": [1.5, 0.8, 3.0],
        "quantity": [100, 250, 75],
    })
    excel_buffer = io.BytesIO()
    df_excel.to_excel(excel_buffer, index=False, engine="openpyxl")
    excel_bytes = excel_buffer.getvalue()

    response = client.post(
        "/api/upload",
        files={"file": ("inventory.xlsx", excel_bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["metadata"]["row_count"] == 3
    assert data["metadata"]["column_count"] == 3
    assert [c["name"] for c in data["metadata"]["columns"]] == ["item", "price", "quantity"]


def test_upload_invalid_file_extension():
    """Test uploading an unsupported file format (.txt) returns 400."""
    response = client.post(
        "/api/upload",
        files={"file": ("notes.txt", b"some plain text content", "text/plain")},
    )
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_upload_empty_file():
    """Test uploading an empty 0-byte file returns 400."""
    response = client.post(
        "/api/upload",
        files={"file": ("empty.csv", b"", "text/csv")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_whitespace_only_file():
    """Test uploading a file containing only whitespace returns 400."""
    response = client.post(
        "/api/upload",
        files={"file": ("blank.csv", b"   \n  \t \n  ", "text/csv")},
    )
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_upload_header_only_file():
    """Test uploading a CSV with headers but no data rows returns 400."""
    response = client.post(
        "/api/upload",
        files={"file": ("header_only.csv", b"col_a,col_b,col_c\n", "text/csv")},
    )
    assert response.status_code == 400
    assert "no data rows" in response.json()["detail"].lower()


def test_upload_corrupted_excel():
    """Test uploading a corrupted Excel file returns 400."""
    response = client.post(
        "/api/upload",
        files={"file": ("corrupt.xlsx", b"not-a-valid-excel-file-binary", "application/vnd.ms-excel")},
    )
    assert response.status_code == 400
    assert "Failed to parse Excel file" in response.json()["detail"]
