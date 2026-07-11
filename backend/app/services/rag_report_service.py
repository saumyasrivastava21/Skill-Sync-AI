import os
from typing import Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.resume_model import Resume
from app.models.rag_report_model import RagReport
from app.services.rag_answer_service import generate_rag_answer
from app.services.rag_chunking_service import chunk_resume_text
from app.services.rag_retrieval_service import (
    delete_existing_chunks,
    index_chunks_to_solr,
    save_resume_chunks,
    search_chunks_solr,
)
from app.services.vector_retrieval_service import hybrid_search_chunks


def _try_read_pdf(path: str) -> str:
    if not path or not os.path.exists(path):
        return ""

    try:
        from PyPDF2 import PdfReader

        reader = PdfReader(path)
        pages = []

        for page in reader.pages:
            pages.append(page.extract_text() or "")

        return "\n".join(pages).strip()

    except Exception:
        return ""


def _get_resume_text(resume: Resume) -> str:
    possible_text_fields = [
        "extracted_text",
        "parsed_text",
        "text_content",
        "content",
        "raw_text",
        "resume_text",
    ]

    for field in possible_text_fields:
        value = getattr(resume, field, None)
        if isinstance(value, str) and value.strip():
            return value.strip()

    possible_path_fields = [
        "file_path",
        "stored_path",
        "stored_file_path",
        "local_path",
        "path",
    ]

    for field in possible_path_fields:
        value = getattr(resume, field, None)
        if isinstance(value, str) and value.strip():
            text = _try_read_pdf(value)
            if text:
                return text

    return ""


def _validate_resume_owner(resume: Resume | None, user_id: int) -> Resume:
    if not resume:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume not found.",
        )

    resume_user_id = getattr(resume, "user_id", None)

    if resume_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this resume.",
        )

    return resume


def index_resume_for_rag(db: Session, resume_id: int, user_id: int) -> dict[str, Any]:
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    resume = _validate_resume_owner(resume, user_id)

    resume_text = _get_resume_text(resume)

    if not resume_text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text is empty. Please upload/parse resume again before RAG indexing.",
        )

    chunks_data = chunk_resume_text(resume_text)

    if not chunks_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not create chunks from resume text.",
        )

    delete_existing_chunks(db, resume_id=resume_id, user_id=user_id)

    saved_chunks = save_resume_chunks(
        db=db,
        resume_id=resume_id,
        user_id=user_id,
        chunks=chunks_data,
    )

    indexed_count = index_chunks_to_solr(saved_chunks)

    embeddings_created = len([chunk for chunk in saved_chunks if chunk.embedding is not None])

    return {
        "resume_id": resume_id,
        "chunks_created": len(saved_chunks),
        "embeddings_created": embeddings_created,
        "chunks_indexed_in_solr": indexed_count,
        "message": "Resume indexed for Hybrid RAG successfully.",
    }


def ask_resume_question(
    db: Session,
    resume_id: int,
    user_id: int,
    question: str,
    top_k: int = 6,
) -> RagReport:
    resume = db.query(Resume).filter(Resume.id == resume_id).first()
    _validate_resume_owner(resume, user_id)

    evidence_chunks = hybrid_search_chunks(
        db=db,
        resume_id=resume_id,
        user_id=user_id,
        query=question,
        top_k=top_k,
        keyword_search_fn=search_chunks_solr,
    )

    if not evidence_chunks:
        index_resume_for_rag(db, resume_id=resume_id, user_id=user_id)

        evidence_chunks = hybrid_search_chunks(
            db=db,
            resume_id=resume_id,
            user_id=user_id,
            query=question,
            top_k=top_k,
            keyword_search_fn=search_chunks_solr,
        )

    answer_payload = generate_rag_answer(question, evidence_chunks)

    report = RagReport(
        user_id=user_id,
        resume_id=resume_id,
        question=question,
        answer=answer_payload.get("answer", ""),
        summary=answer_payload.get("summary", ""),
        strengths=answer_payload.get("strengths", []),
        weaknesses=answer_payload.get("weaknesses", []),
        missing_skills=answer_payload.get("missing_skills", []),
        recommendations=answer_payload.get("recommendations", []),
        evidence_chunks=evidence_chunks,
        confidence_score=float(answer_payload.get("confidence_score", 0.0)),
        retrieval_strategy="hybrid_pgvector_solr",
        llm_model=answer_payload.get("llm_model"),
        llm_status=answer_payload.get("llm_status", "success"),
    )

    db.add(report)
    db.commit()
    db.refresh(report)

    return report


def serialize_rag_report(report: RagReport) -> dict[str, Any]:
    return {
        "id": report.id,
        "user_id": report.user_id,
        "resume_id": report.resume_id,
        "question": report.question,
        "answer": report.answer,
        "summary": report.summary,
        "strengths": report.strengths or [],
        "weaknesses": report.weaknesses or [],
        "missing_skills": report.missing_skills or [],
        "recommendations": report.recommendations or [],
        "evidence_chunks": report.evidence_chunks or [],
        "confidence_score": report.confidence_score or 0.0,
        "retrieval_strategy": report.retrieval_strategy or "hybrid_pgvector_solr",
        "llm_model": report.llm_model,
        "llm_status": report.llm_status,
        "created_at": report.created_at,
    }


def get_rag_reports(db: Session, user_id: int) -> list[RagReport]:
    return (
        db.query(RagReport)
        .filter(RagReport.user_id == user_id)
        .order_by(RagReport.created_at.desc())
        .all()
    )


def get_rag_report_by_id(db: Session, report_id: int, user_id: int) -> RagReport:
    report = (
        db.query(RagReport)
        .filter(RagReport.id == report_id, RagReport.user_id == user_id)
        .first()
    )

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="RAG report not found.",
        )

    return report


def delete_rag_report(db: Session, report_id: int, user_id: int) -> None:
    report = get_rag_report_by_id(db, report_id, user_id)
    db.delete(report)
    db.commit()
