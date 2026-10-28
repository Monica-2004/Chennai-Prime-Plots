"""Pipeline Orchestrator

Coordinates the execution of all 6 stages into a single end-to-end flow:
1. Dataset retrieval (Stage 1)
2. Query Understanding (Stage 2)
3. AI Analyst Agent (Stage 3)
4. Verification Layer (Stage 4)
5. Explainability Layer (Stage 5)
6. Output Formatter (Stage 6)

Guarantees graceful degradation if any stage fails, returning a consistent
AskResponse shape rather than crashing.
"""

from backend.app.models.schemas import (
    AskResponse,
    VerificationResult,
    ExplanationResult,
)
from backend.app.pipeline.stage1_ingestion import ingestion_service
from backend.app.pipeline.stage2_query_understanding import query_understanding_agent
from backend.app.pipeline.stage3_analyst_agent import analyst_agent
from backend.app.pipeline.stage4_verification import verification_layer
from backend.app.pipeline.stage5_explainability import explainability_agent
from backend.app.pipeline.stage6_output_formatter import output_formatter


async def run_pipeline(session_id: str, question: str) -> AskResponse:
    """Run the complete 6-stage VeriAnalyst pipeline.

    Args:
        session_id: ID of the active dataset session.
        question: User's natural language question.

    Returns:
        AskResponse formatted with answer_text, result_table, chart,
        explanation_text, verified flag, and warnings.
    """
    if not session_id:
        return AskResponse(
            answer_text="No dataset session ID provided.",
            explanation_text="Please upload a dataset first.",
            verified=False,
            warning="Missing session_id / file_id.",
        )

    if not question or not question.strip():
        return AskResponse(
            answer_text="No question provided.",
            explanation_text="Please ask a question about your uploaded dataset.",
            verified=False,
            warning="Empty question query.",
        )

    # 1. Retrieve dataset session (Stage 1)
    try:
        df = ingestion_service.load_dataset(session_id)
        metadata = ingestion_service.get_metadata(session_id)
        if metadata is None or df is None:
            raise KeyError("Dataset not found in store")
    except Exception as e:
        return AskResponse(
            answer_text="Dataset not found or session has expired.",
            explanation_text="The specified dataset could not be located in the active session store.",
            verified=False,
            warning=f"Dataset session '{session_id}' not found.",
        )

    # 2. Query Understanding (Stage 2)
    try:
        intent = await query_understanding_agent.parse_query(query=question, metadata=metadata)
    except Exception as e:
        return AskResponse(
            answer_text="Could not understand the question in relation to the dataset.",
            explanation_text=f"The question could not be mapped to the dataset schema: {str(e)}",
            verified=False,
            warning=f"Query understanding error: {str(e)}",
        )

    # 3. AI Analyst Agent execution (Stage 3)
    try:
        analyst_result = analyst_agent.execute(df, intent)
        if not analyst_result.success:
            return AskResponse(
                answer_text="Unable to compute the requested analysis.",
                explanation_text=f"The analyst agent encountered an error: {analyst_result.error_message}",
                verified=False,
                warning=analyst_result.error_message or "Execution failed",
            )
    except Exception as e:
        return AskResponse(
            answer_text="An error occurred while executing the data operation.",
            explanation_text=f"Pandas computation failed: {str(e)}",
            verified=False,
            warning=str(e),
        )

    # 4. Verification Layer (Stage 4)
    try:
        verification = verification_layer.verify(df, intent, analyst_result)
    except Exception as e:
        verification = VerificationResult(
            verified=False,
            status="failed",
            discrepancy=f"Verification error: {str(e)}",
            confidence_note="Verification exception encountered.",
        )

    # 5. Explainability Layer (Stage 5)
    try:
        explanation = await explainability_agent.explain(
            query=question,
            intent=intent,
            analyst_result=analyst_result,
            verification=verification,
        )
    except Exception as e:
        explanation = ExplanationResult(
            explanation_text=(
                f"The analysis calculated {intent.operation} on '{intent.target_column}' "
                f"yielding {analyst_result.result_value}."
                if verification.verified
                else f"Result could not be verified: {verification.discrepancy}"
            ),
        )

    # 6. Output Formatter (Stage 6)
    return output_formatter.format_output(
        query=question,
        intent=intent,
        analyst_result=analyst_result,
        verification=verification,
        explanation=explanation,
    )
