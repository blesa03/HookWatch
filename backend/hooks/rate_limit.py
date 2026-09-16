import hashlib
import logging
import time
from dataclasses import dataclass

from django.conf import settings
from redis.exceptions import RedisError

from config.redis_client import (
    get_redis_client,
)

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class RateLimitDecision:
    allowed: bool
    retry_after: int


def _client_key(
    source_ip: str | None,
) -> str:
    value = (
        source_ip
        or "unknown"
    )

    return hashlib.sha256(
        value.encode("utf-8")
    ).hexdigest()[:24]


def check_ingest_rate_limit(
    *,
    endpoint_id,
    source_ip: str | None,
) -> RateLimitDecision:
    limit = (
        settings
        .HOOKWATCH_INGEST_RATE_LIMIT
    )

    window = max(
        1,
        settings
        .HOOKWATCH_INGEST_RATE_WINDOW_SECONDS,
    )

    if limit <= 0:
        return RateLimitDecision(
            allowed=True,
            retry_after=0,
        )

    now = time.time()

    bucket = int(
        now // window
    )

    retry_after = max(
        1,
        int(
            (
                (bucket + 1)
                * window
            )
            - now
        ),
    )

    key = (
        "hookwatch:ratelimit:"
        f"ingest:{endpoint_id}:"
        f"{_client_key(source_ip)}:"
        f"{bucket}"
    )

    try:
        client = (
            get_redis_client()
        )

        pipeline = client.pipeline(
            transaction=True
        )

        pipeline.incr(key)

        pipeline.expire(
            key,
            window + 5,
        )

        count, _ = (
            pipeline.execute()
        )
    except (
        RedisError,
        OSError,
    ):
        logger.warning(
            "Redis unavailable while "
            "checking ingest rate limit. "
            "Allowing request."
        )

        return RateLimitDecision(
            allowed=True,
            retry_after=0,
        )

    return RateLimitDecision(
        allowed=(
            int(count) <= limit
        ),
        retry_after=retry_after,
    )