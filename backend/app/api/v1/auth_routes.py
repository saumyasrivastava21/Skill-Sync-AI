from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.core.security import create_access_token, decode_token
from app.db.session import get_db
from app.models.user_model import User
from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    MessageResponse,
    RegisterRequest,
    TokenRefreshRequest,
    TokenRefreshResponse,
)
from app.schemas.user_schema import UserMe, UserPublic
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=UserPublic,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    payload: RegisterRequest,
    db: Session = Depends(get_db),
) -> UserPublic:
    return AuthService.register_user(db, payload)


@router.post("/login", response_model=LoginResponse)
async def login(
    payload: LoginRequest,
    db: Session = Depends(get_db),
) -> LoginResponse:
    return AuthService.login_user(
        db=db,
        email=payload.email,
        password=payload.password,
    )


@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    payload: TokenRefreshRequest,
    db: Session = Depends(get_db),
) -> TokenRefreshResponse:
    decoded = decode_token(payload.refresh_token)

    if decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = decoded.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token subject",
        )

    user = AuthService.get_user_by_id(db, int(user_id))

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    new_access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return TokenRefreshResponse(
        access_token=new_access_token,
        token_type="bearer",
    )


@router.get("/me", response_model=UserMe)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserMe:
    return UserMe.model_validate(current_user)


@router.post("/logout", response_model=MessageResponse)
async def logout() -> MessageResponse:
    return MessageResponse(
        message="Logout successful. Please remove token from frontend storage."
    )