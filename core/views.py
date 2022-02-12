from django.shortcuts import render
import os
import json
from django.http import JsonResponse

# Create your views here.


def index(request):
    home = [-74.570980, 39.287440] #set these to your home location lon/lat!
    begin = [-74.571009, 39.288843] #set this to where you'd like the current location (boat icon) to default to
    return render(request, "index.html", {"home": home, "current": begin})


def shutdown(request):
    data = os.system("sudo shutdown -h now")
    print(data)
    return render(request, "shutdown.html")

def log_data(request):
    data = request.POST
    data = dict(data)

    with open("track_history.json", "w") as f:
        json.dump(data, f)
    return JsonResponse({"response": "success"})

def start_data(request):
    os.system("python3 /home/pi/boatbuddy/data.py")
    return JsonResponse({"response": "success"})
