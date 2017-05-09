from django.conf.urls import url, include

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^cozinheiro/(?P<cozid>[0-9]+)', views.cozinheiro, name='cozinheiro'),
    url(r'^blog/$', views.blog, name='blog'),
    url(r'^blog/(?P<postid>[0-9]+)', views.blog, name='blog'),
    url(r'^pagina/(?P<pagina>[a-z]+)', views.pagina, name='pagina'),
    url(r'^contato/$', views.contato, name='contato'),
    url(r'^tinymce/', include('tinymce.urls')),
    url(r'^mce_filebrowser/', include('mce_filebrowser.urls')),
]
