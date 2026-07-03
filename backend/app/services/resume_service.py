import math

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.resume_model import Resume
from app.services.parser_service import ParserService
from app.services.storage_service import StorageService


class ResumeService:
    @staticmethod
    def create_resume_record(
        db: Session,
        user_id: int,
        metadata: dict,
    ) -> Resume:
        resume = Resume(
            user_id=user_id,
            original_file_name=metadata["original_file_name"],
            stored_file_name=metadata["stored_file_name"],
            file_type=metadata["file_type"],
            file_size=metadata["file_size"],
            storage_path=metadata["storage_path"],
            status="uploaded",
        )

        db.add(resume)
        db.commit()
        db.refresh(resume)

        return resume

    @staticmethod
    def get_resume_or_404(
        db: Session,
        resume_id: int,
        user_id: int,
    ) -> Resume:
        stmt = select(Resume).where(
            Resume.id == resume_id,
            Resume.user_id == user_id,
        )

        resume = db.scalar(stmt)

        if not resume:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume not found",
            )

        return resume

    @staticmethod
    def list_resumes(
        db: Session,
        user_id: int,
        page: int,
        page_size: int,
        search: str | None,
    ) -> dict:
        stmt = select(Resume).where(Resume.user_id == user_id)

        if search:
            stmt = stmt.where(Resume.original_file_name.ilike(f"%{search}%"))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = db.scalar(count_stmt) or 0

        offset = (page - 1) * page_size

        items_stmt = (
            stmt.order_by(Resume.created_at.desc())
            .offset(offset)
            .limit(page_size)
        )

        items = list(db.scalars(items_stmt).all())

        pages = math.ceil(total / page_size) if total else 0

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": pages,
        }

    @staticmethod
    def delete_resume(
        db: Session,
        resume_id: int,
        user_id: int,
    ) -> None:
        resume = ResumeService.get_resume_or_404(db, resume_id, user_id)

        StorageService.delete_file(resume.storage_path)

        db.delete(resume)
        db.commit()

    @staticmethod
    def process_resume_background(resume_id: int) -> None:
        db = SessionLocal()

        try:
            resume = db.get(Resume, resume_id)

            if not resume:
                return

            resume.status = "parsing"
            resume.parse_error = None
            db.commit()
            db.refresh(resume)

            parsed_result = ParserService.parse_file(resume.storage_path)

            resume.parsed_text = parsed_result["parsed_text"]
            resume.extracted_skills = parsed_result["extracted_skills"]
            resume.word_count = parsed_result["word_count"]
            resume.status = "parsed"
            resume.parse_error = None

            db.commit()

        except Exception as exc:
            resume = db.get(Resume, resume_id)

            if resume:
                resume.status = "failed"
                resume.parse_error = str(exc)
                db.commit()

        finally:
            db.close()