var bleno = require('bleno');
function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

const ledUUID = 'ff10'

bleno.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    bleno.startAdvertising('Lamp', [ledUUID]);
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

var ledService = new bleno.PrimaryService({
    uuid: ledUUID,
    characteristics: [
      new bleno.Characteristic({
        value: null,
        uuid: '2901',
        properties: ['notify', 'read', 'write'],
        onWriteRequest: function(data, offset, withoutResponse, callback) {
          console.log("Data: " + this.value)
          var result = this.RESULT_SUCCESS;
          callback(result);
        },
      })
    ]
  });

bleno.on('advertisingStart', function(error) {
  console.log("Advertising Started");
  if (error) {
    // error on advertise start
    console.log("Error: " + error);
  } else {
    console.log('started...');

    bleno.setServices([
      ledService
    ]);
  }
});