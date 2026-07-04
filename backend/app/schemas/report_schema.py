from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AnalyzeResumeRequest(BaseModel):
    resume_id: int = Field(..., gt=0)
    job_title: str | None = Field(default=None, max_length=255)
    company_name: str | None = Field(default=None, max_length=255)
    job_description: str = Field(..., min_length=30)


class LLMReportOutput(BaseModel):
    report_summary: str
    role_readiness: str
    improvement_plan: list[str]
    interview_focus: list[str]


class ReportPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    resume_id: int
    resume_file_name: str | None = None
    job_title: str | None = None
    company_name: str | None = None

    ats_score: float
    skill_match_score: float
    keyword_coverage_score: float
    resume_quality_score: float

    matched_skills: list[str]
    missing_skills: list[str]
    recommendations: list[str]

    llm_model: str | None = None
    llm_used: bool
    graph_version: str

    created_at: datetime
    updated_at: datetime


class ReportDetail(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    resume_id: int
    resume_file_name: str | None = None

    job_title: str | None = None
    company_name: str | None = None
    job_description: str

    resume_skills: list[str]
    jd_skills: list[str]
    matched_skills: list[str]
    missing_skills: list[str]
    extra_skills: list[str]

    ats_score: float
    skill_match_score: float
    keyword_coverage_score: float
    resume_quality_score: float

    report_summary: str | None = None
    role_readiness: str | None = None
    improvement_plan: list[str]
    interview_focus: list[str]
    recommendations: list[str]
    evidence_snippets: list[dict[str, Any]]

    llm_model: str | None = None
    llm_used: bool
    graph_version: str
    workflow_trace: list[str]

    created_at: datetime
    updated_at: datetime


class ReportListResponse(BaseModel):
    items: list[ReportPublic]
    total: int
    page: int
    page_size: int
    pages: int


class MissingSkillsResponse(BaseModel):
    report_id: int
    job_title: str | None = None
    company_name: str | None = None
    missing_skills: list[str]
    matched_skills: list[str]
    jd_skills: list[str]


class RecommendationsResponse(BaseModel):
    report_id: int
    ats_score: float
    recommendations: list[str]
    improvement_plan: list[str]
    interview_focus: list[str]
    role_readiness: str | None = None
    llm_used: bool
    llm_model: str | None = None


class EvidenceResponse(BaseModel):
    report_id: int
    evidence_snippets: list[dict[str, Any]]


class ReportDeleteResponse(BaseModel):
    message: str