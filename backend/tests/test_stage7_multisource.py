"""Tests for Stage 7: Multi-Source Data Ingestion

Covers:
1. Live Database ingestion (SQLAlchemy with SQLite, connection strings, table vs SELECT query)
2. SQL Injection & Destructive query validation (strictly rejects INSERT, UPDATE, DELETE, DROP, ALTER, chaining)
3. PDF file ingestion: structured table extraction vs. unstructured text fallback
4. PPTX file ingestion: slide table extraction vs. slide text notes fallback
5. API endpoints: /ingest/database, /api/ingest/database, /upload with .pdf and .pptx
6. Session store normalization and contract consistency
"""

import io
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.app.pipeline.stage1_ingestion import (
    ingestion_service,
    dataset_store,
    validate_select_query,
    validate_table_name,
    SQLValidationError,
    DatabaseConnectionError,
    InvalidFileTypeError,
)

client = TestClient(app)

SAMPLES_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "samples"
SQLITE_DB_PATH = SAMPLES_DIR / "sample_company.db"
PDF_TABLE_PATH = SAMPLES_DIR / "sample_report_with_table.pdf"
PDF_TEXT_PATH = SAMPLES_DIR / "sample_unstructured.pdf"
PPTX_TABLE_PATH = SAMPLES_DIR / "sample_presentation_with_table.pptx"
PPTX_TEXT_PATH = SAMPLES_DIR / "sample_presentation_text_only.pptx"


# =========================================================================
# 1. SQL Query Security & Validation Tests
# =========================================================================

def test_sql_validation_accepts_clean_select():
    """Verify clean SELECT queries pass validation."""
    q1 = "SELECT * FROM sales"
    assert validate_select_query(q1) == q1

    q2 = "SELECT product_name, sum(revenue) FROM sales GROUP BY product_name;"
    assert validate_select_query(q2).startswith("SELECT")

    q3 = "WITH monthly_rev AS (SELECT * FROM sales WHERE month = '2024-03') SELECT * FROM monthly_rev"
    assert validate_select_query(q3).startswith("WITH")


def test_sql_validation_rejects_destructive_and_ddl_queries():
    """Verify dangerous DDL/DML operations are strictly rejected."""
    dangerous_queries = [
        "DROP TABLE sales",
        "DELETE FROM sales WHERE revenue < 100",
        "INSERT INTO sales VALUES ('Widget', 50)",
        "UPDATE sales SET revenue = 9999",
        "ALTER TABLE sales ADD COLUMN hack TEXT",
        "TRUNCATE TABLE sales",
        "CREATE TABLE fake (id INT)",
        "EXEC xp_cmdshell('dir')",
        "GRANT ALL PRIVILEGES ON DATABASE test TO user",
    ]
    for q in dangerous_queries:
        with pytest.raises(SQLValidationError) as exc:
            validate_select_query(q)
        assert "Forbidden SQL operation" in str(exc.value) or "Only SELECT queries" in str(exc.value)


def test_sql_validation_rejects_query_chaining():
    """Verify query chaining with semicolons is strictly rejected."""
    chained_query = "SELECT * FROM sales; DROP TABLE sales;"
    with pytest.raises(SQLValidationError) as exc:
        validate_select_query(chained_query)
    assert "Multiple SQL statements" in str(exc.value)


def test_sql_validation_table_name():
    """Verify table name identifier validation."""
    assert validate_table_name("sales") == "sales"
    assert validate_table_name("public.sales_q1") == "public.sales_q1"

    with pytest.raises(SQLValidationError):
        validate_table_name("sales; DROP TABLE users")

    with pytest.raises(SQLValidationError):
        validate_table_name("sales--")


# =========================================================================
# 2. Database Ingestion Tests (SQLite via SQLAlchemy)
# =========================================================================

def test_ingest_database_with_table_name():
    """Test loading a full database table via SQLAlchemy."""
    assert SQLITE_DB_PATH.exists()
    conn_str = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"

    metadata = ingestion_service.ingest_database(
        connection_string=conn_str,
        table_name="sales",
    )

    assert metadata.source_type == "db"
    assert metadata.has_structured_tables is True
    assert metadata.row_count == 4
    assert metadata.column_count == 5
    col_names = [col.name for col in metadata.columns]
    assert "product_name" in col_names
    assert "revenue" in col_names
    assert len(metadata.preview_rows) == 4

    # Verify stored in session store
    df = dataset_store.get_dataframe(metadata.file_id)
    assert df is not None
    assert len(df) == 4
    assert "Coffee Maker" in df["product_name"].values


def test_ingest_database_with_select_query():
    """Test loading database filtered rows via SELECT query."""
    assert SQLITE_DB_PATH.exists()
    conn_str = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"

    metadata = ingestion_service.ingest_database(
        connection_string=conn_str,
        query="SELECT product_name, revenue FROM sales WHERE revenue > 200",
    )

    assert metadata.source_type == "db"
    assert metadata.has_structured_tables is True
    assert metadata.row_count == 2
    assert metadata.column_count == 2
    col_names = [col.name for col in metadata.columns]
    assert col_names == ["product_name", "revenue"]


def test_ingest_database_endpoint_live():
    """Test API endpoint POST /api/ingest/database and /ingest/database."""
    conn_str = f"sqlite:///{SQLITE_DB_PATH.as_posix()}"

    # Valid database ingest
    res = client.post(
        "/api/ingest/database",
        json={"connection_string": conn_str, "table_name": "sales"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["source_type"] == "db"
    assert data["has_structured_tables"] is True
    assert data["row_count"] == 4
    assert "file_id" in data

    # Attempt forbidden SQL injection / DROP TABLE through endpoint
    bad_res = client.post(
        "/api/ingest/database",
        json={"connection_string": conn_str, "query": "DROP TABLE sales"},
    )
    assert bad_res.status_code == 400
    assert "SQL Validation Error" in bad_res.json()["detail"]


# =========================================================================
# 3. PDF Ingestion Tests
# =========================================================================

def test_ingest_pdf_with_table():
    """Test PDF file containing structured tables."""
    assert PDF_TABLE_PATH.exists()
    with open(PDF_TABLE_PATH, "rb") as f:
        content = f.read()

    metadata = ingestion_service.ingest_bytes(
        filename="sample_report_with_table.pdf",
        content=content,
    )

    assert metadata.source_type == "pdf"
    assert metadata.has_structured_tables is True
    assert metadata.table_count >= 1
    assert metadata.row_count == 3
    col_names = [col.name for col in metadata.columns]
    assert "product_name" in col_names
    assert "revenue" in col_names
    assert len(metadata.preview_rows) == 3

    # Check session store
    df = dataset_store.get_dataframe(metadata.file_id)
    assert df is not None
    assert "Coffee Maker" in df["product_name"].values


def test_ingest_pdf_unstructured_text_fallback():
    """Test PDF file with no tables falls back to unstructured text without forcing a fake table."""
    assert PDF_TEXT_PATH.exists()
    with open(PDF_TEXT_PATH, "rb") as f:
        content = f.read()

    metadata = ingestion_service.ingest_bytes(
        filename="sample_unstructured.pdf",
        content=content,
    )

    assert metadata.source_type == "pdf"
    assert metadata.has_structured_tables is False
    assert metadata.has_unstructured_text is True
    assert metadata.unstructured_text is not None
    assert "Executive Briefing" in metadata.unstructured_text or "expansion" in metadata.unstructured_text
    assert metadata.row_count == 0
    assert metadata.columns == []
    assert metadata.warning is not None
    assert "unstructured text only" in metadata.warning.lower()

    # Confirms DataFrame in store is empty (not a fake table)
    df = dataset_store.get_dataframe(metadata.file_id)
    assert df is not None
    assert df.empty


def test_upload_pdf_endpoint():
    """Test uploading a PDF through POST /upload endpoint."""
    with open(PDF_TABLE_PATH, "rb") as f:
        content = f.read()

    res = client.post(
        "/upload",
        files={"file": ("report.pdf", content, "application/pdf")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["source_type"] == "pdf"
    assert data["has_structured_tables"] is True
    assert data["row_count"] == 3


# =========================================================================
# 4. PPTX Ingestion Tests
# =========================================================================

def test_ingest_pptx_with_table():
    """Test PowerPoint presentation containing embedded slide table."""
    assert PPTX_TABLE_PATH.exists()
    with open(PPTX_TABLE_PATH, "rb") as f:
        content = f.read()

    metadata = ingestion_service.ingest_bytes(
        filename="sample_presentation_with_table.pptx",
        content=content,
    )

    assert metadata.source_type == "pptx"
    assert metadata.has_structured_tables is True
    assert metadata.table_count >= 1
    assert metadata.row_count == 2
    col_names = [col.name for col in metadata.columns]
    assert "product_name" in col_names
    assert "revenue" in col_names
    assert "category" in col_names

    # Check unstructured slide text extraction
    assert metadata.has_unstructured_text is True
    assert metadata.unstructured_text is not None
    assert len(metadata.unstructured_notes) >= 1

    # Check store
    df = dataset_store.get_dataframe(metadata.file_id)
    assert df is not None
    assert "Coffee Maker" in df["product_name"].values


def test_ingest_pptx_unstructured_text_fallback():
    """Test PowerPoint presentation with no tables stores slide text and sets has_structured_tables=False."""
    assert PPTX_TEXT_PATH.exists()
    with open(PPTX_TEXT_PATH, "rb") as f:
        content = f.read()

    metadata = ingestion_service.ingest_bytes(
        filename="sample_presentation_text_only.pptx",
        content=content,
    )

    assert metadata.source_type == "pptx"
    assert metadata.has_structured_tables is False
    assert metadata.has_unstructured_text is True
    assert metadata.unstructured_text is not None
    assert "Future Strategy" in metadata.unstructured_text or "Milestones" in metadata.unstructured_text
    assert metadata.row_count == 0
    assert metadata.warning is not None
    assert "unstructured text only" in metadata.warning.lower()

    df = dataset_store.get_dataframe(metadata.file_id)
    assert df is not None
    assert df.empty


def test_upload_pptx_endpoint():
    """Test uploading a PPTX through POST /upload endpoint."""
    with open(PPTX_TABLE_PATH, "rb") as f:
        content = f.read()

    res = client.post(
        "/upload",
        files={"file": ("deck.pptx", content, "application/vnd.openxmlformats-officedocument.presentationml.presentation")},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["source_type"] == "pptx"
    assert data["has_structured_tables"] is True
    assert data["row_count"] == 2
