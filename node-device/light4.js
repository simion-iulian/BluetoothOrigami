
var bleno = require('bleno');

var Descriptor = bleno.Descriptor;

var buf = [111, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110, 110]; // -> onnnn

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

const serviceSettings = {
  service_id: 'ccc0',
  characteristic_id: '2901'
};

const colorSettings = {
  service_id:'ccc1',
  characteristic_id:'2901'
};

const brightnessSettings = {
  service_id:'ccc2',
  characteristic_id:'2901'
};

const switchSettings = {
  service_id:'ccc3',
  characteristic_id:'2901'
};


var brightnessCharacteristic = 
    new bleno.Characteristic({
      value: null,
      uuid: brightnessSettings.service_id,
      properties: ['notify', 'read', 'write'],
      onWriteRequest: function(data, offset, withoutResponse, callback) {
        //withoutResponse = false;
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
  

var switchCharacteristic =  
    new bleno.Characteristic({
      value: null,
      uuid: switchSettings.service_id,
      properties: ['notify', 'read', 'write'],
      onWriteRequest: function(data, offset, withoutResponse, callback) {
        //withoutResponse = false;
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
  

var colorCharacteristic =  
    new bleno.Characteristic({
      value: null,
      uuid: colorSettings.characteristic_id,
      properties: ['notify', 'read', 'write'],
    
      onWriteRequest: function(data, offset, withoutResponse, callback) {
        //withoutResponse = false;
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


var neopixelService =  new bleno.PrimaryService({
  uuid: serviceSettings.service_id,
  characteristics: [
    brightnessCharacteristic,
    switchCharacteristic,
    colorCharacteristic
  ]
})
    

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('OrigamiLamp', ['ccc0']);
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

bleno.on('advertisingStart', function(error) {
  console.log("Advertising Started");
  if (error) {
    // error on advertise start
    console.log("Error: " + error);
  } else {
    console.log('started...');

    //console.log(bleno);
    bleno.setServices([
      neopixelService
    ]);
  }
});
