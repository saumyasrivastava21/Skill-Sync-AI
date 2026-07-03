from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile, status

from app.core.config import get_settings

settings = get_settings()


class StorageService:
    ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}

    @staticmethod
    def get_upload_dir() -> Path:
        upload_dir = Path(settings.UPLOAD_DIR)
        upload_dir.mkdir(parents=True, exist_ok=True)
        return upload_dir

    @staticmethod
    def validate_file_name(file_name: str | None) -> str:
        if not file_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File name is missing",
            )

        safe_name = Path(file_name).name
        extension = Path(safe_name).suffix.lower()

        if extension not in StorageService.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF, DOCX, and TXT files are allowed",
            )

        return safe_name

    @staticmethod
    async def save_upload_file(file: UploadFile, user_id: int) -> dict:
        original_file_name = StorageService.validate_file_name(file.filename)
        extension = Path(original_file_name).suffix.lower()

        upload_dir = StorageService.get_upload_dir()

        stored_file_name = f"user_{user_id}_{uuid4().hex}{extension}"
        storage_path = upload_dir / stored_file_name

        max_size_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
        file_size = 0

        with storage_path.open("wb") as buffer:
            while True:
                chunk = await file.read(1024 * 1024)

                if not chunk:
                    break

                file_size += len(chunk)

                if file_size > max_size_bytes:
                    storage_path.unlink(missing_ok=True)
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Max size is {settings.MAX_UPLOAD_MB} MB",
                    )

                buffer.write(chunk)

        return {
            "original_file_name": original_file_name,
            "stored_file_name": stored_file_name,
            "file_type": extension.replace(".", ""),
            "file_size": file_size,
            "storage_path": str(storage_path),
        }

    @staticmethod
    def delete_file(storage_path: str) -> None:
        path = Path(storage_path)

        if path.exists():
            path.unlink()

    @staticmethod
    def file_exists(storage_path: str) -> bool:
        return Path(storage_path).exists()