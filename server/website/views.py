from django.shortcuts import render, redirect
from website.models import Cozinheiro, Post, Pagina

from website.forms import ContatoForm
from django.core.mail import EmailMessage
from django.template import Context
from django.template.loader import get_template

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

def pagina(request, pagina):
	context = {'post' : Pagina.objects.get(slug=pagina)}
	return render(request, 'website/pagina.html', context)

def contato(request):
    form_class = ContatoForm
     # new logic!
    if request.method == 'POST':
        form = form_class(data=request.POST)

        if form.is_valid():
            contact_name = request.POST.get(
                'contact_name'
            , '')
            contact_email = request.POST.get(
                'contact_email'
            , '')
            form_content = request.POST.get('content', '')

            # Email the profile with the 
            # contact information
            template = get_template('website/contact-template.txt')
            context = Context({
                'contact_name': contact_name,
                'contact_email': contact_email,
                'form_content': form_content,
            })
            content = template.render(context)

            email = EmailMessage(
                "Novo contato de ComidaImigrante",
                content,
                "Your website" +'',
                ['pedro@markun.com.br'],
                headers = {'Reply-To': contact_email }
            )
            email.send()
            return redirect('contato')

    
    return render(request, 'website/contato.html', {
        'form': form_class,
    })
