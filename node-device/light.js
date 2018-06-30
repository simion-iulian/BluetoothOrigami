var bleno = require('bleno');
var ws281x = require('rpi-ws281x-native');
var shortid = require('shortid');

var NUM_LEDS = parseInt(process.argv[2], 11) || 11,
        pixelData = new Uint32Array(NUM_LEDS);

ws281x.init(NUM_LEDS);

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});


var Descriptor = bleno.Descriptor;

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

var serviceSettings = {
  service_id: 'ccc0',
  characteristic_id: '2901'
};

var switchSettings = {
  service_id:'ccc3',
  characteristic_id:'2901'
};

var brightnessSettings = {
  service_id:'ccc2',
  characteristic_id:'2901'
};

var colorSettings = {
  service_id:'ccc1',
  characteristic_id:'2901'
};


class SwitchCharacteristic extends bleno.Characteristic {
  constructor(uuid, name) {
      super({
          uuid: uuid,
          properties: ["write","read", "notify"],
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
          console.log(`${this.name} is now ${status}`);
          if(status === "On"){
            for(var i = 0; i<NUM_LEDS;i++)
            pixelData[i] = 0xFFFFFF;
          }
          else{
            for(var i = 0; i<NUM_LEDS;i++)
            pixelData[i] = 0x000000;
          }
          ws281x.render(pixelData);
          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer(1);
        callback(this.RESULT_SUCCESS, data);
    } catch (err) {
        console.error(err);
        callback(this.RESULT_UNLIKELY_ERROR);
    }
  }
}

class ColorCharacteristic extends bleno.Characteristic {
  constructor(uuid, name) {
      super({
          uuid: uuid,
          properties: ["write","read", "notify"],
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
    // console.log("["+data[0]+"]["+data[1]+"]["+data[2]+"]");
    
    try {
      data = new Uint16Array(data)
      if(data.length != 3) {
          callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
          return;
      }
      this.argument=data
      console.log(`${this.name} is ${this.argument}`);
      for(var i = 0; i<NUM_LEDS;i++)
        pixelData[i] = rgb2Int(data[0],data[1],data[2]);
      
      ws281x.render(pixelData);
      callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer(1);
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
          properties: ["write", "read", "notify"],
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
          console.log(`${this.name} is now ${this.argument}`);
          ws281x.setBrightness(this.argument);
          ws281x.render(pixelData);

          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer(1);
        callback(this.RESULT_SUCCESS, data);
    } catch (err) {
        console.error(err);
        callback(this.RESULT_UNLIKELY_ERROR);
    }
  }
}

let switchCharacteristic = new SwitchCharacteristic(switchSettings.service_id, "Switch");
let brightnessCharacteristic = new BrightnessCharacteristic(brightnessSettings.service_id, "Brightness");
let colorCharacteristic = new ColorCharacteristic(colorSettings.service_id,  "Color (24-bit)");



var neopixelService =  new bleno.PrimaryService({
  uuid: serviceSettings.service_id,
  characteristics: [
   switchCharacteristic,
   brightnessCharacteristic,
   colorCharacteristic
  ]
})

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('Origami Lamp Alex', ["ccc0"]);
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

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
