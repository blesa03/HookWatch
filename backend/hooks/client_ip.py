from ipaddress import (
    IPv4Address,
    IPv6Address,
    ip_address,
    ip_network,
)

from django.conf import settings
from django.http import HttpRequest

IPAddress = IPv4Address | IPv6Address


def _parse_ip(
    value: str | None,
) -> IPAddress | None:
    if not value:
        return None

    try:
        return ip_address(
            value.strip()
        )
    except ValueError:
        return None


def _is_trusted_proxy(
    address: IPAddress,
) -> bool:
    for raw_network in (
        settings
        .HOOKWATCH_TRUSTED_PROXY_NETWORKS
    ):
        try:
            network = ip_network(
                raw_network,
                strict=False,
            )
        except ValueError:
            continue

        if (
            address.version
            == network.version
            and address in network
        ):
            return True

    return False


def get_source_ip(
    request: HttpRequest,
) -> str | None:
    remote = _parse_ip(
        request.META.get(
            "REMOTE_ADDR"
        )
    )

    if remote is None:
        return None

    if not _is_trusted_proxy(
        remote
    ):
        return str(remote)

    forwarded_header = (
        request.headers.get(
            "X-Forwarded-For"
        )
    )

    if not forwarded_header:
        return str(remote)

    forwarded: list[IPAddress] = []

    for raw_address in (
        forwarded_header.split(",")
    ):
        address = _parse_ip(
            raw_address
        )

        if address is None:
            return str(remote)

        forwarded.append(address)

    chain = [
        *forwarded,
        remote,
    ]

    for address in reversed(chain):
        if not _is_trusted_proxy(
            address
        ):
            return str(address)

    if forwarded:
        return str(forwarded[0])

    return str(remote)