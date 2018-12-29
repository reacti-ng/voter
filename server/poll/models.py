import uuid

from django.db import models
from proposal.models import Proposal

class Proposal(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

class Poll(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(blank=False, max_length=128)

    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE)

    ballot = models.ForeignKey('ballot.Ballot', on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)
    open_at = models.DateTimeField(null=True)
    close_at = models.DateTimeField(null=True)
    count_at = models.DateTimeField(null=True)
