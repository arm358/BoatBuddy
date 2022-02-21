import urllib.request
import json
import pandas as pd
from datetime import datetime
import os


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
    
    response = urllib.request.urlopen(url)

    text = response.read()
    data = json.loads(text)

    create_predictions(data)

def create_predictions(data):
    table = pd.DataFrame(data["predictions"])
    table["date"] = table.apply(lambda row: convert_date(row["t"]), axis=1)
    table["time"] = table.apply(lambda row: convert_time(row["t"]), axis=1)
    table.to_csv("tides.csv")
    


def proceed():
    print("This script requires BoatBuddy to be connected to the internet! It will not work if the ethernet cable is not plugged in.")
    print(" ")
    print("You will also need your station ID. Find your station ID at NOAA's website: https://tidesandcurrents.noaa.gov/tide_predictions.html")
    proceed = input("Continue [y/n]?")
    if proceed.lower() == "y" or proceed.lower() == "yes":
        return True
    else:
        return False

def get_dates():
    begin_date = input("Please enter start date in YYYYMMDD format: ")
    end_date = input("Please enter end date in YYYYMMDD format: ")
    if clean_dates(begin_date, end_date):
        return str(begin_date), str(end_date)
    else:
        print("Something's wrong with the dates.")
        return False, False

def clean_dates(begin_date, end_date):
    try:
        begin_date = datetime.strptime(str(begin_date), "%Y%m%d")
        end_date = datetime.strptime(str(end_date), "%Y%m%d")
        return True
    except:
        return False

def get_station_id():
    station_id = input("Input your station ID: ")
    try:
        station_id = int(station_id)
        return str(station_id)
    except:
        print("Please only enter numbers!")
        return False

if __name__ == "__main__":
    if proceed():
        ready = False
        while not ready:
            station_id = get_station_id()
            if not station_id:
                continue
            begin_date, end_date = get_dates()
            if not begin_date or not end_date:
                continue
            ready = True
        scrape_data(begin_date, end_date, station_id)
        print(f"tides.csv saved in {os.getcwd()}")
    else:
        exit()

