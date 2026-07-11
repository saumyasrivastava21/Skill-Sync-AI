"""add hybrid rag pgvector tables

Revision ID: 20260711_hybrid_rag_pgvector
Revises: af3efe0e8f8c
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from pgvector.sqlalchemy import Vector


revision = "20260711_hybrid_rag_pgvector"
down_revision = 'af3efe0e8f8c'
branch_labels = None
depends_on = None


def upgrade():
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "resume_chunks",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("chunk_index", sa.Integer(), nullable=False),
        sa.Column("chunk_text", sa.Text(), nullable=False),
        sa.Column("section_name", sa.String(length=100), nullable=True),
        sa.Column("token_count", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("embedding", Vector(384), nullable=True),
        sa.Column("solr_id", sa.String(length=150), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_resume_chunks_id"), "resume_chunks", ["id"], unique=False)
    op.create_index(op.f("ix_resume_chunks_user_id"), "resume_chunks", ["user_id"], unique=False)
    op.create_index(op.f("ix_resume_chunks_resume_id"), "resume_chunks", ["resume_id"], unique=False)
    op.create_index(op.f("ix_resume_chunks_solr_id"), "resume_chunks", ["solr_id"], unique=True)

    op.create_table(
        "rag_reports",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("resume_id", sa.Integer(), nullable=False),
        sa.Column("question", sa.Text(), nullable=False),
        sa.Column("answer", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("strengths", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("weaknesses", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("missing_skills", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("recommendations", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("evidence_chunks", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("confidence_score", sa.Float(), nullable=False, server_default="0"),
        sa.Column("retrieval_strategy", sa.String(length=100), nullable=False, server_default="hybrid_pgvector_solr"),
        sa.Column("llm_model", sa.String(length=150), nullable=True),
        sa.Column("llm_status", sa.String(length=50), nullable=False, server_default="success"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["resume_id"], ["resumes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_rag_reports_id"), "rag_reports", ["id"], unique=False)
    op.create_index(op.f("ix_rag_reports_user_id"), "rag_reports", ["user_id"], unique=False)
    op.create_index(op.f("ix_rag_reports_resume_id"), "rag_reports", ["resume_id"], unique=False)


def downgrade():
    op.drop_index(op.f("ix_rag_reports_resume_id"), table_name="rag_reports")
    op.drop_index(op.f("ix_rag_reports_user_id"), table_name="rag_reports")
    op.drop_index(op.f("ix_rag_reports_id"), table_name="rag_reports")
    op.drop_table("rag_reports")

    op.drop_index(op.f("ix_resume_chunks_solr_id"), table_name="resume_chunks")
    op.drop_index(op.f("ix_resume_chunks_resume_id"), table_name="resume_chunks")
    op.drop_index(op.f("ix_resume_chunks_user_id"), table_name="resume_chunks")
    op.drop_index(op.f("ix_resume_chunks_id"), table_name="resume_chunks")
    op.drop_table("resume_chunks")



