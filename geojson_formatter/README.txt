This script takes data from the NOAA ENC downloads and converts the GEOJSON format into formats readable by OpenMapbox.

To add new data you will have to go to the NOAA ENC site (https://charts.noaa.gov/ENCs/ENCs.shtml) and download the area you are looking for. 

If you click a state for example, it will download a zip file. Unzip the file and it will show a folder containing all of the charts that cover that state. To view which charts you will need (for example,
maybe you only need 2 charts to cover your area) use the ENC Chart Locator tool (https://charts.noaa.gov/InteractiveCatalog/nrnc.shtml#mapTabs-2). Once you know what chart you need, go to MyGeodata Converter
(https://mygeodata.cloud/converter) and upload the archived file within the chart folder (ignore the .txt files within the chart folder). Select your output format as GEOJSON and convert it. These GEOJSON
files can then be reformatted using the geoconverter.py tool located in this folder.

You will need to review what type of data you want (soundings, recommended track, etc.) and add those to the index.html mapbox instantiation area as a new layer. You can find the full name of the
geojson files acronyms at www.s-57.com.

You will also have to edit the .py file's input/output parameters to convert correctly. You may have to change some other pieces of the converter's code (for example, when it loops through the JSON 
you may need to look for a different key to get your values). 
