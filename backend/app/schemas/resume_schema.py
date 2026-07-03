from datetime import datetime
from pydantic import BaseModel, Field


class ResumePublic(BaseModel):
    id: int
    user_id: int
    original_file_name: str
    stored_file_name: str
    file_type: str
    file_size: int
    status: str
    extracted_skills: list[str] | None = None
    word_count: int | None = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ResumeDetail(ResumePublic):
    parsed_text: str | None = None
    parse_error: str | None = None


class ResumeUploadResponse(BaseModel):
    id: int
    file_name: str
    status: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class ResumeListResponse(BaseModel):
    items: list[ResumePublic]
    total: int
    page: int
    page_size: int
    pages: int


class ResumeMessageResponse(BaseModel):
    message: str


class ResumeSearchParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=10, ge=1, le=50)
    search: str | None = None