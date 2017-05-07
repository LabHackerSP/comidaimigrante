from django.shortcuts import render
from website.models import Cozinheiro, Post

# Create your views here.

def index(request):
     context = {'cozinheiros' : Cozinheiro.objects.all() }
     return render(request, 'website/index.html', context)

def cozinheiro(request, cozid):
	context = {'cozinheiro' : Cozinheiro.objects.get(pk=cozid)}
	return render(request, 'website/cozinheiro.html', context)

def blog(request, postid=None):
	if postid:
		context = {'post' : Post.objects.get(pk=postid)}
		return render(request, 'website/post.html', context)
	else:
		context = { 'posts' : Post.objects.all() }
		return render(request, 'website/blog.html', context)	