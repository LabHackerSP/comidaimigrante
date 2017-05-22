from geopy.distance import vincenty
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from comidaimigrante.models import Restaurante, Cidade, Origem, Comida, Horario, Flag, Regiao, Evento, UserProfile

from tastypie.authorization import Authorization, ReadOnlyAuthorization
from tastypie.authentication import SessionAuthentication, Authentication
from tastypie.authorization import DjangoAuthorization
from tastypie.exceptions import Unauthorized
from tastypie.validation import FormValidation
from django import forms
from django.contrib.auth.models import Permission

from urllib.parse import parse_qs
from tastypie.serializers import Serializer

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from tastypie.http import HttpUnauthorized, HttpForbidden
from django.conf.urls import url
from tastypie.utils import trailing_slash

from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()



class CustomAuthentication(SessionAuthentication):
    """
    Authenticates everyone if the request is GET otherwise performs
    BasicAuthentication.
    """
    def is_authenticated(self, request, **kwargs):
        """
        Checks to make sure the user is logged in & has a Django session.
        """
        # Cargo-culted from Django 1.3/1.4's ``django/middleware/csrf.py``.
        # We can't just use what's there, since the return values will be
        # wrong.
        # We also can't risk accessing ``request.POST``, which will break with
        # the serialized bodies.
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'TRACE'):
            return True

        return request.user.is_authenticated()


class RestauranteAuthorization(ReadOnlyAuthorization):
    def create_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.request.user.is_authenticated():
            return True

    def update_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.obj.user == bundle.request.user:
            return True

class EventoAuthorization(ReadOnlyAuthorization):
    def create_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.request.user.is_authenticated():
            return True

    def update_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.obj.user == bundle.request.user:
            return True

class HorarioAuthorization(ReadOnlyAuthorization):
    def create_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.request.user.is_authenticated():
            return True

    def delete_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.obj.user == bundle.request.user:
            return True

    def update_detail(self, object_list, bundle):
        if bundle.request.user.is_staff or bundle.obj.user == bundle.request.user:
            return True

    def create_list(self, object_list, bundle):
        print("post")
        allowed = []
        for horario in object_list:
            restaurante = Restaurante.objects.get(pk=horario.restaurante.pk)
            if bundle.request.user.is_staff or restaurante.user == bundle.request.user:
                allowed.append(horario)
        return allowed

    def update_list(self, object_list, bundle):
        print("hakuna matata")
        allowed = []
        for horario in object_list:
            restaurante = Restaurante.objects.get(pk=horario.restaurante.pk)
            if bundle.request.user.is_staff or restaurante.user == bundle.request.user:
                allowed.append(horario)
        return allowed

class UserAuthorization(ReadOnlyAuthorization):
    def update_detail(self, object_list, bundle):
        updated_user = User.objects.get(pk=bundle.obj.pk)
        if (bundle.request.user.is_staff or updated_user == bundle.request.user):
            return True

class urlencodeSerializer(Serializer):
    formats = ['json', 'xml', 'yaml', 'plist', 'urlencode']
    content_types = {
    'json': 'application/json',
    'xml': 'application/xml',
    'yaml': 'text/yaml',
    'plist': 'application/x-plist',
    'urlencode': 'application/x-www-form-urlencoded',
    }

    def from_urlencode(self, data,options=None):
        """ handles basic formencoded url posts """
        qs = dict((k, v if len(v)>1 else v[0] )
        for k, v in parse_qs(data).items())
        return qs

        def to_urlencode(self,content):
            pass

class BaseResource(ModelResource):
    class Meta:
        authentication = CustomAuthentication()
        authorization = ReadOnlyAuthorization()

class ProfileResource(BaseResource):
    class Meta:
        queryset = UserProfile.objects.all()

class UserResource(BaseResource):
    class Meta:
        queryset = User.objects.all()
        fields = ['first_name', 'last_name', 'username']
        list_allowed_methods = ['get']
        detail_allowed_methods = ['get','put']
        resource_name = 'user'
        serializer = urlencodeSerializer()
        authorization = UserAuthorization()

    def obj_create(self, bundle, **kwargs):
            bundle.obj = self._meta.object_class()

            for key, value in kwargs.items():
                setattr(bundle.obj, key, value)

            bundle = self.full_hydrate(bundle) # hydrate before authorize, not after
            self.authorized_create_detail(self.get_object_list(bundle.request), bundle)
            return self.save(bundle)


class HorarioResource(BaseResource):
    restaurante = fields.ForeignKey('comidaimigrante.api.RestauranteResource', 'restaurante')


    class Meta:
        queryset = Horario.objects.all()
        authorization = HorarioAuthorization()
        list_allowed_methods = ['get', 'patch', 'post', 'put', 'delete']

    def dehydrate(self, bundle):
        bundle.data['id'] = bundle.obj.id
        bundle.data['weekday'] = bundle.obj.weekday
        bundle.data['from_hour'] = bundle.obj.from_hour
        bundle.data['to_hour'] = bundle.obj.to_hour
        return bundle

class EventoResource(BaseResource):
    restaurante = fields.ForeignKey('comidaimigrante.api.RestauranteResource', 'restaurante')
    user = fields.ForeignKey('comidaimigrante.api.UserResource', 'user', full=True)
    visitors = fields.ToManyField('comidaimigrante.api.UserResource', 'visitors', null=True, full=True, use_in='detail')
    class Meta:
        authentication = CustomAuthentication()
        authorization = EventoAuthorization()
        queryset = Evento.objects.all()
        detail_allowed_methods = ['get','patch','delete']
        ordering = ['data']
        filtering = {
            'data': ALL
        }
        resource_name = 'evento'
        serializer = urlencodeSerializer()

    def dehydrate(self, bundle):
        #conta visitantes
        bundle.data['visitor_count'] = bundle.obj.visitors.count()
        return bundle

    # grava qual usuário criou o restaurante
    def hydrate_user(self, bundle):
        if bundle.request.method == 'POST':
            bundle.obj.user = User.objects.get(pk=bundle.request.user.pk)
        elif bundle.request.method == 'PATCH':
            bundle.obj.user = Restaurante.objects.get(pk=bundle.obj.pk).user
        return bundle

class OrigemResource(BaseResource):
    class Meta:
        queryset = Origem.objects.all()
        include_resource_uri = False

class RegiaoResource(BaseResource):
    class Meta:
        queryset = Regiao.objects.all()
        include_resource_uri = True

class CidadeResource(BaseResource):
    class Meta:
        queryset = Cidade.objects.all()
        include_resource_uri = False

class ComidaForm(forms.Form):
    comida = forms.CharField(max_length=20)

class ComidaResource(BaseResource):
    class Meta:
        queryset = Comida.objects.all()
        authentication = CustomAuthentication()
        authorization = ReadOnlyAuthorization()
        validation=FormValidation(form_class=ComidaForm)

class FlagForm(forms.Form):
    flag = forms.CharField(max_length=20)

class FlagResource(BaseResource):
    class Meta:
        queryset = Flag.objects.all()
        filtering = {
            'flag': ALL
        }
        authentication = CustomAuthentication()
        authorization = ReadOnlyAuthorization()
        validation=FormValidation(form_class=FlagForm)

class RestauranteForm(forms.Form):
    ## TODO: Definir outras regras de validacao
    ## nome = forms.CharField(min_length=20)
    pass

class RestauranteResource(BaseResource):
    link = fields.CharField(attribute='link', use_in='detail')
    sinopse = fields.CharField(attribute='sinopse', use_in='detail')
    telefone = fields.CharField(attribute='telefone', use_in='detail')
    origem = fields.ForeignKey(OrigemResource, 'origem', full=True)
    regiao = fields.ForeignKey(RegiaoResource, 'regiao', full=True)
    cidade = fields.ForeignKey(CidadeResource, 'cidade', full=True, use_in='detail')
    comida = fields.ManyToManyField(ComidaResource, 'comida', full=True, use_in='detail')
    flags = fields.ManyToManyField(FlagResource, 'flags', full=True, use_in='detail')
    horarios = fields.ToManyField(HorarioResource, attribute='horario_set', full=True, null=True, use_in='detail')
    eventos = fields.ToManyField(EventoResource, attribute='evento_set', full=True, null=True, use_in='detail')
    user = fields.ForeignKey(UserResource, 'user', use_in='detail', null=True)
    class Meta:
        authentication = CustomAuthentication()
        authorization = RestauranteAuthorization()
        validation=FormValidation(form_class=RestauranteForm)
        queryset = Restaurante.objects.all()
        detail_allowed_methods = ['get','patch']
        resource_name = 'restaurante'
        filtering = {
            "autorizado" : ('exact',),
            "lat": ('lte','gte',),
            "long": ('lte','gte',),
            "nome": ('like','contains',),
            "origem": ('exact', 'in'),
            "regiao": ('exact','in'),
            "flags": ('exact', 'in'),
            "comida" : ('exact', 'in'),
        }
        serializer = urlencodeSerializer()

    def apply_filters(self, request, applicable_filters):
        """
        Implementando filtro de maneira hackish por multiplos valores sem ter que zoar o core do django.
        """
        last_filter = self.get_object_list(request)
        if hasattr(request, 'GET'):
            filters = dict(request.GET.copy()) #Os metodos do Django pegam apenas o último valor de uma lista
        for filter_name in filters.keys():
            filter_values = filters[filter_name]
            if isinstance(filter_values,list) and '[]' in filter_name:
                for value in filter_values:
                    fn = filter_name.replace('[]','__in')
                    if fn not in applicable_filters:
                        applicable_filters[fn] = [value]
                    else:
                        applicable_filters[fn].append(value)

            if isinstance(filter_values,list) and '__exact' in filter_name:
                for value in filter_values:
                    last_filter = last_filter.filter(**{ filter_name : value })
        return last_filter.filter(**applicable_filters)

    # POST sempre não autorizado, necessita moderação
    def hydrate(self, bundle):
        bundle.data['autorizado'] = False
        if bundle.request.method == 'POST':
            bundle.data['user'] = User.objects.get(pk=bundle.request.user.pk)
        return bundle

    # grava qual usuário criou o restaurante
    #def hydrate_user(self, bundle):
    #    elif bundle.request.method == 'PATCH':
    #        bundle.obj.user = Restaurante.objects.get(pk=bundle.obj.pk).user
    #    return bundle

    #dá a distância de cada resultado comparado a um ponto
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

    def dehydrate_regiao(self, bundle):
        return bundle.data['regiao'].data['regiao']
