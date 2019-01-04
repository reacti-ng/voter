"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include

from rest_framework import routers

from org.views import OrgViewSet
from poll import views as poll_views
from proposal.views import ProposalViewSet
from user import views as user_views

router = routers.DefaultRouter()
router.register('org', OrgViewSet)
router.register('poll', poll_views.PollViewSet)
router.register('proposal', ProposalViewSet)

router.register('user', user_views.UserViewSet)
urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/', include(router.urls)),
    path('auth/', include('oauth2_provider.urls', namespace='oauth2_provider'))
] 
