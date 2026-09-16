from datetime import timedelta
from unittest.mock import patch

import pytest
from django.utils import timezone

from hooks.models import Endpoint
from hooks.services import (
    create_temporary_endpoint,
)
from hooks.tasks import (
    cleanup_expired_temporary_endpoints,
)

pytestmark = pytest.mark.django_db


def test_cleanup_deletes_only_expired_temporary_endpoints():
    expired, _ = (
        create_temporary_endpoint()
    )

    active, _ = (
        create_temporary_endpoint()
    )

    expired.expires_at = (
        timezone.now()
        - timedelta(minutes=1)
    )

    expired.save(
        update_fields=[
            "expires_at",
        ]
    )

    with patch(
        "hooks.tasks."
        "queue_endpoint_closed"
    ):
        deleted = (
            cleanup_expired_temporary_endpoints
            .run()
        )

    assert deleted == 1

    assert not (
        Endpoint.objects
        .filter(
            id=expired.id
        )
        .exists()
    )

    assert (
        Endpoint.objects
        .filter(
            id=active.id
        )
        .exists()
    )