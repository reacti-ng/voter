from django.contrib import admin

from .models import Org, OrgMembership

@admin.register(Org, OrgMembership)
class OrgAdmin(admin.ModelAdmin):
    pass