from django.contrib import admin

from .models import Poll

# Register your models here.

@admin.register(Poll)
class UserPoll(admin.ModelAdmin):
    pass