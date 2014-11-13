from django.conf.urls import patterns, url

from accounts import views

urlpatterns = patterns('',
    url(r'^login/$', 'django.contrib.auth.views.login', {
        'template_name': 'login.html'
    }),
    
    url(r'^logout/$', 'django.contrib.auth.views.logout', {
        
        'next_page': '/dashboard/'
    }),
)  
  
