import pytest

from accounts.models import User

pytestmark = pytest.mark.django_db


def test_register_creates_user_and_sets_cookie(
    api_client,
):
    response = api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "Test@Example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert response.status_code == 201

    assert "access" in response.data
    assert "refresh" not in response.data

    assert (
        "hookwatch_refresh"
        in response.cookies
    )

    assert response.cookies[
        "hookwatch_refresh"
    ]["httponly"]

    user = User.objects.get()

    assert user.email == "test@example.com"


def test_refresh_uses_cookie_not_body(
    api_client,
):
    register_response = api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "user@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    assert register_response.status_code == 201

    response = api_client.post(
        "/api/v1/auth/refresh/",
        {},
        format="json",
    )

    assert response.status_code == 200

    assert "access" in response.data
    assert "refresh" not in response.data


def test_me_requires_access_token(
    api_client,
    user,
):
    response = api_client.get(
        "/api/v1/auth/me/"
    )

    assert response.status_code == 401


def test_me_returns_authenticated_user(
    api_client,
):
    register_response = api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "user@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    access = register_response.data[
        "access"
    ]

    api_client.credentials(
        HTTP_AUTHORIZATION=(
            f"Bearer {access}"
        )
    )

    response = api_client.get(
        "/api/v1/auth/me/"
    )

    assert response.status_code == 200

    assert (
        response.data["email"]
        == "user@example.com"
    )


def test_logout_clears_refresh_cookie(
    api_client,
):
    api_client.post(
        "/api/v1/auth/register/",
        {
            "email": "user@example.com",
            "password": "StrongPassword123!",
        },
        format="json",
    )

    response = api_client.post(
        "/api/v1/auth/logout/"
    )

    assert response.status_code == 204

    assert (
        response.cookies[
            "hookwatch_refresh"
        ]["max-age"]
        == 0
    )