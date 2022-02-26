import urllib.request
import json
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

def scrape_data(begin_date, end_date, station_id):
    url = f"https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=NOS.COOPS.TAC.WL&begin_date={begin_date}&end_date={end_date}&datum=MLLW&station={station_id}&time_zone=lst_ldt&units=english&interval=hilo&format=json"
    print(url)
    response = urllib.request.urlopen(url)
    text = response.read()
    data = json.loads(text)

    create_predictions(data)

def create_predictions(data):
    table = pd.DataFrame(data["predictions"])
    table["date"] = table.apply(lambda row: convert_date(row["t"]), axis=1)
    table["time"] = table.apply(lambda row: convert_time(row["t"]), axis=1)
    table.to_csv("./assets/files/tides.csv")

def clean_dates(begin_date, end_date):
    begin_date = begin_date.replace("-", "")
    end_date = end_date.replace("-", "")
    return begin_date, end_date




