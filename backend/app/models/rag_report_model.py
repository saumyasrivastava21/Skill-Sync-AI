from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.sql import func

from app.db.base import Base


class RagReport(Base):
    __tablename__ = "rag_reports"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)

    question = Column(Text, nullable=False)

    answer = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)

    strengths = Column(JSON, nullable=False, default=list)
    weaknesses = Column(JSON, nullable=False, default=list)
    missing_skills = Column(JSON, nullable=False, default=list)
    recommendations = Column(JSON, nullable=False, default=list)
    evidence_chunks = Column(JSON, nullable=False, default=list)

    confidence_score = Column(Float, nullable=False, default=0.0)

    retrieval_strategy = Column(String(100), nullable=False, default="hybrid_pgvector_solr")
    llm_model = Column(String(150), nullable=True)
    llm_status = Column(String(50), nullable=False, default="success")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
