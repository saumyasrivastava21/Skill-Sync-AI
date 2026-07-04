from app.services.ats_service import normalize_text


def score_chunk(chunk_text: str, query_terms: list[str]) -> int:
    normalized = normalize_text(chunk_text)
    score = 0

    for term in query_terms:
        term_norm = normalize_text(term)
        if term_norm and term_norm in normalized:
            score += 3

    return score


def retrieve_evidence_chunks(
    chunks: list[dict],
    jd_skills: list[str],
    matched_skills: list[str],
    missing_skills: list[str],
    top_k: int = 5,
) -> list[dict]:
    query_terms = list(dict.fromkeys(jd_skills + matched_skills + missing_skills))

    scored_chunks: list[dict] = []

    for chunk in chunks:
        score = score_chunk(chunk.get("text", ""), query_terms)

        if score > 0:
            scored_chunks.append(
                {
                    "chunk_id": chunk["chunk_id"],
                    "score": score,
                    "matched_terms": [
                        term
                        for term in query_terms
                        if normalize_text(term) in normalize_text(chunk.get("text", ""))
                    ],
                    "snippet": chunk.get("text", "")[:500],
                }
            )

    scored_chunks.sort(key=lambda item: item["score"], reverse=True)

    if scored_chunks:
        return scored_chunks[:top_k]

    return [
        {
            "chunk_id": chunk["chunk_id"],
            "score": 0,
            "matched_terms": [],
            "snippet": chunk.get("text", "")[:500],
        }
        for chunk in chunks[:top_k]
    ]