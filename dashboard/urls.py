from django.conf.urls import patterns, url

from dashboard import views

urlpatterns = patterns('',
    url(r'^$', views.index, name='dashboard'),
    url(r'^test/$', views.test, name='test'),
    url(r'^proxy.php?$', views.proxy, name='proxy'),
)