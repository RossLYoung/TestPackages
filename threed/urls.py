from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$',         'threed.views.index',  name='threed-home'),
    #url(r'^projects/$', 'threed.views.projects', name='threed-projects'),
)
