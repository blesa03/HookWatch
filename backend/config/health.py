from django.db import connection
from django.http import JsonResponse
from redis.exceptions import RedisError

from .redis_client import (
    get_redis_client,
)


def _database_available() -> bool:
    try:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT 1"
            )
            cursor.fetchone()
    except Exception:
        return False

    return True


def _redis_available() -> bool:
    try:
        return bool(
            get_redis_client().ping()
        )
    except (
        RedisError,
        OSError,
    ):
        return False


def liveness_check(_request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "hookwatch-api",
        }
    )


def readiness_check(_request):
    database_ok = (
        _database_available()
    )

    redis_ok = (
        _redis_available()
    )

    checks = {
        "database": (
            "ok"
            if database_ok
            else "unavailable"
        ),
        "redis": (
            "ok"
            if redis_ok
            else "degraded"
        ),
    }

    if not database_ok:
        return JsonResponse(
            {
                "status":
                    "unavailable",
                "service":
                    "hookwatch-api",
                "checks": checks,
            },
            status=503,
        )

    return JsonResponse(
        {
            "status": (
                "ready"
                if redis_ok
                else "degraded"
            ),
            "service":
                "hookwatch-api",
            "checks": checks,
        }
    )