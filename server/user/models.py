
from datetime import datetime, timedelta
import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser

from django.contrib.postgres.fields import ArrayField

from oauth2_provider.models import Grant, Application

def gen_code():
    return uuid.uuid4().hex[-8:]


# Create your models here.
class User(AbstractUser):

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=256)

    created_at = models.DateTimeField(auto_now_add=True)

    def add_grant(self, client_id, redirect_uri, scope):
        auth_code = gen_code()

        # for the moment, expire in 3600
        expires = datetime.utcnow() + timedelta(seconds=3600)

        application = Application.objects.get(client_id=client_id)
        if not application.redirect_uri_allowed(redirect_uri):
            raise Exception(f'redirect_uri: \'{redirect_uri}\' not allowed by \'{application.name}\'')

        grant = Grant(
            user=self,
            code=auth_code,
            application=application,
            expires=expires,
            redirect_uri=redirect_uri,
            scope=scope
        )
        grant.save()
        return grant


    def all_grants(self):
        return Grant.objects.filter(user=self)

    def get_grant_for_app(self, app_name='org'):
        return self.all_grants().get(application__name='org')

    def get_grant(self, client_id):
        return self.all_grants().get(application__client_id=client_id)

