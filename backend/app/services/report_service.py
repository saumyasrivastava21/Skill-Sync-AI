import math

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.report_model import AnalysisReport
from app.schemas.report_schema import AnalyzeResumeRequest
from app.services.langgraph_ats_workflow import run_ats_langgraph_workflow


def create_analysis_report(
    db: Session,
    user_id: int,
    payload: AnalyzeResumeRequest,
) -> AnalysisReport:
    return run_ats_langgraph_workflow(
        db=db,
        user_id=user_id,
        payload=payload,
    )


def get_report_for_user_or_404(
    db: Session,
    report_id: int,
    user_id: int,
) -> AnalysisReport:
    report = db.scalar(
        select(AnalysisReport).where(
            AnalysisReport.id == report_id,
            AnalysisReport.user_id == user_id,
        )
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis report not found",
        )

    return report


def list_reports(
    db: Session,
    user_id: int,
    page: int = 1,
    page_size: int = 10,
    search: str | None = None,
) -> tuple[list[AnalysisReport], int, int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)

    conditions = [AnalysisReport.user_id == user_id]

    if search:
        search_like = f"%{search}%"
        conditions.append(
            or_(
                AnalysisReport.job_title.ilike(search_like),
                AnalysisReport.company_name.ilike(search_like),
            )
        )

    total = db.scalar(select(func.count(AnalysisReport.id)).where(*conditions)) or 0

    reports = db.scalars(
        select(AnalysisReport)
        .where(*conditions)
        .order_by(AnalysisReport.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).all()

    pages = math.ceil(total / page_size) if total else 0

    return list(reports), total, pages


def delete_report(db: Session, report_id: int, user_id: int) -> None:
    report = get_report_for_user_or_404(
        db=db,
        report_id=report_id,
        user_id=user_id,
    )

    db.delete(report)
    db.commit()