from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^api/meta', views.meta, name='meta'),
    url(r'^api/forms', views.forms, name='forms'),
]
