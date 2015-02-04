from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$',             'commentry.views.home',  name='home'),
    url(r'^thing/(\d+)/$', 'commentry.views.thing', name='thing'),

    url(r'^comments/', include('django_comments.urls')),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^settings/', include('custom_user.urls')),
        url(r'^viz/', include('viz.urls')),



    url(r'^member/$', 'custom_user.views.member_index', name='user_home'),
    url(r'^member/action$', 'custom_user.views.member_action', name='user_action'),

    #enable simple auth
    #url(r'^login/$', 'django.contrib.auth.views.login', name='login'),

    url(r'^admin/', include(admin.site.urls)),
)
