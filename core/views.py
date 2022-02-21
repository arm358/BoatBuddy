from django.shortcuts import render, redirect
from django.http import HttpResponse, FileResponse
from django.template.response import TemplateResponse
from django.contrib import messages
from .forms import UploadGeoJSONForm, UploadENCForm
from .converters import *
from .models import Marker
import uuid
import os


### --- Main Views --- ###
def home(request):
    home_marker, default_marker, custom_markers = get_markers()
    layers = get_layers()
    return render(
        request,
        "home.html",
        {
            "home_marker": home_marker,
            "default_marker": default_marker,
            "layers": layers,
            "custom_markers": custom_markers,
        },
    )

def customize(request):
    if request.method == "POST":
        if request.POST["source"] == "geojson":
            form = UploadGeoJSONForm(request.POST, request.FILES)
            if form.is_valid() and correct_extensions(request, "geojson"):
                for file in request.FILES.getlist("geojsonfiles"):
                    staged_file = handle_uploaded_file(file)
                    file_conversion_handler(request, staged_file, file.name)
                return redirect("customize")
            else:
                print(form.errors)
                messages.warning(
                    request,
                    "Something went wrong. Please double check that you are uploading a GeoJSON file and have selected a Layer Type.",
                )
                return redirect("customize")
        elif request.POST["source"] == "enc":
            form = UploadENCForm(request.POST, request.FILES)
            if form.is_valid() and correct_extensions(request, "000"):
                for file in request.FILES.getlist("encfiles"):
                    staged_file = handle_uploaded_file(file)
                    enc_layer_extractor_handler(request, staged_file, file.name)
            else:
                print(form.errors)
                messages.warning(
                    request,
                    "Something went wrong. Please double check that you are uploading an ENC file (.000 file extension) and have selected your desired layers.",
                )
            return redirect("customize")
        elif request.POST["source"] == "tide":
            if correct_extensions(request, "csv"):
                with open(f"{os.getcwd()}/core/assets/files/tides.csv", "wb+") as outfile:
                    for chunk in request.FILES["csvfiles"].chunks():
                        outfile.write(chunk)
                messages.success(request, f"Tide data updated successfully.")
                return redirect("customize")
            else:
                messages.warning(request, f"Issue with tide data. Please upload a .csv file.")
                return redirect("customize")
        else:
            update_standard_markers(request)
            return redirect("customize")
    else:
        dst, tz = get_time_config()
        layers = get_existing_layers()
        home_marker = Marker.objects.get(name="home")
        default_marker = Marker.objects.get(name="default")
        markers = Marker.objects.exclude(name="home").exclude(name="default")
    return render(
        request,
        "customize.html",
        {
            "layers": layers,
            "default_marker": default_marker,
            "home_marker": home_marker,
            "markers": markers,
            "dst": dst,
            "tz": tz
        },
    )


### --- ASYNC Views --- ###
def shutdown(request):
    os.system("sudo shutdown -h now")
    return HttpResponse("")

def update_standard_markers(request):
    name = request.POST["source"]
    marker = Marker.objects.get(name=request.POST["source"])
    marker.latitude = request.POST["latitude"]
    marker.longitude = request.POST["longitude"]
    marker.save()
    messages.success(request, f"{name.capitalize()} marker location updated.")

def add_marker(request):
    try:
        uid = str(uuid.uuid4())[:7]
        name = (
            request.POST["name"]
            if request.POST["name"] != ""
            and request.POST["name"] not in ["home", "default"]
            else uid
        )
        marker = Marker.objects.create(
            name=name,
            uid=uid,
            latitude=request.POST["latitude"],
            longitude=request.POST["longitude"],
            caption=request.POST["caption"],
        )
        if request.POST["source"] == "customize":
            response = TemplateResponse(request, "marker_row.html", {"marker": marker})
        else:
            response = TemplateResponse(request, "marker_popup_success.html")
            response["HX-Trigger"] = "success"
        return response
    except:
        response = TemplateResponse(request, "marker_error_row.html", {})
        return response

def delete_marker(request):
    if request.method == "POST":
        Marker.objects.get(name=request.POST["name"]).delete()
        return HttpResponse("")
    else:
        return redirect("customize")

def delete_file(request):
    if request.method == "POST":
        for root, dirs, files in os.walk("./core/assets/layers/"):
            for file in files:
                if file == request.POST["file"]:
                    os.remove(os.path.join(root, file))
        return HttpResponse("")
    else:
        return redirect("customize")

def download_file(request, file):
    for root, dirs, files in os.walk("core/assets/layers/"):
        for filename in files:
            if filename == file:
                return FileResponse(
                    open(os.path.join(root, file), "rb"),
                    content_type="application/force-download",
                )

def update_time_config(request):
    if request.method == "POST":
        dst_flag = True if "dst" in request.POST else False
        dst, tz = set_time_config(dst_flag, request.POST["tz"])
        response = TemplateResponse(request, "time_config.html", {"dst": dst, "tz": tz})
        response["HX-Trigger-After-Swap"] = "success"
        response["HX-Trigger"] = "remove"
        return response
    else:
        return redirect("customize")

### --- Helper Functions --- ###
def get_markers():
    markers = Marker.objects.exclude(name="home").exclude(name="default").values()
    custom_markers = custom_marker_builder(markers)

    home = Marker.objects.get(name="home")
    default = Marker.objects.get(name="default")

    home_marker = [float(home.longitude), float(home.latitude)]
    default_marker = [float(default.longitude), float(default.latitude)]

    return home_marker, default_marker, custom_markers

def correct_extensions(request, extension):
    extension = extension.lower()
    correct_extensions = (
        True
        if all(
            file.name.split(".")[1] == extension
            for file in request.FILES.getlist(f"{extension}files")
        )
        else False
    )
    return correct_extensions

def get_layers():
    layers = {}
    for item in sorted(os.listdir("./core/assets/layers")):
        file_list = []
        if os.path.isdir(f"./core/assets/layers/{item}"):
            for file in os.listdir(f"./core/assets/layers/{item}"):
                if not file.startswith("."):
                    file_list.append(file)
            layers[item] = file_list
    return layers

def get_existing_layers():
    mapping = {
        "depthareas": "Depth Areas",
        "rectracks": "Recommended Tracks",
        "soundings": "Soundings",
        "t1beacons": "Beacons - Green",
        "t1buoys": "Buoys - Green",
        "t2beacons": "Beacons - Red",
        "t2buoys": "Buoys - Red",
    }
    order = [
        "Soundings",
        "Depth Areas",
        "Recommended Tracks",
        "Buoys - Green",
        "Buoys - Red",
        "Beacons - Green",
        "Beacons - Red",
    ]
    layers = {}
    sort = {}
    for item in os.listdir("./core/assets/layers"):
        file_list = []
        if os.path.isdir(f"./core/assets/layers/{item}"):
            for file in os.listdir(f"./core/assets/layers/{item}"):
                if not file.startswith("."):
                    file_list.append(file)
            layers[mapping[item]] = file_list

    for item in order:
        sort[item] = layers[item]
    return sort

def handle_uploaded_file(file):
    extension = (file.name.split("."))[1]
    directory = f"{os.getcwd()}/core/assets/layers/staging_file.{extension}"
    with open(directory, "wb+") as destination:
        for chunk in file.chunks():
            destination.write(chunk)
    return directory
