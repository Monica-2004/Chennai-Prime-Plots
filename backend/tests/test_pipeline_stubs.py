"""Tests to ensure all pipeline stage modules and stubs are properly defined."""

import pytest
from backend.app.core.config import settings
from backend.app.core.llm_client import llm_client
from backend.app.pipeline import (
    ingestion_service,
    query_understanding_agent,
    analyst_agent,
    verification_layer,
    explainability_agent,
    output_formatter,
)
from backend.app.models.schemas import QueryIntent, DatasetMetadata


def test_config_loaded():
    assert settings.OLLAMA_MODEL == "qwen2.5:3b"
    assert "localhost:11434" in settings.OLLAMA_BASE_URL


def test_pipeline_stubs_exist():
    assert ingestion_service is not None
    assert query_understanding_agent is not None
    assert analyst_agent is not None
    assert verification_layer is not None
    assert explainability_agent is not None
    assert output_formatter is not None


def test_all_pipeline_stages_implemented():
    """Verify all 6 pipeline components are fully instantiated and ready."""
    assert callable(getattr(ingestion_service, "ingest_bytes"))
    assert callable(getattr(query_understanding_agent, "parse_query"))
    assert callable(getattr(analyst_agent, "execute"))
    assert callable(getattr(verification_layer, "verify"))
    assert callable(getattr(explainability_agent, "explain"))
    assert callable(getattr(output_formatter, "format_output"))
