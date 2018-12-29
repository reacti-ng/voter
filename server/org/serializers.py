
from rest_framework import serializers

from user.serializers import UserSerializer

from .models import Org, OrgMembership


class OrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = Org
        fields = ('id', 'name')

class OrgMembershipSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgMembership
        fields = ('id', 'user', 'created_at')

    user = UserSerializer()

