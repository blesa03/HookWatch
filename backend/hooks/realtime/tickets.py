import json
import secrets

from django.conf import settings
from redis.exceptions import RedisError

from config.redis_client import (
    get_redis_client,
)

TICKET_PREFIX = (
    "hookwatch:ws-ticket:"
)


class RealtimeStoreUnavailable(
    Exception
):
    pass


def _ticket_key(
    ticket: str,
) -> str:
    return (
        f"{TICKET_PREFIX}{ticket}"
    )


def issue_ws_ticket(
    *,
    endpoint_id,
    principal_type: str,
    principal_id=None,
) -> str:
    ticket = (
        secrets.token_urlsafe(32)
    )

    payload = {
        "endpoint_id": str(
            endpoint_id
        ),
        "principal_type":
            principal_type,
        "principal_id": (
            str(principal_id)
            if principal_id
            is not None
            else None
        ),
    }

    try:
        created = (
            get_redis_client()
            .set(
                _ticket_key(ticket),
                json.dumps(payload),
                ex=(
                    settings
                    .HOOKWATCH_WS_TICKET_TTL
                ),
                nx=True,
            )
        )
    except RedisError as exc:
        raise (
            RealtimeStoreUnavailable
        ) from exc

    if not created:
        return issue_ws_ticket(
            endpoint_id=endpoint_id,
            principal_type=(
                principal_type
            ),
            principal_id=(
                principal_id
            ),
        )

    return ticket


def consume_ws_ticket(
    ticket: str,
) -> dict | None:
    try:
        raw_payload = (
            get_redis_client()
            .getdel(
                _ticket_key(ticket)
            )
        )
    except RedisError as exc:
        raise (
            RealtimeStoreUnavailable
        ) from exc

    if raw_payload is None:
        return None

    try:
        payload = json.loads(
            raw_payload
        )
    except json.JSONDecodeError:
        return None

    if not isinstance(
        payload,
        dict,
    ):
        return None

    return payload