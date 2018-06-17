const NEOPIXEL_SERVICE_UUID = "ccc0";
const COLOR_UUID = "ccc1";
const BRIGHTNESS_UUID = "ccc2";
const SWITCH_UUID = "ccc3";

var bleno = require('bleno');

var serviceSettings = {
  service_id: NEOPIXEL_SERVICE_UUID,
  characteristic_id: '2901'
};

var colorSettings = {
  service_id:COLOR_UUID,
  characteristic_id:'2901',
  descriptor_name: "Color"
};

var brightnessSettings = {
  service_id:BRIGHTNESS_UUID,
  characteristic_id:'2901',
  descriptor_name: "Brightness"
};

var switchSettings = {
  service_id: SWITCH_UUID,
  characteristic_id:'2901',
  descriptor_name: "Switch"
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('OrigamiLamp', ['ccc0','ccc1','ccc2']);
    console.log("Bluetooth On");
  } else {
    bleno.stopAdvertising();
  }
});


// Notify the console that we've accepted a connection
bleno.on('accept', function(clientAddress) {
  console.log("Accepted connection from address: " + clientAddress);
});


// Notify the console that we have disconnected from a client
bleno.on('disconnect', function(clientAddress) {
  console.log("Disconnected from address: " + clientAddress);
});


let colorC = new bleno.Characteristic({
  value: null,
  uuid: colorSettings.characteristic_id,
  properties: ['notify', 'read', 'write'],
  descriptors: [
    new bleno.Descriptor({
        uuid: "2901",
        value: colorSettings.descriptor_name
      })
  ],
  onWriteRequest: function(data, offset, withoutResponse, callback) {
    withoutResponse = false;
    console.log(withoutResponse);
    
    this.value = ab2str(data).replace(/[^\w\s]/gi, '');

    //console.log("Length: " + this.value.length);
    console.log("Data: " + this.value);

    var result = this.RESULT_SUCCESS;
    callback(result);
  },

  onReadRequest: function(offset, callback) {

    var result = this.RESULT_SUCCESS;

    // CREATE BUFFER FROM TYPED ARRAY
    var data = new Buffer(new Uint8Array(buf));

    callback(result, data);
  }
})

let serviceCharacteristic = new bleno.Characteristic({
  value: null,
  uuid: serviceSettings.characteristic_id,
  properties: ['notify', 'read', 'write'],

  onWriteRequest: function(data, offset, withoutResponse, callback) {
    withoutResponse = false;
    console.log(withoutResponse);
    
    this.value = ab2str(data).replace(/[^\w\s]/gi, '');

    //console.log("Length: " + this.value.length);
    console.log("Data: " + this.value);

    var result = this.RESULT_SUCCESS;
    callback(result);
  },

  onReadRequest: function(offset, callback) {

    var result = this.RESULT_SUCCESS;

    // CREATE BUFFER FROM TYPED ARRAY
    var data = new Buffer(new Uint8Array(buf));

    callback(result, data);
  }
});

bleno.on('advertisingStart', function(error) {
  console.log("Advertising Started");
  if (error) {
    // error on advertise start
    console.log("Error: " + error);
  } else {
    console.log('started...');

    //console.log(bleno);
    let neoPixelService = new bleno.PrimaryService({
      uuid: serviceSettings.service_id,
      characteristics: [
        colorC,
        serviceCharacteristic
      ]
    })

    bleno.setServices([
      neoPixelService
    ])
  }
});
