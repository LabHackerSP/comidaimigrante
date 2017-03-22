from django.contrib import admin
from import_export import resources

from import_export.admin import ImportExportModelAdmin

from comidaimigrante.models import Origem, Comida, Flag, Restaurante, Horario, Cidade, Regiao
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
    inlines = [HorariosInline]
    resource_class = RestauranteResource

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
