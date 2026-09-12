import pytest

from hooks.models import (
    Endpoint,
    WebhookRequest,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db


def test_temporary_endpoint_uses_hashed_management_token():
    endpoint, raw_token = (
        create_temporary_endpoint()
    )

    assert endpoint.owner is None
    assert endpoint.is_temporary
    assert endpoint.expires_at is not None

    assert (
        endpoint.management_token_hash
        != raw_token
    )

    assert endpoint.verify_management_token(
        raw_token
    )


def test_anonymous_endpoint_api_returns_token_once(
    api_client,
):
    response = api_client.post(
        "/api/v1/anonymous/endpoints/",
        {},
        format="json",
    )

    assert response.status_code == 201

    endpoint = Endpoint.objects.get(
        id=response.data["endpoint"]["id"]
    )

    raw_token = response.data[
        "management_token"
    ]

    assert endpoint.verify_management_token(
        raw_token
    )

    assert (
        raw_token
        != endpoint.management_token_hash
    )


def test_authenticated_user_can_adopt_endpoint(
    api_client,
):
    register_response = api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "user@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    access = register_response.data[
        "access"
    ]

    endpoint, token = (
        create_temporary_endpoint()
    )

    api_client.credentials(
        HTTP_AUTHORIZATION=(
            f"Bearer {access}"
        )
    )

    response = api_client.post(
        "/api/v1/endpoints/adopt/",
        {
            "endpoint_id": str(
                endpoint.id
            )
        },
        format="json",
        HTTP_X_HOOKWATCH_MANAGEMENT_TOKEN=(
            token
        ),
    )

    assert response.status_code == 200

    endpoint.refresh_from_db()

    assert endpoint.owner is not None
    assert not endpoint.is_temporary
    assert endpoint.expires_at is None

    assert (
        endpoint.management_token_hash
        == ""
    )


def test_wrong_management_token_cannot_adopt(
    api_client,
):
    register_response = api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "user@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    access = register_response.data[
        "access"
    ]

    endpoint, _ = (
        create_temporary_endpoint()
    )

    api_client.credentials(
        HTTP_AUTHORIZATION=(
            f"Bearer {access}"
        )
    )

    response = api_client.post(
        "/api/v1/endpoints/adopt/",
        {
            "endpoint_id": str(
                endpoint.id
            )
        },
        format="json",
        HTTP_X_HOOKWATCH_MANAGEMENT_TOKEN=(
            "wrong-token"
        ),
    )

    assert response.status_code == 404


def test_requests_are_deleted_with_endpoint(
    user,
):
    endpoint = Endpoint.objects.create(
        owner=user,
        name="Test endpoint",
        is_temporary=False,
    )

    WebhookRequest.objects.create(
        endpoint=endpoint,
        method="POST",
        path="/hooks/test/",
        body_raw=b'{"hello":"world"}',
        body_size=17,
    )

    assert (
        WebhookRequest.objects.count()
        == 1
    )

    endpoint.delete()

    assert (
        WebhookRequest.objects.count()
        == 0
    )