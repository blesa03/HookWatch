from unittest.mock import patch

import pytest
from redis.exceptions import RedisError

from hooks.models import (
    Endpoint,
    WebhookRequest,
)
from hooks.realtime.tickets import (
    RealtimeStoreUnavailable,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db


def test_ingest_persists_when_rate_limit_store_is_down(
    client,
):
    endpoint, _ = (
        create_temporary_endpoint()
    )

    with patch(
        (
            "hooks.rate_limit."
            "get_redis_client"
        ),
        side_effect=RedisError(
            "redis unavailable"
        ),
    ):
        response = client.post(
            f"/hooks/"
            f"{endpoint.ingest_token}/"
        )

    assert response.status_code == 200

    assert (
        WebhookRequest.objects
        .filter(
            endpoint=endpoint
        )
        .count()
        == 1
    )


def test_ws_ticket_returns_503_when_redis_is_down(
    api_client,
    user,
):
    endpoint = (
        Endpoint.objects.create(
            owner=user,
            name=(
                "Realtime endpoint"
            ),
        )
    )

    api_client.force_authenticate(
        user=user
    )

    with patch(
        (
            "hooks.realtime.views."
            "issue_ws_ticket"
        ),
        side_effect=(
            RealtimeStoreUnavailable()
        ),
    ):
        response = (
            api_client.post(
                "/api/v1/ws/tickets/",
                {
                    "endpoint_id":
                        str(endpoint.id),
                },
                format="json",
            )
        )

    assert (
        response.status_code
        == 503
    )

    assert response.data == {
        "error": {
            "code":
                "realtime_unavailable",
            "message":
                (
                    "Realtime service "
                    "unavailable."
                ),
        }
    }