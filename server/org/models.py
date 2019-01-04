import uuid

from django.db import models


class Org(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)

    members = models.ManyToManyField('user.User', through='OrgMembership', through_fields=('org', 'user'))

class OrgMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    org  = models.ForeignKey(Org, on_delete=models.CASCADE)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)

    created_at = models.DateField(auto_now_add=True)

    nominated_by = models.ForeignKey('user.User', related_name='nominated_memberships',
        null=True,
        blank=True,
        on_delete=models.SET_NULL
    )
    accepted_by  = models.ForeignKey('user.User', related_name='accepted_memberships',
        null=True, 
        blank=True,
        on_delete=models.SET_NULL
    )

    @property
    def org_name(self):
        return self.org.name


    @property
    def created_proposals(self):
        from proposal.models import Proposal
        return (Proposal.objects
            .filter(by=self.user.id)
            .order_by('-created_at')
        )

