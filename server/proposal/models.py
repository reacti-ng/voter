import uuid
from django.db import models


class Proposal(models.Model):
    class Meta:
        unique_together = (
            ('org', 'code'),
        )

    id  = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    org = models.ForeignKey('org.Org', on_delete=models.CASCADE)
    code = models.CharField(max_length=64)

    by  = models.ForeignKey('user.User', on_delete=models.SET_NULL, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    description = models.TextField()
    content_md = models.TextField()

    # if the previous proposal is deleted, that's a problem.
    previous = models.ForeignKey('self', on_delete=models.PROTECT, null=True)

class UserProposalActivity(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    proposal = models.ForeignKey(Proposal, on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.SET_NULL, null=True)

    type = models.CharField(max_length=32)