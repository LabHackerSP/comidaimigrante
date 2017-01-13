from tastypie.resources import ModelResource
from comidaimigrante.models import Restaurante


class RestauranteResource(ModelResource):
    class Meta:
        queryset = Restaurante.objects.all()
        resource_name = 'restaurante'
