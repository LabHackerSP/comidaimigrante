from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^cozinheiro/(?P<cozid>[0-9]+)', views.cozinheiro, name='cozinheiro'),
    url(r'^tinymce/', include('tinymce.urls')),
]
