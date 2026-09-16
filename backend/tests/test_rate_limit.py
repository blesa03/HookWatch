from unittest.mock import (
    Mock,
    patch,
)

from django.test import (
    override_settings,
)
from redis.exceptions import RedisError

from hooks.rate_limit import (
    check_ingest_rate_limit,
)


@override_settings(
    HOOKWATCH_INGEST_RATE_LIMIT=2,
    HOOKWATCH_INGEST_RATE_WINDOW_SECONDS=60,
)
def test_rate_limit_rejects_above_limit():
    client = Mock()
    pipeline = Mock()

    client.pipeline.return_value = (
        pipeline
    )

    pipeline.execute.return_value = [
        3,
        True,
    ]

    with patch(
        (
            "hooks.rate_limit."
            "get_redis_client"
        ),
        return_value=client,
    ):
        decision = (
            check_ingest_rate_limit(
                endpoint_id="endpoint",
                source_ip=(
                    "203.0.113.10"
                ),
            )
        )

    assert decision.allowed is False
    assert decision.retry_after > 0


@override_settings(
    HOOKWATCH_INGEST_RATE_LIMIT=2,
    HOOKWATCH_INGEST_RATE_WINDOW_SECONDS=60,
)
def test_rate_limit_fails_open_when_redis_is_down():
    with patch(
        (
            "hooks.rate_limit."
            "get_redis_client"
        ),
        side_effect=RedisError(
            "redis down"
        ),
    ):
        decision = (
            check_ingest_rate_limit(
                endpoint_id="endpoint",
                source_ip=(
                    "203.0.113.10"
                ),
            )
        )

    assert decision.allowed is True