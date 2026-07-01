from fastapi import APIRouter

from app.core.config import get_settings
from app.db.ping import check_postgres, check_redis
from app.schemas.health_schema import HealthResponse, DependencyHealthResponse

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()

    return HealthResponse(
        status="ok",
        service=settings.PROJECT_NAME,
        environment=settings.ENVIRONMENT,
        version=settings.API_VERSION,
    )


@router.get("/dependencies", response_model=DependencyHealthResponse)
async def dependency_health() -> DependencyHealthResponse:
    return DependencyHealthResponse(
        postgres=check_postgres(),
        redis=check_redis(),
    )