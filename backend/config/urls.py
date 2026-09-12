from django.contrib import admin
from django.http import JsonResponse
from django.urls import path


def health_check(_request):
    return JsonResponse(
        {
            "status": "ok",
            "service": "hookwatch-api",
        }
    )


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/health/", health_check),
]