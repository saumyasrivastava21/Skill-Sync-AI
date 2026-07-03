from fastapi import APIRouter

from app.api.v1 import auth_routes, health_routes, resume_routes

api_router = APIRouter()

api_router.include_router(health_routes.router)
api_router.include_router(auth_routes.router)
api_router.include_router(resume_routes.router)