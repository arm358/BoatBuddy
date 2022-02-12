import urllib.request
import json  # Used to load data into JSON format
import pandas as pd
from datetime import datetime


def convert_date(inp):
    date = datetime.strptime(inp, "%Y-%m-%d %H:%M")
    date = date.strftime("%Y-%m-%d")
    return date


def convert_time(inp):
    t = datetime.strptime(inp, "%Y-%m-%d %H:%M")
    t = t.strftime("%H:%M")
    return t


begin_date = 20210714
end_date = 20300814

url = f"https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date={begin_date}&end_date={end_date}&datum=MLLW&station=8534975&time_zone=lst_ldt&units=english&interval=hilo&format=json"
response = urllib.request.urlopen(url)

text = response.read()

json_data = json.loads(text)


table = pd.DataFrame(json_data["predictions"])

table["date"] = table.apply(lambda row: convert_date(row["t"]), axis=1)
table["time"] = table.apply(lambda row: convert_time(row["t"]), axis=1)

print(table)


table.to_csv("tides.csv")
