from rest_framework import serializers
from .models import Poll


class PollSerializer(serializers.ModelSerializer):
    class Meta:
        model = Poll
        fields = (
            'id', 
            'name', 
            'proposal',
            'created_at',
            'open_at',
            'close_at',
            'count_at',
            'org',
            'ballot'
        )

         