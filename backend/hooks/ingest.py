import json

from django.conf import settings
from django.db import transaction
from django.http import (
    HttpRequest,
    JsonResponse,
)
from django.views.decorators.csrf import csrf_exempt

from .models import Endpoint, WebhookRequest

ALLOWED_METHODS = (
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
)


def _error_response(
    message: str,
    *,
    status: int,
) -> JsonResponse:
    return JsonResponse(
        {
            "error": {
                "message": message,
            }
        },
        status=status,
    )


def _get_endpoint(
    ingest_token: str,
) -> Endpoint | None:
    return (
        Endpoint.objects.filter(
            ingest_token=ingest_token
        )
        .only(
            "id",
            "state",
            "expires_at",
        )
        .first()
    )


def _query_params(
    request: HttpRequest,
) -> dict[str, list[str]]:
    return {
        key: values
        for key, values
        in request.GET.lists()
    }


def _headers(
    request: HttpRequest,
) -> dict[str, str]:
    return {
        key: value
        for key, value
        in request.headers.items()
    }


def _source_ip(
    request: HttpRequest,
) -> str | None:
    return request.META.get(
        "REMOTE_ADDR"
    )


def _content_type(
    request: HttpRequest,
) -> str:
    return request.headers.get(
        "Content-Type",
        "",
    )


def _is_json_content_type(
    content_type: str,
) -> bool:
    media_type = (
        content_type.split(";", 1)[0]
        .strip()
        .lower()
    )

    return (
        media_type == "application/json"
        or media_type.endswith("+json")
    )


def _parse_json(
    body: bytes,
    content_type: str,
):
    if not body:
        return None

    if not _is_json_content_type(
        content_type
    ):
        return None

    try:
        return json.loads(
            body.decode("utf-8")
        )
    except (
        UnicodeDecodeError,
        json.JSONDecodeError,
    ):
        return None


def _content_length_exceeds_limit(
    request: HttpRequest,
) -> bool:
    raw_content_length = (
        request.META.get(
            "CONTENT_LENGTH"
        )
    )

    if not raw_content_length:
        return False

    try:
        content_length = int(
            raw_content_length
        )
    except (TypeError, ValueError):
        return False

    return (
        content_length
        > settings.HOOKWATCH_MAX_BODY_SIZE
    )


def _read_body(
    request: HttpRequest,
) -> bytes | None:
    if _content_length_exceeds_limit(
        request
    ):
        return None

    body = request.read(
        settings.HOOKWATCH_MAX_BODY_SIZE
        + 1
    )

    if (
        len(body)
        > settings.HOOKWATCH_MAX_BODY_SIZE
    ):
        return None

    return body


def _captured_path(
    request_path: str,
) -> str:
    if not request_path:
        return "/"

    return f"/{request_path}"


@csrf_exempt
def ingest_webhook(
    request: HttpRequest,
    ingest_token: str,
    request_path: str = "",
) -> JsonResponse:
    if request.method not in ALLOWED_METHODS:
        response = _error_response(
            "Method not allowed.",
            status=405,
        )

        response["Allow"] = ", ".join(
            ALLOWED_METHODS
        )

        return response

    endpoint = _get_endpoint(
        ingest_token
    )

    if endpoint is None:
        return _error_response(
            "Endpoint not found.",
            status=404,
        )

    if (
        endpoint.state
        != Endpoint.State.ACTIVE
    ):
        return _error_response(
            "Endpoint not found.",
            status=404,
        )

    if endpoint.is_expired:
        return _error_response(
            "Endpoint expired.",
            status=410,
        )

    body = _read_body(request)

    if body is None:
        return _error_response(
            "Payload too large.",
            status=413,
        )

    content_type = _content_type(
        request
    )

    with transaction.atomic():
        captured_request = (
            WebhookRequest.objects.create(
                endpoint=endpoint,
                method=request.method,
                path=_captured_path(
                    request_path
                ),
                headers=_headers(request),
                query_params=_query_params(
                    request
                ),
                content_type=content_type,
                body_raw=body,
                parsed_json=_parse_json(
                    body,
                    content_type,
                ),
                body_size=len(body),
                source_ip=_source_ip(
                    request
                ),
            )
        )

    return JsonResponse(
        {
            "status": "captured",
            "request_id": str(
                captured_request.id
            ),
        },
        status=200,
    )