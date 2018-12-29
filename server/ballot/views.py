from rest_framework import viewsets

from .serializers import PollSerializer


# Create your views here.
class PollViewSet(viewsets.ModelViewSet)