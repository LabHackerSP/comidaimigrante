from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^accounts/profile', views.profile, name='profile'),
    url(r'^api/meta', views.meta, name='meta'),
    url(r'^api/forms', views.forms, name='forms'),
    url(r'^api/visitar/(?P<evento>[0-9]+)/(?P<choice>[a-z]+)', views.visit, name='visit'),
]
