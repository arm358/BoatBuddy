You must be connected to the internet to use this script!

Options:
    1. Run this on a separate computer and upload the data to the customize screen (http://boatbuddy.live/customize/)
    2. Undo the Access Point setup manually on your Pi and run this script. Re-setup the access point, and upload to the customize screen.

You will need to find the station closest to the area you wish to get tide data for:
https://tidesandcurrents.noaa.gov/tide_predictions.html Click on the state or use the
map to locate the corresponding 7-digit ID. Enter this value when prompted by the script.

It will also ask for your date range (feel free to give it 5+ years of data!). It will pull the
tide data from NOAA's publicly available API. The data will be saved as a .csv in this directory
(./Tide Scraping Script/) which you can upload later to the customize screen.