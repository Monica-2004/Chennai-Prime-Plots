"""Stage 3: AI Analyst Agent

Executes the corresponding pandas operation on the real dataset according to
the structured QueryIntent extracted in Stage 2.

Features:
- Purely deterministic code (NO LLM involved).
- Handlers for sum, average/mean, max, min, count, compare, and filter.
- Safe filter condition evaluator supporting binary comparisons and relative dates.
- Clean structured output {operation, result_value, result_table, row_count_used, columns_used}.
- Comprehensive edge case handling: empty filtered data, all-null targets, capped groupings, non-numeric errors.
"""

import math
import re
import time
from typing import Any, Dict, List, Optional, Tuple
import numpy as np
import pandas as pd

from backend.app.models.schemas import QueryIntent, AnalystExecutionResult


def sanitize_value(val: Any) -> Any:
    """Convert numpy and pandas types to JSON-safe Python native types."""
    if val is None or pd.isna(val):
        return None
    if isinstance(val, (np.integer, int)):
        return int(val)
    if isinstance(val, (np.floating, float)):
        if math.isnan(val) or math.isinf(val):
            return None
        return float(val)
    if isinstance(val, (np.bool_, bool)):
        return bool(val)
    if isinstance(val, (pd.Timestamp, np.datetime64)):
        return str(val)
    if isinstance(val, dict):
        return {k: sanitize_value(v) for k, v in val.items()}
    if isinstance(val, (list, tuple)):
        return [sanitize_value(v) for v in val]
    return str(val)


def parse_and_apply_filter(
    df: pd.DataFrame,
    filter_condition: Optional[str],
) -> Tuple[pd.DataFrame, List[str], List[str], Optional[str]]:
    """Parse a simple filter condition and apply it to the DataFrame.
    
    Supported:
    - column == 'value' or column = 'value'
    - column != 'value'
    - column > value, column < value, >=, <=
    - relative date expressions like 'this month' (interpreted as latest available value)

    Returns:
        (filtered_df, columns_used, warnings, pandas_filter_snippet)
    """
    if not filter_condition:
        return df, [], [], None

    clean_cond = filter_condition.strip()
    if clean_cond.lower() in ("null", "none", "n/a", ""):
        return df, [], [], None

    warnings: List[str] = []
    columns_used: List[str] = []

    # Check if the filter condition is a standalone relative expression like "this month"
    if clean_cond.lower() in ("this month", "current month", "latest month"):
        date_col = next((c for c in df.columns if any(k in str(c).lower() for k in ("month", "date", "period"))), None)
        if date_col:
            latest_val = df[date_col].dropna().max()
            if not pd.isna(latest_val):
                columns_used.append(date_col)
                filtered = df[df[date_col] == latest_val]
                warnings.append(f"Interpreted '{clean_cond}' as latest available '{date_col}': '{latest_val}'.")
                snippet = f"df[df['{date_col}'] == '{latest_val}']"
                return filtered, columns_used, warnings, snippet

    # Regex for: column op value
    pattern = r"^\s*([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<|=)\s*(['\"]?)(.*?)\3\s*$"
    match = re.match(pattern, clean_cond)

    if not match:
        warnings.append(
            f"Filter condition '{clean_cond}' could not be parsed into supported pandas logic as unsupported; proceeding without filter."
        )
        return df, [], warnings, None

    col_raw, op, _, val_raw = match.groups()
    if op == "=":
        op = "=="

    # Find matching column (case-insensitive)
    col = None
    for c in df.columns:
        if str(c).strip().lower() == col_raw.strip().lower():
            col = c
            break

    if not col:
        warnings.append(
            f"Filter column '{col_raw}' not found in dataset columns; proceeding without filter."
        )
        return df, [], warnings, None

    columns_used.append(col)
    val = val_raw.strip()

    # Relative date / month handling
    if val.lower() in ("this month", "current month", "latest month"):
        latest_val = df[col].dropna().max()
        if pd.isna(latest_val):
            warnings.append(f"No valid non-null values found in '{col}' to evaluate '{val}'.")
            return df, columns_used, warnings, None
        filtered = df[df[col] == latest_val]
        warnings.append(f"Interpreted '{val}' as latest available '{col}': '{latest_val}'.")
        snippet = f"df[df['{col}'] == '{latest_val}']"
        return filtered, columns_used, warnings, snippet

    # Type casting for numeric comparisons
    if pd.api.types.is_numeric_dtype(df[col]):
        try:
            val_num = float(val) if "." in val else int(val)
            if op == "==":
                filtered = df[df[col] == val_num]
            elif op == "!=":
                filtered = df[df[col] != val_num]
            elif op == ">":
                filtered = df[df[col] > val_num]
            elif op == "<":
                filtered = df[df[col] < val_num]
            elif op == ">=":
                filtered = df[df[col] >= val_num]
            elif op == "<=":
                filtered = df[df[col] <= val_num]
            else:
                warnings.append(f"Unsupported operator '{op}' for numeric column '{col}'.")
                return df, columns_used, warnings, None
            snippet = f"df[df['{col}'] {op} {val_num}]"
            return filtered, columns_used, warnings, snippet
        except ValueError:
            warnings.append(f"Could not convert filter value '{val}' to number for column '{col}'.")
            return df, columns_used, warnings, None

    # String / Categorical comparisons
    if op == "==":
        filtered = df[df[col].astype(str).str.strip().str.lower() == val.lower()]
    elif op == "!=":
        filtered = df[df[col].astype(str).str.strip().str.lower() != val.lower()]
    else:
        warnings.append(f"Operator '{op}' is not supported for text column '{col}'.")
        return df, columns_used, warnings, None

    snippet = f"df[df['{col}'].str.lower() {op} '{val.lower()}']"
    return filtered, columns_used, warnings, snippet


class AIAnalystAgent:
    """Deterministic agent that executes pandas computations safely based on QueryIntent."""

    def execute(self, df: pd.DataFrame, intent: QueryIntent) -> AnalystExecutionResult:
        """Run the matching pandas operation on the DataFrame based on intent.

        Args:
            df: Ingested pandas DataFrame.
            intent: Structured intent from Stage 2.

        Returns:
            AnalystExecutionResult containing operation, result_value or result_table,
            row_count_used, columns_used, code snippet, and execution time.
        """
        start_time = time.perf_counter()
        op = intent.operation.lower().strip()
        if op == "mean":
            op = "average"

        target_col = intent.target_column
        group_by_col = intent.group_by_column
        filter_cond = intent.filter_condition

        warnings: List[str] = []
        columns_used: List[str] = []

        # 1. Apply filtering
        filtered_df, filter_cols, filter_warns, filter_snippet = parse_and_apply_filter(
            df, filter_cond
        )
        warnings.extend(filter_warns)
        columns_used.extend(filter_cols)

        row_count_used = len(filtered_df)

        # Edge case: empty DataFrame after filter
        if row_count_used == 0:
            warnings.append("No rows matched the filter condition; execution returned empty result.")
            exec_time = round((time.perf_counter() - start_time) * 1000, 2)
            return AnalystExecutionResult(
                success=True,
                operation=op,
                result_value=None,
                result_table=[],
                row_count_used=0,
                columns_used=list(set(columns_used)),
                pandas_snippet=filter_snippet or "df.copy()",
                execution_time_ms=exec_time,
                warnings=warnings,
            )

        # 2. Validate columns exist
        if target_col and target_col not in df.columns:
            return AnalystExecutionResult(
                success=False,
                operation=op,
                error_message=f"Target column '{target_col}' not found in dataset.",
                execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2),
                warnings=warnings,
            )
        if target_col and target_col not in columns_used:
            columns_used.append(target_col)

        if group_by_col and group_by_col not in df.columns:
            return AnalystExecutionResult(
                success=False,
                operation=op,
                error_message=f"Group by column '{group_by_col}' not found in dataset.",
                execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2),
                warnings=warnings,
            )
        if group_by_col and group_by_col not in columns_used:
            columns_used.append(group_by_col)

        # Edge case: target_col has all nulls
        if target_col and filtered_df[target_col].dropna().empty:
            warnings.append(f"Target column '{target_col}' has all null values in the filtered rows.")
            exec_time = round((time.perf_counter() - start_time) * 1000, 2)
            return AnalystExecutionResult(
                success=True,
                operation=op,
                result_value=None,
                result_table=[],
                row_count_used=row_count_used,
                columns_used=list(set(columns_used)),
                execution_time_ms=exec_time,
                warnings=warnings,
            )

        # Edge case: non-numeric check for sum / average
        if op in ("sum", "average") and target_col:
            if not pd.api.types.is_numeric_dtype(filtered_df[target_col]):
                return AnalystExecutionResult(
                    success=False,
                    operation=op,
                    error_message=f"Cannot compute '{op}' on non-numeric column '{target_col}' of type '{filtered_df[target_col].dtype}'.",
                    execution_time_ms=round((time.perf_counter() - start_time) * 1000, 2),
                    warnings=warnings,
                )

        # Edge case: group-by column cardinality cap
        if group_by_col:
            unique_groups = filtered_df[group_by_col].nunique()
            if unique_groups > 50:
                warnings.append(
                    f"Group-by column '{group_by_col}' has {unique_groups} unique groups. Capping output to top 50 groups."
                )

        # 3. Execute Operations
        result_value = None
        result_table: Optional[List[Dict[str, Any]]] = None
        code_snippets: List[str] = [filter_snippet] if filter_snippet else ["df"]

        # ========================================================
        # Case A: Grouped Operations (group_by_column is specified)
        # ========================================================
        if group_by_col:
            metric_col = target_col or filtered_df.columns[0]
            if op == "sum":
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].sum()
                agg_df = agg_df.sort_values(by=metric_col, ascending=False).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].sum().sort_values(ascending=False)")
            elif op == "average":
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].mean()
                agg_df[metric_col] = agg_df[metric_col].round(4)
                agg_df = agg_df.sort_values(by=metric_col, ascending=False).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].mean().sort_values(ascending=False)")
            elif op == "max":
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].max()
                agg_df = agg_df.sort_values(by=metric_col, ascending=False).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].max().sort_values(ascending=False)")
                if not agg_df.empty:
                    top_row = agg_df.iloc[0]
                    result_value = {
                        group_by_col: sanitize_value(top_row[group_by_col]),
                        metric_col: sanitize_value(top_row[metric_col]),
                    }
            elif op == "min":
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].min()
                agg_df = agg_df.sort_values(by=metric_col, ascending=True).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].min().sort_values(ascending=True)")
                if not agg_df.empty:
                    bottom_row = agg_df.iloc[0]
                    result_value = {
                        group_by_col: sanitize_value(bottom_row[group_by_col]),
                        metric_col: sanitize_value(bottom_row[metric_col]),
                    }
            elif op == "count":
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].count()
                agg_df = agg_df.sort_values(by=metric_col, ascending=False).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].count().sort_values(ascending=False)")
            elif op == "compare":
                if pd.api.types.is_numeric_dtype(filtered_df[metric_col]):
                    agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].mean()
                    agg_df[metric_col] = agg_df[metric_col].round(4)
                else:
                    agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].count()
                agg_df = agg_df.sort_values(by=metric_col, ascending=False).head(50)
                code_snippets.append(f".groupby('{group_by_col}')['{metric_col}'].agg(...).sort_values(ascending=False)")
            else:
                # Default group fallback
                agg_df = filtered_df.groupby(group_by_col, as_index=False)[metric_col].count().head(50)

            result_table = [
                {k: sanitize_value(v) for k, v in row.items()}
                for row in agg_df.to_dict(orient="records")
            ]

        # ========================================================
        # Case B: Scalar / Ungrouped Operations
        # ========================================================
        else:
            if not target_col and op != "filter":
                target_col = filtered_df.columns[0]
                columns_used.append(target_col)

            if op == "sum":
                val = filtered_df[target_col].sum()
                result_value = sanitize_value(round(float(val), 4) if isinstance(val, float) else val)
                code_snippets.append(f"['{target_col}'].sum()")
            elif op == "average":
                val = filtered_df[target_col].mean()
                result_value = sanitize_value(round(float(val), 4))
                code_snippets.append(f"['{target_col}'].mean()")
            elif op == "max":
                val = filtered_df[target_col].max()
                result_value = sanitize_value(val)
                code_snippets.append(f"['{target_col}'].max()")
            elif op == "min":
                val = filtered_df[target_col].min()
                result_value = sanitize_value(val)
                code_snippets.append(f"['{target_col}'].min()")
            elif op == "count":
                val = int(filtered_df[target_col].count())
                result_value = val
                code_snippets.append(f"['{target_col}'].count()")
            elif op in ("filter", "compare"):
                result_value = row_count_used
                result_table = [
                    {k: sanitize_value(v) for k, v in row.items()}
                    for row in filtered_df.head(50).to_dict(orient="records")
                ]
                code_snippets.append(f".head(50)")
            else:
                warnings.append(f"Unrecognized operation '{op}'.")

        exec_time = round((time.perf_counter() - start_time) * 1000, 2)
        pandas_snippet = "".join(code_snippets)

        return AnalystExecutionResult(
            success=True,
            operation=op,
            result_value=result_value,
            result_table=result_table,
            row_count_used=row_count_used,
            columns_used=list(set(columns_used)),
            pandas_snippet=pandas_snippet,
            execution_time_ms=exec_time,
            warnings=warnings,
        )


# Singleton agent instance
analyst_agent = AIAnalystAgent()
