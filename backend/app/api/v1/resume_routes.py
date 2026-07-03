from pathlib import Path

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.user_model import User
from app.schemas.resume_schema import (
    ResumeDetail,
    ResumeListResponse,
    ResumeMessageResponse,
    ResumePublic,
    ResumeUploadResponse,
)
from app.services.resume_service import ResumeService
from app.services.storage_service import StorageService

router = APIRouter(prefix="/resumes", tags=["Resumes"])


@router.post(
    "/upload",
    response_model=ResumeUploadResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_resume(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeUploadResponse:
    metadata = await StorageService.save_upload_file(
        file=file,
        user_id=current_user.id,
    )

    resume = ResumeService.create_resume_record(
        db=db,
        user_id=current_user.id,
        metadata=metadata,
    )

    background_tasks.add_task(
        ResumeService.process_resume_background,
        resume.id,
    )

    return ResumeUploadResponse(
        id=resume.id,
        file_name=resume.original_file_name,
        status=resume.status,
        created_at=resume.created_at,
    )


@router.get("", response_model=ResumeListResponse)
async def list_resumes(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=10, ge=1, le=50),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeListResponse:
    result = ResumeService.list_resumes(
        db=db,
        user_id=current_user.id,
        page=page,
        page_size=page_size,
        search=search,
    )

    return ResumeListResponse(**result)


@router.get("/{resume_id}", response_model=ResumeDetail)
async def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeDetail:
    resume = ResumeService.get_resume_or_404(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )

    return ResumeDetail.model_validate(resume)


@router.delete("/{resume_id}", response_model=ResumeMessageResponse)
async def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ResumeMessageResponse:
    ResumeService.delete_resume(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )

    return ResumeMessageResponse(message="Resume deleted successfully")


@router.get("/{resume_id}/download")
async def download_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FileResponse:
    resume = ResumeService.get_resume_or_404(
        db=db,
        resume_id=resume_id,
        user_id=current_user.id,
    )

    file_path = Path(resume.storage_path)

    if not StorageService.file_exists(resume.storage_path):
        from fastapi import HTTPException

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume file not found in storage",
        )

    return FileResponse(
        path=file_path,
        filename=resume.original_file_name,
        media_type="application/octet-stream",
    )