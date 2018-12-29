import uuid

from django.db import models

# Create your models here.


class Org(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=128)

    members = models.ManyToManyField('user.User', through='OrgMembership', through_fields=('org', 'user'))


class OrgMembership(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('user.User', on_delete=models.CASCADE)
    org  = models.ForeignKey(Org, on_delete=models.CASCADE)

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
