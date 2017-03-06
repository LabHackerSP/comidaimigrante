from geopy.distance import vincenty
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from comidaimigrante.models import Restaurante, Cidade, Origem, Comida, Horario, Flag


from tastypie.authentication import BasicAuthentication
from tastypie.authorization import DjangoAuthorization
from tastypie.validation import FormValidation
from django import forms


class CustomAuthentication(BasicAuthentication):
    """
    Authenticates everyone if the request is GET otherwise performs
    BasicAuthentication.
    """

    def is_authenticated(self, request, **kwargs):
        if request.method == 'GET': # Permite leitura sem autenticação
            return True
        return super(CustomAuthentication, self).is_authenticated(request, **kwargs)


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

class ComidaForm(forms.Form):
    comida = forms.CharField(max_length=20)

class ComidaResource(ModelResource):
    class Meta:
        queryset = Comida.objects.all()
        authentication = CustomAuthentication()
        authorization = DjangoAuthorization()
        validation=FormValidation(form_class=ComidaForm)

class FlagForm(forms.Form):
    flag = forms.CharField(max_length=20)

class FlagResource(ModelResource):
    class Meta:
        queryset = Flag.objects.all()
        filtering = {
            'flag': ALL
        }
        authentication = CustomAuthentication()
        authorization = DjangoAuthorization()
        validation=FormValidation(form_class=FlagForm)

class RestauranteForm(forms.Form):
    ## TODO: Definir outras regras de validacao
    ## nome = forms.CharField(min_length=20)
    

class RestauranteResource(ModelResource):
    nome = fields.CharField(attribute='nome', use_in='detail')
    link = fields.CharField(attribute='link', use_in='detail')
    sinopse = fields.CharField(attribute='sinopse', use_in='detail')
    telefone = fields.CharField(attribute='telefone', use_in='detail')
    origem = fields.ForeignKey(OrigemResource, 'origem', full=True)
    cidade = fields.ForeignKey(CidadeResource, 'cidade', full=True, use_in='detail')
    comida = fields.ManyToManyField(ComidaResource, 'comida', full=True, use_in='detail')
    flags = fields.ManyToManyField(FlagResource, 'flags', full=True, use_in='detail')
    horarios = fields.ToManyField(HorarioResource, attribute='restaurante', full=True, null=True, use_in='detail')
    class Meta:
        authentication = CustomAuthentication()
        authorization = DjangoAuthorization()
        validation=FormValidation(form_class=RestauranteForm)
        queryset = Restaurante.objects.filter(autorizado = True)
        resource_name = 'restaurante'
        excludes = ('autorizado')
        filtering = {
            "lat": ('lte','gte',),
            "long": ('lte','gte',),
            "nome": ('like','contains',),
            "origem": ('exact',),
            "flags": ALL_WITH_RELATIONS,
        }
    
    def apply_filters(self, request, applicable_filters):
        """
        Implementando filtro de maneira hackish por multiplos valores sem ter que zoar o core do django.
        """
        last_filter = self.get_object_list(request)
        if hasattr(request, 'GET'):
            filters = dict(request.GET.copy()) #Os metodos do Django pegam apenas o último valor de uma lista

        for filter_name in filters.keys():
            filter_values = filters[filter_name]
            if isinstance(filter_values,list) and '__exact' in filter_name:
                for value in filter_values:
                    last_filter = last_filter.filter(**{ filter_name : value })
        return last_filter.filter(**applicable_filters)

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