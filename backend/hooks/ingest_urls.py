from django.urls import path

from .ingest import ingest_webhook

urlpatterns = [
    path(
        "<str:ingest_token>/",
        ingest_webhook,
        name="webhook-ingest",
    ),
    path(
        "<str:ingest_token>/<path:request_path>",
        ingest_webhook,
        name="webhook-ingest-path",
    ),
]