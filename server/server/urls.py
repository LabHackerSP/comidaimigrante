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
from comidaimigrante import api
from django.contrib.auth import views as auth_views
from django.conf import settings
from django.conf.urls.static import static


restaurante = api.RestauranteResource()
flags = api.FlagResource()
comida = api.ComidaResource()
origem = api.OrigemResource()
user = api.UserResource()
evento = api.EventoResource()
regiao = api.RegiaoResource()
horario = api.HorarioResource()

urlpatterns = [
    url(r'^', include('comidaimigrante.urls')),
    url(r'^', include('website.urls')),
    url(r'^admin/', admin.site.urls),
    url(r'^api/', include(restaurante.urls)),
    url(r'^api/', include(flags.urls)),
    url(r'^api/', include(comida.urls)),
    url(r'^api/', include(origem.urls)),
    url(r'^api/', include(user.urls)),
    url(r'^api/', include(evento.urls)),
    url(r'^api/', include(regiao.urls)),
    url(r'^api/', include(horario.urls)),
    url(r'^accounts/', include('allauth.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
