import json
import os
import re
from typing import Any


def _safe_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(item) for item in value]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def build_rag_prompt(question: str, evidence_chunks: list[dict[str, Any]]) -> str:
    context_blocks = []

    for index, chunk in enumerate(evidence_chunks, start=1):
        section = chunk.get("section_name") or "general"
        source = chunk.get("retrieval_source") or "hybrid"
        score = chunk.get("hybrid_score") or chunk.get("vector_score") or chunk.get("keyword_score") or 0
        text = chunk.get("chunk_text") or ""

        context_blocks.append(
            f"Evidence {index} | Section: {section} | Source: {source} | Score: {score}\n{text}"
        )

    context = "\n\n---\n\n".join(context_blocks)

    return f"""
You are an AI resume analyst for SkillSync AI.

You must answer using ONLY the resume evidence provided below.
If evidence is insufficient, clearly say what is missing.
Do not invent fake skills, fake experience, fake companies, fake scores, or fake achievements.

User Question:
{question}

Resume Evidence:
{context}

Return strictly valid JSON with this structure:
{{
  "answer": "direct detailed answer",
  "summary": "short summary",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "missing_skills": ["skill 1", "skill 2"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "confidence_score": 0.0
}}
""".strip()


def _extract_json(text: str) -> dict[str, Any]:
    if not text:
        return {}

    cleaned = text.strip()
    cleaned = re.sub(r"^```json", "", cleaned)
    cleaned = re.sub(r"^```", "", cleaned)
    cleaned = re.sub(r"```$", "", cleaned)
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except Exception:
        pass

    match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            return {}

    return {}


def generate_fallback_answer(question: str, evidence_chunks: list[dict[str, Any]]) -> dict[str, Any]:
    preview = " ".join(
        (chunk.get("chunk_text") or "")[:300] for chunk in evidence_chunks[:3]
    )

    return {
        "answer": (
            "LLM response was unavailable, so this fallback answer is generated from retrieved evidence. "
            f"For the question '{question}', the most relevant resume evidence indicates: {preview}"
        ),
        "summary": "Fallback answer generated from hybrid RAG evidence.",
        "strengths": ["Relevant resume evidence was retrieved using hybrid search."] if evidence_chunks else [],
        "weaknesses": ["LLM generation was unavailable."],
        "missing_skills": [],
        "recommendations": [
            "Improve resume bullets by adding stronger metrics, tools, project outcomes, and role-specific keywords."
        ],
        "confidence_score": 0.45 if evidence_chunks else 0.15,
        "llm_status": "fallback",
    }


def generate_rag_answer(question: str, evidence_chunks: list[dict[str, Any]]) -> dict[str, Any]:
    api_key = os.getenv("NVIDIA_API_KEY")
    model = os.getenv("NVIDIA_MODEL", "meta/llama-3.3-70b-instruct")

    if not evidence_chunks:
        return {
            "answer": "I could not find enough resume evidence to answer this question.",
            "summary": "No relevant evidence found.",
            "strengths": [],
            "weaknesses": ["Resume evidence was insufficient for this question."],
            "missing_skills": [],
            "recommendations": ["Index the resume again or ask a more specific question."],
            "confidence_score": 0.1,
            "llm_model": model,
            "llm_status": "no_evidence",
        }

    if not api_key or api_key.startswith("your_"):
        fallback = generate_fallback_answer(question, evidence_chunks)
        fallback["llm_model"] = model
        return fallback

    prompt = build_rag_prompt(question, evidence_chunks)

    try:
        from langchain_nvidia_ai_endpoints import ChatNVIDIA

        llm = ChatNVIDIA(
            model=model,
            api_key=api_key,
            temperature=0.2,
            max_tokens=1400,
        )

        response = llm.invoke(prompt)
        content = getattr(response, "content", str(response))
        parsed = _extract_json(content)

        if not parsed:
            fallback = generate_fallback_answer(question, evidence_chunks)
            fallback["llm_model"] = model
            return fallback

        return {
            "answer": str(parsed.get("answer") or "No answer generated."),
            "summary": str(parsed.get("summary") or ""),
            "strengths": _safe_list(parsed.get("strengths")),
            "weaknesses": _safe_list(parsed.get("weaknesses")),
            "missing_skills": _safe_list(parsed.get("missing_skills")),
            "recommendations": _safe_list(parsed.get("recommendations")),
            "confidence_score": float(parsed.get("confidence_score") or 0.75),
            "llm_model": model,
            "llm_status": "success",
        }

    except Exception:
        fallback = generate_fallback_answer(question, evidence_chunks)
        fallback["llm_model"] = model
        return fallback
