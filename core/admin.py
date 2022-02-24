from django.contrib import admin
from .models import Marker, MapMode

class MarkerAdmin(admin.ModelAdmin):
    model = Marker
    list_display = ["name", "latitude","longitude"]

admin.site.register(Marker, MarkerAdmin)
admin.site.register(MapMode)