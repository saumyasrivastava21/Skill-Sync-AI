from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class RagAskRequest(BaseModel):
    question: str = Field(min_length=5, max_length=3000)
    top_k: int = Field(default=6, ge=1, le=12)


class RagIndexResponse(BaseModel):
    resume_id: int
    chunks_created: int
    embeddings_created: int
    chunks_indexed_in_solr: int
    message: str


class RagAskResponse(BaseModel):
    report_id: int
    resume_id: int
    question: str

    answer: str
    summary: str | None = None

    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    evidence_chunks: list[dict[str, Any]]

    confidence_score: float
    retrieval_strategy: str
    llm_model: str | None = None
    llm_status: str


class RagReportResponse(BaseModel):
    id: int
    user_id: int
    resume_id: int
    question: str

    answer: str
    summary: str | None = None

    strengths: list[str]
    weaknesses: list[str]
    missing_skills: list[str]
    recommendations: list[str]
    evidence_chunks: list[dict[str, Any]]

    confidence_score: float
    retrieval_strategy: str
    llm_model: str | None = None
    llm_status: str

    created_at: datetime


class RagReportListResponse(BaseModel):
    items: list[RagReportResponse]
    total: int
