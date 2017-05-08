from django.contrib import admin
from django.conf import settings
from mce_filebrowser.admin import MCEFilebrowserAdmin


from website.models import Cozinheiro, Post
# Register your models here.

class CozinheiroAdmin(MCEFilebrowserAdmin):
    pass

class PostAdmin(MCEFilebrowserAdmin):
    pass

admin.site.register(Cozinheiro, CozinheiroAdmin)
admin.site.register(Post, PostAdmin)