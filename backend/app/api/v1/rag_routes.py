from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import SessionLocal
from app.models.user_model import User
from app.schemas.rag_schema import (
    RagAskRequest,
    RagAskResponse,
    RagIndexResponse,
    RagReportListResponse,
    RagReportResponse,
)
from app.services.rag_report_service import (
    ask_resume_question,
    delete_rag_report,
    get_rag_report_by_id,
    get_rag_reports,
    index_resume_for_rag,
    serialize_rag_report,
)


router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post(
    "/index-resume/{resume_id}",
    response_model=RagIndexResponse,
    status_code=status.HTTP_200_OK,
)
def index_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return index_resume_for_rag(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )


@router.post(
    "/ask-resume/{resume_id}",
    response_model=RagAskResponse,
    status_code=status.HTTP_201_CREATED,
)
def ask_resume(
    resume_id: int,
    payload: RagAskRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = ask_resume_question(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
        question=payload.question,
        top_k=payload.top_k,
    )

    serialized = serialize_rag_report(report)

    return {
        "report_id": serialized["id"],
        "resume_id": serialized["resume_id"],
        "question": serialized["question"],
        "answer": serialized["answer"],
        "summary": serialized["summary"],
        "strengths": serialized["strengths"],
        "weaknesses": serialized["weaknesses"],
        "missing_skills": serialized["missing_skills"],
        "recommendations": serialized["recommendations"],
        "evidence_chunks": serialized["evidence_chunks"],
        "confidence_score": serialized["confidence_score"],
        "retrieval_strategy": serialized["retrieval_strategy"],
        "llm_model": serialized["llm_model"],
        "llm_status": serialized["llm_status"],
    }


@router.get("/reports", response_model=RagReportListResponse)
def list_rag_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports = get_rag_reports(db=db, user_id=current_user.id)
    items = [serialize_rag_report(report) for report in reports]

    return {
        "items": items,
        "total": len(items),
    }


@router.get("/reports/{report_id}", response_model=RagReportResponse)
def get_rag_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = get_rag_report_by_id(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return serialize_rag_report(report)


@router.delete("/reports/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_rag_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_rag_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return None
