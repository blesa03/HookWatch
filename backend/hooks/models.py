import uuid

from django.conf import settings
from django.db import models
from django.utils import timezone

from .tokens import (
    generate_ingest_token,
    verify_token,
)


class Endpoint(models.Model):
    class State(models.TextChoices):
        ACTIVE = "active", "Active"
        DISABLED = "disabled", "Disabled"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="endpoints",
        null=True,
        blank=True,
    )

    name = models.CharField(
        max_length=120,
        default="Temporary endpoint",
    )

    ingest_token = models.CharField(
        max_length=64,
        unique=True,
        default=generate_ingest_token,
        editable=False,
    )

    management_token_hash = models.CharField(
        max_length=64,
        blank=True,
        default="",
        editable=False,
    )

    is_temporary = models.BooleanField(
        default=False,
    )

    state = models.CharField(
        max_length=16,
        choices=State.choices,
        default=State.ACTIVE,
    )

    expires_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ("-created_at",)

        indexes = [
            models.Index(
                fields=["owner", "-created_at"],
                name="hooks_ep_owner_created",
            ),
        ]

        constraints = [
            models.CheckConstraint(
                condition=(
                    models.Q(
                        is_temporary=True,
                        owner__isnull=True,
                    )
                    | models.Q(
                        is_temporary=False,
                        owner__isnull=False,
                    )
                ),
                name="hooks_ep_owner_temp",
            ),
            models.CheckConstraint(
                condition=(
                    models.Q(
                        is_temporary=True,
                        expires_at__isnull=False,
                    )
                    | models.Q(
                        is_temporary=False,
                        expires_at__isnull=True,
                    )
                ),
                name="hooks_ep_expiry_temp",
            ),
        ]

    @property
    def is_expired(self) -> bool:
        return bool(
            self.expires_at
            and self.expires_at <= timezone.now()
        )

    @property
    def status(self) -> str:
        if self.is_expired:
            return "expired"

        return self.state

    def verify_management_token(
        self,
        raw_token: str,
    ) -> bool:
        return verify_token(
            raw_token,
            self.management_token_hash,
        )

    def __str__(self) -> str:  # noqa: DJ012
        return self.name


class WebhookRequest(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    endpoint = models.ForeignKey(
        Endpoint,
        on_delete=models.CASCADE,
        related_name="requests",
    )

    method = models.CharField(
        max_length=10,
    )

    path = models.TextField()

    headers = models.JSONField(
        default=dict,
    )

    query_params = models.JSONField(
        default=dict,
    )

    content_type = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    body_raw = models.BinaryField(
        blank=True,
        default=bytes,
    )

    parsed_json = models.JSONField(
        null=True,
        blank=True,
    )

    body_size = models.PositiveBigIntegerField(
        default=0,
    )

    source_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    received_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ("-received_at",)

        indexes = [
            models.Index(
                fields=[
                    "endpoint",
                    "-received_at",
                ],
                name="hooks_req_ep_received",
            ),
            models.Index(
                fields=[
                    "endpoint",
                    "method",
                ],
                name="hooks_req_ep_method",
            ),
        ]

    def __str__(self) -> str:
        return (
            f"{self.method} "
            f"{self.endpoint_id} "
            f"{self.received_at.isoformat()}"
        )