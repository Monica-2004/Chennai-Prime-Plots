"""Stage 5: Explainability Layer

Generates a plain-language rationale for how the result was derived using the local
Ollama LLM (qwen2.5:3b), incorporating verified data facts and grounding checks.

Features:
- Reuses the central llm_client module from Stage 2.
- Prompts with concrete facts only (operation, columns, filter, row count, verified result).
- Refuses to validate or invent numbers.
- If verification failed (verified: false), clearly explains that the result could not be confirmed.
- Fully isolated to allow easily swapping models without affecting Stages 1-4.
"""

from typing import Optional
from backend.app.core.llm_client import OllamaClient, llm_client
from backend.app.models.schemas import (
    QueryIntent,
    AnalystExecutionResult,
    VerificationResult,
    ExplanationResult,
)


def build_explanation_prompt(
    query: str,
    intent: QueryIntent,
    analyst_result: AnalystExecutionResult,
    verification: VerificationResult,
) -> str:
    """Construct factual prompt strictly constrained to executed facts."""
    if not verification.verified:
        return f"""You are an explainable AI data analyst.
A data analysis query was executed, but independent mathematical verification FAILED to ground the result in the dataset.
Explain this discrepancy clearly to the user in 2 to 3 concise sentences.

Factual Execution Details:
- User Question: "{query}"
- Reported Result: {analyst_result.result_value}
- Verification Failure Discrepancy: {verification.discrepancy}

Rules:
1. Clearly inform the user that the result could NOT be confirmed or verified against the dataset.
2. State the verification discrepancy so the user understands why the result is untrusted.
3. Do NOT present the reported result as trustworthy fact.
4. Write 2 to 3 clear, plain-language sentences.

Explanation:"""

    result_repr = (
        analyst_result.result_value
        if analyst_result.result_value is not None
        else analyst_result.result_table
    )

    return f"""You are an explainable AI data analyst.
Explain to a non-technical user how the answer was derived from the data in 2 to 3 concise, clear sentences.

Factual Execution Details:
- User Question: "{query}"
- Operation Used: {intent.operation}
- Target Metric / Column: {intent.target_column or "N/A"}
- Grouping Column: {intent.group_by_column or "None"}
- Filter Applied: {intent.filter_condition or "None (all data included)"}
- Rows Analyzed: {analyst_result.row_count_used}
- Computed Result: {result_repr}
- Verification Status: Grounded and verified against the source dataset.

Rules:
1. Write 2 to 3 plain-English sentences.
2. Mention the specific result value, entity/product name (if applicable), and operation or column.
3. Do NOT invent new numbers, hypothetical figures, or unverified claims.
4. Only describe what was actually calculated above.

Explanation:"""


class ExplainabilityAgent:
    """Agent that translates technical query execution steps into plain-English explanations."""

    def __init__(self, client: Optional[OllamaClient] = None):
        self.llm = client or llm_client

    async def explain(
        self,
        query: str,
        intent: QueryIntent,
        analyst_result: AnalystExecutionResult,
        verification: VerificationResult,
    ) -> ExplanationResult:
        """Generate human-understandable explanation and methodology rationale.

        Args:
            query: The user's original query.
            intent: Structured intent from Stage 2.
            analyst_result: Real execution data from Stage 3.
            verification: Grounding status and steps from Stage 4.

        Returns:
            ExplanationResult containing explanation_text and supporting metadata.
        """
        prompt = build_explanation_prompt(
            query=query,
            intent=intent,
            analyst_result=analyst_result,
            verification=verification,
        )

        raw_explanation = await self.llm.generate(prompt=prompt, temperature=0.0)
        clean_text = raw_explanation.strip()

        # Fallback if LLM output was unexpectedly empty
        if not clean_text:
            if verification.verified:
                clean_text = (
                    f"The {intent.operation} operation on '{intent.target_column}' "
                    f"yielded {analyst_result.result_value} across {analyst_result.row_count_used} rows."
                )
            else:
                clean_text = (
                    f"The analysis result could not be verified against the dataset due to: {verification.discrepancy}"
                )

        return ExplanationResult(
            explanation_text=clean_text,
            summary=f"{intent.operation.capitalize()} of {intent.target_column or 'data'}",
            step_by_step_rationale=verification.deterministic_steps,
            caveats_or_filters=analyst_result.warnings,
        )


# Singleton agent instance
explainability_agent = ExplainabilityAgent()


async def generate_explanation(
    question: str,
    intent: QueryIntent,
    analyst_result: AnalystExecutionResult,
    verification: VerificationResult,
    client: Optional[OllamaClient] = None,
) -> dict:
    """Generate a short plain-language explanation of how the answer was derived.

    Args:
        question: Original user question.
        intent: Parsed intent from Stage 2.
        analyst_result: Result object from Stage 3.
        verification: Verification object from Stage 4.
        client: Optional OllamaClient instance (defaults to shared singleton).

    Returns:
        Dict with key "explanation_text".
    """
    agent = ExplainabilityAgent(client=client) if client else explainability_agent
    result = await agent.explain(
        query=question,
        intent=intent,
        analyst_result=analyst_result,
        verification=verification,
    )
    return {"explanation_text": result.explanation_text}

