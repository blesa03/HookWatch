from django.conf import settings
from rest_framework import status
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import (
    InvalidToken,
    TokenError,
)
from rest_framework_simplejwt.serializers import (
    TokenRefreshSerializer,
)
from rest_framework_simplejwt.tokens import (
    RefreshToken,
)

from .serializers import (
    LoginSerializer,
    RegisterSerializer,
    UserSerializer,
)


def set_refresh_cookie(
    response: Response,
    refresh_token: str,
) -> None:
    lifetime = (
        settings.SIMPLE_JWT[
            "REFRESH_TOKEN_LIFETIME"
        ]
    )

    response.set_cookie(
        key=settings.AUTH_REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=int(
            lifetime.total_seconds()
        ),
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,
        samesite=settings.AUTH_COOKIE_SAMESITE,
        path="/api/v1/auth/",
    )


def clear_refresh_cookie(
    response: Response,
) -> None:
    response.delete_cookie(
        key=settings.AUTH_REFRESH_COOKIE_NAME,
        path="/api/v1/auth/",
        samesite=settings.AUTH_COOKIE_SAMESITE,
    )


def issue_tokens(user):
    refresh = RefreshToken.for_user(user)

    return (
        str(refresh.access_token),
        str(refresh),
    )


class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        access, refresh = issue_tokens(user)

        response = Response(
            {
                "access": access,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )

        set_refresh_cookie(
            response,
            refresh,
        )

        return response


class LoginView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = LoginSerializer(
            data=request.data,
            context={"request": request},
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data[
            "user"
        ]

        access, refresh = issue_tokens(user)

        response = Response(
            {
                "access": access,
                "user": UserSerializer(user).data,
            }
        )

        set_refresh_cookie(
            response,
            refresh,
        )

        return response


class RefreshView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        raw_refresh = request.COOKIES.get(
            settings.AUTH_REFRESH_COOKIE_NAME
        )

        if not raw_refresh:
            raise InvalidToken(
                "Refresh token missing."
            )

        serializer = TokenRefreshSerializer(
            data={
                "refresh": raw_refresh,
            }
        )

        try:
            serializer.is_valid(
                raise_exception=True
            )
        except TokenError as exc:
            raise InvalidToken(
                str(exc)
            ) from exc

        response = Response(
            {
                "access": (
                    serializer.validated_data[
                        "access"
                    ]
                )
            }
        )

        rotated_refresh = (
            serializer.validated_data.get(
                "refresh"
            )
        )

        if rotated_refresh:
            set_refresh_cookie(
                response,
                rotated_refresh,
            )

        return response


class LogoutView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        raw_refresh = request.COOKIES.get(
            settings.AUTH_REFRESH_COOKIE_NAME
        )

        if raw_refresh:
            try:
                RefreshToken(
                    raw_refresh
                ).blacklist()
            except TokenError:
                pass

        response = Response(
            status=status.HTTP_204_NO_CONTENT
        )

        clear_refresh_cookie(response)

        return response


class MeView(APIView):
    permission_classes = (
        IsAuthenticated,
    )

    def get(self, request):
        return Response(
            UserSerializer(
                request.user
            ).data
        )