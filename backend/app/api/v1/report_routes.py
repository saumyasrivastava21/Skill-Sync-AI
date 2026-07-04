from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user_model import User
from app.schemas.report_schema import (
    AnalyzeResumeRequest,
    EvidenceResponse,
    MissingSkillsResponse,
    RecommendationsResponse,
    ReportDeleteResponse,
    ReportDetail,
    ReportListResponse,
    ReportPublic,
)
from app.services.report_service import (
    create_analysis_report,
    delete_report,
    get_report_for_user_or_404,
    list_reports,
)

router = APIRouter(prefix="/reports", tags=["reports"])


@router.post(
    "/analyze",
    response_model=ReportDetail,
    status_code=status.HTTP_201_CREATED,
)
def analyze_resume(
    payload: AnalyzeResumeRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return create_analysis_report(
        db=db,
        user_id=current_user.id,
        payload=payload,
    )


@router.get("", response_model=ReportListResponse)
def get_reports(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    reports, total, pages = list_reports(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        search=search,
    )

    return ReportListResponse(
        items=[ReportPublic.model_validate(report) for report in reports],
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/{report_id}", response_model=ReportDetail)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_report_for_user_or_404(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )


@router.get("/{report_id}/missing-skills", response_model=MissingSkillsResponse)
def get_report_missing_skills(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = get_report_for_user_or_404(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return MissingSkillsResponse(
        report_id=report.id,
        job_title=report.job_title,
        company_name=report.company_name,
        missing_skills=report.missing_skills,
        matched_skills=report.matched_skills,
        jd_skills=report.jd_skills,
    )


@router.get("/{report_id}/recommendations", response_model=RecommendationsResponse)
def get_report_recommendations(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = get_report_for_user_or_404(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return RecommendationsResponse(
        report_id=report.id,
        ats_score=report.ats_score,
        recommendations=report.recommendations,
        improvement_plan=report.improvement_plan,
        interview_focus=report.interview_focus,
        role_readiness=report.role_readiness,
        llm_used=report.llm_used,
        llm_model=report.llm_model,
    )


@router.get("/{report_id}/evidence", response_model=EvidenceResponse)
def get_report_evidence(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    report = get_report_for_user_or_404(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return EvidenceResponse(
        report_id=report.id,
        evidence_snippets=report.evidence_snippets,
    )


@router.delete("/{report_id}", response_model=ReportDeleteResponse)
def remove_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    delete_report(
        db=db,
        report_id=report_id,
        user_id=current_user.id,
    )

    return ReportDeleteResponse(message="Analysis report deleted successfully")