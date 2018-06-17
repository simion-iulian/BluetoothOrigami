var bleno = require('bleno');
var Descriptor = bleno.Descriptor;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

var serviceSettings = {
  service_id: 'ff10',
  characteristic_id: '2901' 
};

var switchSettings = {
  service_id:'ff11',
  characteristic_id:'2901'
};

var brightnessSettings = {
  service_id:'ff12',
  characteristic_id:'2901'
};

class SwitchCharacteristic extends bleno.Characteristic {
  constructor(uuid, name) {
      super({
          uuid: uuid,
          properties: ["write","read"],
          value: null,
          descriptors: [
              new bleno.Descriptor({
                  uuid: "2901",
                  value: name
                })
          ]
      });
      this.argument = 0;
      this.name = name;
  }
  onWriteRequest(data, offset, withoutResponse, callback) {
      try {
          if(data.length != 1) {
              callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
              return;
          }
          this.argument = data.readUInt8();
          var status = this.argument === 0 ? "Off" : "On";
          console.log(`Switch ${this.name} is now ${status}`);
          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        const result = this.calcResultFunc();
        console.log(`Returning result: ${result}`);

        let data = new Buffer(1);
        data.writeUInt8(result, 0);
        callback(this.RESULT_SUCCESS, data);
    } catch (err) {
        console.error(err);
        callback(this.RESULT_UNLIKELY_ERROR);
    } 
  }
}

class BrightnessCharacteristic extends bleno.Characteristic {
  constructor(uuid, name) {
      super({
          uuid: uuid,
          properties: ["write","read"],
          value: null,
          descriptors: [
              new bleno.Descriptor({
                  uuid: "2901",
                  value: name
                })
          ]
      });
      this.argument = 0;
      this.name = name;
  }
  onWriteRequest(data, offset, withoutResponse, callback) {
      try {
          if(data.length != 1) {
              callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
              return;
          }
          this.argument = data.readUInt8();
          console.log(`Brightness ${this.name} is now ${this.argument}`);
          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        const result = this.calcResultFunc();
        console.log(`Returning result: ${result}`);

        let data = new Buffer(1);
        data.writeUInt8(result, 0);
        callback(this.RESULT_SUCCESS, data);
    } catch (err) {
        console.error(err);
        callback(this.RESULT_UNLIKELY_ERROR);
    } 
  }
}

let switchCharacteristic = new SwitchCharacteristic(switchSettings.service_id, "Switch");
let brightnessCharacteristic = new BrightnessCharacteristic(brightnessSettings.service_id, "Brightness");
var neopixelService =  new bleno.PrimaryService({
  uuid: serviceSettings.service_id,
  characteristics: [
   switchCharacteristic,brightnessCharacteristic
  ]
})

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('OrigamiLamp', ["ff10"]);
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


bleno.on("servicesSet", err => {
  console.log("Bleno: servicesSet")
  // console.log(neopixelService)
});
bleno.on("servicesSetError", err => console.log("Bleno: servicesSetError"));
