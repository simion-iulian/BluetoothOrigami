const bleno = require("bleno");

const NEOPIXEL_SERVICE_UUID = "0000ccc-0000-1000-8000-00805f9b34fb";
const COLOR_UUID = "0000ccc1-0000-1000-8000-00805f9b34fb";
const BRIGHTNESS_UUID = "0000ccc2-0000-1000-8000-00805f9b34fb";
const SWITCH_UUID = "0000ccc3-0000-1000-8000-00805f9b34fb";

class ArgumentCharacteristic extends bleno.Characteristic {
    constructor(uuid, name) {
        super({
            uuid: uuid,
            properties: ["write","read","notify"],
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
      console.log("writeRequest fired!")  
      try {
            if(data.length != 1) {
                callback(this.RESULT_INVALID_ATTRIBUTE_LENGTH);
                return;
            }

            this.argument = data.readUInt8();
            console.log(`Argument ${this.name} is now ${this.argument}`);
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


console.log("Starting bleno...");

bleno.on("stateChange", state => {

    if (state === "poweredOn") {
        
        bleno.startAdvertising("OrigamiLamp", [NEOPIXEL_SERVICE_UUID], err => {
            if (err) console.log(err);
        });

    } else {
        console.log("Stopping...");
        bleno.stopAdvertising();
    }        
});

bleno.on("advertisingStart", err => {

    console.log("Configuring services...");
    
    if(err) {
        console.error(err);
        return;
    }

    let colorCharacteristic = new ArgumentCharacteristic(COLOR_UUID, "Color");
    let brightnessCharacteristic = new ArgumentCharacteristic(BRIGHTNESS_UUID, "Brightness");
    let switchCharacteristic = new ArgumentCharacteristic(SWITCH_UUID, "Switch");
   
    let calculator = new bleno.PrimaryService({
        uuid: NEOPIXEL_SERVICE_UUID,
        characteristics: [
            colorCharacteristic,
            brightnessCharacteristic,
            switchCharacteristic
        ]
    });

    bleno.setServices([calculator], err => {
        if(err)
            console.log(err);
        else
            console.log("Services configured");
            console.log(calculator.characteristics);
    });
});


// some diagnostics 
bleno.on("stateChange", state => console.log(`Bleno: Adapter changed state to ${state}`));

bleno.on("advertisingStart", err => console.log("Bleno: advertisingStart"));
bleno.on("advertisingStartError", err => console.log("Bleno: advertisingStartError"));
bleno.on("advertisingStop", err => console.log("Bleno: advertisingStop"));

bleno.on("servicesSet", err => console.log("Bleno: servicesSet"));
bleno.on("servicesSetError", err => console.log("Bleno: servicesSetError"));

bleno.on("accept", clientAddress => console.log(`Bleno: accept ${clientAddress}`));
bleno.on("disconnect", clientAddress => console.log(`Bleno: disconnect ${clientAddress}`));