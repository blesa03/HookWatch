from unittest.mock import patch


def test_health_endpoint(client):
    response = client.get(
        "/api/v1/health/"
    )

    assert response.status_code == 200

    assert response.json() == {
        "status": "ok",
        "service": "hookwatch-api",
    }


def test_liveness_endpoint(client):
    response = client.get(
        "/api/v1/health/live/"
    )

    assert response.status_code == 200

    assert response.json()[
        "status"
    ] == "ok"


def test_readiness_is_ready_when_dependencies_are_available(
    client,
):
    with (
        patch(
            (
                "config.health."
                "_database_available"
            ),
            return_value=True,
        ),
        patch(
            (
                "config.health."
                "_redis_available"
            ),
            return_value=True,
        ),
    ):
        response = client.get(
            "/api/v1/health/ready/"
        )

    assert response.status_code == 200

    assert response.json()[
        "status"
    ] == "ready"


def test_readiness_is_degraded_when_only_redis_is_down(
    client,
):
    with (
        patch(
            (
                "config.health."
                "_database_available"
            ),
            return_value=True,
        ),
        patch(
            (
                "config.health."
                "_redis_available"
            ),
            return_value=False,
        ),
    ):
        response = client.get(
            "/api/v1/health/ready/"
        )

    assert response.status_code == 200

    assert response.json()[
        "status"
    ] == "degraded"


def test_readiness_fails_when_database_is_down(
    client,
):
    with (
        patch(
            (
                "config.health."
                "_database_available"
            ),
            return_value=False,
        ),
        patch(
            (
                "config.health."
                "_redis_available"
            ),
            return_value=True,
        ),
    ):
        response = client.get(
            "/api/v1/health/ready/"
        )

    assert response.status_code == 503

    assert response.json()[
        "status"
    ] == "unavailable"