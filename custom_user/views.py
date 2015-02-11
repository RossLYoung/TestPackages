from django.contrib import messages
from django.views.generic.edit import FormMixin, UpdateView
from django.shortcuts import render_to_response
from django.contrib.auth.decorators import login_required
from django.core.urlresolvers import reverse_lazy, reverse
from django.template import RequestContext
from django.dispatch import receiver

from allauth.account.signals import user_signed_up
from allauth.account.views import EmailView, PasswordChangeView
from allauth.socialaccount.views import ConnectionsView, SignupView

from .forms import CustomUserEditForm


class MyModelInstanceMixin(FormMixin):
    def get_model_instance(self):
        return None

    def get_form_kwargs(self):
        kwargs = super(MyModelInstanceMixin, self).get_form_kwargs()
        instance = self.get_model_instance()
        if instance:
            kwargs.update({'instance': instance})
        return instance


class CustomUserEditView(UpdateView):
    """Allow view and update of basic user data.

    In practice this view edits a model, and that model is
    the CustomUser object itself, specifically the names that
    a user has.

    The key to updating an existing model, as compared to creating
    a model (i.e. adding a new row to a database) by using the
    Django generic view ``UpdateView``, specifically the
    ``get_object`` method.
    """
    form_class = CustomUserEditForm
    template_name = "settings/profile.html"
    #success_url = '/email-sent/'
    view_name = 'account_profile'
    success_url = reverse_lazy(view_name)

    def get_object(self):
        return self.request.user

    def form_valid(self, form):
        # TODO: not sure how to enforce *minimum* length of a field.
        #print "form valid..."
        #print "save to user:", self.request.user, form.cleaned_data
        form.save()
        messages.add_message(self.request, messages.INFO, 'User profile updated')
        return super(CustomUserEditView, self).form_valid(form)

account_profile = login_required(CustomUserEditView.as_view())


class NewSignUp(SignupView):
    pass


#Change templates to thes ones in this app
class SettingsEmail(EmailView):
    template_name = 'settings/email.html'
    success_url = reverse_lazy('settings_emails')

import os


class SettingsSocial(ConnectionsView):
    template_name = 'settings/connections.html'
    print('social, yo')
    print(os.getpid())
    success_url = reverse_lazy('settings_social')


class SettingsPassword(PasswordChangeView):
    template_name = 'settings/password_change.html'
    success_url = reverse_lazy('settings_password')



@login_required
def member_index(request):
    return render_to_response("custom_user/member-index.html", RequestContext(request))

@login_required
def member_action(request):
    return render_to_response("custom_user/member-action.html", RequestContext(request))


# @receiver(user_signed_up)
# def set_gender(sender, **kwargs):
#     user = kwargs.pop('user')
#     extra_data = user.socialaccount_set.filter(provider='facebook')[0].extra_data
#     gender = extra_data['gender']
#
#     if gender == 'male': # because the default is female.
#         user.gender = 'male'
#
#     user.save()