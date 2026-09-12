import base64

from rest_framework import serializers

from .models import Endpoint, WebhookRequest

SUPPORTED_METHODS = {
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
}


class EndpointSerializer(serializers.ModelSerializer):
    status = serializers.CharField(
        read_only=True
    )
    ingest_url = serializers.SerializerMethodField()
    request_count = serializers.SerializerMethodField()
    last_request_at = serializers.SerializerMethodField()

    class Meta:
        model = Endpoint
        fields = (
            "id",
            "name",
            "status",
            "state",
            "is_temporary",
            "ingest_url",
            "request_count",
            "last_request_at",
            "created_at",
            "updated_at",
            "expires_at",
        )
        read_only_fields = fields

    def get_ingest_url(self, obj) -> str:
        path = f"/hooks/{obj.ingest_token}/"
        request = self.context.get("request")

        if request is None:
            return path

        return request.build_absolute_uri(path)

    def get_request_count(self, obj) -> int:
        annotated = getattr(
            obj,
            "request_count",
            None,
        )

        if annotated is not None:
            return annotated

        return obj.requests.count()

    def get_last_request_at(self, obj):
        if hasattr(obj, "last_request_at"):
            return obj.last_request_at

        return (
            obj.requests
            .order_by("-received_at")
            .values_list(
                "received_at",
                flat=True,
            )
            .first()
        )


class EndpointCreateSerializer(
    serializers.ModelSerializer
):
    name = serializers.CharField(
        max_length=120,
        required=False,
        default="Untitled endpoint",
    )

    class Meta:
        model = Endpoint
        fields = ("name",)

    def validate_name(self, value):
        return value.strip()


class EndpointUpdateSerializer(
    serializers.ModelSerializer
):
    name = serializers.CharField(
        max_length=120,
        required=False,
    )
    state = serializers.ChoiceField(
        choices=Endpoint.State.choices,
        required=False,
    )

    class Meta:
        model = Endpoint
        fields = (
            "name",
            "state",
        )

    def validate_name(self, value):
        return value.strip()


class AdoptEndpointSerializer(
    serializers.Serializer
):
    endpoint_id = serializers.UUIDField()


class WebhookRequestSummarySerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = WebhookRequest
        fields = (
            "id",
            "method",
            "path",
            "content_type",
            "body_size",
            "received_at",
        )
        read_only_fields = fields


class WebhookRequestDetailSerializer(
    serializers.ModelSerializer
):
    body = serializers.SerializerMethodField()

    class Meta:
        model = WebhookRequest
        fields = (
            "id",
            "method",
            "path",
            "headers",
            "query_params",
            "content_type",
            "body",
            "body_size",
            "source_ip",
            "received_at",
        )
        read_only_fields = fields

    def get_body(self, obj):
        raw_bytes = bytes(
            obj.body_raw or b""
        )

        try:
            raw = raw_bytes.decode("utf-8")
        except UnicodeDecodeError:
            return {
                "format": "base64",
                "raw": base64.b64encode(
                    raw_bytes
                ).decode("ascii"),
                "parsed": obj.parsed_json,
            }

        media_type = (
            obj.content_type
            .split(";", 1)[0]
            .strip()
            .lower()
        )

        is_json = (
            media_type == "application/json"
            or media_type.endswith("+json")
        )

        return {
            "format": (
                "json"
                if is_json
                else "text"
            ),
            "raw": raw,
            "parsed": obj.parsed_json,
        }


class RequestFilterSerializer(
    serializers.Serializer
):
    method = serializers.CharField(
        required=False,
    )
    search = serializers.CharField(
        required=False,
        allow_blank=False,
        max_length=200,
    )
    ordering = serializers.ChoiceField(
        choices=(
            "-received_at",
            "received_at",
        ),
        default="-received_at",
    )

    def __init__(
        self,
        *args,
        **kwargs,
    ):
        super().__init__(
            *args,
            **kwargs,
        )

        self.fields["from"] = (
            serializers.DateTimeField(
                required=False
            )
        )
        self.fields["to"] = (
            serializers.DateTimeField(
                required=False
            )
        )

    def validate_method(self, value):
        method = value.upper()

        if method not in SUPPORTED_METHODS:
            raise serializers.ValidationError(
                "Unsupported HTTP method."
            )

        return method

    def validate(self, attrs):
        start = attrs.get("from")
        end = attrs.get("to")

        if (
            start is not None
            and end is not None
            and start > end
        ):
            raise serializers.ValidationError(
                "'from' must be earlier than 'to'."
            )

        return attrs