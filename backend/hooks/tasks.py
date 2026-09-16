from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .models import Endpoint
from .realtime.events import (
    queue_endpoint_closed,
)

CLEANUP_BATCH_SIZE = 500


@shared_task(
    name=(
        "hooks.cleanup_expired_"
        "temporary_endpoints"
    ),
    ignore_result=True,
)
def cleanup_expired_temporary_endpoints():
    deleted_total = 0

    while True:
        now = timezone.now()

        with transaction.atomic():
            endpoint_ids = list(
                Endpoint.objects
                .select_for_update(
                    skip_locked=True
                )
                .filter(
                    is_temporary=True,
                    expires_at__lte=now,
                )
                .order_by(
                    "expires_at"
                )
                .values_list(
                    "id",
                    flat=True,
                )[:CLEANUP_BATCH_SIZE]
            )

            if not endpoint_ids:
                break

            (
                Endpoint.objects
                .filter(
                    id__in=endpoint_ids,
                    is_temporary=True,
                    expires_at__lte=now,
                )
                .delete()
            )

            for endpoint_id in (
                endpoint_ids
            ):
                queue_endpoint_closed(
                    endpoint_id
                )

        deleted_total += len(
            endpoint_ids
        )

        if (
            len(endpoint_ids)
            < CLEANUP_BATCH_SIZE
        ):
            break

    return deleted_total