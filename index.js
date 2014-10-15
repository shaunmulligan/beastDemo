var SCREEN_WIDTH = 320;
var SCREEN_HEIGHT = 240;

var Firebase = require("firebase");
var datastore = new Firebase("https://resin-ripple.firebaseio.com/");

var fs = require('fs');
var Gpio = require('onoff').Gpio;

var button = new Gpio(23, 'in', 'both');

var frontBuffer = new Buffer(SCREEN_WIDTH * SCREEN_HEIGHT * 2);
frontBuffer.fill(0);

var beast = require('./beast.json');

var uuid = process.env.RESIN_DEVICE_UUID;
if (!(beast[uuid] && beast[uuid][1])) {
	frontBuffer.fill(255);
	process.exit();
}

var coords = beast[uuid];

prevEvent = Date.now()
button.watch(function(err, value) {
	var now = Date.now()
	if (now - prevEvent < 2000) {
		return;
	}
	prevEvent = now;

	datastore.set({
		coords: coords,
		time: Date.now()
	});

});

datastore.on("value", function(touch) {
	touch = touch.val();
	if (touch === null) {
		return;
	}
	var now = Date.now()
	var distance = Math.abs(touch.coords[0] - coords[0]) + Math.abs(touch.coords[1] - coords[1]) + 1;

	var eta = touch.time + 500 * distance;
	
	// touch in the past
	if (now > eta) {
		return;
	}

	setTimeout(function () {
		for (var x = 0; x < SCREEN_WIDTH; x++ ) {
			for (var y = 0; y < SCREEN_HEIGHT; y++) {
				frontBuffer[SCREEN_WIDTH * 2 * y + 2 * x + 1] = 255;
			}
		}
		setTimeout(function () {
			for (var x = 0; x < SCREEN_WIDTH; x++ ) {
				for (var y = 0; y < SCREEN_HEIGHT; y++) {
					frontBuffer[SCREEN_WIDTH * 2 * y + 2 * x + 1] = 0;
				}
			}
		}, 300);
	}, eta - now);
});

var FPS = 20;

var draw = function () {
	fs.writeFileSync("/dev/fb1", frontBuffer);
	setTimeout(draw, 1000 / FPS);
}

draw();
