"""server URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.10/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from comidaimigrante.api import RestauranteResource, FlagResource, ComidaResource, OrigemResource, UserResource
from django.contrib.auth import views as auth_views

restaurante = RestauranteResource()
flags = FlagResource()
comida = ComidaResource()
origem = OrigemResource()
user = UserResource()

urlpatterns = [
    url(r'^', include('comidaimigrante.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(restaurante.urls)),
    url(r'^api/', include(flags.urls)),
    url(r'^api/', include(comida.urls)),
    url(r'^api/', include(origem.urls)),
    url(r'^api/', include(user.urls)),
    url(r'^accounts/login/$', auth_views.login),
    url(r'^accounts/logout/$', auth_views.logout),
    url(r'^accounts/', include('allaccess.urls')),
]
