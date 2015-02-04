from django.conf.urls import patterns, include, url
from django.contrib import admin
from custom_user.views import SettingsEmail, SettingsPassword, SettingsSocial


urlpatterns = patterns('',

    url(r'^$',         'custom_user.views.account_profile',    name='account_profile'),
    url(r'^emails/$',  SettingsEmail.as_view(),                name='settings_emails'),
    url(r'^social/$',  SettingsSocial.as_view(),               name='settings_social'),
    url(r'^password/$',SettingsPassword.as_view(),             name='settings_password'),

)
