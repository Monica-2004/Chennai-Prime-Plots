"""Stage 6: Output Layer

Synthesizes the pipeline artifacts into the final user-facing response matching the exact contract:
{
  answer_text: short natural-language sentence with the result,
  result_table: table data if relevant (e.g. for compare/group results),
  chart: chart spec if relevant (bar for comparisons/groups, single value display for a plain max/min/sum), or null,
  explanation_text: from Stage 5,
  verified: true/false from Stage 4,
  warning: null, or a clear message if verified is false or if Stage 3/4 reported an issue
}
"""

from typing import Any, Dict, List, Optional
from backend.app.models.schemas import (
    QueryIntent,
    AnalystExecutionResult,
    VerificationResult,
    ExplanationResult,
    AskResponse,
)


def _format_currency_or_number(val: Any) -> str:
    """Format numeric values cleanly."""
    if isinstance(val, float):
        if val.is_integer():
            return f"{int(val):,}"
        return f"{val:,.2f}"
    if isinstance(val, int):
        return f"{val:,}"
    return str(val)


class OutputFormatter:
    """Formats analyst results, verification badges, and explanations into an API response."""

    def format_output(
        self,
        query: str,
        intent: QueryIntent,
        analyst_result: AnalystExecutionResult,
        verification: VerificationResult,
        explanation: ExplanationResult,
    ) -> AskResponse:
        """Construct the complete multi-modal answer payload.

        Args:
            query: Original user question.
            intent: Structured query intent from Stage 2.
            analyst_result: Execution result from Stage 3.
            verification: Grounding audit from Stage 4.
            explanation: Plain-language explanation from Stage 5.

        Returns:
            AskResponse satisfying all Stage 6 specifications.
        """
        op = intent.operation.lower()
        target_col = intent.target_column or "metric"
        group_by_col = intent.group_by_column
        res_val = analyst_result.result_value
        res_table = analyst_result.result_table

        # 1. Answer text generation
        if not verification.verified:
            answer_text = (
                f"The analysis completed, but the result could not be verified against the dataset. "
                f"Discrepancy: {verification.discrepancy or 'Unverified result'}"
            )
        elif op == "max":
            if isinstance(res_val, dict) and group_by_col and target_col in res_val:
                entity = res_val.get(group_by_col, "Unknown")
                val_str = _format_currency_or_number(res_val.get(target_col))
                answer_text = f"The {group_by_col.replace('_', ' ')} with the highest {target_col.replace('_', ' ')} is {entity} with {val_str}."
            else:
                val_str = _format_currency_or_number(res_val)
                answer_text = f"The maximum {target_col.replace('_', ' ')} is {val_str}."

        elif op == "min":
            if isinstance(res_val, dict) and group_by_col and target_col in res_val:
                entity = res_val.get(group_by_col, "Unknown")
                val_str = _format_currency_or_number(res_val.get(target_col))
                answer_text = f"The {group_by_col.replace('_', ' ')} with the lowest {target_col.replace('_', ' ')} is {entity} with {val_str}."
            else:
                val_str = _format_currency_or_number(res_val)
                answer_text = f"The minimum {target_col.replace('_', ' ')} is {val_str}."

        elif op == "sum":
            val_str = _format_currency_or_number(res_val)
            answer_text = f"The total {target_col.replace('_', ' ')} is {val_str}."

        elif op in ("average", "mean"):
            val_str = _format_currency_or_number(res_val)
            answer_text = f"The average {target_col.replace('_', ' ')} is {val_str}."

        elif op == "count":
            answer_text = f"The total count is {res_val}."

        elif op == "compare":
            answer_text = f"Here is the comparative breakdown of {target_col.replace('_', ' ')} by {group_by_col or 'category'}."

        elif op == "filter":
            answer_text = f"Found {analyst_result.row_count_used} matching rows for condition '{intent.filter_condition}'."

        else:
            answer_text = f"Result: {res_val if res_val is not None else 'Completed successfully'}."

        # 2. Result Table
        result_table: Optional[List[Dict[str, Any]]] = None
        if res_table and len(res_table) > 0:
            result_table = res_table

        # 3. Chart Specification
        chart_spec: Optional[Dict[str, Any]] = None
        if result_table and len(result_table) >= 2 and group_by_col and target_col:
            chart_spec = {
                "chart_type": "bar",
                "title": f"{target_col.replace('_', ' ').title()} by {group_by_col.replace('_', ' ').title()}",
                "x_key": group_by_col,
                "y_key": target_col,
                "data": result_table,
            }
        elif res_val is not None:
            if isinstance(res_val, dict) and group_by_col and target_col in res_val:
                chart_spec = {
                    "chart_type": "metric",
                    "title": f"Highest {target_col.replace('_', ' ').title()}",
                    "label": str(res_val.get(group_by_col)),
                    "value": res_val.get(target_col),
                }
            elif isinstance(res_val, (int, float)):
                chart_spec = {
                    "chart_type": "metric",
                    "title": f"{op.capitalize()} {target_col.replace('_', ' ').title()}",
                    "label": target_col.replace('_', ' ').title(),
                    "value": res_val,
                }

        # 4. Warnings synthesis
        warning_msg: Optional[str] = None
        warnings_list: List[str] = []

        if not verification.verified:
            warnings_list.append(
                f"Verification warning: {verification.discrepancy or 'Result could not be confirmed against the dataset.'}"
            )
        if analyst_result.warnings:
            warnings_list.extend(analyst_result.warnings)

        if warnings_list:
            warning_msg = "; ".join(warnings_list)

        return AskResponse(
            answer_text=answer_text,
            result_table=result_table,
            chart=chart_spec,
            explanation_text=explanation.explanation_text,
            verified=verification.verified,
            warning=warning_msg,
        )


# Singleton formatter instance
output_formatter = OutputFormatter()
