from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("shutdown/", views.shutdown, name="shutdown"),
    path("log_data/", views.log_data, name="log_data"),
]
