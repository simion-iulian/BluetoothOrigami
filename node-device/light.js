var bleno = require('bleno');
var ws281x = require('rpi-ws281x-native');
var fs = require("fs");

let r,g,b,patternState,switchState,bright;
var lampState = JSON.parse(fs.readFileSync("settings.json"));
console.log(JSON.stringify(lampState))

var NUM_LEDS = lampState.strip_length, 
   pixelData = new Uint32Array(NUM_LEDS);
ws281x.init(NUM_LEDS);

const lampName = lampState.name;
 r = lampState.settings.r;
 g = lampState.settings.g;
 b = lampState.settings.b;
 patternState = lampState.settings.pattern;
 switchState = lampState.settings.power;
 bright = lampState.settings.brightness;

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
  var json = JSON.stringify(lampState)
  fs.writeFileSync('settings.json', json, 'utf8', () => { console.log("Saved state")});
});


function loadState(){
  r = lampState.settings.r;
  g = lampState.settings.g;
  b = lampState.settings.b;
  patternState = lampState.settings.pattern;
  switchState = lampState.settings.power;
  bright = lampState.settings.brightness;
  if(switchState == 1){
    for(var i = 0; i<NUM_LEDS;i++)
      pixelData[i] = rgb2Int(r,g,b);
  }
  else{
    for(var i = 0; i<NUM_LEDS;i++)
    pixelData[i] = 0x000000;
  }
  ws281x.setBrightness(bright);
  ws281x.render(pixelData);
}
loadState();

function saveState(){
  lampState.settings.r = r;
  lampState.settings.g = g;
  lampState.settings.b = b;
  lampState.settings.pattern = patternState;
  lampState.settings.power = switchState;
  lampState.settings.brightness = bright;
  var json = JSON.stringify(lampState)
  fs.writeFile('settings.json', json, 'utf8', ()=>{ console.log("Saved state")});
}

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
var patternSettings = {
  service_id:'ccc4',
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
          lampState.settings.power = this.argument;
          loadState();
          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer(lampState.settings.power);
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
      clearIntervals();
      this.argument=data
      console.log(`${this.name} is ${this.argument}`);
      for(var i = 0; i<NUM_LEDS;i++){
        r = data[0];
        g = data[1];
        b = data[2]
        pixelData[i] = rgb2Int(r,g,b);
      }
      ws281x.render(pixelData);
      saveState();
      callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer([r,g,b]);
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
          bright = this.argument;
          console.log(`${this.name} is now ${this.argument}`);
          ws281x.setBrightness(this.argument);
          ws281x.render(pixelData);
          saveState();
          callback(this.RESULT_SUCCESS);
      } catch (err) {
          console.error(err);
          callback(this.RESULT_UNLIKELY_ERROR);
      }
  }
  onReadRequest(offset, callback) {
    try {
        let data = new Buffer([bright]);
        callback(this.RESULT_SUCCESS, data);
    } catch (err) {
        console.error(err);
        callback(this.RESULT_UNLIKELY_ERROR);
    }
  }
}

class PatternCharacteristic extends bleno.Characteristic {
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
      this.argument = data.readUInt8()
      patternState = this.argument
      console.log(`${this.name} is ${this.argument}`);
      clearIntervals();
      switch(patternState){
        case 1:{
          rainbow();
        }
      }
      saveState();
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
let patternCharacteristic = new PatternCharacteristic(patternSettings.service_id,  "Pattern:");



var neopixelService =  new bleno.PrimaryService({
  uuid: serviceSettings.service_id,
  characteristics: [
   switchCharacteristic,
   brightnessCharacteristic,
   colorCharacteristic,
   patternCharacteristic
  ]
})

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising(lampName, ["ccc0"]);
    console.log("Bluetooth On");
  } else {
    bleno.stopAdvertising();
  }
});

// Notify the console that we've accepted a connection
bleno.on('accept', function(clientAddress) {
  console.log("Accepted connection from address: " + clientAddress);
  loadState();
});

// Notify the console that we have disconnected from a client
bleno.on('disconnect', function(clientAddress) {
  console.log("Disconnected from address: " + clientAddress);
  saveState();
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

//Animations
//State 1 - Rainbow
var rainbowInterval;
function rainbow(){
  var offset = 0;
  rainbowInterval = setInterval(function () {
    for (var i = 0; i < NUM_LEDS; i++) {
      pixelData[i] = colorwheel((offset + i) % 256);
    }
  offset = (offset + 1) % 256;
  if(switchState == 1)
    ws281x.render(pixelData)
  else 
    loadState()
  }, 1000/30);
}

function clearIntervals(){
  clearInterval(rainbowInterval);
}

function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int(r, g, b) {
  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}
