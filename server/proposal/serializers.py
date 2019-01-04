from rest_framework import serializers

from .models import Proposal

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = ('id', 'org', 'code', 'by', 'created_at', 'description', 'content_md')

