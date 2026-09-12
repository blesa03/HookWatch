from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import (
    validate_password,
)
from rest_framework import serializers

from .models import User


class UserSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = User

        fields = (
            "id",
            "email",
            "date_joined",
        )

        read_only_fields = fields


class RegisterSerializer(
    serializers.Serializer
):
    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(
            email=email
        ).exists():
            raise serializers.ValidationError(
                "An account with this email "
                "already exists."
            )

        return email

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )


class LoginSerializer(
    serializers.Serializer
):
    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    def validate(self, attrs):
        email = attrs["email"].strip().lower()

        user = authenticate(
            request=self.context.get("request"),
            email=email,
            password=attrs["password"],
        )

        if user is None or not user.is_active:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        attrs["user"] = user

        return attrs