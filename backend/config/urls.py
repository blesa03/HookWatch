from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path


def health_check(_request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "hookwatch-api",
        }
    )


urlpatterns = [
    path(
        "admin/",
        admin.site.urls,
    ),
    path(
        "api/v1/health/",
        health_check,
    ),
    path(
        "api/v1/auth/",
        include("accounts.urls"),
    ),
    path(
        "api/v1/",
        include("hooks.api_urls"),
    ),
    path(
        "hooks/",
        include("hooks.ingest_urls"),
    ),
]