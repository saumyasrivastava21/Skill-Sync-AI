from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "SkillSync AI"
    API_VERSION: str = "v1"
    ENVIRONMENT: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    BACKEND_CORS_ORIGINS: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:3000,"
        "http://127.0.0.1:3000"
    )

    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5433
    POSTGRES_DB: str = "skillsync_db"
    POSTGRES_USER: str = "skillsync_user"
    POSTGRES_PASSWORD: str = "skillsync_password"

    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379

    SECRET_KEY: str = "TXOX5ZC8rjq-gRpOp_rToUT3JzUImnaU_KUFRpXuDcvF_Bmu4xH0tjDA5L4N3VSMlVgASnTYx_4mJ6pGnzYh5g"
    ALGORITHM: str = "HS256"

    JWT_SECRET_KEY: str = "TXOX5ZC8rjq-gRpOp_rToUT3JzUImnaU_KUFRpXuDcvF_Bmu4xH0tjDA5L4N3VSMlVgASnTYx_4mJ6pGnzYh5g"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    UPLOAD_DIR: str = "uploads/resumes"
    MAX_UPLOAD_MB: int = 5
    STORAGE_BACKEND: str = "local"

    NVIDIA_API_KEY: str | None = None
    NVIDIA_MODEL: str = "meta/llama-3.3-70b-instruct"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:"
            f"{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:"
            f"{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def sync_database_url(self) -> str:
        return self.database_url

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip()
            for origin in self.BACKEND_CORS_ORIGINS.split(",")
            if origin.strip()
        ]

    @property
    def cors_origins(self) -> list[str]:
        return self.cors_origins_list


@lru_cache
def get_settings() -> Settings:
    return Settings()