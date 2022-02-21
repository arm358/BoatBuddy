from django.contrib import messages
import json
import os
import uuid

mapping = {
    "Depth Areas": "DEPARE",
    "Recommended Track": "RECTRC",
    "Soundings": "SOUNDG",
    "Beacons": "BCNLAT",
    "Buoys": "BOYLAT",
}

### --- Handlers --- ###

def enc_layer_extractor_handler(request, staged_file, filename):
    check = True if "GDAL " in os.popen("ogrinfo --version").read() else False
    success_list = []
    if check:
        for type in request.POST.getlist("enctype"):
            output = layer_extractor(staged_file, mapping[type])
            if os.path.getsize(output) > 0:
                if type == "Soundings":
                    response = sounding_converter(output, filename, None)
                    if response:
                        success_list.append(type)
                    else:
                        send_enc_message(request, [type], "warning", filename)
                elif type == "Depth Areas":
                    response = depth_area_converter(output, filename, None)
                    if response:
                        success_list.append(type)
                    else:
                        send_enc_message(request, [type], "warning", filename)
                elif type == "Recommended Track":
                    response = rec_track_converter(output, filename, None)
                    if response:
                        success_list.append(type)
                    else:
                        send_enc_message(request, [type], "warning", filename)
                elif type == "Buoys":
                    response = buoy_converter(output, filename, None)
                    if response:
                        success_list.append(type)
                    else:
                        send_enc_message(request, [type], "warning", filename)
                elif type == "Beacons":
                    response = beacon_converter(output, filename, None)
                    if response:
                        success_list.append(type)
                    else:
                        send_enc_message(request, [type], "warning", filename)
            else:
                messages.warning(
                    request,
                    f"No data available in requested layer {type} from {filename}.",
                )
            os.remove(output)
        if len(success_list) > 0:
            send_enc_message(request, success_list, "success", filename)

    else:
        messages.warning(
            request,
            f"The ENC Data Upload option is only available if GDAL is installed. Please visit the BoatBuddy GitHub for installation instructions.",
        )


def file_conversion_handler(request, staged_file, filename):

    chart = request.POST["geojsonchart"]
    type = request.POST["geojsontype"]

    if type == "Soundings":
        response = sounding_converter(staged_file, filename, chart)
        if response:
            send_geo_message(request, type, "success", filename, "SOUNDG")
        else:
            send_geo_message(request, type, "warning", filename, "SOUNDG")
    elif type == "Depth Areas":
        response = depth_area_converter(staged_file, filename, chart)
        if response:
            send_geo_message(request, type, "success", filename, "DEPARE")
        else:
            send_geo_message(request, type, "warning", filename, "DEPARE")
    elif type == "Recommended Track":
        response = rec_track_converter(staged_file, filename, chart)
        if response:
            send_geo_message(request, type, "success", filename, "RECTRC")
        else:
            send_geo_message(request, type, "warning", filename, "RECTRC")
    elif type == "Beacons":
        response = beacon_converter(staged_file, filename, chart)
        if response:
            send_geo_message(request, type, "success", filename, "BCNLAT")
        else:
            send_geo_message(request, type, "warning", filename, "BCNLAT")
    elif type == "Buoys":
        response = buoy_converter(staged_file, filename, chart)
        if response:
            send_geo_message(request, type, "success", filename, "BOYLAT")
        else:
            send_geo_message(request, type, "warning", filename, "BOYLAT")
    os.remove(staged_file)


### --- ENC Layer Extractor --- ###

def layer_extractor(staged_file, type):
    id = str(uuid.uuid4())[:7]
    output = f"{os.getcwd()}/core/assets/layers/staging_file{id}.geojson"
    os.system(f"ogr2ogr -overwrite {output} {staged_file} {type}")
    return output


### --- GeoJSON Converters --- ###

def rec_track_converter(staged_file, name, chart):
    destination = f"{os.getcwd()}/core/assets/layers/rectracks/"
    with open(staged_file) as f:
        data = json.load(f)
        if data["name"] == "RECTRC":
            if chart:
                output_name = name.split(".")[0] + "_" + chart + ".json"
            else:
                id = str(uuid.uuid4())[:7]
                output_name = name.split(".")[0] + "_" + id + ".json"
            with open(f"{destination}/{output_name}", "w") as outfile:
                json.dump(data, outfile)
            return True
        else:
            return False


def depth_area_converter(staged_file, name, chart):
    destination = f"{os.getcwd()}/core/assets/layers/depthareas/"
    with open(staged_file) as f:
        data = json.load(f)
        if data["name"] == "DEPARE":
            if chart:
                output_name = name.split(".")[0] + "_" + chart + ".json"
            else:
                id = str(uuid.uuid4())[:7]
                output_name = name.split(".")[0] + "_" + id + ".json"
            with open(f"{destination}/{output_name}", "w") as outfile:
                json.dump(data, outfile)
            return True
        else:
            return False


def sounding_converter(staged_file, name, chart):
    if chart:
        output_name = name.split(".")[0] + "_" + chart + ".json"
    else:
        id = str(uuid.uuid4())[:7]
        output_name = name.split(".")[0] + "_" + id + ".json"

    destination = f"{os.getcwd()}/core/assets/layers/soundings/{output_name}"
    sounding_out = {
        "type": "FeatureCollection",
        "name": f"{output_name}",
        "features": [],
    }
    with open(staged_file) as f:
        data = json.load(f)
        if data["name"] == "SOUNDG":
            for feature in data["features"]:
                if any(
                    isinstance(point, list)
                    for point in feature["geometry"]["coordinates"]
                ):
                    for coordinate in feature["geometry"]["coordinates"]:
                        x = {
                            "type": "Feature",
                            "properties": {
                                "depth": round(float(coordinate[2]) * 3.281, 1)
                            },
                            "geometry": {
                                "type": "MultiPoint",
                                "coordinates": [
                                    [
                                        coordinate[0],
                                        coordinate[1],
                                    ]
                                ],
                            },
                        }
                        sounding_out["features"].append(x)
                else:
                    coords = feature["geometry"]["coordinates"]
                    x = {
                        "type": "Feature",
                        "properties": {"depth": round(float(coords[2]) * 3.281, 1)},
                        "geometry": {
                            "type": "MultiPoint",
                            "coordinates": [
                                [
                                    coords[0],
                                    coords[1],
                                ]
                            ],
                        },
                    }
                    sounding_out["features"].append(x)

            with open(destination, "w") as outfile:
                json.dump(sounding_out, outfile)
            return True
        else:
            return False


def beacon_converter(staged_file, name, chart):
    if chart:
        output_name_1 = name.split(".")[0] + "_" + chart + "_T1.json"
        output_name_2 = name.split(".")[0] + "_" + chart + "_T2.json"
    else:
        id = str(uuid.uuid4())[:7]
        output_name_1 = name.split(".")[0] + "_" + id + "_T1.json"
        output_name_2 = name.split(".")[0] + "_" + id + "_T2.json"

    destination_1 = f"{os.getcwd()}/core/assets/layers/t1beacons/{output_name_1}"
    beacon_out_1 = {
        "type": "FeatureCollection",
        "name": f"{output_name_1}",
        "features": [],
    }
    destination_2 = f"{os.getcwd()}/core/assets/layers/t2beacons/{output_name_2}"
    beacon_out_2 = {
        "type": "FeatureCollection",
        "name": f"{output_name_2}",
        "features": [],
    }

    with open(staged_file, encoding="ascii") as f:
        data = json.load(f)
        if data["name"] == "BCNLAT":
            for feature in data["features"]:
                try:
                    if (
                        feature["properties"]["CATLAM"] == 1
                        or feature["properties"]["CATLAM"] == 3
                    ):
                        x = {
                            "type": "Feature",
                            "properties": {"OBJNAM": feature["properties"]["OBJNAM"]},
                            "geometry": {
                                "type": "Point",
                                "coordinates": feature["geometry"]["coordinates"],
                            },
                        }
                        beacon_out_1["features"].append(x)
                    elif (
                        feature["properties"]["CATLAM"] == 2
                        or feature["properties"]["CATLAM"] == 4
                    ):
                        x = {
                            "type": "Feature",
                            "properties": {"OBJNAM": feature["properties"]["OBJNAM"]},
                            "geometry": {
                                "type": "Point",
                                "coordinates": feature["geometry"]["coordinates"],
                            },
                        }
                        beacon_out_2["features"].append(x)
                except KeyError:
                    continue
            with open(destination_1, "w") as outfile:
                json.dump(beacon_out_1, outfile)
            with open(destination_2, "w") as outfile:
                json.dump(beacon_out_2, outfile)
            return True
        else:
            return False


def buoy_converter(staged_file, name, chart):
    if chart:
        output_name_1 = name.split(".")[0] + "_" + chart + "_T1.json"
        output_name_2 = name.split(".")[0] + "_" + chart + "_T2.json"
    else:
        id = str(uuid.uuid4())[:7]
        output_name_1 = name.split(".")[0] + "_" + id + "_T1.json"
        output_name_2 = name.split(".")[0] + "_" + id + "_T2.json"

    destination_1 = f"{os.getcwd()}/core/assets/layers/t1buoys/{output_name_1}"
    buoy_out_1 = {
        "type": "FeatureCollection",
        "name": f"{output_name_1}",
        "features": [],
    }
    destination_2 = f"{os.getcwd()}/core/assets/layers/t2buoys/{output_name_2}"
    buoy_out_2 = {
        "type": "FeatureCollection",
        "name": f"{output_name_2}",
        "features": [],
    }

    with open(staged_file) as f:
        data = json.load(f)
        if data["name"] == "BOYLAT":
            for feature in data["features"]:
                try:
                    if (
                        feature["properties"]["CATLAM"] == 1
                        or feature["properties"]["CATLAM"] == 3
                    ):
                        x = {
                            "type": "Feature",
                            "properties": {"OBJNAM": feature["properties"]["OBJNAM"]},
                            "geometry": {
                                "type": "Point",
                                "coordinates": feature["geometry"]["coordinates"],
                            },
                        }
                        buoy_out_1["features"].append(x)
                    elif (
                        feature["properties"]["CATLAM"] == 2
                        or feature["properties"]["CATLAM"] == 4
                    ):
                        x = {
                            "type": "Feature",
                            "properties": {"OBJNAM": feature["properties"]["OBJNAM"]},
                            "geometry": {
                                "type": "Point",
                                "coordinates": feature["geometry"]["coordinates"],
                            },
                        }
                        buoy_out_2["features"].append(x)
                except KeyError:
                    continue

            with open(destination_1, "w") as outfile:
                json.dump(buoy_out_1, outfile)
            with open(destination_2, "w") as outfile:
                json.dump(buoy_out_2, outfile)
            return True
        else:
            return False


### --- Marker Converter --- ###

def custom_marker_builder(markers):

    custom_markers = {
        "type": "FeatureCollection",
        "name": "Custom Markers",
        "features": [],
    }
    for marker in markers:
        x = {
                "type": "Feature",
                "properties": {"name": marker["name"], "caption": marker["caption"], "id": marker["uid"]},
                "geometry": {"type": "Point", "coordinates": [float(marker["longitude"]), float(marker["latitude"])]},
            }
        custom_markers["features"].append(x)
    
    print(custom_markers)
    return custom_markers


### --- Message Senders --- ###

def send_geo_message(request, type, outcome, filename, layerid):
    if outcome == "success":
        messages.success(request, f"{type} Upload Complete: {filename}")
    else:
        messages.warning(
            request,
            f"Something went wrong. Ensure you are uploading a {layerid} GeoJSON file from NOAA",
        )


def send_enc_message(request, type, outcome, filename):
    if outcome == "success":
        messages.success(request, f"{filename} ENC Upload Complete: {', '.join(type)}")
    else:
        messages.warning(
            request,
            f"Something went wrong. Ensure you are uploading an ENC file (.000 extension)",
        )


### --- Time Config --- ###
def get_time_config():
    file = f"{os.getcwd()}/core/assets/files/timeconfig.json"
    if os.path.getsize(file) > 0:
        with open(file) as config:
            data = json.load(config)
            dst = data["dst"]
            tz = data["timezone"]
            return dst, tz
    else:
        return False, 0

def set_time_config(dst, tz):
    file = f"{os.getcwd()}/core/assets/files/timeconfig.json"
    with open(file) as config:
        if os.path.getsize(file) > 0:
            data = json.load(config)
            data["dst"] = dst
            data["timezone"] = tz
        else:
            data ={"dst": False, "timezone": -8}
        with open(file, "w") as output:
            json.dump(data, output)
    return dst, tz