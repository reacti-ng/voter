from rest_framework import serializers

from .models import User

class MemberOfOrgSerializer(serializers.Serializer):
    org = serializers.UUIDField(source='org.id')
    org_name = serializers.CharField(max_length=256, source='org.name')


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'created_at', 'member_of')

    member_of = MemberOfOrgSerializer(source='orgmembership_set', many=True)