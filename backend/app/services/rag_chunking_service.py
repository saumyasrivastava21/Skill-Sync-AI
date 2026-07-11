import re
from dataclasses import dataclass


@dataclass
class ChunkData:
    chunk_index: int
    chunk_text: str
    section_name: str
    token_count: int


SECTION_PATTERNS = [
    ("education", r"\b(education|academic|degree|university|college|cgpa)\b"),
    ("skills", r"\b(skills|technical skills|technologies|tools|programming|frameworks)\b"),
    ("experience", r"\b(experience|internship|work experience|employment|research intern)\b"),
    ("projects", r"\b(projects|project experience|portfolio|built|developed|implemented)\b"),
    ("achievements", r"\b(achievements|awards|certifications|certificates|winner|hackathon)\b"),
]


def clean_resume_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\x00", " ")
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()


def detect_section_name(text: str) -> str:
    lower = text.lower()

    for section_name, pattern in SECTION_PATTERNS:
        if re.search(pattern, lower):
            return section_name

    return "general"


def chunk_resume_text(
    resume_text: str,
    chunk_size_words: int = 350,
    overlap_words: int = 50,
) -> list[ChunkData]:
    cleaned = clean_resume_text(resume_text)

    if not cleaned:
        return []

    words = cleaned.split()

    if len(words) <= chunk_size_words:
        return [
            ChunkData(
                chunk_index=0,
                chunk_text=cleaned,
                section_name=detect_section_name(cleaned),
                token_count=len(words),
            )
        ]

    chunks: list[ChunkData] = []
    start = 0
    chunk_index = 0

    while start < len(words):
        end = min(start + chunk_size_words, len(words))
        chunk_words = words[start:end]
        chunk_text = " ".join(chunk_words).strip()

        if chunk_text:
            chunks.append(
                ChunkData(
                    chunk_index=chunk_index,
                    chunk_text=chunk_text,
                    section_name=detect_section_name(chunk_text),
                    token_count=len(chunk_words),
                )
            )
            chunk_index += 1

        if end >= len(words):
            break

        start = max(end - overlap_words, start + 1)

    return chunks
