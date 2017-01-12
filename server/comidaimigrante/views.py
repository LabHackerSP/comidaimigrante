from django.http import HttpResponse

# Create your views here.
def index(request):
    return HttpResponse("Index do Comida de Imigrante. Oi!")
