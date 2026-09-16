from django.test import (
    RequestFactory,
    override_settings,
)

from hooks.client_ip import (
    get_source_ip,
)


@override_settings(
    HOOKWATCH_TRUSTED_PROXY_NETWORKS=[],
)
def test_direct_ip_ignores_forwarded_header():
    request = RequestFactory().get(
        "/",
        REMOTE_ADDR="198.51.100.10",
        HTTP_X_FORWARDED_FOR=(
            "203.0.113.20"
        ),
    )

    assert (
        get_source_ip(request)
        == "198.51.100.10"
    )


@override_settings(
    HOOKWATCH_TRUSTED_PROXY_NETWORKS=[
        "10.0.0.0/8",
    ],
)
def test_trusted_proxy_uses_forwarded_ip():
    request = RequestFactory().get(
        "/",
        REMOTE_ADDR="10.0.0.5",
        HTTP_X_FORWARDED_FOR=(
            "203.0.113.20"
        ),
    )

    assert (
        get_source_ip(request)
        == "203.0.113.20"
    )


@override_settings(
    HOOKWATCH_TRUSTED_PROXY_NETWORKS=[
        "10.0.0.0/8",
        "192.168.0.0/16",
    ],
)
def test_proxy_chain_uses_first_untrusted_from_right():
    request = RequestFactory().get(
        "/",
        REMOTE_ADDR="10.0.0.5",
        HTTP_X_FORWARDED_FOR=(
            "203.0.113.1, "
            "198.51.100.9, "
            "192.168.1.10"
        ),
    )

    assert (
        get_source_ip(request)
        == "198.51.100.9"
    )


@override_settings(
    HOOKWATCH_TRUSTED_PROXY_NETWORKS=[
        "10.0.0.0/8",
    ],
)
def test_invalid_forwarded_header_falls_back_to_peer():
    request = RequestFactory().get(
        "/",
        REMOTE_ADDR="10.0.0.5",
        HTTP_X_FORWARDED_FOR=(
            "definitely-not-an-ip"
        ),
    )

    assert (
        get_source_ip(request)
        == "10.0.0.5"
    )