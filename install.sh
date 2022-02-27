#!/bin/sh
CYAN='\033[0;36m'
NC='\033[0m'
GRE='\033[0;32m'
echo "\n${CYAN}########## Welcome to the BoatBuddy install script! ##########\n"

echo "\n${GRE}Updating packages...${NC}"
sudo apt-get update

echo "\n${GRE}Installing required packages...${NC}"
sudo apt-get install python3-pip gdal-bin libatlas-base-dev hostapd dnsmasq -y
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y netfilter-persistent iptables-persistent

echo "\n${GRE}Installing Python requirements...${NC}"
sudo pip3 install -r requirements.txt

echo "\n${GRE}Downloading maptile source (all of Continental United States)...${NC}"
sudo gdown --id 19gPAdYwtpGbcRwsL6bMjZeao6qv5-XLG

echo "\n${GRE}Extracting maptile data, this may take a while...${NC}"
sleep 3
sudo unzip tiles.zip -d core/static/core/
sudo rm tiles.zip

echo "\n${GRE}Updating rc.local for autostart of services...${NC}"
sudo sed -i '$i \cd home/pi/BoatBuddy\npython3 manage.py runserver boatbuddy.live:80 &\npython3 data.py &\n' /etc/rc.local

echo "\n${GRE}Enabling hardware UART...${NC}"
sudo sed -i '$i \enable_uart=1' /boot/config.txt
sudo sed -i '$d' /boot/config.txt
sudo systemctl stop serial-getty@ttyAMA0.service
sudo systemctl disable serial-getty@ttyAMA0.service
sudo systemctl stop serial-getty@ttyS0.service
sudo systemctl disable serial-getty@ttyS0.service
sudo sed -i s/'console=serial0,115200 '//g /boot/cmdline.txt

echo "\n${GRE}Setting up WiFi Access Point...${NC}"
#sudo sed -i '$ainterface wlan0\nstatic ip_address=10.20.1.1/24\nnohook wpa_supplicant' /etc/dhcpcd.conf
sudo touch /etc/sysctl.d/routed-ap.conf
echo "net.ipv4.ip_forward=1" | sudo tee /etc/sysctl.d/routed-ap.conf
sudo iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
sudo netfilter-persistent save
sudo mv /etc/dnsmasq.conf /etc/dnsmasq.conf.orig
sudo touch /etc/dnsmasq.conf
echo "interface=wlan0" | sudo tee /etc/dnsmasq.conf
sudo sed -i '$adhcp-range=10.20.1.5,10.20.1.100,255.255.255.0,24\ndomain=live\naddress=/boatbuddy.live/10.20.1.1' /etc/dnsmasq.conf
sudo touch /etc/hostapd/hostapd.conf
echo "country_code=US" | sudo tee /etc/hostapd/hostapd.conf
sed -i '$ainterface=wlan0\nssid=BoatBuddy\nhw_mode=g\nchannel=2\nmacaddr_acl=0\nauth_algs=1\nignore_broadcast_ssid=0\nwpa=2\nwpa_passphrase=boatbuddy\nwpa_key_mgmt=WPA-PSK\nwpa_pairwise=TKIP\nrsn_pairwise=CCMP' /etc/hostapd/hostapd.conf