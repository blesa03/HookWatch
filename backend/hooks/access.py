from django.db.models import Count, Max
from rest_framework.exceptions import NotFound

from .models import Endpoint

MANAGEMENT_TOKEN_HEADER = "X-HookWatch-Management-Token"


def endpoint_queryset():
    return Endpoint.objects.annotate(
        request_count=Count("requests"),
        last_request_at=Max("requests__received_at"),
    )


def get_accessible_endpoint(
    request,
    endpoint_id,
) -> Endpoint:
    endpoint = (
        endpoint_queryset()
        .filter(id=endpoint_id)
        .first()
    )

    if endpoint is None:
        raise NotFound("Endpoint not found.")

    if (
        request.user.is_authenticated
        and endpoint.owner_id == request.user.id
    ):
        return endpoint

    management_token = request.headers.get(
        MANAGEMENT_TOKEN_HEADER
    )

    if (
        endpoint.is_temporary
        and management_token
        and endpoint.verify_management_token(
            management_token
        )
    ):
        return endpoint

    raise NotFound("Endpoint not found.")