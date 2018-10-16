#!/bin/bash
#sudo npm install -g forever

device_name="pi@raspberrypi.local"
lamp_script_path = "/home/pi/Kinetikami-lamp/"
scp lampService $device_name:/etc/init.d/lampService
scp light.js $device_name:"$lamp_script_path"light.js
scp settings.json $device_name:"$lamp_script_path"settings.json

#sudo chmod 755 /etc/init.d/lampService
#sudo update-rc.d lampService defaults
