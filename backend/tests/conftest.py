import pytest
from rest_framework.test import APIClient

from accounts.models import User


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="user@example.com",
        password="StrongPassword123!",
    )