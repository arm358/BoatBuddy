from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from core import consumers


websocket_urlpattern = [
    path("ws/data/", consumers.DashboardConsumer.as_asgi()),
]

application = ProtocolTypeRouter({"websocket": URLRouter(websocket_urlpattern)})
