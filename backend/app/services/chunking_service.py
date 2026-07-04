import re


def clean_for_chunking(text: str) -> str:
    text = text or ""
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()


def chunk_text(
    text: str,
    chunk_size_words: int = 120,
    overlap_words: int = 25,
) -> list[dict]:
    cleaned = clean_for_chunking(text)
    words = cleaned.split()

    if not words:
        return []

    chunks: list[dict] = []
    start = 0
    chunk_id = 1

    while start < len(words):
        end = min(start + chunk_size_words, len(words))
        chunk_words = words[start:end]
        chunk_text_value = " ".join(chunk_words)

        chunks.append(
            {
                "chunk_id": chunk_id,
                "start_word": start,
                "end_word": end,
                "text": chunk_text_value,
            }
        )

        if end >= len(words):
            break

        start = max(end - overlap_words, start + 1)
        chunk_id += 1

    return chunks