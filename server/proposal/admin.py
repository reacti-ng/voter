from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Proposal

# Register your models here.

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    pass