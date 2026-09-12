import os

from channels.routing import (
    ProtocolTypeRouter,
    URLRouter,
)
from channels.security.websocket import (
    OriginValidator,
)
from django.conf import settings
from django.core.asgi import (
    get_asgi_application,
)

os.environ.setdefault(
    "DJANGO_SETTINGS_MODULE",
    "config.settings",
)

django_asgi_application = (
    get_asgi_application()
)

from hooks.routing import (  # noqa: E402
    websocket_urlpatterns,
)

application = ProtocolTypeRouter(
    {
        "http": (
            django_asgi_application
        ),
        "websocket": OriginValidator(
            URLRouter(
                websocket_urlpatterns
            ),
            settings.WEBSOCKET_ALLOWED_ORIGINS,
        ),
    }
)