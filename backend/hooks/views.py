from rest_framework import status
from rest_framework.exceptions import (
    NotFound,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import (
    AdoptEndpointSerializer,
    EndpointSerializer,
)
from .services import (
    EndpointAdoptionError,
    adopt_temporary_endpoint,
    create_temporary_endpoint,
)


class AnonymousEndpointCreateView(
    APIView
):
    permission_classes = (AllowAny,)

    def post(self, request):
        endpoint, management_token = (
            create_temporary_endpoint()
        )

        return Response(
            {
                "endpoint": (
                    EndpointSerializer(
                        endpoint,
                        context={
                            "request": request
                        },
                    ).data
                ),
                "management_token": (
                    management_token
                ),
            },
            status=status.HTTP_201_CREATED,
        )


class AdoptEndpointView(APIView):
    permission_classes = (
        IsAuthenticated,
    )

    def post(self, request):
        serializer = (
            AdoptEndpointSerializer(
                data=request.data
            )
        )

        serializer.is_valid(
            raise_exception=True
        )

        management_token = (
            request.headers.get(
                "X-HookWatch-Management-Token"
            )
        )

        if not management_token:
            raise NotFound(
                "Endpoint not found."
            )

        try:
            endpoint = (
                adopt_temporary_endpoint(
                    endpoint_id=(
                        serializer.validated_data[
                            "endpoint_id"
                        ]
                    ),
                    management_token=(
                        management_token
                    ),
                    user=request.user,
                )
            )
        except EndpointAdoptionError as exc:
            raise NotFound(
                "Endpoint not found."
            ) from exc

        return Response(
            EndpointSerializer(
                endpoint,
                context={
                    "request": request
                },
            ).data
        )