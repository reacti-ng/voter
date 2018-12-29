from collections import OrderedDict

from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class DefaultPageNumberPagination(PageNumberPagination):
    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('total', self.page.paginator.count),
            ('number', self.page.number),
            ('next', self.next_page_number()),
            ('prev', self.previous_page_number()),
            ('results', data)
        ]))

    def next_page_number(self):
        if not self.page.has_next():
            return None
        return self.page.next_page_number()

    def previous_page_number(self):
        if not self.page.has_previous():
            return None
        return self.page.next_page_number()
