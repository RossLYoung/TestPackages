from django import forms

from .models import CustomUser


class CustomUserEditForm(forms.ModelForm):
    """Form for viewing and editing name fields in a DemoUser object.  """

    def __init__(self, *args, **kwargs):
        # TODO: this doesn't seem to work. Need to get to the bottom of it.
        #self.base_fields["display_name"].min_length = 2
        #self.base_fields["display_name"].validators.append(MinLengthValidator)
        #print self.base_fields['display_name'].validators
        super(forms.ModelForm, self).__init__(*args, **kwargs)

    class Meta:
        model = CustomUser
        fields = ( 'display_name' , 'first_name', 'last_name')


class CustomUserAdminForm(forms.ModelForm):

    class Meta:
        model = CustomUser
        fields = ('email', 'first_name', 'last_name', 'display_name', 'is_staff', 'is_active', 'date_joined')

    def is_valid(self):
        #log.info(force_text(self.errors))
        return super(CustomUserAdminForm, self).is_valid()
