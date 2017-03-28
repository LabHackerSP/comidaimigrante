from geopy.distance import vincenty
from tastypie import fields
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from comidaimigrante.models import Restaurante, Cidade, Origem, Comida, Horario, Flag, Regiao, Evento

from tastypie.authorization import Authorization
from tastypie.authentication import BasicAuthentication, Authentication
from tastypie.authorization import DjangoAuthorization
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
User = get_user_model()

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

class UserResource(ModelResource):
    class Meta:
        queryset = User.objects.all()
        fields = ['first_name', 'last_name']
        allowed_methods = ['get', 'post']
        resource_name = 'user'
        serializer = urlencodeSerializer()

    def override_urls(self):
        return [
            url(r"^(?P<resource_name>%s)/login%s$" %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('login'), name="api_login"),
            url(r'^(?P<resource_name>%s)/logout%s$' %
                (self._meta.resource_name, trailing_slash()),
                self.wrap_view('logout'), name='api_logout'),
        ]

    def login(self, request, **kwargs):
        self.method_check(request, allowed=['post'])

        data = self.deserialize(request, request.body, format=request.META.get('CONTENT_TYPE', 'application/json'))

        username = data.get('username', '')
        password = data.get('password', '')

        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                login(request, user)
                return self.create_response(request, {
                    'success': True
                })
            else:
                return self.create_response(request, {
                    'success': False,
                    'reason': 'disabled',
                    }, HttpForbidden )
        else:
            return self.create_response(request, {
                'success': False,
                'reason': 'incorrect',
                }, HttpUnauthorized )

    def logout(self, request, **kwargs):
        self.method_check(request, allowed=['get'])
        if request.user and request.user.is_authenticated():
            logout(request)
            return self.create_response(request, { 'success': True })
        else:
            return self.create_response(request, { 'success': False }, HttpUnauthorized)

class CustomAuthentication(BasicAuthentication):
    """
    Authenticates everyone if the request is GET otherwise performs
    BasicAuthentication.
    """

    def is_authenticated(self, request, **kwargs):
        if request.method == 'GET': # Permite leitura sem autenticação
            return True
        return super(CustomAuthentication, self).is_authenticated(request, **kwargs)

class CustomAuthorization(DjangoAuthorization):
    # sempre deixa ler lista
    def read_list(self, object_list, bundle):
        return object_list

    # sempre deixa ler objeto
    def read_detail(self, object_list, bundle):
        return True

    def create_list(self, object_list, bundle):
        # aqui o objeto é criado, deve estar logado
        return object_list

    def update_detail(self, object_list, bundle):
        # aqui o objeto é editado, deve ser admin ou mesmo usuário que criou
        return True

class HorarioResource(ModelResource):
    class Meta:
        queryset = Horario.objects.all()

    def dehydrate(self, bundle):
        bundle.data['weekday'] = bundle.obj.weekday
        bundle.data['from_hour'] = bundle.obj.from_hour
        bundle.data['to_hour'] = bundle.obj.to_hour
        return bundle

class EventoResource(ModelResource):
    restaurante = fields.ForeignKey('comidaimigrante.api.RestauranteResource', 'restaurante')
    user = fields.ForeignKey('comidaimigrante.api.UserResource', 'user', full=True)
    class Meta:
        queryset = Evento.objects.all()
        include_resource_uri = False
        authentication = CustomAuthentication()
        authorization = Authorization()
    

class OrigemResource(ModelResource):
    class Meta:
        queryset = Origem.objects.all()
        include_resource_uri = False

class RegiaoResource(ModelResource):
    class Meta:
        queryset = Regiao.objects.all()
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
        authorization = CustomAuthorization()
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
        authorization = CustomAuthorization()
        validation=FormValidation(form_class=FlagForm)

class RestauranteForm(forms.Form):
    ## TODO: Definir outras regras de validacao
    ## nome = forms.CharField(min_length=20)
    pass

class RestauranteResource(ModelResource):
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
    user = fields.ForeignKey(UserResource, 'user', use_in='detail')
    class Meta:
        #authentication = CustomAuthentication()
        authorization = Authorization()
        validation=FormValidation(form_class=RestauranteForm)
        queryset = Restaurante.objects.filter(autorizado = True)
        resource_name = 'restaurante'
        excludes = ('autorizado')
        filtering = {
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
        return bundle

    # grava qual usuário criou o restaurante
    def hydrate_user(self, bundle):
        user = User.objects.get(pk=bundle.request.user.pk)
        bundle.obj.user = user
        return bundle

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