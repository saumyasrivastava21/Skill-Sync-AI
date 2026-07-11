from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector

from app.db.base import Base


class ResumeChunk(Base):
    __tablename__ = "resume_chunks"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id", ondelete="CASCADE"), nullable=False, index=True)

    chunk_index = Column(Integer, nullable=False)
    chunk_text = Column(Text, nullable=False)
    section_name = Column(String(100), nullable=True)
    token_count = Column(Integer, nullable=False, default=0)

    embedding = Column(Vector(384), nullable=True)

    solr_id = Column(String(150), nullable=True, unique=True, index=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
