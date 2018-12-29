from django.shortcuts import get_object_or_404

from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from oauth2_provider.models import Grant
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope, OAuth2Authentication

from .models import Org
from .serializers import OrgSerializer, OrgMembershipSerializer

class OrgViewSet(viewsets.ModelViewSet):
    queryset = Org.objects.all().order_by('-created_at')
    serializer_class = OrgSerializer

    authentication_classes = [OAuth2Authentication]
    permission_classes = [IsAuthenticated, TokenHasReadWriteScope]

    @action(methods=['get'], detail=True)
    def members(self, request, pk=None):
        queryset = self.get_queryset()
        org = get_object_or_404(queryset, pk=pk)

        org_members = self.paginate_queryset(org.orgmembership_set.all())

        serializer = OrgMembershipSerializer(org_members, many=True)
        return self.get_paginated_response(serializer.data)


