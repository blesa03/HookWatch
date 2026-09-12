import pytest
from asgiref.sync import (
    async_to_sync,
)
from channels.testing import (
    WebsocketCommunicator,
)

from config.asgi import application
from hooks.models import Endpoint
from hooks.realtime.tickets import (
    consume_ws_ticket,
)
from hooks.services import (
    create_temporary_endpoint,
)

pytestmark = pytest.mark.django_db(
    transaction=True
)


def create_endpoint(user):
    return Endpoint.objects.create(
        owner=user,
        name="Realtime endpoint",
    )


def issue_ticket(
    api_client,
    endpoint,
):
    response = api_client.post(
        "/api/v1/ws/tickets/",
        {
            "endpoint_id": str(
                endpoint.id
            )
        },
        format="json",
    )

    assert response.status_code == 201

    return response.data["ticket"]


def test_user_can_issue_single_use_ticket(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    api_client.force_authenticate(
        user=user
    )

    ticket = issue_ticket(
        api_client,
        endpoint,
    )

    payload = consume_ws_ticket(
        ticket
    )

    assert payload is not None

    assert payload[
        "endpoint_id"
    ] == str(endpoint.id)

    assert (
        payload["principal_type"]
        == "user"
    )

    assert (
        consume_ws_ticket(ticket)
        is None
    )


def test_anonymous_endpoint_can_issue_ticket(
    api_client,
):
    endpoint, management_token = (
        create_temporary_endpoint()
    )

    response = api_client.post(
        "/api/v1/ws/tickets/",
        {
            "endpoint_id": str(
                endpoint.id
            )
        },
        format="json",
        HTTP_X_HOOKWATCH_MANAGEMENT_TOKEN=(
            management_token
        ),
    )

    assert response.status_code == 201


def test_ticket_connects_only_once(
    api_client,
    user,
):
    endpoint = create_endpoint(user)

    api_client.force_authenticate(
        user=user
    )

    ticket = issue_ticket(
        api_client,
        endpoint,
    )

    async def scenario():
        path = (
            f"/ws/endpoints/"
            f"{endpoint.id}/"
            f"?ticket={ticket}"
        )

        first = WebsocketCommunicator(
            application,
            path,
            headers=[
                (
                    b"origin",
                    b"http://localhost:5173",
                )
            ],
        )

        connected, _ = (
            await first.connect()
        )

        assert connected

        await first.disconnect()

        second = WebsocketCommunicator(
            application,
            path,
            headers=[
                (
                    b"origin",
                    b"http://localhost:5173",
                )
            ],
        )

        connected, _ = (
            await second.connect()
        )

        assert not connected

        await second.disconnect()

    async_to_sync(scenario)()


def test_ticket_is_scoped_to_endpoint(
    api_client,
    user,
):
    first_endpoint = (
        create_endpoint(user)
    )

    second_endpoint = (
        create_endpoint(user)
    )

    api_client.force_authenticate(
        user=user
    )

    ticket = issue_ticket(
        api_client,
        first_endpoint,
    )

    async def scenario():
        communicator = (
            WebsocketCommunicator(
                application,
                (
                    f"/ws/endpoints/"
                    f"{second_endpoint.id}/"
                    f"?ticket={ticket}"
                ),
                headers=[
                    (
                        b"origin",
                        (
                            b"http://"
                            b"localhost:5173"
                        ),
                    )
                ],
            )
        )

        connected, _ = (
            await communicator.connect()
        )

        assert not connected

        await communicator.disconnect()

    async_to_sync(scenario)()