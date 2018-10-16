#!/bin/bash

sudo npm install -g forever forver-monitor
sudo chmod 755 /etc/init.d/lampService
sudo update-rc.d lampService defaults
