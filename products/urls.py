from django.conf.urls import patterns, include, url
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^$', 'products.views.list',  name='products'),
    #url(r'^all/$', 'products.views.list', name='products-all'),
    url(r'^(?P<slug>[\w-]*)/$', 'products.views.single',  name='single-product'),
)
