from django.shortcuts import render
from website.models import Cozinheiro

# Create your views here.

def index(request):
     context = {'cozinheiros' : Cozinheiro.objects.all() }
     return render(request, 'website/index.html', context)

def cozinheiro(request, cozid):
	context = {'cozinheiro' : Cozinheiro.objects.get(pk=cozid)}
	return render(request, 'website/cozinheiro.html', context)