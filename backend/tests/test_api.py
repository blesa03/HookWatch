import base64

import pytest

from accounts.models import User
from hooks.models import (
    Endpoint,
    WebhookRequest,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db


def create_endpoint(
    user,
    name="Test endpoint",
):
    return Endpoint.objects.create(
        owner=user,
        name=name,
    )


def create_request(
    endpoint,
    *,
    method="POST",
    path="/",
    content_type="application/json",
    body_raw=b"{}",
    parsed_json=None,
):
    return WebhookRequest.objects.create(
        endpoint=endpoint,
        method=method,
        path=path,
        content_type=content_type,
        body_raw=body_raw,
        body_size=len(body_raw),
        parsed_json=parsed_json,
    )


def test_authenticated_user_can_create_endpoint(
    api_client,
    user,
):
    api_client.force_authenticate(
        user=user
    )

    response = api_client.post(
        "/api/v1/endpoints/",
        {
            "name": "GitHub",
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["name"] == "GitHub"
    assert response.data["status"] == "active"

    endpoint = Endpoint.objects.get(
        id=response.data["id"]
    )

    assert endpoint.owner == user
    assert not endpoint.is_temporary


def test_endpoint_list_contains_request_summary(
    api_client,
    user,
):
    api_client.force_authenticate(
        user=user
    )

    endpoint = create_endpoint(user)

    create_request(endpoint)

    response = api_client.get(
        "/api/v1/endpoints/"
    )

    assert response.status_code == 200
    assert len(response.data) == 1

    data = response.data[0]

    assert data["request_count"] == 1
    assert data["last_request_at"] is not None


def test_other_users_endpoint_returns_404(
    api_client,
    user,
):
    other_user = (
        User.objects.create_user(
            email="other@example.com",
            password="StrongPassword123!",
        )
    )

    endpoint = create_endpoint(
        other_user
    )

    api_client.force_authenticate(
        user=user
    )

    response = api_client.get(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/"
    )

    assert response.status_code == 404


def test_anonymous_endpoint_requires_management_token(
    api_client,
):
    endpoint, management_token = (
        create_temporary_endpoint()
    )

    url = (
        f"/api/v1/endpoints/"
        f"{endpoint.id}/"
    )

    response = api_client.get(url)

    assert response.status_code == 404

    response = api_client.get(
        url,
        HTTP_X_HOOKWATCH_MANAGEMENT_TOKEN=(
            management_token
        ),
    )

    assert response.status_code == 200
    assert response.data["id"] == str(
        endpoint.id
    )


def test_endpoint_can_be_updated_and_deleted(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    api_client.force_authenticate(
        user=user
    )

    url = (
        f"/api/v1/endpoints/"
        f"{endpoint.id}/"
    )

    response = api_client.patch(
        url,
        {
            "name": "Renamed",
            "state": "disabled",
        },
        format="json",
    )

    assert response.status_code == 200
    assert response.data["name"] == "Renamed"
    assert response.data["status"] == "disabled"

    response = api_client.delete(url)

    assert response.status_code == 204
    assert not Endpoint.objects.filter(
        id=endpoint.id
    ).exists()


def test_request_list_is_summary_and_can_filter(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    create_request(
        endpoint,
        method="POST",
        path="/github/push",
    )

    create_request(
        endpoint,
        method="GET",
        path="/stripe/event",
    )

    api_client.force_authenticate(
        user=user
    )

    response = api_client.get(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
        "?method=POST&search=github"
    )

    assert response.status_code == 200
    assert len(response.data["results"]) == 1

    item = response.data["results"][0]

    assert item["method"] == "POST"
    assert item["path"] == "/github/push"

    assert "headers" not in item
    assert "body" not in item


def test_anonymous_user_can_list_requests_with_token(
    api_client,
):
    endpoint, management_token = (
        create_temporary_endpoint()
    )

    create_request(endpoint)

    url = (
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
    )

    response = api_client.get(url)

    assert response.status_code == 404

    response = api_client.get(
        url,
        HTTP_X_HOOKWATCH_MANAGEMENT_TOKEN=(
            management_token
        ),
    )

    assert response.status_code == 200
    assert len(response.data["results"]) == 1


def test_request_detail_returns_json_body(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    captured = create_request(
        endpoint,
        body_raw=b'{"hello":"world"}',
        parsed_json={
            "hello": "world",
        },
    )

    api_client.force_authenticate(
        user=user
    )

    response = api_client.get(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
        f"{captured.id}/"
    )

    assert response.status_code == 200

    assert response.data["body"] == {
        "format": "json",
        "raw": '{"hello":"world"}',
        "parsed": {
            "hello": "world",
        },
    }


def test_binary_request_body_is_base64(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    body = b"\xff\x00"

    captured = create_request(
        endpoint,
        content_type=(
            "application/octet-stream"
        ),
        body_raw=body,
    )

    api_client.force_authenticate(
        user=user
    )

    response = api_client.get(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
        f"{captured.id}/"
    )

    assert response.status_code == 200

    assert (
        response.data["body"]["format"]
        == "base64"
    )

    assert (
        response.data["body"]["raw"]
        == base64.b64encode(
            body
        ).decode("ascii")
    )


def test_request_can_be_deleted_and_history_cleared(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    first = create_request(endpoint)
    create_request(endpoint)

    api_client.force_authenticate(
        user=user
    )

    response = api_client.delete(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
        f"{first.id}/"
    )

    assert response.status_code == 204
    assert endpoint.requests.count() == 1

    response = api_client.post(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
        "clear/"
    )

    assert response.status_code == 200
    assert response.data[
        "deleted_count"
    ] == 1

    assert endpoint.requests.count() == 0


def test_request_list_uses_cursor_pagination(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    for _ in range(51):
        create_request(endpoint)

    api_client.force_authenticate(
        user=user
    )

    response = api_client.get(
        f"/api/v1/endpoints/"
        f"{endpoint.id}/requests/"
    )

    assert response.status_code == 200

    assert len(
        response.data["results"]
    ) == 50

    assert response.data["next"] is not None


def test_validation_errors_use_uniform_shape(
    api_client,
    user,
):
    api_client.force_authenticate(
        user=user
    )

    response = api_client.post(
        "/api/v1/endpoints/",
        {
            "name": "",
        },
        format="json",
    )

    assert response.status_code == 400

    assert response.data[
        "error"
    ]["code"] == "validation_error"

    assert (
        "name"
        in response.data["error"]["fields"]
    )