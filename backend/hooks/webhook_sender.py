import json
from urllib.error import (
    HTTPError,
    URLError,
)
from urllib.request import (
    Request,
    urlopen,
)

from django.conf import settings


class TestSendError(Exception):
    pass


def _target_url(endpoint) -> str:
    base_url = (
        settings
        .HOOKWATCH_INTERNAL_BASE_URL
        .rstrip("/")
    )

    return (
        f"{base_url}/hooks/"
        f"{endpoint.ingest_token}/"
    )


def send_test_webhook(
    *,
    endpoint,
    method: str,
    content_type: str,
    body: str,
) -> dict:
    raw_body = (
        body.encode("utf-8")
        if body
        else None
    )

    request = Request(
        _target_url(endpoint),
        data=raw_body,
        method=method,
        headers={
            "Content-Type": content_type,
            "User-Agent": (
                "HookWatch-TestSender/1.0"
            ),
            "X-HookWatch-Test": "true",
        },
    )

    try:
        with urlopen(
            request,
            timeout=(
                settings
                .HOOKWATCH_TEST_REQUEST_TIMEOUT
            ),
        ) as response:
            raw_response = (
                response.read()
            )

            status_code = (
                response.status
            )
    except HTTPError as exc:
        try:
            detail = (
                exc.read()
                .decode("utf-8")
            )
        except Exception:
            detail = ""

        raise TestSendError(
            detail
            or (
                "The test request was "
                f"rejected with HTTP "
                f"{exc.code}."
            )
        ) from exc
    except URLError as exc:
        raise TestSendError(
            "HookWatch could not reach "
            "its ingest endpoint."
        ) from exc

    try:
        payload = json.loads(
            raw_response.decode("utf-8")
        )
    except (
        UnicodeDecodeError,
        json.JSONDecodeError,
    ) as exc:
        raise TestSendError(
            "The ingest endpoint returned "
            "an invalid response."
        ) from exc

    return {
        "status_code": status_code,
        "request_id": payload.get(
            "request_id"
        ),
    }