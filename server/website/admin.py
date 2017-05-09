from django.contrib import admin
from django.conf import settings
from mce_filebrowser.admin import MCEFilebrowserAdmin


from website.models import Cozinheiro, Post, Pagina
# Register your models here.

class CozinheiroAdmin(MCEFilebrowserAdmin):
    pass

class PostAdmin(MCEFilebrowserAdmin):
    pass

class PaginaAdmin(MCEFilebrowserAdmin):
    pass

admin.site.register(Cozinheiro, CozinheiroAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Pagina, PaginaAdmin)