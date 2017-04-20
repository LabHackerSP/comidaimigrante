from django.utils.translation import ugettext as _
from django.utils import timezone
from django.db import models
from django.contrib.admin import widgets
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

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

class UserProfile(models.Model):
    user = models.OneToOneField(User, related_name='profile')
    phonehash = models.CharField(max_length=10, blank=True)
    picture = models.URLField(blank=True)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


class Cidade(models.Model):
    cidade = StringField()
    estado = models.CharField(max_length=2)

    def __str__(self):
        return self.cidade + ' - ' + self.estado

class Regiao(models.Model):
    regiao = StringField(primary_key=True)

    def __str__(self):
        return self.regiao

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
    regiao = models.ForeignKey(Regiao)
    cidade = models.ForeignKey(Cidade, default=1)
    sinopse = models.TextField()
    lat = models.DecimalField(max_digits=10, decimal_places=7)
    long = models.DecimalField(max_digits=10, decimal_places=7)
    telefone = models.CharField(blank=True, max_length=11)
    origem = models.ForeignKey(Origem)
    foto = models.ImageField(blank=True, upload_to='fotos')
    link = models.URLField(blank=True)
    preco_min = models.IntegerField(blank=True, null=True)
    preco_max = models.IntegerField(blank=True, null=True)
    comida = models.ManyToManyField(Comida)
    flags = models.ManyToManyField(Flag, blank=True)
    user = models.ForeignKey(User, default=1)
    autorizado = models.BooleanField(default=False)

    def __str__(self):
        return self.nome

class Evento(models.Model):
    nome = StringField()
    restaurante = models.ForeignKey(Restaurante)
    sinopse = models.TextField()
    user = models.ForeignKey(User, default=1)
    data = models.DateTimeField()
    autorizado = models.BooleanField(default=False)
    privado = models.BooleanField(default=False)
    visitors = models.ManyToManyField(User, related_name='visitors')

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
        return _("%(restaurante)s: %(weekday)s (%(from_hour)s - %(to_hour)s)") % {
            'restaurante': self.restaurante,
            'weekday': WEEKDAYS[self.weekday-1][1],
            'from_hour': self.from_hour,
            'to_hour': self.to_hour
        }
