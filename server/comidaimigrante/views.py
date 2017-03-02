from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.clickjacking import xframe_options_exempt
from django.shortcuts import render
from comidaimigrante.models import Cidade, Origem, Comida, Flag
import json

# Create your views here.
def index(request):
    return render(request, 'views/home.html')

def meta(request):
    origens = Origem.objects.all()
    flags = Flag.objects.all()
    data = {
        'origem' : [origem.nome for origem in origens],
        'flag' : [flag.flag for flag in flags]
    }

    return HttpResponse(json.dumps(data), content_type="application/json")

@xframe_options_exempt
def profile(request):
    user = request.user
    data = {
        'id': user.id,
        'user': user.username,
        'authenticated': user.is_authenticated(),
    }

    try:
        data['first_name'] = user.first_name
        data['last_name'] = user.last_name
        data['avatar_url'] = user.socialaccount_set.all[0].get_avatar_url
    except:
        pass

    return HttpResponse(json.dumps(data), content_type="application/json")

def formObject(name, display, icon, type, choices = None, min = None, max = None, hidden = False):
    obj = {
        'name': name,
        'display': display,
        'icon': icon,
        'type': type
    }

    if(choices != None): obj['choices'] = choices
    if(min != None): obj['min'] = min
    if(max != None): obj['max'] = max
    if(hidden): obj['hidden'] = hidden

    return obj

# por hora hardcoded mas pode ser gerado a partir de modelos
def forms(request):

    origens = Origem.objects.all()
    flags = Flag.objects.all()
    comidas = Comida.objects.all()

    data = {
        'forms' : [
            formObject('nome', 'Nome', 'info', 'string'),
            formObject('endereco', 'Endereço', 'location_on', 'address'),
            formObject('lat', '', '', 'float', hidden = True),
            formObject('long', '', '', 'float', hidden = True),
            formObject('telefone', 'Telefone', 'phone', 'tel'),
            formObject('origem', 'Origem', 'flag', 'select', [origem.nome for origem in origens]),
            formObject('comida', 'Tipo de comida', 'local_dining', 'multiple', [comida.tag for comida in comidas]),
            formObject('preco', 'Preço', 'attach_money', 'slider', min = 1, max = 5),
            formObject('link', 'Link (opcional)', 'link', 'url'),
            formObject('sinopse', 'Sinopse', 'info', 'resizable'),
            formObject('foto', 'Foto (opcional)', 'add_a_photo', 'image'),
            formObject('flags', 'Flags (opcional)', 'list', 'multiple', [flag.flag for flag in flags])
        ]
    }

    # nome = StringField()
    # endereco = StringField()
    # cidade = models.ForeignKey(Cidade)
    # sinopse = models.TextField()
    # lat = models.DecimalField(max_digits=9, decimal_places=6)
    # long = models.DecimalField(max_digits=9, decimal_places=6)
    # telefone = models.CharField(blank=True, max_length=11)
    # origem = models.ForeignKey(Origem)
    # foto = models.ImageField(blank=True, upload_to='fotos')
    # link = models.URLField(blank=True)
    # preco = models.IntegerField()
    # comida = models.ManyToManyField(Comida)
    # flags = models.ManyToManyField(Flag, blank=True)

    return HttpResponse(json.dumps(data), content_type="application/json")
