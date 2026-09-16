from functools import lru_cache

from django.conf import settings
from redis import Redis


@lru_cache(maxsize=4)
def _build_redis_client(
    url: str,
    timeout: float,
) -> Redis:
    return Redis.from_url(
        url,
        decode_responses=True,
        socket_connect_timeout=timeout,
        socket_timeout=timeout,
        health_check_interval=30,
    )


def get_redis_client() -> Redis:
    return _build_redis_client(
        settings.REDIS_URL,
        settings.HOOKWATCH_REDIS_SOCKET_TIMEOUT,
    )