from django.http import HttpResponse
from comidaimigrante.models import Cidade, Origem, Comida, Flag
import json

# Create your views here.
def index(request):
    return HttpResponse("Index do Comida de Imigrante. Oi!")

def meta(request):
    origens = Origem.objects.all()
    flags = Flag.objects.all()
    data = {
        'origem' : [origem.nome for origem in origens],
        'flag' : [flag.flag for flag in flags]
    }
    
    return HttpResponse(json.dumps(data), content_type="application/json")
