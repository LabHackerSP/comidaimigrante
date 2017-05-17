from django.conf.urls import url

from . import views

urlpatterns = [
    url(r'^accounts/profile', views.profile, name='profile'),
    url(r'^accounts/confirm', views.confirm, name='confirm'),
    url(r'^api/meta', views.meta, name='meta'),
    url(r'^api/picture/(?P<userid>[0-9]+)', views.picture, name='picture'),
    url(r'^api/forms$', views.forms, name='forms'),
    url(r'^api/formsvisitaco$', views.formsvisitaco, name='formsvisitaco'),
    url(r'^api/visitar/(?P<evento>[0-9]+)/(?P<choice>[a-z]+)', views.visit, name='visit'),
]
