from django.urls import path

from .realtime.views import (
    WebSocketTicketView,
)
from .views import (
    AdoptEndpointView,
    AnonymousEndpointCreateView,
    EndpointDetailView,
    EndpointListCreateView,
    EndpointRequestClearView,
    EndpointRequestDetailView,
    EndpointRequestListView,
)

urlpatterns = [
    path(
        "anonymous/endpoints/",
        AnonymousEndpointCreateView.as_view(),
        name="anonymous-endpoint-create",
    ),
    path(
        "endpoints/adopt/",
        AdoptEndpointView.as_view(),
        name="endpoint-adopt",
    ),
    path(
        "endpoints/",
        EndpointListCreateView.as_view(),
        name="endpoint-list-create",
    ),
    path(
        "endpoints/<uuid:endpoint_id>/",
        EndpointDetailView.as_view(),
        name="endpoint-detail",
    ),
    path(
        (
            "endpoints/<uuid:endpoint_id>/"
            "requests/clear/"
        ),
        EndpointRequestClearView.as_view(),
        name="endpoint-request-clear",
    ),
    path(
        (
            "endpoints/<uuid:endpoint_id>/"
            "requests/<uuid:request_id>/"
        ),
        EndpointRequestDetailView.as_view(),
        name="endpoint-request-detail",
    ),
    path(
        (
            "endpoints/<uuid:endpoint_id>/"
            "requests/"
        ),
        EndpointRequestListView.as_view(),
        name="endpoint-request-list",
    ),
    path(
        "ws/tickets/",
        WebSocketTicketView.as_view(),
        name="websocket-ticket",
    ),
]