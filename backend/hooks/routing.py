from django.urls import path

from .realtime.consumer import (
    EndpointConsumer,
)

websocket_urlpatterns = [
    path(
        (
            "ws/endpoints/"
            "<uuid:endpoint_id>/"
        ),
        EndpointConsumer.as_asgi(),
        name="endpoint-websocket",
    ),
]