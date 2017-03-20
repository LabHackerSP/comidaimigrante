from django.utils.translation import ugettext as _
from django.db import models
from django.contrib.admin import widgets
from django.contrib.auth.models import User
from server import settings

# Create your models here.

WEEKDAYS = [
  (1, _("Segunda")),
  (2, _("Terça")),
  (3, _("Quarta")),
  (4, _("Quinta")),
  (5, _("Sexta")),
  (6, _("Sábado")),
  (7, _("Domingo")),
]

class StringField(models.TextField):
    def formfield(self, **kwargs):
        kwargs['widget'] = widgets.AdminTextInputWidget
        return super(StringField, self).formfield(**kwargs)

class Cidade(models.Model):
    cidade = StringField()
    estado = models.CharField(max_length=2)

    def __str__(self):
        return self.cidade + ' - ' + self.estado

class Origem(models.Model):
    nome = StringField(primary_key=True)
    bandeira = models.CharField(max_length=50)

    def __str__(self):
        return self.nome

class Comida(models.Model):
    tag = StringField(primary_key=True)

    def __str__(self):
        return self.tag

class Flag(models.Model):
    flag = StringField(primary_key=True)

    def __str__(self):
        return self.flag

class Restaurante(models.Model):
    nome = StringField()
    endereco = StringField()
    cidade = models.ForeignKey(Cidade, default=1)
    sinopse = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=7)
    long = models.DecimalField(max_digits=9, decimal_places=7)
    telefone = models.CharField(blank=True, max_length=11)
    origem = models.ForeignKey(Origem)
    foto = models.ImageField(blank=True, upload_to='fotos')
    link = models.URLField(blank=True)
    preco_min = models.IntegerField()
    preco_max = models.IntegerField()
    comida = models.ManyToManyField(Comida)
    flags = models.ManyToManyField(Flag, blank=True)
    user = models.ForeignKey(User, default=1)
    autorizado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome

class Horario(models.Model):
    restaurante = models.ForeignKey(Restaurante)
    weekday = models.IntegerField(choices=WEEKDAYS)
    from_hour = models.TimeField()
    to_hour = models.TimeField()

    #removido para que um restaurante possa ter mais de um horário por dia
    #class Meta:
    #    unique_together = ('restaurante', 'weekday')

    def __str__(self):
        return _("%(weekday)s (%(from_hour)s - %(to_hour)s)") % {
            'weekday': WEEKDAYS[self.weekday-1][1],
            'from_hour': self.from_hour,
            'to_hour': self.to_hour
        }
