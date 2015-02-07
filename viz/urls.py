from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$',         'viz.views.index',  name='viz-home'),
    url(r'^projects/$', 'viz.views.projects', name='viz-projects'),
)