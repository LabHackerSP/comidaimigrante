from django.contrib import admin

from comidaimigrante.models import Origem, Comida, Flag, Restaurante, Horario, Cidade
# Register your models here.

class HorariosInline(admin.TabularInline):
    model = Horario

class RestauranteAdmin(admin.ModelAdmin):
    inlines = [HorariosInline]

    def save_model(self, request, obj, form, change): 
        obj.user = request.user
        obj.save()

admin.site.register(Restaurante, RestauranteAdmin)
admin.site.register(Origem)
admin.site.register(Comida)
admin.site.register(Flag)
admin.site.register(Cidade)
