from rest_framework.pagination import CursorPagination


class RequestCursorPagination(CursorPagination):
    page_size = 50
    cursor_query_param = "cursor"
    ordering = "-received_at"