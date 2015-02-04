from django import forms
from django.contrib.admin import widgets
from django_comments.forms import CommentForm

from crispy_forms.helper import FormHelper
from crispy_forms.layout import Submit, Fieldset, Layout, Hidden, Field

from models import MPTTComment


class MPTTCommentForm(CommentForm):

    def __init__(self, *args, **kwargs):
        super(MPTTCommentForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.form_tag = False
        self.helper.layout = Layout(
            Fieldset(
                '',
                'comment',
                'honeypot',
                'content_type',
                'object_pk',
                'timestamp',
                'security_hash'
            ),
            #Field('honeypot', type="hidden"),
            #Hidden('honeypot','')
        )
        self.fields['comment'].label = "I think that..."
        self.fields['comment'].required = "True"
        self.fields['comment'].widget



    parent = forms.ModelChoiceField(queryset=MPTTComment.objects.all(), required=False, widget=forms.HiddenInput)

    def get_comment_model(self):
        return MPTTComment

    def get_comment_create_data(self):
        data = super(MPTTCommentForm, self).get_comment_create_data()
        data['parent'] = self.cleaned_data['parent']
        return data
