from rest_framework.exceptions import (
    ValidationError,
)
from rest_framework.views import (
    exception_handler,
)


def _message_from_data(data) -> str:
    if isinstance(data, dict):
        detail = data.get("detail")

        if isinstance(detail, str):
            return detail

    if isinstance(data, list) and data:
        if isinstance(data[0], str):
            return data[0]

    if isinstance(data, str):
        return data

    return "Request failed."


def hookwatch_exception_handler(
    exc,
    context,
):
    response = exception_handler(
        exc,
        context,
    )

    if response is None:
        return None

    if isinstance(exc, ValidationError):
        response.data = {
            "error": {
                "code": "validation_error",
                "message": (
                    "Validation failed."
                ),
                "fields": response.data,
            }
        }

        return response

    code = getattr(
        exc,
        "default_code",
        "api_error",
    )

    if isinstance(response.data, dict):
        raw_code = response.data.get(
            "code"
        )

        if isinstance(raw_code, str):
            code = raw_code

    message = _message_from_data(
        response.data
    )

    response.data = {
        "error": {
            "code": str(code),
            "message": message,
        }
    }

    return response