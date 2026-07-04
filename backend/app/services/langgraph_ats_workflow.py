from typing import Any, TypedDict

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.report_model import AnalysisReport
from app.models.resume_model import Resume
from app.schemas.report_schema import AnalyzeResumeRequest
from app.services.ats_service import analyze_resume_against_jd
from app.services.chunking_service import chunk_text
from app.services.nvidia_llm_service import generate_nvidia_structured_report
from app.services.retrieval_service import retrieve_evidence_chunks


class ATSGraphState(TypedDict, total=False):
    db: Session
    user_id: int
    payload: AnalyzeResumeRequest

    resume: Resume
    resume_text: str

    analysis: dict[str, Any]
    chunks: list[dict]
    evidence_snippets: list[dict]
    llm_output: dict[str, Any]

    report: AnalysisReport
    workflow_trace: list[str]
    errors: list[str]


def add_trace(state: ATSGraphState, message: str) -> list[str]:
    trace = list(state.get("workflow_trace", []))
    trace.append(message)
    return trace


def load_resume_node(state: ATSGraphState) -> ATSGraphState:
    db = state["db"]
    user_id = state["user_id"]
    payload = state["payload"]

    resume = (
        db.query(Resume)
        .filter(Resume.id == payload.resume_id, Resume.user_id == user_id)
        .first()
    )

    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found",
        )

    if resume.status != "parsed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume is not parsed yet. Please wait and try again.",
        )

    if not resume.parsed_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume parsed text is empty.",
        )

    return {
        **state,
        "resume": resume,
        "resume_text": resume.parsed_text,
        "workflow_trace": add_trace(state, "load_resume_node completed"),
    }


def extract_jd_skills_node(state: ATSGraphState) -> ATSGraphState:
    payload = state["payload"]
    resume = state["resume"]

    analysis = analyze_resume_against_jd(
        resume_text=state["resume_text"],
        job_description=payload.job_description,
        existing_resume_skills=resume.extracted_skills or [],
    )

    return {
        **state,
        "analysis": analysis,
        "workflow_trace": add_trace(state, "extract_jd_skills_node completed"),
    }


def ats_score_node(state: ATSGraphState) -> ATSGraphState:
    return {
        **state,
        "workflow_trace": add_trace(
            state,
            f'ats_score_node completed ats_score={state["analysis"]["ats_score"]}',
        ),
    }


def chunk_resume_node(state: ATSGraphState) -> ATSGraphState:
    chunks = chunk_text(
        text=state["resume_text"],
        chunk_size_words=120,
        overlap_words=25,
    )

    return {
        **state,
        "chunks": chunks,
        "workflow_trace": add_trace(state, f"chunk_resume_node completed chunks={len(chunks)}"),
    }


def retrieve_evidence_node(state: ATSGraphState) -> ATSGraphState:
    analysis = state["analysis"]

    evidence = retrieve_evidence_chunks(
        chunks=state.get("chunks", []),
        jd_skills=analysis.get("jd_skills", []),
        matched_skills=analysis.get("matched_skills", []),
        missing_skills=analysis.get("missing_skills", []),
        top_k=5,
    )

    return {
        **state,
        "evidence_snippets": evidence,
        "workflow_trace": add_trace(state, f"retrieve_evidence_node completed evidence={len(evidence)}"),
    }


def llm_report_node(state: ATSGraphState) -> ATSGraphState:
    payload = state["payload"]

    llm_output = generate_nvidia_structured_report(
        analysis=state["analysis"],
        evidence_snippets=state.get("evidence_snippets", []),
        job_title=payload.job_title,
        company_name=payload.company_name,
        job_description=payload.job_description,
    )

    return {
        **state,
        "llm_output": llm_output,
        "workflow_trace": add_trace(
            state,
            f'llm_report_node completed llm_used={llm_output.get("llm_used")}',
        ),
    }


def validate_report_node(state: ATSGraphState) -> ATSGraphState:
    llm_output = state.get("llm_output", {})

    required_fields = [
        "report_summary",
        "role_readiness",
        "improvement_plan",
        "interview_focus",
    ]

    missing_fields = [
        field
        for field in required_fields
        if field not in llm_output or llm_output.get(field) in [None, ""]
    ]

    if missing_fields:
        analysis = state["analysis"]
        llm_output["report_summary"] = (
            f'The resume received an ATS score of {analysis["ats_score"]}. '
            f'Matched skills: {", ".join(analysis["matched_skills"][:5])}. '
            f'Missing skills: {", ".join(analysis["missing_skills"][:5])}.'
        )
        llm_output["role_readiness"] = (
            "Strong fit"
            if analysis["ats_score"] >= 80
            else "Moderate fit"
            if analysis["ats_score"] >= 65
            else "Needs improvement"
        )
        llm_output["improvement_plan"] = analysis.get("improvement_plan", [])
        llm_output["interview_focus"] = analysis.get("interview_focus", [])
        llm_output["llm_used"] = False

    return {
        **state,
        "llm_output": llm_output,
        "workflow_trace": add_trace(state, "validate_report_node completed"),
    }


def save_report_node(state: ATSGraphState) -> ATSGraphState:
    db = state["db"]
    user_id = state["user_id"]
    payload = state["payload"]
    resume = state["resume"]
    analysis = state["analysis"]
    llm_output = state["llm_output"]

    report = AnalysisReport(
        user_id=user_id,
        resume_id=resume.id,
        job_title=payload.job_title,
        company_name=payload.company_name,
        job_description=payload.job_description,
        resume_skills=analysis["resume_skills"],
        jd_skills=analysis["jd_skills"],
        matched_skills=analysis["matched_skills"],
        missing_skills=analysis["missing_skills"],
        extra_skills=analysis["extra_skills"],
        ats_score=analysis["ats_score"],
        skill_match_score=analysis["skill_match_score"],
        keyword_coverage_score=analysis["keyword_coverage_score"],
        resume_quality_score=analysis["resume_quality_score"],
        recommendations=analysis["recommendations"],
        evidence_snippets=state.get("evidence_snippets", []),
        report_summary=llm_output["report_summary"],
        role_readiness=llm_output["role_readiness"],
        improvement_plan=llm_output["improvement_plan"],
        interview_focus=llm_output["interview_focus"],
        llm_model=llm_output.get("llm_model"),
        llm_used=bool(llm_output.get("llm_used")),
        graph_version="day4_langgraph_v1",
        workflow_trace=add_trace(state, "save_report_node completed"),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return {
        **state,
        "report": report,
        "workflow_trace": report.workflow_trace,
    }


def build_ats_graph():
    from langgraph.graph import END, START, StateGraph

    graph = StateGraph(ATSGraphState)

    graph.add_node("load_resume", load_resume_node)
    graph.add_node("extract_jd_skills", extract_jd_skills_node)
    graph.add_node("ats_score", ats_score_node)
    graph.add_node("chunk_resume", chunk_resume_node)
    graph.add_node("retrieve_evidence", retrieve_evidence_node)
    graph.add_node("llm_report", llm_report_node)
    graph.add_node("validate_report", validate_report_node)
    graph.add_node("save_report", save_report_node)

    graph.add_edge(START, "load_resume")
    graph.add_edge("load_resume", "extract_jd_skills")
    graph.add_edge("extract_jd_skills", "ats_score")
    graph.add_edge("ats_score", "chunk_resume")
    graph.add_edge("chunk_resume", "retrieve_evidence")
    graph.add_edge("retrieve_evidence", "llm_report")
    graph.add_edge("llm_report", "validate_report")
    graph.add_edge("validate_report", "save_report")
    graph.add_edge("save_report", END)

    return graph.compile()


def run_ats_langgraph_workflow(
    db: Session,
    user_id: int,
    payload: AnalyzeResumeRequest,
) -> AnalysisReport:
    app = build_ats_graph()

    initial_state: ATSGraphState = {
        "db": db,
        "user_id": user_id,
        "payload": payload,
        "workflow_trace": ["START day4_langgraph_v1"],
        "errors": [],
    }

    final_state = app.invoke(initial_state)

    return final_state["report"]