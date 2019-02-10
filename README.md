# Origami Lamp control app

Credit due to these repos:

[Ionic Framework Neopixel example](https://github.com/don/ionic-ble-examples/tree/master/neopixel)

[Ionic LED example](https://github.com/don/ionic-ble-examples/blob/master/arduino/LED/LED.ino)

[Needed Bluetooth Characteristics for NeoPixels(Arduino port to Bleno)](https://github.com/MakeBluetooth/ble-neopixel/blob/master/arduino/BLE_NeoPixel/BLE_NeoPixel.ino)

[And inspired by this setup too](https://github.com/jdj333/node-ionic-bluetooth)

## Ionic 3

This project requires Ionic3 and cordova
    `npm install -g ionic@latest`
    `npm install -g cordova@latest`


## iOS

Assuming you have Xcode installed
    `ionic cordova run ios --device`

## Android

Assuming you have the Android SDK installed
    `ionic cordova run android --device`

## Raspberry Pi Zero W setup:
In order to have the script at startup move the `lampService` from `node-device folder` to `/etc/init.d/lampService` and run these:

    sudo npm install -g forever forver-monitor
    sudo chmod 755 /etc/init.d/lampService
    sudo update-rc.d lampService defaults

Run `sh /etc/init.d/lampService start` in order to check if the service is running then restart the service.

Inside the folder containing the node-device script (light.js) run these

    npm install node-gyp
    npm install bleno
    npm install rpi-ws281x-native


