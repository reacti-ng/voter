from rest_framework import viewsets
from rest_framework.pagination import CursorPagination
from rest_framework.permissions import IsAuthenticated

from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope, OAuth2Authentication


from .models import Poll
from .serializers import PollSerializer


class PollPagination(CursorPagination):
    ordering = ('-count_at', '-close_at', '-open_at', '-created_at')


class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.all().order_by('-created_at')
    serializer_class = PollSerializer 

    pagination_class = PollPagination

    authentication_classes = [OAuth2Authentication]
    permission_classes = [IsAuthenticated, TokenHasReadWriteScope]
