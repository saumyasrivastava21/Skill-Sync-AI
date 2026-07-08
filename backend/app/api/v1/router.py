from app.api.v1 import role_auth_routes
from fastapi import APIRouter

from app.api.v1 import (
    auth_routes,
    health_routes,
    recruiter_routes,
    report_routes,
    resume_routes,
)

api_router = APIRouter()

api_router.include_router(health_routes.router)
api_router.include_router(auth_routes.router)
api_router.include_router(resume_routes.router)
api_router.include_router(report_routes.router)
api_router.include_router(recruiter_routes.router)
api_router.include_router(role_auth_routes.router, prefix="/auth", tags=["Role Auth"])

