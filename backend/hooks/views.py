from uuid import UUID

from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.exceptions import NotFound
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from .access import (
    MANAGEMENT_TOKEN_HEADER,
    endpoint_queryset,
    get_accessible_endpoint,
)
from .models import WebhookRequest
from .pagination import RequestCursorPagination
from .realtime.events import (
    queue_endpoint_closed,
    queue_request_deleted,
    queue_requests_cleared,
)
from .serializers import (
    AdoptEndpointSerializer,
    EndpointCreateSerializer,
    EndpointSerializer,
    EndpointUpdateSerializer,
    RequestFilterSerializer,
    WebhookRequestDetailSerializer,
    WebhookRequestSummarySerializer,
)
from .services import (
    EndpointAdoptionError,
    adopt_temporary_endpoint,
    create_temporary_endpoint,
)


def _get_request_or_404(
    endpoint,
    request_id,
) -> WebhookRequest:
    captured_request = (
        WebhookRequest.objects
        .filter(
            endpoint=endpoint,
            id=request_id,
        )
        .first()
    )

    if captured_request is None:
        raise NotFound(
            "Request not found."
        )

    return captured_request


class AnonymousEndpointCreateView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        endpoint, management_token = (
            create_temporary_endpoint()
        )

        return Response(
            {
                "endpoint": EndpointSerializer(
                    endpoint,
                    context={
                        "request": request,
                    },
                ).data,
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
        serializer = AdoptEndpointSerializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )

        management_token = (
            request.headers.get(
                MANAGEMENT_TOKEN_HEADER
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
                    "request": request,
                },
            ).data
        )


class EndpointListCreateView(APIView):
    permission_classes = (
        IsAuthenticated,
    )

    def get(self, request):
        endpoints = (
            endpoint_queryset()
            .filter(owner=request.user)
            .order_by("-created_at")
        )

        return Response(
            EndpointSerializer(
                endpoints,
                many=True,
                context={
                    "request": request,
                },
            ).data
        )

    def post(self, request):
        serializer = EndpointCreateSerializer(
            data=request.data
        )
        serializer.is_valid(
            raise_exception=True
        )

        endpoint = serializer.save(
            owner=request.user,
            is_temporary=False,
        )

        return Response(
            EndpointSerializer(
                endpoint,
                context={
                    "request": request,
                },
            ).data,
            status=status.HTTP_201_CREATED,
        )


class EndpointDetailView(APIView):
    permission_classes = (AllowAny,)

    def get(self, request, endpoint_id):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        return Response(
            EndpointSerializer(
                endpoint,
                context={
                    "request": request,
                },
            ).data
        )

    def patch(
        self,
        request,
        endpoint_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        serializer = EndpointUpdateSerializer(
            endpoint,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(
            raise_exception=True
        )

        endpoint = serializer.save()

        return Response(
            EndpointSerializer(
                endpoint,
                context={
                    "request": request,
                },
            ).data
        )

    def delete(
        self,
        request,
        endpoint_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        endpoint_id = endpoint.id

        with transaction.atomic():
            endpoint.delete()

            queue_endpoint_closed(
                endpoint_id
            )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class EndpointRequestListView(APIView):
    permission_classes = (AllowAny,)

    def get(
        self,
        request,
        endpoint_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        filter_serializer = (
            RequestFilterSerializer(
                data=request.query_params
            )
        )
        filter_serializer.is_valid(
            raise_exception=True
        )

        filters = (
            filter_serializer.validated_data
        )

        queryset = (
            WebhookRequest.objects
            .filter(endpoint=endpoint)
        )

        method = filters.get("method")

        if method:
            queryset = queryset.filter(
                method=method
            )

        search = filters.get("search")

        if search:
            search_query = (
                Q(path__icontains=search)
                | Q(method__icontains=search)
                | Q(
                    content_type__icontains=(
                        search
                    )
                )
            )

            try:
                request_uuid = UUID(search)
            except ValueError:
                pass
            else:
                search_query |= Q(
                    id=request_uuid
                )

            queryset = queryset.filter(
                search_query
            )

        start = filters.get("from")

        if start:
            queryset = queryset.filter(
                received_at__gte=start
            )

        end = filters.get("to")

        if end:
            queryset = queryset.filter(
                received_at__lte=end
            )

        paginator = (
            RequestCursorPagination()
        )

        paginator.ordering = filters[
            "ordering"
        ]

        page = paginator.paginate_queryset(
            queryset,
            request,
            view=self,
        )

        return paginator.get_paginated_response(
            WebhookRequestSummarySerializer(
                page,
                many=True,
            ).data
        )


class EndpointRequestDetailView(
    APIView
):
    permission_classes = (AllowAny,)

    def get(
        self,
        request,
        endpoint_id,
        request_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        captured_request = (
            _get_request_or_404(
                endpoint,
                request_id,
            )
        )

        return Response(
            WebhookRequestDetailSerializer(
                captured_request
            ).data
        )

    def delete(
        self,
        request,
        endpoint_id,
        request_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        captured_request = (
            _get_request_or_404(
                endpoint,
                request_id,
            )
        )

        with transaction.atomic():
            captured_request.delete()

            queue_request_deleted(
                endpoint.id,
                request_id,
            )

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )

        captured_request.delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT
        )


class EndpointRequestClearView(
    APIView
):
    permission_classes = (AllowAny,)

    def post(
        self,
        request,
        endpoint_id,
    ):
        endpoint = get_accessible_endpoint(
            request,
            endpoint_id,
        )

        with transaction.atomic():
            deleted_count, _ = (
                endpoint.requests
                .all()
                .delete()
            )

            queue_requests_cleared(
                endpoint.id,
                deleted_count,
            )

        return Response(
            {
                "deleted_count": (
                    deleted_count
                )
            }
        )