from django.urls import path

from .views import (
    AdoptEndpointView,
    AnonymousEndpointCreateView,
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
]