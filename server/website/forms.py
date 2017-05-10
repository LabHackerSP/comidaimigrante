from django import forms

# our new form
class ContatoForm(forms.Form):
    contact_name = forms.CharField(required=True)
    contact_email = forms.EmailField(required=True)
    content = forms.CharField(
        required=True,
        widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        super(ContatoForm, self).__init__(*args, **kwargs)
        self.fields['contact_name'].label = "Seu nome:"
        self.fields['contact_email'].label = "Seu email:"
        self.fields['content'].label = "Mensagem"