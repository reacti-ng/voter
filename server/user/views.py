
from .models import User
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

from oauth2_provider.models import Grant
from oauth2_provider.contrib.rest_framework import TokenHasReadWriteScope, TokenHasScope, OAuth2Authentication

from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('-created_at')
    serializer_class = UserSerializer

    authentication_classes = [OAuth2Authentication]
    permission_classes = [IsAuthenticated, TokenHasReadWriteScope]

    @action(methods=['post'], detail=False)
    def implicit(self, request):
        serializer = self.get_serializer_class()(request.user)
        return Response(serializer.data)


    @action(methods=['post'], detail=False)
    def grant_auth_code(self, request):
        """
        TODO: 
            - This should only be callable by the resource owner.
            - This should be the _only_ API call callable by the resource owner.
        """     
        user = request.user

        client_id = request.POST['client_id']
        redirect_uri = request.POST['redirect_uri']
        state = request.POST.get('state', None)
        scope = request.POST.get('scope', None)
        try:
            grant = user.get_grant(client_id)
        except Grant.DoesNotExist:
            grant = user.add_grant(
                client_id=request.POST['client_id'], 
                redirect_uri=redirect_uri,
                scope=scope
            )

        return Response({
            'code': grant.code,
            'state': state
        })


