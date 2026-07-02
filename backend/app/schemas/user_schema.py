from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field

UserRole = Literal["candidate", "recruiter", "admin"]


class UserBase(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    role: UserRole = "candidate"


class UserCreate(UserBase):
    password: str = Field(min_length=6, max_length=128)


class UserPublic(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


class UserMe(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

    model_config = {
        "from_attributes": True
    }