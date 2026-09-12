from django.conf import settings
from rest_framework import serializers, status
from rest_framework.exceptions import (
    APIException,
)
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from hooks.access import (
    get_accessible_endpoint,
)

from .tickets import (
    RealtimeStoreUnavailable,
    issue_ws_ticket,
)


class RealtimeUnavailable(APIException):
    status_code = (
        status.HTTP_503_SERVICE_UNAVAILABLE
    )
    default_detail = (
        "Realtime service unavailable."
    )
    default_code = "realtime_unavailable"


class WebSocketTicketSerializer(
    serializers.Serializer
):
    endpoint_id = serializers.UUIDField()


class WebSocketTicketView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = (
            WebSocketTicketSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        endpoint = (
            get_accessible_endpoint(
                request,
                serializer.validated_data[
                    "endpoint_id"
                ],
            )
        )

        if (
            request.user.is_authenticated
            and endpoint.owner_id
            == request.user.id
        ):
            principal_type = "user"
            principal_id = request.user.id
        else:
            principal_type = "anonymous"
            principal_id = None

        try:
            ticket = issue_ws_ticket(
                endpoint_id=endpoint.id,
                principal_type=(
                    principal_type
                ),
                principal_id=principal_id,
            )
        except (
            RealtimeStoreUnavailable
        ) as exc:
            raise RealtimeUnavailable() from exc

        return Response(
            {
                "ticket": ticket,
                "expires_in": (
                    settings.HOOKWATCH_WS_TICKET_TTL
                ),
            },
            status=status.HTTP_201_CREATED,
        )