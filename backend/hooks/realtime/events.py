import logging
from functools import partial

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction

logger = logging.getLogger(__name__)


def endpoint_group_name(
    endpoint_id,
) -> str:
    return f"endpoint.{endpoint_id}"


def _safe_group_send(
    endpoint_id,
    message: dict,
) -> None:
    try:
        channel_layer = get_channel_layer()

        if channel_layer is None:
            return

        async_to_sync(
            channel_layer.group_send
        )(
            endpoint_group_name(
                endpoint_id
            ),
            message,
        )
    except Exception:
        logger.exception(
            "Realtime event delivery failed "
            "for endpoint %s.",
            endpoint_id,
        )


def queue_event(
    endpoint_id,
    payload: dict,
) -> None:
    transaction.on_commit(
        partial(
            _safe_group_send,
            endpoint_id,
            {
                "type": "hookwatch.event",
                "payload": payload,
            },
        ),
        robust=True,
    )


def queue_webhook_received(
    captured_request,
) -> None:
    queue_event(
        captured_request.endpoint_id,
        {
            "type": "webhook.received",
            "request": {
                "id": str(
                    captured_request.id
                ),
                "method": (
                    captured_request.method
                ),
                "path": (
                    captured_request.path
                ),
                "content_type": (
                    captured_request
                    .content_type
                ),
                "body_size": (
                    captured_request.body_size
                ),
                "received_at": (
                    captured_request
                    .received_at
                    .isoformat()
                ),
            },
        },
    )


def queue_request_deleted(
    endpoint_id,
    request_id,
) -> None:
    queue_event(
        endpoint_id,
        {
            "type": "request.deleted",
            "request_id": str(
                request_id
            ),
        },
    )


def queue_requests_cleared(
    endpoint_id,
    deleted_count: int,
) -> None:
    queue_event(
        endpoint_id,
        {
            "type": "requests.cleared",
            "deleted_count": (
                deleted_count
            ),
        },
    )


def queue_endpoint_closed(
    endpoint_id,
) -> None:
    queue_event(
        endpoint_id,
        {
            "type": "endpoint.closed",
            "endpoint_id": str(
                endpoint_id
            ),
        },
    )


def queue_endpoint_disconnect(
    endpoint_id,
    *,
    reason: str,
) -> None:
    transaction.on_commit(
        partial(
            _safe_group_send,
            endpoint_id,
            {
                "type": (
                    "hookwatch.disconnect"
                ),
                "reason": reason,
            },
        ),
        robust=True,
    )