from unittest.mock import patch

import pytest

from hooks.models import (
    WebhookRequest,
)
from hooks.rate_limit import (
    RateLimitDecision,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db


def test_ingest_returns_429_when_rate_limited(
    client,
):
    endpoint, _ = (
        create_temporary_endpoint()
    )

    with patch(
        (
            "hooks.ingest."
            "check_ingest_rate_limit"
        ),
        return_value=(
            RateLimitDecision(
                allowed=False,
                retry_after=17,
            )
        ),
    ):
        response = client.post(
            f"/hooks/"
            f"{endpoint.ingest_token}/"
        )

    assert response.status_code == 429

    assert (
        response["Retry-After"]
        == "17"
    )

    assert response.json()[
        "error"
    ]["code"] == "rate_limited"

    assert (
        WebhookRequest.objects.count()
        == 0
    )