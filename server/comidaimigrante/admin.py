from django.contrib import admin

from comidaimigrante.models import Origem, Comida, Flag, Restaurante, Horario
# Register your models here.

admin.site.register(Restaurante)
admin.site.register(Origem)
admin.site.register(Comida)
admin.site.register(Flag)
admin.site.register(Horario)
