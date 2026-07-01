import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.core.logging import setup_logging, logger

setup_logging()

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.API_VERSION,
    description="SkillSync AI - Full Stack AI Resume Intelligence Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_logging_middleware(request: Request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = round((time.time() - start_time) * 1000, 2)
    logger.info(
        "%s %s completed_in=%sms status_code=%s",
        request.method,
        request.url.path,
        process_time,
        response.status_code,
    )

    return response


@app.get("/")
async def root():
    return {
        "message": "Welcome to SkillSync AI Backend",
        "docs": "/docs",
        "health": "/api/v1/health",
    }


app.include_router(api_router, prefix="/api/v1")