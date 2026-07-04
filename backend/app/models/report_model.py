from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class AnalysisReport(Base):
    __tablename__ = "analysis_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    resume_id: Mapped[int] = mapped_column(
        ForeignKey("resumes.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    job_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)

    resume_skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    jd_skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    matched_skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    missing_skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    extra_skills: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    ats_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    skill_match_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    keyword_coverage_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    resume_quality_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)

    report_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    role_readiness: Mapped[str | None] = mapped_column(String(100), nullable=True)
    improvement_plan: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    interview_focus: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    recommendations: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    evidence_snippets: Mapped[list[dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    llm_model: Mapped[str | None] = mapped_column(String(255), nullable=True)
    llm_used: Mapped[bool] = mapped_column(default=False, nullable=False)
    graph_version: Mapped[str] = mapped_column(String(50), default="day4_langgraph_v1", nullable=False)
    workflow_trace: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user = relationship("User")
    resume = relationship("Resume")

    @property
    def resume_file_name(self) -> str | None:
        if self.resume:
            return self.resume.original_file_name
        return None