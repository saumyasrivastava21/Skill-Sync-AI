import math
from collections import Counter
from typing import Any

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.report_model import AnalysisReport
from app.models.resume_model import Resume
from app.models.user_model import User
from app.schemas.recruiter_schema import CandidateCard
from app.services.candidate_ranking_service import (
    calculate_candidate_rank_score,
    calculate_recent_activity_score,
    calculate_resume_completeness_score,
)
from app.services.solr_service import index_candidate_documents


def _safe_list(value: Any) -> list:
    if not value:
        return []

    if isinstance(value, list):
        return value

    return []


def _user_name(user: User) -> str:
    name = getattr(user, "name", None) or getattr(user, "full_name", None)

    if name:
        return str(name)

    return str(getattr(user, "email", "Unknown Candidate"))


def _resume_text(resume: Resume | None) -> str:
    if not resume:
        return ""

    for field in ["parsed_text", "extracted_text", "text", "raw_text"]:
        value = getattr(resume, field, None)

        if value:
            return str(value)

    return ""


def _is_candidate_user(user: User) -> bool:
    role = getattr(user, "role", "candidate")
    return role == "candidate"


def build_candidate_card(
    user: User,
    latest_resume: Resume | None,
    latest_report: AnalysisReport | None,
) -> CandidateCard:
    resume_skills = _safe_list(getattr(latest_resume, "extracted_skills", []))
    report_skills = _safe_list(getattr(latest_report, "resume_skills", []))

    top_skills = list(dict.fromkeys(report_skills + resume_skills))[:8]

    ats_score = float(getattr(latest_report, "ats_score", 0) or 0)
    skill_match_score = float(getattr(latest_report, "skill_match_score", 0) or 0)

    resume_completeness_score = calculate_resume_completeness_score(
        word_count=getattr(latest_resume, "word_count", 0),
        skills_count=len(top_skills),
        status=getattr(latest_resume, "status", None),
    )

    recent_activity_score = calculate_recent_activity_score(
        getattr(latest_report, "created_at", None)
        or getattr(latest_resume, "created_at", None)
    )

    rank_score = calculate_candidate_rank_score(
        ats_score=ats_score,
        skill_match_score=skill_match_score,
        resume_completeness_score=resume_completeness_score,
        recent_activity_score=recent_activity_score,
    )

    return CandidateCard(
        candidate_id=user.id,
        candidate_name=_user_name(user),
        email=user.email,
        top_skills=top_skills,
        latest_resume_id=getattr(latest_resume, "id", None),
        latest_resume_file=getattr(latest_resume, "original_file_name", None),
        latest_report_id=getattr(latest_report, "id", None),
        latest_ats_score=ats_score,
        skill_match_score=skill_match_score,
        resume_completeness_score=resume_completeness_score,
        recent_activity_score=recent_activity_score,
        rank_score=rank_score,
        matched_role=getattr(latest_report, "job_title", None),
        company_name=getattr(latest_report, "company_name", None),
        missing_skills=_safe_list(getattr(latest_report, "missing_skills", []))[:8],
        created_at=getattr(latest_report, "created_at", None)
        or getattr(latest_resume, "created_at", None),
    )


def get_latest_resume_for_user(db: Session, user_id: int) -> Resume | None:
    return db.scalar(
        select(Resume)
        .where(Resume.user_id == user_id)
        .order_by(Resume.created_at.desc())
        .limit(1)
    )


def get_latest_report_for_user(db: Session, user_id: int) -> AnalysisReport | None:
    return db.scalar(
        select(AnalysisReport)
        .where(AnalysisReport.user_id == user_id)
        .order_by(AnalysisReport.created_at.desc())
        .limit(1)
    )


def list_candidate_cards(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    query: str | None = None,
    skill: str | None = None,
    missing_skill: str | None = None,
    job_title: str | None = None,
    min_score: float | None = None,
    sort_by: str = "rank_score",
) -> tuple[list[CandidateCard], int, int]:
    page = max(page, 1)
    page_size = min(max(page_size, 1), 50)

    users_query = select(User)

    if hasattr(User, "role"):
        users_query = users_query.where(User.role == "candidate")

    if query:
        like = f"%{query}%"
        conditions = [User.email.ilike(like)]

        if hasattr(User, "name"):
            conditions.append(User.name.ilike(like))

        if hasattr(User, "full_name"):
            conditions.append(User.full_name.ilike(like))

        users_query = users_query.where(or_(*conditions))

    users = list(db.scalars(users_query).all())

    cards: list[CandidateCard] = []

    for user in users:
        if not _is_candidate_user(user):
            continue

        latest_resume = get_latest_resume_for_user(db, user.id)
        latest_report = get_latest_report_for_user(db, user.id)

        if not latest_resume and not latest_report:
            continue

        card = build_candidate_card(user, latest_resume, latest_report)

        if skill:
            skill_lower = skill.lower()

            if not any(skill_lower in item.lower() for item in card.top_skills):
                continue

        if missing_skill:
            missing_lower = missing_skill.lower()

            if not any(missing_lower in item.lower() for item in card.missing_skills):
                continue

        if job_title:
            title_lower = job_title.lower()

            if not card.matched_role or title_lower not in card.matched_role.lower():
                continue

        if min_score is not None and card.latest_ats_score < min_score:
            continue

        cards.append(card)

    if sort_by == "ats_score":
        cards.sort(key=lambda item: item.latest_ats_score, reverse=True)
    elif sort_by == "skill_match_score":
        cards.sort(key=lambda item: item.skill_match_score, reverse=True)
    elif sort_by == "latest_report":
        cards.sort(key=lambda item: item.created_at or "", reverse=True)
    elif sort_by == "name":
        cards.sort(key=lambda item: item.candidate_name.lower())
    else:
        cards.sort(key=lambda item: item.rank_score, reverse=True)

    total = len(cards)
    pages = math.ceil(total / page_size) if total else 0

    start = (page - 1) * page_size
    end = start + page_size

    return cards[start:end], total, pages


def get_candidate_detail(db: Session, candidate_id: int) -> dict[str, Any] | None:
    user = db.get(User, candidate_id)

    if not user:
        return None

    resumes = list(
        db.scalars(
            select(Resume)
            .where(Resume.user_id == candidate_id)
            .order_by(Resume.created_at.desc())
        ).all()
    )

    reports = list(
        db.scalars(
            select(AnalysisReport)
            .where(AnalysisReport.user_id == candidate_id)
            .order_by(AnalysisReport.created_at.desc())
        ).all()
    )

    latest_resume = resumes[0] if resumes else None
    latest_report = reports[0] if reports else None

    candidate = build_candidate_card(
        user=user,
        latest_resume=latest_resume,
        latest_report=latest_report,
    )

    return {
        "candidate": candidate,
        "resumes": [
            {
                "id": resume.id,
                "file_name": resume.original_file_name,
                "status": resume.status,
                "word_count": resume.word_count,
                "extracted_skills": resume.extracted_skills or [],
                "created_at": resume.created_at,
            }
            for resume in resumes
        ],
        "reports": [
            {
                "id": report.id,
                "job_title": report.job_title,
                "company_name": report.company_name,
                "ats_score": report.ats_score,
                "skill_match_score": report.skill_match_score,
                "matched_skills": report.matched_skills or [],
                "missing_skills": report.missing_skills or [],
                "recommendations": report.recommendations or [],
                "created_at": report.created_at,
            }
            for report in reports
        ],
    }


def get_recruiter_analytics(db: Session) -> dict[str, Any]:
    users_query = select(User)

    if hasattr(User, "role"):
        users_query = users_query.where(User.role == "candidate")

    candidate_users = list(db.scalars(users_query).all())

    total_candidates = len(candidate_users)
    total_resumes = db.scalar(select(func.count(Resume.id))) or 0
    total_reports = db.scalar(select(func.count(AnalysisReport.id))) or 0

    reports = list(db.scalars(select(AnalysisReport)).all())

    if reports:
        average_ats_score = round(
            sum(float(report.ats_score or 0) for report in reports) / len(reports),
            2,
        )
    else:
        average_ats_score = 0.0

    skill_counter: Counter[str] = Counter()
    missing_counter: Counter[str] = Counter()

    for report in reports:
        skill_counter.update(_safe_list(report.matched_skills))
        missing_counter.update(_safe_list(report.missing_skills))

    ats_distribution = {
        "0-40": 0,
        "41-60": 0,
        "61-75": 0,
        "76-90": 0,
        "91-100": 0,
    }

    readiness_distribution = {
        "Low": 0,
        "Medium": 0,
        "High": 0,
        "Excellent": 0,
    }

    for report in reports:
        score = float(report.ats_score or 0)

        if score <= 40:
            ats_distribution["0-40"] += 1
            readiness_distribution["Low"] += 1
        elif score <= 60:
            ats_distribution["41-60"] += 1
            readiness_distribution["Medium"] += 1
        elif score <= 75:
            ats_distribution["61-75"] += 1
            readiness_distribution["High"] += 1
        elif score <= 90:
            ats_distribution["76-90"] += 1
            readiness_distribution["High"] += 1
        else:
            ats_distribution["91-100"] += 1
            readiness_distribution["Excellent"] += 1

    return {
        "total_candidates": total_candidates,
        "total_resumes": total_resumes,
        "total_reports": total_reports,
        "average_ats_score": average_ats_score,
        "top_skills": [
            {"skill": skill, "count": count}
            for skill, count in skill_counter.most_common(10)
        ],
        "missing_skills_frequency": [
            {"skill": skill, "count": count}
            for skill, count in missing_counter.most_common(10)
        ],
        "ats_score_distribution": [
            {"range": label, "count": count}
            for label, count in ats_distribution.items()
        ],
        "readiness_distribution": [
            {"label": label, "count": count}
            for label, count in readiness_distribution.items()
        ],
    }


def build_solr_documents(db: Session) -> list[dict[str, Any]]:
    cards, _, _ = list_candidate_cards(
        db=db,
        page=1,
        page_size=1000,
        sort_by="rank_score",
    )

    documents = []

    for card in cards:
        latest_resume = db.get(Resume, card.latest_resume_id) if card.latest_resume_id else None

        documents.append(
            {
                "id": f"candidate_{card.candidate_id}",
                "user_id": card.candidate_id,
                "name": card.candidate_name,
                "email": card.email,
                "skills": card.top_skills,
                "resume_text": _resume_text(latest_resume)[:5000],
                "ats_score": card.latest_ats_score,
                "rank_score": card.rank_score,
                "job_title": card.matched_role or "",
                "created_at": str(card.created_at) if card.created_at else "",
            }
        )

    return documents


def index_candidates_to_solr(db: Session) -> dict[str, Any]:
    documents = build_solr_documents(db)
    success, indexed = index_candidate_documents(documents)

    return {
        "indexed": indexed if success else 0,
        "solr_enabled": success,
        "message": "Candidates indexed into Solr"
        if success
        else "Solr unavailable. PostgreSQL search fallback is active.",
    }