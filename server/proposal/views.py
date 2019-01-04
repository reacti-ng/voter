from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, OAuth2Authentication


from .models import Proposal
from .serializers import ProposalSerializer

class ProposalViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Proposal.objects.all().order_by('-created_at')

    serializer_class = ProposalSerializer

    authentication_classes = [OAuth2Authentication]
    permission_classes = [IsAuthenticated, TokenHasReadWriteScope]