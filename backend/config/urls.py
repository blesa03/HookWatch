from django.contrib import admin
from django.urls import (
    include,
    path,
)

from .health import (
    liveness_check,
    readiness_check,
)

urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),
    path(
        "api/v1/health/",
        liveness_check,
    ),
    path(
        "api/v1/health/live/",
        liveness_check,
    ),
    path(
        "api/v1/health/ready/",
        readiness_check,
    ),
    path(
        "api/v1/auth/",
        include(
            "accounts.urls"
        ),
    ),
    path(
        "api/v1/",
        include(
            "hooks.api_urls"
        ),
    ),
    path(
        "hooks/",
        include(
            "hooks.ingest_urls"
        ),
    ),
]