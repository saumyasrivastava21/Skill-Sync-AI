from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user_model import User
from app.schemas.recruiter_schema import (
    CandidateDetail,
    CandidateListResponse,
    RecruiterAnalytics,
    SolrIndexResponse,
)
from app.services.recruiter_service import (
    get_candidate_detail,
    get_recruiter_analytics,
    index_candidates_to_solr,
    list_candidate_cards,
)

router = APIRouter(prefix="/recruiter", tags=["recruiter"])


def require_recruiter_user(current_user: User) -> None:
    role = getattr(current_user, "role", None)

    if role != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required",
        )


@router.get("/candidates", response_model=CandidateListResponse)
def get_candidates(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    query: str | None = Query(default=None),
    skill: str | None = Query(default=None),
    missing_skill: str | None = Query(default=None),
    job_title: str | None = Query(default=None),
    min_score: float | None = Query(default=None, ge=0, le=100),
    sort_by: str = Query(default="rank_score"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter_user(current_user)

    items, total, pages = list_candidate_cards(
        db=db,
        page=page,
        page_size=page_size,
        query=query,
        skill=skill,
        missing_skill=missing_skill,
        job_title=job_title,
        min_score=min_score,
        sort_by=sort_by,
    )

    return CandidateListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/search", response_model=CandidateListResponse)
def search_candidates(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    query: str | None = Query(default=None),
    skill: str | None = Query(default=None),
    missing_skill: str | None = Query(default=None),
    job_title: str | None = Query(default=None),
    min_score: float | None = Query(default=None, ge=0, le=100),
    sort_by: str = Query(default="rank_score"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter_user(current_user)

    items, total, pages = list_candidate_cards(
        db=db,
        page=page,
        page_size=page_size,
        query=query,
        skill=skill,
        missing_skill=missing_skill,
        job_title=job_title,
        min_score=min_score,
        sort_by=sort_by,
    )

    return CandidateListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
    )


@router.get("/candidates/{candidate_id}", response_model=CandidateDetail)
def get_candidate(
    candidate_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter_user(current_user)

    detail = get_candidate_detail(
        db=db,
        candidate_id=candidate_id,
    )

    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidate not found",
        )

    return detail


@router.get("/analytics", response_model=RecruiterAnalytics)
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter_user(current_user)

    return get_recruiter_analytics(db)


@router.post("/index-candidates", response_model=SolrIndexResponse)
def index_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_recruiter_user(current_user)

    result = index_candidates_to_solr(db)

    return SolrIndexResponse(**result)