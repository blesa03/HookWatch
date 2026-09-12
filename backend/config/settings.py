import os
from datetime import timedelta
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


SECRET_KEY = os.getenv(
    "DJANGO_SECRET_KEY",
    "dev-only-insecure-hookwatch-key-change-me",
)

DEBUG = (
    os.getenv(
        "DJANGO_DEBUG",
        "true",
    ).lower()
    == "true"
)

ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv(
        "DJANGO_ALLOWED_HOSTS",
        "localhost,127.0.0.1,backend",
    ).split(",")
    if host.strip()
]


INSTALLED_APPS = [
    "daphne",
    "channels",
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "corsheaders",
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "accounts",
    "hooks",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "config.urls"


TEMPLATES = [
    {
        "BACKEND": (
            "django.template.backends.django."
            "DjangoTemplates"
        ),
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                (
                    "django.template.context_processors."
                    "request"
                ),
                (
                    "django.contrib.auth.context_processors."
                    "auth"
                ),
                (
                    "django.contrib.messages.context_processors."
                    "messages"
                ),
            ],
        },
    },
]


WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"


DATABASES = {
    "default": {
        "ENGINE": (
            "django.db.backends.postgresql"
        ),
        "NAME": os.getenv(
            "POSTGRES_DB",
            "hookwatch",
        ),
        "USER": os.getenv(
            "POSTGRES_USER",
            "hookwatch",
        ),
        "PASSWORD": os.getenv(
            "POSTGRES_PASSWORD",
            "hookwatch",
        ),
        "HOST": os.getenv(
            "POSTGRES_HOST",
            "localhost",
        ),
        "PORT": os.getenv(
            "POSTGRES_PORT",
            "5432",
        ),
    }
}


AUTH_USER_MODEL = "accounts.User"


AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "UserAttributeSimilarityValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "MinimumLengthValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "CommonPasswordValidator"
        )
    },
    {
        "NAME": (
            "django.contrib.auth.password_validation."
            "NumericPasswordValidator"
        )
    },
]


REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        (
            "rest_framework_simplejwt."
            "authentication.JWTAuthentication"
        ),
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "EXCEPTION_HANDLER": (
        "config.exceptions."
        "hookwatch_exception_handler"
    ),
}


SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(
        minutes=10
    ),
    "REFRESH_TOKEN_LIFETIME": timedelta(
        days=7
    ),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "UPDATE_LAST_LOGIN": False,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


AUTH_REFRESH_COOKIE_NAME = os.getenv(
    "AUTH_REFRESH_COOKIE_NAME",
    "hookwatch_refresh",
)

AUTH_COOKIE_SECURE = (
    os.getenv(
        "AUTH_COOKIE_SECURE",
        "false",
    ).lower()
    == "true"
)

AUTH_COOKIE_SAMESITE = os.getenv(
    "AUTH_COOKIE_SAMESITE",
    "Lax",
)


LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True
USE_TZ = True


STATIC_URL = "static/"

DEFAULT_AUTO_FIELD = (
    "django.db.models.BigAutoField"
)


CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True

HOOKWATCH_MAX_BODY_SIZE = int(
    os.getenv(
        "HOOKWATCH_MAX_BODY_SIZE",
        str(1024 * 1024),
    )
)

DATA_UPLOAD_MAX_MEMORY_SIZE = (
    HOOKWATCH_MAX_BODY_SIZE
)

REDIS_URL = os.getenv(
    "REDIS_URL",
    "redis://localhost:6379/0",
)

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": (
            "channels_redis.core."
            "RedisChannelLayer"
        ),
        "CONFIG": {
            "hosts": [REDIS_URL],
            "prefix": "hookwatch:channels",
            "group_expiry": 3600,
        },
    },
}

WEBSOCKET_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "WEBSOCKET_ALLOWED_ORIGINS",
        "http://localhost:5173",
    ).split(",")
    if origin.strip()
]

HOOKWATCH_WS_TICKET_TTL = int(
    os.getenv(
        "HOOKWATCH_WS_TICKET_TTL",
        "30",
    )
)