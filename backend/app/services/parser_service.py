import re
from pathlib import Path

import fitz
from docx import Document


class ParserService:
    BASIC_SKILLS = [
        "python",
        "java",
        "javascript",
        "typescript",
        "react",
        "redux",
        "fastapi",
        "flask",
        "django",
        "spring boot",
        "sql",
        "postgresql",
        "mysql",
        "mongodb",
        "redis",
        "docker",
        "kubernetes",
        "aws",
        "ec2",
        "s3",
        "rds",
        "ecs",
        "ecr",
        "spark",
        "apache spark",
        "solr",
        "mlflow",
        "machine learning",
        "deep learning",
        "nlp",
        "computer vision",
        "pytorch",
        "tensorflow",
        "langchain",
        "chromadb",
        "git",
        "github actions",
        "linux",
        "bash",
        "ansible",
    ]

    @staticmethod
    def clean_text(text: str) -> str:
        text = text.replace("\x00", " ")
        text = re.sub(r"\s+", " ", text)
        text = re.sub(r"[^\x09\x0A\x0D\x20-\x7E]+", " ", text)
        return text.strip()

    @staticmethod
    def extract_text_from_pdf(file_path: Path) -> str:
        text_parts: list[str] = []

        with fitz.open(file_path) as document:
            for page in document:
                text_parts.append(page.get_text())

        return "\n".join(text_parts)

    @staticmethod
    def extract_text_from_docx(file_path: Path) -> str:
        document = Document(file_path)
        paragraphs = [paragraph.text for paragraph in document.paragraphs]
        return "\n".join(paragraphs)

    @staticmethod
    def extract_text_from_txt(file_path: Path) -> str:
        return file_path.read_text(encoding="utf-8", errors="ignore")

    @staticmethod
    def extract_skills(cleaned_text: str) -> list[str]:
        text_lower = cleaned_text.lower()
        found_skills: list[str] = []

        for skill in ParserService.BASIC_SKILLS:
            pattern = r"\b" + re.escape(skill.lower()) + r"\b"
            if re.search(pattern, text_lower):
                found_skills.append(skill.title())

        return sorted(set(found_skills))

    @staticmethod
    def parse_file(file_path: str) -> dict:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")

        extension = path.suffix.lower()

        if extension == ".pdf":
            raw_text = ParserService.extract_text_from_pdf(path)
        elif extension == ".docx":
            raw_text = ParserService.extract_text_from_docx(path)
        elif extension == ".txt":
            raw_text = ParserService.extract_text_from_txt(path)
        else:
            raise ValueError(f"Unsupported file type: {extension}")

        cleaned_text = ParserService.clean_text(raw_text)
        skills = ParserService.extract_skills(cleaned_text)
        word_count = len(cleaned_text.split())

        return {
            "parsed_text": cleaned_text,
            "extracted_skills": skills,
            "word_count": word_count,
        }