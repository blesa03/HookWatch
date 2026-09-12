from datetime import timedelta

from django.db import transaction
from django.utils import timezone

from .models import Endpoint
from .realtime.events import (
    queue_endpoint_disconnect,
)
from .tokens import (
    generate_management_token,
    hash_token,
)

TEMPORARY_ENDPOINT_LIFETIME = timedelta(
    hours=24,
)


class EndpointAdoptionError(Exception):
    pass


def create_temporary_endpoint(
    *,
    name: str = "Temporary endpoint",
) -> tuple[Endpoint, str]:
    management_token = (
        generate_management_token()
    )

    endpoint = Endpoint.objects.create(
        name=name,
        owner=None,
        is_temporary=True,
        expires_at=(
            timezone.now()
            + TEMPORARY_ENDPOINT_LIFETIME
        ),
        management_token_hash=hash_token(
            management_token
        ),
    )

    return endpoint, management_token


@transaction.atomic
def adopt_temporary_endpoint(
    *,
    endpoint_id,
    management_token: str,
    user,
) -> Endpoint:
    endpoint = (
        Endpoint.objects.select_for_update()
        .filter(id=endpoint_id)
        .first()
    )

    if endpoint is None:
        raise EndpointAdoptionError

    if not endpoint.is_temporary:
        raise EndpointAdoptionError

    if endpoint.state != Endpoint.State.ACTIVE:
        raise EndpointAdoptionError

    if endpoint.is_expired:
        raise EndpointAdoptionError

    if not endpoint.verify_management_token(
        management_token
    ):
        raise EndpointAdoptionError

    endpoint.owner = user
    endpoint.is_temporary = False
    endpoint.expires_at = None
    endpoint.management_token_hash = ""

    endpoint.save(
        update_fields=[
            "owner",
            "is_temporary",
            "expires_at",
            "management_token_hash",
            "updated_at",
        ]
    )

    queue_endpoint_disconnect(
        endpoint.id,
        reason="access_changed",
    )

    return endpoint