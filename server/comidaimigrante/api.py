from geopy.distance import vincenty
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from comidaimigrante.models import Restaurante, Cidade, Origem, Comida, Horario, Flag

class HorarioResource(ModelResource):
    class Meta:
        queryset = Horario.objects.all()

    def dehydrate(self, bundle):
        bundle.data['weekday'] = bundle.obj.weekday
        bundle.data['from_hour'] = bundle.obj.from_hour
        bundle.data['to_hour'] = bundle.obj.to_hour
        return bundle

class OrigemResource(ModelResource):
    class Meta:
        queryset = Origem.objects.all()
        include_resource_uri = False

class CidadeResource(ModelResource):
    class Meta:
        queryset = Cidade.objects.all()
        include_resource_uri = False

class ComidaResource(ModelResource):
    class Meta:
        queryset = Comida.objects.all()

class FlagResource(ModelResource):
    class Meta:
        queryset = Flag.objects.all()

class RestauranteResource(ModelResource):
    origem = fields.ForeignKey(OrigemResource, 'origem', full=True)
    cidade = fields.ForeignKey(CidadeResource, 'cidade', full=True)
    comida = fields.ManyToManyField(ComidaResource, 'comida', full=True)
    flags = fields.ManyToManyField(FlagResource, 'flags', full=True)
    horarios = fields.ToManyField(HorarioResource, attribute='restaurante', full=True, null=True)
    class Meta:
        queryset = Restaurante.objects.all()
        resource_name = 'restaurante'
        filtering = {
            "lat": ('lte','gte',),
            "long": ('lte','gte',),
            "nome": ('like','contains',),
            "origem": ('exact',),
            "flags": ALL_WITH_RELATIONS,
        }

    def dehydrate(self, bundle):
        local = (bundle.request.GET.get('local_lat'), bundle.request.GET.get('local_long'))
        remote = (bundle.data['lat'], bundle.data['long'])
        bundle.data['distance'] = vincenty(local, remote).meters
        return bundle

    # encontra horários do restaurante
    def dehydrate_horarios(self, bundle):
        res = HorarioResource()
        objects = Horario.objects.filter(restaurante=bundle.obj)
        bundles = [res.build_bundle(obj=obj, request=bundle.request) for obj in objects]
        return [res.dehydrate(bundle) for bundle in bundles]

    # exibe lista de nomes sem objetos
    def dehydrate_flags(self, bundle):
        flags = bundle.data['flags']
        return [flag.data['flag'] for flag in flags]

    # exibe lista de nomes sem objetos
    def dehydrate_comida(self, bundle):
        comidas = bundle.data['comida']
        return [comida.data['tag'] for comida in comidas]
