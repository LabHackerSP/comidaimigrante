from django.db import models
from tinymce.models import HTMLField
from django.contrib.admin import widgets

from comidaimigrante.models import Restaurante
from server import settings

class StringField(models.TextField):
    def formfield(self, **kwargs):
        kwargs['widget'] = widgets.AdminTextInputWidget
        return super(StringField, self).formfield(**kwargs)

# Create your models here.
class Cozinheiro(models.Model):
    nome = StringField()
    texto = HTMLField()
    mug = models.ImageField(null=True, blank=True)
    foto = models.ImageField(null=True, blank=True)
    restaurante = models.ForeignKey(Restaurante, null=True, blank=True)

    
    def __str__(self):
        return self.nome

class Post(models.Model):
    titulo = StringField()
    slug = StringField()
    body = HTMLField()
    data = models.DateTimeField()

    def __str__(self):
        return self.titulo

class Pagina(models.Model):
    titulo = StringField()
    slug = StringField()
    body = HTMLField()

    def __str__(self):
        return self.titulo
