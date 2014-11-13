from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = [
    # Examples:
    # url(r'^$', 'datalib_analytics_dashboard.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
 	url(r'^dashboard/', include('dashboard.urls')),
 	url(r'^accounts/', include('accounts.urls')),

 ]