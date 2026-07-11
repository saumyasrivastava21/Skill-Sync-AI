import os
from typing import Any

import requests
from sqlalchemy.orm import Session

from app.models.rag_chunk_model import ResumeChunk
from app.services.embedding_service import generate_embeddings


SOLR_BASE_URL = os.getenv("SOLR_BASE_URL", "http://solr:8983/solr/skillsync_candidates")


def _solr_update_url() -> str:
    return f"{SOLR_BASE_URL}/update?commit=true"


def _solr_select_url() -> str:
    return f"{SOLR_BASE_URL}/select"


def delete_existing_chunks(db: Session, resume_id: int, user_id: int) -> None:
    db.query(ResumeChunk).filter(
        ResumeChunk.resume_id == resume_id,
        ResumeChunk.user_id == user_id,
    ).delete(synchronize_session=False)

    db.commit()

    try:
        payload = {
            "delete": {
                "query": f"doc_type_s:rag_chunk AND resume_id_i:{resume_id} AND user_id_i:{user_id}"
            }
        }
        requests.post(_solr_update_url(), json=payload, timeout=5)
    except Exception:
        pass


def save_resume_chunks(db: Session, resume_id: int, user_id: int, chunks: list[Any]) -> list[ResumeChunk]:
    texts = [item.chunk_text for item in chunks]
    embeddings = generate_embeddings(texts)

    saved_chunks: list[ResumeChunk] = []

    for item, embedding in zip(chunks, embeddings):
        chunk = ResumeChunk(
            user_id=user_id,
            resume_id=resume_id,
            chunk_index=item.chunk_index,
            chunk_text=item.chunk_text,
            section_name=item.section_name,
            token_count=item.token_count,
            embedding=embedding,
        )
        db.add(chunk)
        saved_chunks.append(chunk)

    db.commit()

    for chunk in saved_chunks:
        db.refresh(chunk)
        chunk.solr_id = f"rag_chunk_{chunk.id}"

    db.commit()

    for chunk in saved_chunks:
        db.refresh(chunk)

    return saved_chunks


def index_chunks_to_solr(chunks: list[ResumeChunk]) -> int:
    if not chunks:
        return 0

    docs = []

    for chunk in chunks:
        docs.append(
            {
                "id": chunk.solr_id or f"rag_chunk_{chunk.id}",
                "doc_type_s": "rag_chunk",
                "chunk_id_i": chunk.id,
                "resume_id_i": chunk.resume_id,
                "user_id_i": chunk.user_id,
                "chunk_index_i": chunk.chunk_index,
                "section_name_s": chunk.section_name or "general",
                "chunk_text_t": chunk.chunk_text,
                "content_txt": chunk.chunk_text,
                "token_count_i": chunk.token_count,
            }
        )

    try:
        response = requests.post(_solr_update_url(), json=docs, timeout=10)
        response.raise_for_status()
        return len(docs)
    except Exception:
        return 0


def search_chunks_solr(
    resume_id: int,
    user_id: int,
    query: str,
    top_k: int = 6,
) -> list[dict[str, Any]]:
    params = {
        "q": query,
        "defType": "edismax",
        "qf": "chunk_text_t content_txt section_name_s",
        "fq": [
            "doc_type_s:rag_chunk",
            f"resume_id_i:{resume_id}",
            f"user_id_i:{user_id}",
        ],
        "rows": top_k,
        "fl": "id,chunk_id_i,resume_id_i,user_id_i,section_name_s,chunk_text_t,content_txt,score",
        "wt": "json",
    }

    try:
        response = requests.get(_solr_select_url(), params=params, timeout=8)
        response.raise_for_status()

        docs = response.json().get("response", {}).get("docs", [])

        results = []

        for doc in docs:
            chunk_text = doc.get("chunk_text_t") or doc.get("content_txt") or ""
            if isinstance(chunk_text, list):
                chunk_text = " ".join(str(item) for item in chunk_text)

            results.append(
                {
                    "chunk_id": doc.get("chunk_id_i"),
                    "resume_id": doc.get("resume_id_i", resume_id),
                    "section_name": doc.get("section_name_s", "general"),
                    "chunk_text": chunk_text,
                    "keyword_score": float(doc.get("score", 0.0)),
                    "vector_score": 0.0,
                    "hybrid_score": float(doc.get("score", 0.0)),
                    "retrieval_source": "solr_keyword",
                }
            )

        return results

    except Exception:
        return []
