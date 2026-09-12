from rest_framework import serializers

from .models import Endpoint


class EndpointSerializer(
    serializers.ModelSerializer
):
    status = serializers.CharField(
        read_only=True
    )

    ingest_url = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Endpoint

        fields = (
            "id",
            "name",
            "status",
            "is_temporary",
            "ingest_url",
            "created_at",
            "expires_at",
        )

        read_only_fields = fields

    def get_ingest_url(
        self,
        obj,
    ) -> str:
        path = (
            f"/hooks/{obj.ingest_token}/"
        )

        request = self.context.get(
            "request"
        )

        if request is None:
            return path

        return request.build_absolute_uri(
            path
        )


class AdoptEndpointSerializer(
    serializers.Serializer
):
    endpoint_id = serializers.UUIDField()