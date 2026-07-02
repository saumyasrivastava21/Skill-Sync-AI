import psycopg
from redis import Redis

from app.core.config import get_settings


def check_postgres() -> str:
    settings = get_settings()

    try:
        with psycopg.connect(settings.psycopg_url, connect_timeout=3) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1;")
                result = cur.fetchone()
                if result and result[0] == 1:
                    return "healthy"
        return "unhealthy"
    except Exception:
        return "unhealthy"


def check_redis() -> str:
    settings = get_settings()

    try:
        client = Redis.from_url(settings.redis_url, socket_connect_timeout=3)
        if client.ping():
            return "healthy"
        return "unhealthy"
    except Exception:
        return "unhealthy"