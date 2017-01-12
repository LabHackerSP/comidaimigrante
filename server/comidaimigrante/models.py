from django.utils.translation import ugettext as _
from django.db import models

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

class Origem(models.Model):
    nome = models.TextField(primary_key=True)
    bandeira = models.CharField(max_length=50)

class Comida(models.Model):
    tag = models.TextField(primary_key=True)

class Flag(models.Model):
    flag = models.TextField(primary_key=True)

class Restaurante(models.Model):
    nome = models.TextField()
    endereco = models.TextField()
    cidade = models.TextField()
    sinopse = models.TextField()
    lat = models.DecimalField(max_digits=9, decimal_places=6)
    long = models.DecimalField(max_digits=9, decimal_places=6)
    telefone = models.CharField(max_length=11)
    origem = models.ForeignKey(Origem)
    foto = models.ImageField(upload_to='fotos')
    link = models.URLField()
    preco = models.IntegerField()
    comida = models.ManyToManyField(Comida)
    flags = models.ManyToManyField(Flag)

class Horario(models.Model):
    restaurante = models.ForeignKey(Restaurante)
    weekday = models.IntegerField(choices=WEEKDAYS)
    from_hour = models.TimeField()
    to_hour = models.TimeField()

    class Meta:
        unique_together = ('restaurante', 'weekday')
