var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 240;

// var Firebase = require("firebase");

var fs = require('fs');
var Gpio = require('onoff').Gpio;

var button = new Gpio(23, 'in', 'both');

var frontBuffer = new Buffer(SCREEN_WIDTH * SCREEN_HEIGHT * 2);
frontBuffer.fill(0);

button.watch(function(err, value) {
	if (value === 0) {
		for (var x = 0; x < SCREEN_WIDTH; x++ ) {
			for (var y = 0; y < SCREEN_HEIGHT; y++) {
				simBuffer[SCREEN_WIDTH * 2 * y + 2 * x + 1] = 255;
			}
		}
	} else {
		for (var x = 0; x < SCREEN_WIDTH; x++ ) {
			for (var y = 0; y < SCREEN_HEIGHT; y++) {
				frontBuffer[SCREEN_WIDTH * 2 * y + 2 * x + 1] = 0;
			}
		}
	}
});

// var datastore = new Firebase("https://resin-ripple.firebaseio.com/");

// myFirebaseRef.on("value", function(touches) {
// 	console.log(touces.val())
// });

var FPS = 20;

var draw = function () {
	fs.writeFileSync("/dev/fb1", frontBuffer);
	setTimeout(draw, 1000 / FPS);
}

draw();
