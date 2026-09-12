import json
from datetime import timedelta

import pytest
from django.test import override_settings
from django.utils import timezone

from hooks.models import (
    Endpoint,
    WebhookRequest,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def endpoint():
    endpoint, _ = (
        create_temporary_endpoint()
    )

    return endpoint


def ingest_url(
    endpoint,
    path="",
):
    base = (
        f"/hooks/"
        f"{endpoint.ingest_token}/"
    )

    if not path:
        return base

    return f"{base}{path}"


@pytest.mark.parametrize(
    "method",
    [
        "get",
        "post",
        "put",
        "patch",
        "delete",
    ],
)
def test_supported_methods_are_captured(
    client,
    endpoint,
    method,
):
    response = getattr(
        client,
        method,
    )(
        ingest_url(endpoint)
    )

    assert response.status_code == 200

    captured = (
        WebhookRequest.objects.get()
    )

    assert (
        captured.method
        == method.upper()
    )


def test_json_request_is_captured(
    client,
    endpoint,
):
    payload = {
        "event": "payment.succeeded",
        "amount": 4200,
    }

    raw_body = json.dumps(
        payload
    ).encode()

    response = client.generic(
        "POST",
        (
            ingest_url(endpoint)
            + "?source=stripe"
            + "&tag=one"
            + "&tag=two"
        ),
        data=raw_body,
        content_type="application/json",
        HTTP_X_TEST_HEADER="hookwatch",
    )

    assert response.status_code == 200

    captured = (
        WebhookRequest.objects.get()
    )

    assert captured.method == "POST"

    assert bytes(
        captured.body_raw
    ) == raw_body

    assert captured.body_size == len(
        raw_body
    )

    assert (
        captured.parsed_json
        == payload
    )

    assert captured.query_params == {
        "source": ["stripe"],
        "tag": ["one", "two"],
    }

    assert (
        captured.headers[
            "X-Test-Header"
        ]
        == "hookwatch"
    )

    assert (
        captured.content_type
        == "application/json"
    )

    assert captured.path == "/"


def test_non_json_body_is_preserved(
    client,
    endpoint,
):
    body = b"hello=hookwatch&value=42"

    response = client.generic(
        "POST",
        ingest_url(endpoint),
        data=body,
        content_type=(
            "application/x-www-form-urlencoded"
        ),
    )

    assert response.status_code == 200

    captured = (
        WebhookRequest.objects.get()
    )

    assert bytes(
        captured.body_raw
    ) == body

    assert captured.parsed_json is None


def test_invalid_json_is_still_captured(
    client,
    endpoint,
):
    body = b'{"broken":'

    response = client.generic(
        "POST",
        ingest_url(endpoint),
        data=body,
        content_type="application/json",
    )

    assert response.status_code == 200

    captured = (
        WebhookRequest.objects.get()
    )

    assert bytes(
        captured.body_raw
    ) == body

    assert captured.parsed_json is None


def test_nested_path_is_captured(
    client,
    endpoint,
):
    response = client.post(
        ingest_url(
            endpoint,
            "github/push",
        )
    )

    assert response.status_code == 200

    captured = (
        WebhookRequest.objects.get()
    )

    assert (
        captured.path
        == "/github/push"
    )


def test_unknown_endpoint_returns_404(
    client,
):
    response = client.post(
        "/hooks/not-a-real-token/"
    )

    assert response.status_code == 404

    assert (
        WebhookRequest.objects.count()
        == 0
    )


def test_disabled_endpoint_returns_404(
    client,
    endpoint,
):
    endpoint.state = (
        Endpoint.State.DISABLED
    )

    endpoint.save(
        update_fields=[
            "state",
        ]
    )

    response = client.post(
        ingest_url(endpoint)
    )

    assert response.status_code == 404

    assert (
        WebhookRequest.objects.count()
        == 0
    )


def test_expired_endpoint_returns_410(
    client,
    endpoint,
):
    endpoint.expires_at = (
        timezone.now()
        - timedelta(minutes=1)
    )

    endpoint.save(
        update_fields=[
            "expires_at",
        ]
    )

    response = client.post(
        ingest_url(endpoint)
    )

    assert response.status_code == 410

    assert (
        WebhookRequest.objects.count()
        == 0
    )


def test_unsupported_method_returns_405(
    client,
    endpoint,
):
    response = client.generic(
        "OPTIONS",
        ingest_url(endpoint),
    )

    assert response.status_code == 405

    assert (
        WebhookRequest.objects.count()
        == 0
    )


@override_settings(
    HOOKWATCH_MAX_BODY_SIZE=10,
)
def test_payload_larger_than_limit_returns_413(
    client,
    endpoint,
):
    response = client.generic(
        "POST",
        ingest_url(endpoint),
        data=b"x" * 11,
        content_type=(
            "application/octet-stream"
        ),
    )

    assert response.status_code == 413

    assert (
        WebhookRequest.objects.count()
        == 0
    )