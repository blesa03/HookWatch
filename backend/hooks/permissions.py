from rest_framework.permissions import (
    BasePermission,
)


class IsEndpointOwner(BasePermission):
    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return bool(
            request.user.is_authenticated
            and obj.owner_id
            == request.user.id
        )