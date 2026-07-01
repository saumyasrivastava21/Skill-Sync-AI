from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    environment: str
    version: str


class DependencyHealthResponse(BaseModel):
    postgres: str
    redis: str