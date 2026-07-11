import hashlib
import math
import os
import re
from typing import Iterable


EMBEDDING_DIM = int(os.getenv("EMBEDDING_DIM", "384"))


def _fit_dimension(vector: list[float], dim: int = EMBEDDING_DIM) -> list[float]:
    if len(vector) == dim:
        return vector

    if len(vector) > dim:
        return vector[:dim]

    return vector + [0.0] * (dim - len(vector))


def _normalize(vector: list[float]) -> list[float]:
    norm = math.sqrt(sum(value * value for value in vector))

    if norm == 0:
        return vector

    return [value / norm for value in vector]


def _tokenize(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z0-9+#.]+", (text or "").lower())


def _hash_embedding(text: str, dim: int = EMBEDDING_DIM) -> list[float]:
    vector = [0.0] * dim
    tokens = _tokenize(text)

    if not tokens:
        return vector

    for token in tokens:
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        index = int(digest[:8], 16) % dim
        sign = 1.0 if int(digest[8:10], 16) % 2 == 0 else -1.0
        vector[index] += sign

    return _normalize(vector)


def _try_nvidia_embeddings(texts: list[str]) -> list[list[float]] | None:
    api_key = os.getenv("NVIDIA_API_KEY")
    model = os.getenv("NVIDIA_EMBEDDING_MODEL", "nvidia/nv-embedqa-e5-v5")

    if not api_key or api_key.startswith("your_"):
        return None

    try:
        from langchain_nvidia_ai_endpoints import NVIDIAEmbeddings

        embedder = NVIDIAEmbeddings(
            model=model,
            api_key=api_key,
            truncate="END",
        )

        vectors = embedder.embed_documents(texts)

        final_vectors = []
        for vector in vectors:
            fitted = _fit_dimension([float(value) for value in vector])
            final_vectors.append(_normalize(fitted))

        return final_vectors

    except Exception:
        return None


def generate_embeddings(texts: Iterable[str]) -> list[list[float]]:
    text_list = [text or "" for text in texts]

    if not text_list:
        return []

    nvidia_vectors = _try_nvidia_embeddings(text_list)

    if nvidia_vectors:
        return nvidia_vectors

    return [_hash_embedding(text) for text in text_list]


def generate_query_embedding(query: str) -> list[float]:
    return generate_embeddings([query])[0]
