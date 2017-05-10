from django.contrib import admin
from django.conf import settings
from import_export import resources

from import_export.admin import ImportExportModelAdmin

from comidaimigrante.models import Origem, Comida, Flag, Restaurante, Horario, Cidade, Regiao, Evento
# Register your models here.

class HorariosInline(admin.TabularInline):
    model = Horario


class RestauranteResource(resources.ModelResource):
    class Meta:
        model = Restaurante

class OrigemResource(resources.ModelResource):
    class Meta:
        model = Origem
        import_id_fields = ('nome',)
        exclude = ('id',)

class FlagResource(resources.ModelResource):
    class Meta:
        model = Flag
        import_id_fields = ('flag',)
        exclude = ('id',)

class ComidaResource(resources.ModelResource):
    class Meta:
        model = Comida
        import_id_fields = ('tag',)
        exclude = ('id',)

class RestauranteAdmin(ImportExportModelAdmin):
    list_display = ('nome', 'user', 'origem', 'regiao', 'autorizado')
    list_editable = ('autorizado',)
    list_filter = ('origem', 'regiao', 'autorizado')
    inlines = [HorariosInline]
    resource_class = RestauranteResource

    class Media:
        js = [
            'http://code.jquery.com/jquery-1.4.2.min.js', 
            'http://maps.google.com/maps/api/js?sensor=false', 
            settings.STATIC_URL +'admin/long-lat-render.js'
        ]

    def save_model(self, request, obj, form, change):
        obj.user = request.user
        obj.save()

class ComidaAdmin(ImportExportModelAdmin):
	resource_class = ComidaResource

class OrigemAdmin(ImportExportModelAdmin):
	resource_class = OrigemResource


class FlagAdmin(ImportExportModelAdmin):
    resource_class = FlagResource

class HorarioAdmin(ImportExportModelAdmin):
    pass

admin.site.register(Restaurante, RestauranteAdmin)
admin.site.register(Origem, OrigemAdmin)
admin.site.register(Comida, ComidaAdmin)
admin.site.register(Flag, FlagAdmin)
admin.site.register(Horario, HorarioAdmin)
admin.site.register(Regiao)
admin.site.register(Cidade)
admin.site.register(Evento)
