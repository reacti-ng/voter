from rest_framework import serializers

from org.models import OrgMembership
from proposal.models import Proposal

from .models import User

class MemberProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = ('id', 'code', 'description')

class MemberOfOrgSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgMembership
        fields = ('org_id', 'org_name', 'created_proposals')

    created_proposals = MemberProposalSerializer(many=True)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'name', 'created_at', 'member_of', 'avatar_href')

    member_of = MemberOfOrgSerializer(source='orgmembership_set', many=True)
    avatar_href = serializers.ImageField(source='userinfo.avatar_href', allow_null=True)

