from datetime import datetime
from typing import Any

from pydantic import BaseModel


class CandidateCard(BaseModel):
    candidate_id: int
    candidate_name: str
    email: str
    top_skills: list[str]

    latest_resume_id: int | None = None
    latest_resume_file: str | None = None
    latest_report_id: int | None = None

    latest_ats_score: float
    skill_match_score: float
    resume_completeness_score: float
    recent_activity_score: float
    rank_score: float

    matched_role: str | None = None
    company_name: str | None = None
    missing_skills: list[str]

    created_at: datetime | None = None


class CandidateListResponse(BaseModel):
    items: list[CandidateCard]
    total: int
    page: int
    page_size: int
    pages: int


class CandidateDetail(BaseModel):
    candidate: CandidateCard
    resumes: list[dict[str, Any]]
    reports: list[dict[str, Any]]


class RecruiterAnalytics(BaseModel):
    total_candidates: int
    total_resumes: int
    total_reports: int
    average_ats_score: float
    top_skills: list[dict[str, Any]]
    missing_skills_frequency: list[dict[str, Any]]
    ats_score_distribution: list[dict[str, Any]]
    readiness_distribution: list[dict[str, Any]]


class SolrIndexResponse(BaseModel):
    indexed: int
    solr_enabled: bool
    message: str