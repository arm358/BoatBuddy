import json
import websocket
import random
from datetime import datetime, timedelta
import serial
import pandas as pd
import warnings
import numpy as np
import time
import adafruit_gps
from pykalman import KalmanFilter

warnings.filterwarnings("ignore")

#####  -----   Global Variables ----- #####
wsaddress = "ws://boatbuddy.live/ws/data/"
serialport = "/dev/ttyS0"
tides = pd.read_csv("./core/assets/files/tides.csv")
dst = pd.read_csv("./core/assets/files/dst.csv")
previous_heading = 0
track_history = []
connected = False
last_print = time.monotonic()
counter = 100

#####  -----   Instantiate ----- #####
""" create websocket """
ws = websocket.WebSocket()

""" start the serial connection to read GPS data """
uart = serial.Serial(serialport, baudrate=9600, timeout=10)
gps = adafruit_gps.GPS(uart, debug=False)
gps.send_command(b"PMTK314,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0")
gps.send_command(b"PMTK220,1000")



def heading_cleanser(heading):
    """ returns the heading only if > 2 degrees of difference between last heading
    this reduces the small incremental changes in heading from being  displayed on the map """
    global previous_heading
    try:
        heading = int(heading)
        if abs(previous_heading - heading) < 2:
            return previous_heading
        else:
            previous_heading = heading
            return heading
    except:
        return previous_heading

def C_to_F(c):
    """convert deg C to deg F """
    f = round(c * (9 / 5) + 32)
    return f


def knots_to_mph(knots):
    """ conver knots to mph """
    mph = round(knots * 1.151, 2)
    return mph

def knots_to_kph(knots):
    """ conver knots to kph """
    kph = round(knots * 1.852, 2)
    return kph

def gmt_offset(now, dstflag, tz):
    """since GPS time is GMT without daylight savings, converts current time to configured 
    timezone and accounts for DST"""
    year = int(now.strftime("%Y"))
    startdate = dst[dst["year"] == year].iloc[0]["startdate"]
    endday = dst[dst["year"] == year].iloc[0]["endday"]
    begin = datetime.strptime(str(year) + " 3 " + str(startdate), "%Y %m %d")
    end = datetime.strptime(str(year) + " 10 " + str(endday), "%Y %m %d")

    if now >= begin and now <= end and dstflag:
        now = now + timedelta(hours=tz+1)
    else:
        now = now + timedelta(hours=tz)

    return now


def filter(line):
    """ Kalman filter to remove erroneous GPS data and smooth the output """
    output = []

    measurements = np.asarray(line)
    initial_state_mean = [measurements[0, 0], 0, measurements[0, 1], 0]

    transition_matrix = [[1, 1, 0, 0], [0, 1, 0, 0], [0, 0, 1, 1], [0, 0, 0, 1]]

    observation_matrix = [[1, 0, 0, 0], [0, 0, 1, 0]]

    kf1 = KalmanFilter(
        transition_matrices=transition_matrix, observation_matrices=observation_matrix, initial_state_mean=initial_state_mean
    )
    kf1 = kf1.em(measurements, n_iter=5)

    kf2 = KalmanFilter(
        transition_matrices=transition_matrix,
        observation_matrices=observation_matrix,
        initial_state_mean=initial_state_mean,
        observation_covariance=10 * kf1.observation_covariance,
        em_vars=["transition_covariance", "initial_state_covariance"],
    )

    kf2 = kf2.em(measurements, n_iter=5)
    (smoothed_state_means, smoothed_state_covariances) = kf2.smooth(measurements)

    out = smoothed_state_means.tolist()

    for item in out:
        output.append([item[0], item[2]])

    return output


def gps_converter(lat, lon, track_history):
    """ Rounds the lat/lon from GPS data and creates the list of coordinates that shows the previous route taken
    this removes the last 15 data points due to those not being as smoothed as earlier points"""
    try:
        lat = round(lat,5)
        lon = round(lon,5)

        noduplicates = track_history[-10:]
        if not [lon, lat] in noduplicates:
            track_history.append([lon, lat])

        outline = filter(track_history[-15:])
        track_history = track_history[:-15]

        for item in outline:
            item[0] = round(item[0],5)
            item[1] = round(item[1],5)
            track_history.append(item)
        lat = track_history[-5][1]
        lon = track_history[-5][0]
        return lat, lon, track_history
    except:
        return lat, lon, track_history



def get_tide_data(now_time):
    """pulls tide data from the saved tides.csv file. This is only called every 100seconds to reduce overhead"""
    tides["datetime"] = tides.apply(lambda row: datetime.strptime(row["t"], "%m/%d/%Y %H:%M"), axis=1)
    next_tides = tides.loc[tides["datetime"] >= now_time]

    type = next_tides.iloc[0]["type"]
    tide_time = next_tides.iloc[0]["time"]

    today = now_time.strftime("%Y-%m-%d")
    tomorrow = now_time + timedelta(days=1)
    tomorrow = tomorrow.strftime("%Y-%m-%d")

    tide_window = tides.loc[(tides["date"] == today) | (tides["date"] == tomorrow)]
    heights = tide_window["v"].tolist()
    times = tide_window["time"].tolist()

    return (type, tide_time, heights, times)


def get_cardinal(heading):
    """a non-optimized way of converting the heading in degrees to cardinal heading"""
    heading = int(round(float(heading)))
    if heading >= 337 or heading <= 23:
        cardinal = "N"
    elif heading > 23 and heading < 67:
        cardinal = "NE"
    elif heading >= 67 and heading <= 113:
        cardinal = "E"
    elif heading > 113 and heading < 157:
        cardinal = "SE"
    elif heading >= 157 and heading <= 203:
        cardinal = "S"
    elif heading > 203 and heading < 247:
        cardinal = "SW"
    elif heading >= 247 and heading <= 293:
        cardinal = "W"
    elif heading > 293 and heading < 337:
        cardinal = "NW"
    return cardinal


#### ------ main loop to read GPS sensor and send over websocket to frontend ------ ####
while True:
    try: #getting gps data can sometimes be corrupt, so if error then just continue and try to read data again
        gps.update()
        current = time.monotonic()

        if current - last_print >= 1.0: #pulls from GPS data every second without a sleep
            last_print = current
            if not gps.has_fix: # ensure we have a fix to satellites
                print("Waiting for fix...")
                continue
            while not connected: # connect to the websocket
                try:
                    ws.connect(wsaddress)
                    connected = True
                except:
                    pass
            if counter % 100 == 0: #only pulls tide data every 100 loops == every 100 seconds
                counter = 0
                now = datetime.strptime(f"{gps.timestamp_utc.tm_year} {gps.timestamp_utc.tm_mon} {gps.timestamp_utc.tm_mday} {gps.timestamp_utc.tm_hour} {gps.timestamp_utc.tm_min}", "%Y %m %d %H %M")
                with open("./core/assets/files/timeconfig.json", "r") as timeconfig:
                    data = json.load(timeconfig)
                    dstflag = data["dst"]
                    tz = int(data["timezone"])
                ctime = gmt_offset(now, dstflag, tz)
                type, tide_time, heights, times = get_tide_data(ctime)
            lat, lon, track_history = gps_converter(gps.latitude, gps.longitude, track_history)
            #this is the data package send over websocket and rendered in the browser
            payload = {
                        "mph": knots_to_mph(float(gps.speed_knots)),
                        "knts": round(float(gps.speed_knots),2),
                        "kph": knots_to_kph(float(gps.speed_knots)),
                        "direction": get_cardinal(gps.track_angle_deg),
                        "heading": heading_cleanser(gps.track_angle_deg),
                        "depth": 0,
                        "air": 0,
                        "humidity": 0,
                        "time": ctime.strftime("%H:%M"),
                        "tide_type": type,
                        "tide_time": tide_time,
                        "heights": heights,
                        "times": times,
                        "lat": lat,
                        "lon": lon,
                        "track": track_history[:-4],
                    }
            print(payload) #print data to console for further review. This gets stored in /tmp/rclocal.out
            ws.send(json.dumps(payload)) #send data over websocket
            counter += 1 #counter for tide data loop
    except Exception as e:
        connected = False #reset the websocket connection and retry to connect
        continue

