"""Stage 2: Query Understanding

Uses the local Ollama LLM (qwen2.5:3b) to parse natural language questions into
a structured intent object (operation, target_column, group_by_column, filter_condition).

Key Features:
- Dynamically injects actual dataset column names & types into the prompt.
- Cleans and extracts JSON even if surrounded by markdown fences or prelude text.
- Validates that target_column and group_by_column strictly exist in the dataset,
  preventing hallucinated columns from passing downstream.
"""

import json
from typing import Any, Dict, List, Optional

from backend.app.core.llm_client import OllamaClient, llm_client
from backend.app.models.schemas import DatasetMetadata, ColumnInfo, QueryIntent


class QueryUnderstandingError(Exception):
    """Base exception for query understanding failures."""
    pass


class JSONExtractionError(QueryUnderstandingError):
    """Raised when no valid JSON object can be extracted from the model output."""
    pass


class ColumnValidationError(QueryUnderstandingError):
    """Raised when the model hallucinates or references a non-existent column."""
    pass


class InvalidOperationError(QueryUnderstandingError):
    """Raised when the model outputs an unsupported operation."""
    pass


ALLOWED_OPERATIONS = {"sum", "average", "mean", "max", "min", "count", "compare", "filter"}


def clean_and_extract_json(raw_text: str) -> Dict[str, Any]:
    """Extract and parse JSON from model output.
    
    Strips anything before the first '{' and after the last '}', effectively
    removing markdown fences (```json), commentary, or trailing text.
    """
    if not raw_text:
        raise JSONExtractionError("LLM response was empty.")

    start_idx = raw_text.find("{")
    end_idx = raw_text.rfind("}")

    if start_idx == -1 or end_idx == -1 or start_idx > end_idx:
        raise JSONExtractionError(
            f"No valid JSON object delimiters found in model response: {raw_text[:200]}"
        )

    json_str = raw_text[start_idx : end_idx + 1].strip()

    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise JSONExtractionError(f"Failed to parse extracted JSON '{json_str}': {str(e)}")


def build_query_understanding_prompt(query: str, columns: List[ColumnInfo]) -> str:
    """Construct dynamic prompt instructing qwen2.5:3b to parse query against actual dataset columns."""
    column_descriptions = "\n".join([f"- {col.name} ({col.dtype})" for col in columns])

    return f"""You are an expert data analysis query parser.
A user has uploaded a tabular dataset with the following schema and columns:
{column_descriptions}

Analyze the user's question and map it to a structured query intent.
Respond ONLY with a valid JSON object in this exact schema, with no additional commentary, markdown formatting, or explanations:
{{
  "operation": "sum|average|max|min|count|compare|filter",
  "target_column": "<column name from the dataset, or null>",
  "group_by_column": "<column name from the dataset, or null>",
  "filter_condition": "<plain description of filter conditions, or null>"
}}

Rules:
1. "operation" MUST be one of: "sum", "average", "max", "min", "count", "compare", "filter".
2. "target_column" must be the exact name of a column from the dataset above, or null if not applicable.
3. "group_by_column" must be the exact name of a column from the dataset above if grouping or breaking down by that column is needed, or null.
4. "filter_condition" should describe any row filters needed (e.g. "month == '2024-03'" or "this month"), or null if no filtering is requested.
5. Do NOT invent or hallucinate column names. Only use column names from the provided list.

User Question: "{query}"
JSON:"""


def _normalize_column_name(
    col_name: Optional[str],
    available_columns: List[str],
    field_name: str,
) -> Optional[str]:
    """Normalize and validate column name against dataset schema."""
    if col_name is None:
        return None

    cleaned = str(col_name).strip()
    if cleaned.lower() in ("null", "none", "n/a", ""):
        return None

    # Exact match
    if cleaned in available_columns:
        return cleaned

    # Case-insensitive match
    lower_map = {c.lower(): c for c in available_columns}
    if cleaned.lower() in lower_map:
        return lower_map[cleaned.lower()]

    # If column does not exist, reject hallucination
    available_formatted = ", ".join([f"'{c}'" for c in available_columns])
    raise ColumnValidationError(
        f"Validation error: {field_name} '{cleaned}' does not exist in dataset. "
        f"Available columns are: [{available_formatted}]."
    )


def validate_and_build_intent(
    parsed: Dict[str, Any],
    available_columns: List[str],
    raw_query: str,
) -> QueryIntent:
    """Validate extracted fields against dataset columns and permitted operations."""
    # 1. Operation validation
    op = str(parsed.get("operation", "")).strip().lower()
    if op == "mean":
        op = "average"

    if op not in ALLOWED_OPERATIONS:
        raise InvalidOperationError(
            f"Invalid operation '{op}'. Supported operations are: {sorted(list(ALLOWED_OPERATIONS))}."
        )

    # 2. Target column validation
    raw_target = parsed.get("target_column")
    target_column = _normalize_column_name(raw_target, available_columns, "target_column")

    # 3. Group by column validation
    raw_group_by = parsed.get("group_by_column")
    group_by_column = _normalize_column_name(raw_group_by, available_columns, "group_by_column")

    # 4. Filter condition extraction
    raw_filter = parsed.get("filter_condition")
    filter_condition = None
    if raw_filter and str(raw_filter).strip().lower() not in ("null", "none", "n/a", ""):
        filter_condition = str(raw_filter).strip()

    return QueryIntent(
        raw_query=raw_query,
        operation=op,
        target_column=target_column,
        group_by_column=group_by_column,
        filter_condition=filter_condition,
    )


class QueryUnderstandingAgent:
    """Agent responsible for translating plain-English queries into structured operations."""

    def __init__(self, client: Optional[OllamaClient] = None):
        self.llm = client or llm_client

    async def parse_query(self, query: str, metadata: DatasetMetadata) -> QueryIntent:
        """Analyze user query in the context of the dataset schema to extract intent.

        Args:
            query: The user's question in plain English.
            metadata: Dataset schema and column profile from Stage 1.

        Returns:
            QueryIntent schema containing operation, target column, group-by, and filters.

        Raises:
            QueryUnderstandingError: If model response is invalid or hallucinated columns are detected.
        """
        prompt = build_query_understanding_prompt(query=query, columns=metadata.columns)
        raw_response = await self.llm.generate(prompt=prompt, temperature=0.0)

        # Extract JSON (handling markdown fences & extraneous tokens)
        parsed_json = clean_and_extract_json(raw_response)

        # Validate columns against actual schema
        available_column_names = [col.name for col in metadata.columns]
        intent = validate_and_build_intent(
            parsed=parsed_json,
            available_columns=available_column_names,
            raw_query=query,
        )

        return intent


# Agent instance
query_understanding_agent = QueryUnderstandingAgent()
