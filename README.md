# Origami Lamp control app

Inspired by :
# Ionic3 Bluetooth Low Energy NeoPixel

[Ionic Framework Neopixel example](https://github.com/don/ionic-ble-examples/tree/master/neopixel)

[Ionic LED example](https://github.com/don/ionic-ble-examples/blob/master/arduino/LED/LED.ino)

[Needed Bluetooth Characteristics for NeoPixels(Arduino port to Bleno)](https://github.com/MakeBluetooth/ble-neopixel/blob/master/arduino/BLE_NeoPixel/BLE_NeoPixel.ino)

[And inspired by this setup too](https://github.com/jdj333/node-ionic-bluetooth)

## Ionic 3

This project requires Ionic3
    npm install -g ionic@latest

Install Cordova just to be safe
    npm install -g cordova@latest


## iOS

Assuming you have Xcode installed
    ionic cordova run ios --device


## Android

Assuming you have the Android SDK installed
    ionic cordova run android --device

## Raspberry Pi Zero W setup:
    npm install bleno
    npm install node-gyp
    npm install rpi-ws281x-native


