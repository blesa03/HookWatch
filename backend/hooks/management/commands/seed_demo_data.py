import json
import uuid
from datetime import timedelta
from typing import Any

from django.contrib.auth import get_user_model
from django.core.management.base import (
    BaseCommand,
    CommandError,
)
from django.db import transaction
from django.utils import timezone

from hooks.models import (
    Endpoint,
    WebhookRequest,
)

DEMO_ENDPOINT_NAMES = (
    "GitHub · Production",
    "Stripe · Checkout",
    "Shopify · Orders",
    "Internal API · Staging",
    "Legacy Billing",
)


def _json_bytes(
    value: Any,
) -> bytes:
    return json.dumps(
        value,
        indent=2,
        ensure_ascii=False,
    ).encode("utf-8")


def _create_request(
    endpoint: Endpoint,
    *,
    minutes_ago: int,
    method: str,
    path: str,
    headers: dict[str, str],
    query_params: dict[
        str,
        list[str],
    ] | None = None,
    content_type: str = "",
    body: bytes = b"",
    parsed_json: Any = None,
    source_ip: str = "203.0.113.10",
) -> None:
    captured = (
        WebhookRequest.objects.create(
            endpoint=endpoint,
            method=method,
            path=path,
            headers=headers,
            query_params=(
                query_params
                or {}
            ),
            content_type=content_type,
            body_raw=body,
            parsed_json=parsed_json,
            body_size=len(body),
            source_ip=source_ip,
        )
    )

    WebhookRequest.objects.filter(
        pk=captured.pk,
    ).update(
        received_at=(
            timezone.now()
            - timedelta(
                minutes=minutes_ago
            )
        )
    )


def _create_json_request(
    endpoint: Endpoint,
    *,
    minutes_ago: int,
    method: str = "POST",
    path: str,
    headers: dict[str, str],
    payload: Any,
    query_params: dict[
        str,
        list[str],
    ] | None = None,
    source_ip: str = "203.0.113.10",
) -> None:
    body = _json_bytes(payload)

    _create_request(
        endpoint,
        minutes_ago=minutes_ago,
        method=method,
        path=path,
        headers={
            **headers,
            "Content-Type":
                "application/json",
        },
        query_params=query_params,
        content_type=(
            "application/json"
        ),
        body=body,
        parsed_json=payload,
        source_ip=source_ip,
    )


def _create_endpoint(
    user,
    *,
    name: str,
    days_ago: int,
    state: str = Endpoint.State.ACTIVE,
) -> Endpoint:
    endpoint = Endpoint.objects.create(
        owner=user,
        name=name,
        state=state,
        is_temporary=False,
    )

    Endpoint.objects.filter(
        pk=endpoint.pk,
    ).update(
        created_at=(
            timezone.now()
            - timedelta(
                days=days_ago
            )
        )
    )

    return endpoint


def _seed_github(
    endpoint: Endpoint,
) -> None:
    repository = {
        "id": 912_438_221,
        "name": "hookwatch-api",
        "full_name":
            "acme/hookwatch-api",
        "private": True,
        "html_url": (
            "https://github.com/"
            "acme/hookwatch-api"
        ),
        "default_branch": "main",
    }

    events = [
        (
            4,
            "push",
            "/github/push",
            {
                "ref":
                    "refs/heads/main",
                "before":
                    "b79a0e1",
                "after":
                    "fa241c9",
                "repository":
                    repository,
                "pusher": {
                    "name":
                        "maria-dev",
                },
                "commits": [
                    {
                        "id":
                            "fa241c9",
                        "message":
                            (
                                "fix: validate "
                                "checkout payload"
                            ),
                        "author": {
                            "name":
                                "Maria López",
                        },
                    },
                ],
            },
        ),
        (
            18,
            "pull_request",
            "/github/pull-request",
            {
                "action": "opened",
                "number": 184,
                "repository":
                    repository,
                "pull_request": {
                    "title":
                        (
                            "Add webhook "
                            "retry policy"
                        ),
                    "state": "open",
                    "draft": False,
                    "user": {
                        "login":
                            "andresm",
                    },
                    "base": {
                        "ref": "main",
                    },
                    "head": {
                        "ref":
                            (
                                "feat/"
                                "webhook-retries"
                            ),
                    },
                },
            },
        ),
        (
            41,
            "workflow_run",
            "/github/actions",
            {
                "action": "completed",
                "repository":
                    repository,
                "workflow_run": {
                    "name": "CI",
                    "status":
                        "completed",
                    "conclusion":
                        "success",
                    "head_branch":
                        "main",
                    "run_number":
                        428,
                },
            },
        ),
        (
            77,
            "issues",
            "/github/issues",
            {
                "action": "opened",
                "repository":
                    repository,
                "issue": {
                    "number": 93,
                    "title":
                        (
                            "Webhook delivery "
                            "occasionally delayed"
                        ),
                    "state": "open",
                    "user": {
                        "login":
                            "luciaqa",
                    },
                },
            },
        ),
        (
            126,
            "push",
            "/github/push",
            {
                "ref":
                    (
                        "refs/heads/"
                        "release/v2.4"
                    ),
                "repository":
                    repository,
                "pusher": {
                    "name":
                        "release-bot",
                },
                "commits": [
                    {
                        "id":
                            "98cf134",
                        "message":
                            (
                                "chore: prepare "
                                "v2.4.0"
                            ),
                    },
                ],
            },
        ),
        (
            184,
            "pull_request",
            "/github/pull-request",
            {
                "action": "closed",
                "number": 181,
                "repository":
                    repository,
                "pull_request": {
                    "title":
                        (
                            "Improve API "
                            "rate limits"
                        ),
                    "state":
                        "closed",
                    "merged": True,
                    "user": {
                        "login":
                            "david-backend",
                    },
                },
            },
        ),
        (
            272,
            "release",
            "/github/release",
            {
                "action":
                    "published",
                "repository":
                    repository,
                "release": {
                    "tag_name":
                        "v2.3.1",
                    "name":
                        "v2.3.1",
                    "prerelease":
                        False,
                    "author": {
                        "login":
                            "release-bot",
                    },
                },
            },
        ),
        (
            390,
            "push",
            "/github/push",
            {
                "ref":
                    (
                        "refs/heads/"
                        "feat/audit-log"
                    ),
                "repository":
                    repository,
                "pusher": {
                    "name": "alex",
                },
                "commits": [
                    {
                        "id":
                            "147acdf",
                        "message":
                            (
                                "feat: persist "
                                "audit events"
                            ),
                    },
                    {
                        "id":
                            "9479a6e",
                        "message":
                            (
                                "test: cover "
                                "audit serializer"
                            ),
                    },
                ],
            },
        ),
        (
            535,
            "issues",
            "/github/issues",
            {
                "action": "closed",
                "repository":
                    repository,
                "issue": {
                    "number": 88,
                    "title":
                        (
                            "Document webhook "
                            "signatures"
                        ),
                    "state": "closed",
                },
            },
        ),
        (
            720,
            "workflow_run",
            "/github/actions",
            {
                "action": "completed",
                "repository":
                    repository,
                "workflow_run": {
                    "name":
                        "Deploy production",
                    "status":
                        "completed",
                    "conclusion":
                        "success",
                    "head_branch":
                        "main",
                    "run_number":
                        421,
                },
            },
        ),
        (
            980,
            "push",
            "/github/push",
            {
                "ref":
                    "refs/heads/main",
                "repository":
                    repository,
                "pusher": {
                    "name":
                        "sara-web",
                },
                "commits": [
                    {
                        "id":
                            "badd20c",
                        "message":
                            (
                                "feat: redesign "
                                "dashboard"
                            ),
                    },
                ],
            },
        ),
        (
            1_330,
            "pull_request",
            "/github/pull-request",
            {
                "action":
                    "synchronize",
                "number": 176,
                "repository":
                    repository,
                "pull_request": {
                    "title":
                        (
                            "Add checkout "
                            "telemetry"
                        ),
                    "state": "open",
                },
            },
        ),
    ]

    for (
        minutes_ago,
        event_name,
        path,
        payload,
    ) in events:
        delivery = str(
            uuid.uuid4()
        )

        _create_json_request(
            endpoint,
            minutes_ago=(
                minutes_ago
            ),
            path=path,
            headers={
                "Accept":
                    "*/*",
                "User-Agent":
                    (
                        "GitHub-Hookshot/"
                        "a1b2c3d"
                    ),
                "X-GitHub-Event":
                    event_name,
                "X-GitHub-Delivery":
                    delivery,
                "X-Hub-Signature-256":
                    (
                        "sha256="
                        "7b47c9c82a0d"
                        "fe93d85a1f40"
                    ),
            },
            payload=payload,
            source_ip=(
                "192.0.2.42"
            ),
        )


def _seed_stripe(
    endpoint: Endpoint,
) -> None:
    event_types = [
        (
            9,
            "checkout.session.completed",
            {
                "id":
                    "cs_live_demo01",
                "amount_total":
                    14900,
                "currency":
                    "eur",
                "customer_email":
                    (
                        "ana@example.com"
                    ),
                "payment_status":
                    "paid",
            },
        ),
        (
            53,
            "payment_intent.succeeded",
            {
                "id":
                    "pi_demo_4812",
                "amount":
                    7999,
                "currency": "eur",
                "status":
                    "succeeded",
            },
        ),
        (
            119,
            "invoice.paid",
            {
                "id":
                    "in_demo_291",
                "customer":
                    "cus_demo_42",
                "amount_paid":
                    2900,
                "currency":
                    "eur",
            },
        ),
        (
            246,
            (
                "customer.subscription."
                "updated"
            ),
            {
                "id":
                    "sub_demo_pro",
                "customer":
                    "cus_demo_42",
                "status":
                    "active",
                "plan": {
                    "nickname":
                        "Pro",
                },
            },
        ),
        (
            418,
            "payment_intent.failed",
            {
                "id":
                    "pi_demo_4701",
                "amount":
                    4900,
                "currency":
                    "eur",
                "status":
                    (
                        "requires_"
                        "payment_method"
                    ),
            },
        ),
        (
            810,
            "charge.refunded",
            {
                "id":
                    "ch_demo_901",
                "amount":
                    2499,
                "amount_refunded":
                    2499,
                "currency":
                    "eur",
            },
        ),
        (
            1_220,
            "invoice.payment_failed",
            {
                "id":
                    "in_demo_282",
                "customer":
                    "cus_demo_31",
                "attempt_count":
                    2,
            },
        ),
        (
            1_760,
            "customer.created",
            {
                "id":
                    "cus_demo_55",
                "email":
                    (
                        "jorge@example.com"
                    ),
                "name":
                    "Jorge Martín",
            },
        ),
    ]

    for (
        minutes_ago,
        event_type,
        event_object,
    ) in event_types:
        payload = {
            "id": (
                "evt_"
                + uuid.uuid4().hex[:16]
            ),
            "object": "event",
            "api_version":
                "2026-08-15",
            "created": int(
                (
                    timezone.now()
                    - timedelta(
                        minutes=
                            minutes_ago
                    )
                ).timestamp()
            ),
            "type": event_type,
            "livemode": True,
            "data": {
                "object":
                    event_object,
            },
        }

        _create_json_request(
            endpoint,
            minutes_ago=(
                minutes_ago
            ),
            path="/stripe/events",
            headers={
                "Accept": "*/*",
                "User-Agent":
                    (
                        "Stripe/"
                        "1.0 (+https://"
                        "stripe.com/docs/"
                        "webhooks)"
                    ),
                "Stripe-Signature":
                    (
                        "t=1789550000,"
                        "v1=demo_signature"
                    ),
            },
            payload=payload,
            source_ip=(
                "198.51.100.18"
            ),
        )


def _seed_shopify(
    endpoint: Endpoint,
) -> None:
    events = [
        (
            24,
            "orders/create",
            "/shopify/orders/create",
            {
                "id": 5_842_991,
                "name": "#1048",
                "email":
                    (
                        "laura@example.com"
                    ),
                "currency": "EUR",
                "total_price":
                    "89.90",
                "financial_status":
                    "paid",
                "line_items": [
                    {
                        "title":
                            (
                                "Mechanical "
                                "Keyboard"
                            ),
                        "quantity": 1,
                        "price":
                            "89.90",
                    },
                ],
            },
        ),
        (
            96,
            "orders/paid",
            "/shopify/orders/paid",
            {
                "id": 5_842_712,
                "name": "#1047",
                "currency": "EUR",
                "total_price":
                    "129.00",
                "financial_status":
                    "paid",
            },
        ),
        (
            205,
            "refunds/create",
            "/shopify/refunds/create",
            {
                "id": 712_009,
                "order_id":
                    5_841_990,
                "note":
                    (
                        "Customer return"
                    ),
                "transactions": [
                    {
                        "amount":
                            "39.95",
                        "currency":
                            "EUR",
                    },
                ],
            },
        ),
        (
            367,
            "orders/fulfilled",
            (
                "/shopify/"
                "orders/fulfilled"
            ),
            {
                "id": 5_841_441,
                "name": "#1043",
                "fulfillment_status":
                    "fulfilled",
            },
        ),
        (
            690,
            "products/update",
            (
                "/shopify/"
                "products/update"
            ),
            {
                "id": 8_844_010,
                "title":
                    "USB-C Dock",
                "status":
                    "active",
                "variants": [
                    {
                        "sku":
                            "DOCK-USBC-01",
                        "price":
                            "59.00",
                        "inventory_quantity":
                            24,
                    },
                ],
            },
        ),
        (
            1_440,
            "orders/create",
            "/shopify/orders/create",
            {
                "id": 5_839_901,
                "name": "#1038",
                "currency": "EUR",
                "total_price":
                    "219.00",
                "financial_status":
                    "paid",
            },
        ),
    ]

    for (
        minutes_ago,
        topic,
        path,
        payload,
    ) in events:
        _create_json_request(
            endpoint,
            minutes_ago=(
                minutes_ago
            ),
            path=path,
            headers={
                "Accept":
                    "application/json",
                "User-Agent":
                    "Shopify-Captain-Hook",
                "X-Shopify-Topic":
                    topic,
                "X-Shopify-Shop-Domain":
                    (
                        "acme-devices."
                        "myshopify.com"
                    ),
                "X-Shopify-Webhook-Id":
                    str(
                        uuid.uuid4()
                    ),
            },
            payload=payload,
            source_ip=(
                "203.0.113.64"
            ),
        )


def _seed_internal_api(
    endpoint: Endpoint,
) -> None:
    _create_json_request(
        endpoint,
        minutes_ago=14,
        method="POST",
        path="/deployments",
        headers={
            "Authorization":
                "Bearer demo_redacted",
            "User-Agent":
                "acme-ci/4.8.2",
        },
        payload={
            "service":
                "payments-api",
            "environment":
                "staging",
            "version":
                "2026.09.16-rc3",
            "commit":
                "4f9c2ae",
            "status":
                "deployed",
        },
        source_ip=
            "10.42.0.18",
    )

    _create_json_request(
        endpoint,
        minutes_ago=38,
        method="PATCH",
        path="/feature-flags",
        headers={
            "Authorization":
                "Bearer demo_redacted",
            "User-Agent":
                "admin-console/2.4",
        },
        query_params={
            "environment": [
                "staging",
            ],
        },
        payload={
            "flag":
                "checkout_v2",
            "enabled": True,
            "rollout":
                25,
        },
        source_ip=
            "10.42.1.9",
    )

    _create_json_request(
        endpoint,
        minutes_ago=88,
        method="POST",
        path="/jobs/queue",
        headers={
            "Authorization":
                "Bearer demo_redacted",
            "User-Agent":
                "worker-control/1.9",
        },
        payload={
            "queue":
                "emails",
            "job":
                "send_receipt",
            "priority":
                "high",
            "attempt":
                1,
        },
        source_ip=
            "10.42.0.31",
    )

    _create_request(
        endpoint,
        minutes_ago=143,
        method="GET",
        path="/health",
        headers={
            "Accept":
                "application/json",
            "User-Agent":
                "uptime-agent/3.2",
        },
        query_params={
            "verbose": ["1"],
        },
        source_ip=
            "10.42.2.12",
    )

    _create_json_request(
        endpoint,
        minutes_ago=301,
        method="DELETE",
        path="/cache/session",
        headers={
            "Authorization":
                "Bearer demo_redacted",
            "User-Agent":
                "ops-console/5.1",
        },
        query_params={
            "region": [
                "eu-west",
            ],
        },
        payload={
            "reason":
                (
                    "invalidate after "
                    "deployment"
                ),
        },
        source_ip=
            "10.42.1.7",
    )

    raw_body = (
        b"build=2026.09.15.4"
        b"&status=success"
        b"&duration=84"
    )

    _create_request(
        endpoint,
        minutes_ago=940,
        method="POST",
        path="/builds/callback",
        headers={
            "Content-Type":
                (
                    "application/x-www-"
                    "form-urlencoded"
                ),
            "User-Agent":
                "legacy-ci/1.4",
        },
        content_type=(
            "application/x-www-"
            "form-urlencoded"
        ),
        body=raw_body,
        source_ip=
            "10.42.3.20",
    )


def _seed_legacy(
    endpoint: Endpoint,
) -> None:
    for (
        minutes_ago,
        invoice_id,
        status,
    ) in (
        (
            4_500,
            "INV-2026-0182",
            "paid",
        ),
        (
            5_200,
            "INV-2026-0181",
            "failed",
        ),
        (
            6_900,
            "INV-2026-0179",
            "paid",
        ),
    ):
        _create_json_request(
            endpoint,
            minutes_ago=(
                minutes_ago
            ),
            path="/billing/callback",
            headers={
                "User-Agent":
                    "billing-gateway/0.9",
                "X-Api-Version":
                    "2019-04",
            },
            payload={
                "invoice_id":
                    invoice_id,
                "status":
                    status,
                "currency":
                    "EUR",
            },
            source_ip=(
                "192.0.2.90"
            ),
        )


class Command(BaseCommand):
    help = (
        "Populate an existing user "
        "with realistic HookWatch "
        "demo data."
    )

    def add_arguments(
        self,
        parser,
    ) -> None:
        parser.add_argument(
            "--email",
            help=(
                "Email of the user "
                "that should own the "
                "demo endpoints."
            ),
        )

    def _get_user(
        self,
        email: str | None,
    ):
        User = get_user_model()

        if email:
            try:
                return User.objects.get(
                    email__iexact=(
                        email.strip()
                    )
                )
            except User.DoesNotExist as exc:
                raise CommandError(
                    "No user exists "
                    f"with email {email}."
                ) from exc

        users = list(
            User.objects.all()[:2]
        )

        if not users:
            raise CommandError(
                "No users exist. "
                "Create an account "
                "first."
            )

        if len(users) > 1:
            raise CommandError(
                "Multiple users exist. "
                "Run the command again "
                "with --email."
            )

        return users[0]

    @transaction.atomic
    def handle(
        self,
        *args,
        **options,
    ) -> None:
        user = self._get_user(
            options.get("email")
        )

        Endpoint.objects.filter(
            owner=user,
            name__in=(
                DEMO_ENDPOINT_NAMES
            ),
        ).delete()

        github = _create_endpoint(
            user,
            name="GitHub · Production",
            days_ago=0,
        )

        stripe = _create_endpoint(
            user,
            name="Stripe · Checkout",
            days_ago=2,
        )

        shopify = _create_endpoint(
            user,
            name="Shopify · Orders",
            days_ago=5,
        )

        internal = _create_endpoint(
            user,
            name=(
                "Internal API · Staging"
            ),
            days_ago=9,
        )

        legacy = _create_endpoint(
            user,
            name="Legacy Billing",
            days_ago=34,
            state=(
                Endpoint.State.DISABLED
            ),
        )

        _seed_github(github)
        _seed_stripe(stripe)
        _seed_shopify(shopify)
        _seed_internal_api(internal)
        _seed_legacy(legacy)

        total_requests = (
            WebhookRequest.objects
            .filter(
                endpoint__owner=user,
                endpoint__name__in=(
                    DEMO_ENDPOINT_NAMES
                ),
            )
            .count()
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Demo data created "
                f"for {user.email}: "
                "5 endpoints, "
                f"{total_requests} "
                "requests."
            )
        )