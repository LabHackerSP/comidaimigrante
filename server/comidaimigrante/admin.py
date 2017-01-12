from django.contrib import admin

from comidaimigrante.models import Origem, Comida, Flag, Restaurante, Horario, Cidade
# Register your models here.

class HorariosInline(admin.TabularInline):
    model = Horario

class RestauranteAdmin(admin.ModelAdmin):
    inlines = [HorariosInline]

admin.site.register(Restaurante, RestauranteAdmin)
admin.site.register(Origem)
admin.site.register(Comida)
admin.site.register(Flag)
admin.site.register(Cidade)
