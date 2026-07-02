from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
)
from app.models.user_model import User
from app.schemas.auth_schema import LoginResponse, RegisterRequest
from app.schemas.user_schema import UserMe, UserPublic


class AuthService:
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        stmt = select(User).where(User.email == email.lower())
        return db.scalar(stmt)

    @staticmethod
    def get_user_by_id(db: Session, user_id: int) -> User | None:
        stmt = select(User).where(User.id == user_id)
        return db.scalar(stmt)

    @staticmethod
    def register_user(db: Session, payload: RegisterRequest) -> UserPublic:
        existing_user = AuthService.get_user_by_email(db, payload.email)

        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user = User(
            name=payload.name.strip(),
            email=payload.email.lower(),
            hashed_password=hash_password(payload.password),
            role=payload.role,
            is_active=True,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return UserPublic.model_validate(user)

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> User:
        user = AuthService.get_user_by_email(db, email)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive",
            )

        return user

    @staticmethod
    def login_user(db: Session, email: str, password: str) -> LoginResponse:
        user = AuthService.authenticate_user(db, email, password)

        access_token = create_access_token(user_id=user.id, role=user.role)
        refresh_token = create_refresh_token(user_id=user.id, role=user.role)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserMe.model_validate(user),
        )