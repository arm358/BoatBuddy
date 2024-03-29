# BoatBuddy
### An open-source boat display cockpit for navigation, speed, heading, and tide tables running on Raspberry Pi and accessible as a webapp through any smartphone or tablet


## Features
- Navigational map showing current location, heading, location history, depths, buoys, and recommended track
- Speedometer showing current speed via GPS satellite data (toggle between Knots and MPH)
- Tide table showing high and low tides for next 8 periods
- Standalone access-point and self-hosted -- no internet connection required
- Accessible via any browser @ http://boatbuddy.live with ability for many simultaneous connections
- Night/Day Mode, custom map markers (waypoints), easy data customization for any coastal area 

<div float="center">
  <div>
  <img src="screenshots/Landscape_Speedometer.gif" width="600" />
  <img src="screenshots/Landscape_Map.gif" width="600" /> 
  </div>
  <div>
  <img src="screenshots/Portrait_Speedometer.gif" width="200" />
  <img src="screenshots/Portrait_Map.gif" width="200" />
    <img src="screenshots/IMG_5556.PNG" width="200" />
    </div
</div>
    <img src="screenshots/IMG_5588.jpg" width="600" />

## Parts List
- Raspberry Pi 3b+ || Raspberry Pi 4 || Raspberry Pi Zero 2 
  - Any of these will work. Any Raspberry Pi less powerful is not recommended due to the overhead of the data smoothing algorithm
  - If you choose a Raspberry Pi Zero 2, it will work but the Bluetooth audio function will not since it does not have a 3.5mm Audio Output
- <a href="https://www.adafruit.com/product/746">Adafruit GPS Breakout<a>
- Small wires, solder, soldering iron, etc. to turn the GPS Breakout into a HAT.

## Installation
#### Installation is made easy by the install script included in the repository.
It is recommended to start with a fresh install of Raspberry Pi OS Lite (no desktop environment). Once booted into your Raspberry Pi, plug in an ethernet cable (or connect to WiFi) and follow the steps and commands below.
- Install git `sudo apt-get install git`
- Change directory to the home folder `cd /home/pi`
- Clone the BoatBuddy repository `git clone https://github.com/arm358/BoatBuddy`
- Change directory into the new BoatBuddy folder `cd BoatBuddy`
- Make the install script executable `sudo chmod +x install.sh`
- Run the install script `./install.sh`
#### Note: This may take a while as files are downloaded and unpacked, so please be patient! Once the installation completes, you'll be prompted to restart.

## Setup

### WiFi Details
```
wifi name = BoatBuddy
wifi password = boatbuddy
```

### Connecting GPS Module
Wire the GPS module as follows:
<div>
<img src="https://cdn-learn.adafruit.com/assets/assets/000/062/852/original/adafruit_products_sensors_uartgps_bb.png?1538430197" width=600>
</div>

## Usage

### Connection & Viewing
1. Connect to the BoatBuddy WiFi network
2. Navigate to http://boatbuddy.live
3. In order to remove address bar on Apple iOS devices for a "cleaner" look:
   - In Safari and while on the page:
     - Tap the "Share" button on the bottom bar
     - Tap "Add to Home Screen"
     - Tap "Add"
   - The page should now have a shortcut on your homescreen, and will display in an app-like format (without the address bar at the top)

### Functions

- Tap the Tide Data icon in the top-left corner to toggle the tide chart 
  - The Tide data button is replaced by the current speed.
  - Tap again to revert back to Speedometer

- Tap anywhere on the Speedometer chart to change to MPH instead of knots.
  - Tap again to revert back to knots
 
- Tap the Heading icon in the top right corner to toggle to the Map.
  - Use pinching and two-fingers to zoom and spin the view.
  - Tap the Lock button to stop the view from being moved to the current position. Useful for panning around the map.
    - Tap the Unlock button to re-couple the view with the current position.

- Tap the Gear icon to open additional settings:
  - Day/Night Mode: toggle the theme for the map from Day to Night or vice versa. Selected option is persistent through restart.
  - Toggle Route History: toggle on/off the track history (previous route) from view
  - Edit Configuration: change the settings for BoatBuddy. See Configuration section.
  - Add Marker: adds a custom marker to the current location with a name and description. Markers are persistent through restart.

- Tap the Heading again to revert back to the Speedometer (or tide chart -- whichever was displayed last)

- Tap the Power button and confirm to safely shutdown the system

## Configuration
#### Configuration page has many options to customize the data to any location. Access the configuration page by clicking the Gear icon on the map, then selecting the Edit Configuration option.

    
### Upload Data
#### This section updates the layers on the map (depth soundings, depth areas, etc.) via Electronic Navigational Chart (ENC) files from NOAA or via GeoJSON files extracted from ENCs. 
#### You can <a href="https://www.charts.noaa.gov/ENCs/ENCs.shtml">download ENC charts here</a> from NOAA. To find the corresponding charts for your area, use the <a href="https://www.charts.noaa.gov/InteractiveCatalog/nrnc.shtml">NOAA Chart Locator</a>.
    
#### <strong><u>Preferred Option:</u> Upload an ENC file.</strong>
##### This is the raw ENC file downloaded from the NOAA Chart Downloader. All necessary conversion is completed automatically.
- Download the desired chart and unzip the compressed file
- Upload the file that ends in .000 (ex: US5NJ20M.000, this is the ENC file)
- Select all of the layers desired (note: not all ENC files have all layers. The system will automatically skip layers that do not exist in the ENC file)
Note: multiple ENC files can be uploaded simultaneously.

    
#### <u>Option 2:</u> Upload GeoJSON data directly
##### This option uploads a single source/type of data and displays it on the map. You can get GeoJSON layer files by converting the downloaded ENC chart data.
- Ensure the GeoJSON data is a SOUNDG, DEPARE, RECTRC, BOYLAT, or BCNLAT extract from NOAA ENC charts
- Choose the type of layer from the dropdown list
- [Optional] Add the chart title (such as US5NJ20M)
- Upload the file and click Submit.

Note: multiple files can be uploaded simultaneously, as long as they are all of the same type.

    
### Edit Existing Layers
#### This section allows the user to review the list of current layers and remove them from the map, or download them from the file system.
- Click the Gear icon associated with the desired layer
- Click delete to remove the layer from the map permanently
- Click download to save a copy of the file

    
### Update Markers
#### This section allows the user to update the locations of the default icons (Home and Current) as well as add or remove any custom markers.
- For the Home and Current markers, change the latitude/longitude to the desired location and click Submit.
- Add a custom marker: enter the name, latitude, longitude, and description, then click the + sign.
- Remove a custom marker: click the remove icon in the corresponding row.

    
### Other Config Options
#### This section allows the user to update the tide data, timezone, and daylight savings time flag
##### Tide Data Configuration
- To configure the tide data for your location, ensure BoatBuddy is connected to the internet via an ethernet cable. <strong>This is required in order to get new tide data!</strong>
- Find the NOAA station closest to your location using the <a href="https://tidesandcurrents.noaa.gov/map/">NOAA Tides and Currents Map</a>
- Enter the station ID (8 digit integer), begin date, and end date, then click Submit.

##### Timezone and DST
- Check or Uncheck the "Account for Daylight Savings Time?" box if your location adheres to daylight savings time. Selection persists through reboot.
- Adjust the timezone value to reflect which timezone in which you reside. This is necessary since GPS data only provides GMT. Selection persists through reboot.

## Issues / Troubleshooting / FAQ
- The map is slow to respond/laggy.
    - The number of layers (and amount of data within those layers) on the map is inversely proportional to the performance of the map. Try to use less layers. 
- The site loads but there is no data being sent.
    - Add this line `exec 1>/tmp/rclocal.out 2>&1` to the top of the `/etc/rc.local` file. This will make a log in `/tmp/rclocal.out` where you can investigate the issue futher.
- Map loads but doesn't have any detail on it (city names, streets, etc.).
    - Because of space limitations and the large number of files used by the map tiles at different zoom levels, the map only has detailed information for the Continental United States. Please raise an Issue if you need help setting up a different area of the world.
- Why are you running the default Django http server and not Apache/NGINX/Daphne?
    - A dedicated HTTP server would add an additional layer of abstraction here and additional setup for no gain. Further, the site is "airgapped" and has no connection to the outside world. The security risks here are miniscule. The default Django http server works well in this instance without any further setup required.

## Under the Hood
#### Various technologies, open source repos, and free data were used on this project:
- Django as back-end framework for HTTP server
- Django-Channels for sending GPS data to front-end clients via websockets
- MapLibre for displaying interactive map in Javascript (open source fork of Mapbox)
- Chart.js for tide chart and speedometer gauge display
- Bulma CSS framework for styling
- NOAA ENC data in GeoJSON format for depths, buoy locations, etc.
- Various open-source Python repos used in websocket script for collecting, manipulating, and sending data
    
<a href="https://www.openstreetmap.org/copyright">Map tiles courtesy of © OpenStreetMap contributors</a>
    
