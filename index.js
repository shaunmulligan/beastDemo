var WIDTH = 400;
var HEIGHT = 400;
var OMEGA = 0.009;
var WAVE_VELOCITY = 0.04;
var DISTANCE_ATTENUATION = -0.04;
var TIME_ATTENUATION = -0.0006;
var DISTANCE_ATTENUATION = 0;
var TIME_ATTENUATION = 0;
var MAX_TOUCHES = 5;
var AMPLITUDE = 0.3;
var FPS = 30;

var WAVE_VELOCITY_INV = 1 / WAVE_VELOCITY;
var FRAME_DURATION = 1000 / FPS;

var x11 = require('x11');

// These will be different depending on the screen
var offsetX = 0;
var offsetY = 0;

x11.createClient(function(err, display) {
	var X = display.client;
	var root = display.screen[0].root;

	var win = X.AllocID();

	X.CreateWindow(
		win, root,
		0, 0, WIDTH, HEIGHT,
		0, 0, 0, 0,
		{ eventMask: x11.eventMask.ButtonPress }
	);
	X.MapWindow(win);

	var gc = X.AllocID();
	X.CreateGC(gc, win);

	var pixmap = new Buffer(WIDTH * HEIGHT * 4);

	// Initialise pixmap to black
	for (var i = 0; i < pixmap.length; i++) {
		pixmap[i] = 0;
	}

	var touches = [];

    X.on('event', function(e) {
        if (e.type === x11.eventMask.ButtonPress) {
			touches.push([e.x, e.y, Date.now()]);
			// touches.sort(function (a, b) {
			// 	return - Math.abs(a[0] - offsetX) + Math.abs(a[1] - offsetY) + Math.abs(b[0] - offsetX) - Math.abs(b[1] - offsetY)
			// });
			if (touches.length > MAX_TOUCHES) {
				touches.shift();
			}
			console.log(touches);
        } 
    });

	var draw = function () {
		var now = Date.now();
		var touchesLen = touches.length;
		
		for (var x = 0; x < WIDTH; x++ ) {
			for (var y = 0; y < HEIGHT; y++) {
				var value = 0;
				for (var k = 0; k < touchesLen; k++) {
					var touch = touches[k];
					var x0 = touch[0];
					var y0 = touch[1];
					var t0 = touch[2];
					
					var d = Math.sqrt((x - x0) * (x - x0) + (y - y0) * (y - y0));
					var t = (now - t0 - d * WAVE_VELOCITY_INV);
		
					// Check is the wave has reached this point
					if (t > 0) {
						value += AMPLITUDE * Math.sin(OMEGA * t) * Math.exp(DISTANCE_ATTENUATION * d + TIME_ATTENUATION * t);
					}
				}
				pixmap[WIDTH * 4 * y + 4 * x] = value * 128 + 128;
			}
		}
		X.PutImage(2, win, gc, WIDTH, HEIGHT, 0, 0, 0, 24, pixmap);
		setTimeout(draw, FRAME_DURATION);
	}
	draw();
});
