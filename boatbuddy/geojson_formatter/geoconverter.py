import json

output_name = ""
file_name = ""

new_data_json = {"type": "FeatureCollection", "name": f"{output_name}", "features": []}


with open(f"{file_name}") as f:
    data = json.load(f)

    for feature in data["features"]:
        for coordinate in feature["geometry"]["coordinates"]:
            x = {
                "type": "Feature",
                "properties": {"depth": round(float(coordinate[2]) * 3.281, 1)},
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
            new_data_json["features"].append(x)


with open(f"{output_name}", "w") as outfile:
    json.dump(new_data_json, outfile)
