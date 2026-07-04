from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.models.user_model import User


settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login"
)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        secret_key = getattr(settings, "SECRET_KEY", settings.JWT_SECRET_KEY)
        algorithm = getattr(settings, "ALGORITHM", settings.JWT_ALGORITHM)

        payload = jwt.decode(
            token,
            secret_key,
            algorithms=[algorithm],
        )

        subject = payload.get("sub")
        user_id = payload.get("user_id")
        email = payload.get("email")

        if subject is None and user_id is None and email is None:
            raise credentials_exception

    except JWTError:
        raise credentials_exception

    user = None

    if user_id is not None:
        try:
            user = db.query(User).filter(User.id == int(user_id)).first()
        except Exception:
            user = None

    if user is None and subject is not None:
        subject_value = str(subject)

        if subject_value.isdigit():
            user = db.query(User).filter(User.id == int(subject_value)).first()
        else:
            user = db.query(User).filter(User.email == subject_value).first()

    if user is None and email is not None:
        user = db.query(User).filter(User.email == str(email)).first()

    if user is None:
        raise credentials_exception

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    return current_user


def require_recruiter(
    current_user: User = Depends(get_current_user),
) -> User:
    if getattr(current_user, "role", None) != "recruiter":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required",
        )

    return current_user


def require_candidate(
    current_user: User = Depends(get_current_user),
) -> User:
    if getattr(current_user, "role", None) != "candidate":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Candidate access required",
        )

    return current_user
