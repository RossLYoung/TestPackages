"""
Django settings for TestPackages project.

For more information on this file, see
https://docs.djangoproject.com/en/1.7/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.7/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.7/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '0ap=hvx5h&-p9m-$$@4512&z^#@ptkv$+x15(y$gye^h*l6=*3'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []




# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    'custom_user',

    'crispy_forms',
    'django_comments',
    'mptt',
    'django_mptt_admin',
    'commentry',

    'viz',
    'threed',
    'django_extensions',



    #'csvimport',
)

#TODO: Ask Ross why appending to tuple?
INSTALLED_APPS += (
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.twitter',
    'allauth.socialaccount.providers.google',

    'bootstrap3',
)

COMMENTS_APP = 'commentry'
CRISPY_TEMPLATE_PACK = 'bootstrap3'

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'TestPackages.urls'

WSGI_APPLICATION = 'TestPackages.wsgi.application'

LOGIN_URL = '/accounts/login/'

LOGIN_REDIRECT_URL = '/member/' #named url

######################################################################
########## AUTENTICATION CONFIGURATION ###############################
######################################################################
AUTHENTICATION_BACKENDS = (
    "django.contrib.auth.backends.ModelBackend",
    "allauth.account.auth_backends.AuthenticationBackend",
)

ACCOUNT_AUTHENTICATION_METHOD = "email"
ACCOUNT_EMAIL_REQUIRED        = True
ACCOUNT_EMAIL_VERIFICATION    = "mandatory"
ACCOUNT_USERNAME_REQUIRED = True
ACCOUNT_USERNAME_MIN_LENGTH = 3
ACCOUNT_USER_MODEL_USERNAME_FIELD = 'display_name'
ACCOUNT_USER_MODEL_EMAIL_FIELD = "email"

SOCIALACCOUNT_AVATAR_SUPPORT = 'avatar'

REQUIRED_FIELDS = ['email']

ACCOUNT_LOGOUT_ON_GET = False # Keep as this. Stop problems for pages with /mysite/logout or browsers prefetching pages
#ACCOUNT_LOGOUT_REDIRECT_URL = 'http://bbc.co.uk'
########## END AUTHENTICATION CONFIGURATION

######################################################################
########## CUSTOM USER CONFIGURATION #################################
######################################################################

# Select the correct user model
AUTH_USER_MODEL = 'custom_user.CustomUser'
#LOGIN_REDIRECT_URL = "users:redirect"
########## END Custom user app defaults

TEMPLATE_CONTEXT_PROCESSORS = (
    'django.contrib.auth.context_processors.auth',
    'django.core.context_processors.debug',
    'django.core.context_processors.i18n',
    'django.core.context_processors.media',
    'django.core.context_processors.static',
    'django.core.context_processors.tz',
    'django.contrib.messages.context_processors.messages',
    'django.core.context_processors.request',

    "allauth.account.context_processors.account",
    "allauth.socialaccount.context_processors.socialaccount",
)

EMAIL_HOST    = "localhost"
EMAIL_PORT    = 1025
EMAIL_BACKEND = ('django.core.mail.backends.console.EmailBackend')


# Database
# https://docs.djangoproject.com/en/1.7/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.7/topics/i18n/

LANGUAGE_CODE = 'en-gb'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.7/howto/static-files/

STATIC_URL = '/static/'

TEMPLATE_DIRS = (
        os.path.join(BASE_DIR, 'custom_user', 'templates'),
        os.path.join(BASE_DIR, 'templates', 'viz'),
        os.path.join(BASE_DIR, 'templates', 'threed'),
        os.path.join(BASE_DIR, 'templates', 'allauth'),
        os.path.join(BASE_DIR, 'templates'),
)


TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',

)


SITE_ID = 1


######################################################################
########## DJANGO DEBUG TOOLBAR CONFIGURATION ########################
######################################################################

MIDDLEWARE_CLASSES += ('debug_toolbar.middleware.DebugToolbarMiddleware',
                                                  'django.contrib.admindocs.middleware.XViewMiddleware',
                                                  'debugtools.middleware.XViewMiddleware',
)
INSTALLED_APPS += ('debug_toolbar',
                   'template_timings_panel',
                   'template_profiler_panel',
                   'debugtools',
)

INTERNAL_IPS = ('127.0.0.1', 'localhost',)


DEBUG_TOOLBAR_CONFIG = {
    'INTERCEPT_REDIRECTS': False,
    'SHOW_TEMPLATE_CONTEXT': True,
}

DEBUG_TOOLBAR_PANELS = [
'debug_toolbar.panels.versions.VersionsPanel',
'debug_toolbar.panels.timer.TimerPanel',
'debug_toolbar.panels.settings.SettingsPanel',
'debug_toolbar.panels.headers.HeadersPanel',
'debug_toolbar.panels.request.RequestPanel',
'debug_toolbar.panels.sql.SQLPanel',
'debug_toolbar.panels.staticfiles.StaticFilesPanel',
'debug_toolbar.panels.cache.CachePanel',
'debug_toolbar.panels.signals.SignalsPanel',
'debug_toolbar.panels.logging.LoggingPanel',
'debug_toolbar.panels.redirects.RedirectsPanel',
'debug_toolbar.panels.templates.TemplatesPanel',

#3rd party
'template_profiler_panel.panels.template.TemplateProfilerPanel',
'template_timings_panel.panels.TemplateTimings.TemplateTimings',
]

DISABLE_PANELS = set(['debug_toolbar.panels.redirects.RedirectsPanel'])

########## end django-debug-toolbar


