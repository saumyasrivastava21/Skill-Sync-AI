from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.models.user_model import User


router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class RoleSignupRequest(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=150)
    password: str = Field(min_length=6, max_length=100)
    confirm_password: str = Field(min_length=6, max_length=100)
    role: str = "candidate"


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register-with-role", status_code=status.HTTP_201_CREATED)
def register_with_role(payload: RoleSignupRequest, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    name = payload.name.strip()
    role = payload.role.strip().lower()

    if role not in ["candidate", "recruiter"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Choose candidate or recruiter.",
        )

    if payload.password != payload.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    if "@" not in email or "." not in email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please enter a valid email address.",
        )

    existing_user = db.query(User).filter(User.email == email).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered.",
        )

    columns = {column.name for column in User.__table__.columns}
    user_data = {}

    if "email" in columns:
        user_data["email"] = email

    if "name" in columns:
        user_data["name"] = name

    if "full_name" in columns:
        user_data["full_name"] = name

    if "role" in columns:
        user_data["role"] = role

    if "is_active" in columns:
        user_data["is_active"] = True

    hashed_password = pwd_context.hash(payload.password)

    if "hashed_password" in columns:
        user_data["hashed_password"] = hashed_password
    elif "password_hash" in columns:
        user_data["password_hash"] = hashed_password
    elif "password" in columns:
        user_data["password"] = hashed_password
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password column not found in User model.",
        )

    user = User(**user_data)
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": f"{role.capitalize()} account created successfully.",
        "email": email,
        "role": role,
    }
