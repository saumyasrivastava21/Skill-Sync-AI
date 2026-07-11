from typing import Any

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.services.embedding_service import generate_query_embedding


def _vector_to_pgvector(values: list[float]) -> str:
    return "[" + ",".join(str(float(value)) for value in values) + "]"


def search_chunks_pgvector(
    db: Session,
    resume_id: int,
    user_id: int,
    query: str,
    top_k: int = 6,
) -> list[dict[str, Any]]:
    query_embedding = generate_query_embedding(query)
    query_vector = _vector_to_pgvector(query_embedding)

    sql = text(
        """
        SELECT
            id AS chunk_id,
            resume_id,
            section_name,
            chunk_text,
            GREATEST(0, 1 - (embedding <=> CAST(:query_vector AS vector))) AS vector_score
        FROM resume_chunks
        WHERE resume_id = :resume_id
          AND user_id = :user_id
          AND embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:query_vector AS vector)
        LIMIT :top_k
        """
    )

    try:
        rows = db.execute(
            sql,
            {
                "query_vector": query_vector,
                "resume_id": resume_id,
                "user_id": user_id,
                "top_k": top_k,
            },
        ).mappings().all()

        results = []

        for row in rows:
            results.append(
                {
                    "chunk_id": row["chunk_id"],
                    "resume_id": row["resume_id"],
                    "section_name": row["section_name"] or "general",
                    "chunk_text": row["chunk_text"],
                    "keyword_score": 0.0,
                    "vector_score": float(row["vector_score"] or 0.0),
                    "hybrid_score": float(row["vector_score"] or 0.0),
                    "retrieval_source": "pgvector_semantic",
                }
            )

        return results

    except Exception:
        return []


def search_chunks_db_fallback(
    db: Session,
    resume_id: int,
    user_id: int,
    query: str,
    top_k: int = 6,
) -> list[dict[str, Any]]:
    from app.models.rag_chunk_model import ResumeChunk

    terms = set(query.lower().split())

    chunks = (
        db.query(ResumeChunk)
        .filter(
            ResumeChunk.resume_id == resume_id,
            ResumeChunk.user_id == user_id,
        )
        .all()
    )

    scored = []

    for chunk in chunks:
        text = chunk.chunk_text or ""
        text_terms = set(text.lower().split())
        overlap = terms.intersection(text_terms)
        score = len(overlap) / max(len(terms), 1)

        scored.append(
            {
                "chunk_id": chunk.id,
                "resume_id": chunk.resume_id,
                "section_name": chunk.section_name or "general",
                "chunk_text": chunk.chunk_text,
                "keyword_score": score,
                "vector_score": 0.0,
                "hybrid_score": score,
                "retrieval_source": "db_fallback",
            }
        )

    scored.sort(key=lambda item: item["hybrid_score"], reverse=True)
    return scored[:top_k]


def merge_hybrid_results(
    vector_results: list[dict[str, Any]],
    keyword_results: list[dict[str, Any]],
    top_k: int = 6,
) -> list[dict[str, Any]]:
    merged: dict[int, dict[str, Any]] = {}

    for item in vector_results:
        chunk_id = item.get("chunk_id")
        if chunk_id is None:
            continue

        merged[chunk_id] = {
            **item,
            "vector_score": float(item.get("vector_score") or 0.0),
            "keyword_score": 0.0,
            "retrieval_source": "pgvector_semantic",
        }

    for item in keyword_results:
        chunk_id = item.get("chunk_id")
        if chunk_id is None:
            continue

        keyword_score = float(item.get("keyword_score") or 0.0)

        if chunk_id in merged:
            merged[chunk_id]["keyword_score"] = max(
                float(merged[chunk_id].get("keyword_score") or 0.0),
                keyword_score,
            )
            merged[chunk_id]["retrieval_source"] = "hybrid_pgvector_solr"
        else:
            merged[chunk_id] = {
                **item,
                "vector_score": 0.0,
                "keyword_score": keyword_score,
                "retrieval_source": "solr_keyword",
            }

    for chunk_id, item in merged.items():
        vector_score = float(item.get("vector_score") or 0.0)
        keyword_score = float(item.get("keyword_score") or 0.0)

        normalized_keyword = min(keyword_score / 10.0, 1.0)

        item["hybrid_score"] = round(
            0.65 * vector_score + 0.35 * normalized_keyword,
            4,
        )

    final_results = list(merged.values())
    final_results.sort(key=lambda item: item["hybrid_score"], reverse=True)

    return final_results[:top_k]


def hybrid_search_chunks(
    db: Session,
    resume_id: int,
    user_id: int,
    query: str,
    top_k: int = 6,
    keyword_search_fn=None,
) -> list[dict[str, Any]]:
    vector_results = search_chunks_pgvector(
        db=db,
        resume_id=resume_id,
        user_id=user_id,
        query=query,
        top_k=top_k,
    )

    keyword_results = []

    if keyword_search_fn:
        keyword_results = keyword_search_fn(
            resume_id=resume_id,
            user_id=user_id,
            query=query,
            top_k=top_k,
        )

    hybrid_results = merge_hybrid_results(
        vector_results=vector_results,
        keyword_results=keyword_results,
        top_k=top_k,
    )

    if hybrid_results:
        return hybrid_results

    return search_chunks_db_fallback(
        db=db,
        resume_id=resume_id,
        user_id=user_id,
        query=query,
        top_k=top_k,
    )
