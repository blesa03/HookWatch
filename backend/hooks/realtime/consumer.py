from urllib.parse import parse_qs

from asgiref.sync import sync_to_async
from channels.db import database_sync_to_async
from channels.generic.websocket import (
    AsyncJsonWebsocketConsumer,
)

from hooks.models import Endpoint

from .events import endpoint_group_name
from .tickets import (
    RealtimeStoreUnavailable,
    consume_ws_ticket,
)


@database_sync_to_async
def ticket_matches_endpoint(
    endpoint_id,
    payload: dict,
) -> bool:
    endpoint = (
        Endpoint.objects
        .filter(id=endpoint_id)
        .only(
            "id",
            "owner_id",
            "is_temporary",
            "state",
            "expires_at",
        )
        .first()
    )

    if endpoint is None:
        return False

    if (
        endpoint.state
        != Endpoint.State.ACTIVE
    ):
        return False

    if endpoint.is_expired:
        return False

    principal_type = payload.get(
        "principal_type"
    )

    if principal_type == "user":
        principal_id = payload.get(
            "principal_id"
        )

        return bool(
            not endpoint.is_temporary
            and endpoint.owner_id
            and str(endpoint.owner_id)
            == principal_id
        )

    if principal_type == "anonymous":
        return bool(
            endpoint.is_temporary
            and endpoint.owner_id is None
        )

    return False


class EndpointConsumer(
    AsyncJsonWebsocketConsumer
):
    async def connect(self):
        endpoint_id = (
            self.scope["url_route"]
            ["kwargs"]["endpoint_id"]
        )

        query = parse_qs(
            self.scope[
                "query_string"
            ].decode("ascii")
        )

        ticket = query.get(
            "ticket",
            [None],
        )[0]

        if not ticket:
            await self.close(
                code=4401,
            )
            return

        try:
            payload = await sync_to_async(
                consume_ws_ticket,
                thread_sensitive=False,
            )(ticket)
        except RealtimeStoreUnavailable:
            await self.close(
                code=1013,
            )
            return

        if payload is None:
            await self.close(
                code=4401,
            )
            return

        if (
            payload.get("endpoint_id")
            != str(endpoint_id)
        ):
            await self.close(
                code=4401,
            )
            return

        if not await ticket_matches_endpoint(
            endpoint_id,
            payload,
        ):
            await self.close(
                code=4401,
            )
            return

        self.endpoint_id = endpoint_id

        self.group_name = (
            endpoint_group_name(
                endpoint_id
            )
        )

        try:
            await self.channel_layer.group_add(
                self.group_name,
                self.channel_name,
            )
        except Exception:
            await self.close(
                code=1013,
            )
            return

        await self.accept()

    async def disconnect(
        self,
        _close_code,
    ):
        group_name = getattr(
            self,
            "group_name",
            None,
        )

        if not group_name:
            return

        try:
            await self.channel_layer.group_discard(
                group_name,
                self.channel_name,
            )
        except Exception:
            pass

    async def hookwatch_event(
        self,
        event,
    ):
        payload = event["payload"]

        await self.send_json(payload)

        if (
            payload.get("type")
            == "endpoint.closed"
        ):
            await self.close(
                code=4004,
            )

    async def hookwatch_disconnect(
        self,
        event,
    ):
        await self.close(
            code=4001,
            reason=event.get(
                "reason",
                "access_changed",
            ),
        )