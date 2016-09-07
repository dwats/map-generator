/* jshint esversion:6 */
let canvasWidth, canvasHeight, drawScale, chokecanvasData;
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

// Monochrome
function drawMonoArray(frame) {
	'use strict';
	for (let x = 0; x < frame.length; x++) {
		for (let y = 0; y < frame[x].length; y++) {
			let index = (x + y * canvasWidth) * 4;
			let pixel = (frame[x][y] + 1) / 2.0 * 255;
			if (pixel > 255) pixel = 255;
			for (let i = 0; i < 3; i++) {
				canvasData.data[index + i] = pixel;
			}
			canvasData.data[index + 3] = 255;
		}
	}
	ctx.putImageData(canvasData, 0, 0);
}

function drawRgbArray(frame) {
	for (let x = 0; x < frame.length; x++) {
		for (let y = 0; y < frame[x].length; y++) {
			let index = (x + y * canvasWidth) * 4;
			for (let i = 0; i < 3; i++) {
				canvasData.data[index + i] = frame[x][y][i];
			}
			canvasData.data[index + 3] = 255;
		}
	}
	ctx.putImageData(canvasData, 0, 0);
}

let updateCanvas = function() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.save();
	ctx.putImageData(canvasData, 0,0);
	ctx.drawImage(canvas, 0, 0);
	ctx.restore();
};

function setInitValues() {
	canvasWidth = $("#width").val() || 512;
	canvasHeight = $("#height").val() || 512;
	drawScale = $("#scale").val() || 1;
	frequency = $("#frequency").val() || 0.0125;
	canvasData = ctx.getImageData(0,0,canvasWidth, canvasHeight);

	canvas.setAttribute("width", canvasWidth);
	canvas.setAttribute("height", canvasHeight);
	canvas.setAttribute("id", "canvas");
	canvas.setAttribute("style", "border-style:solid; border-width: 1px; image-rendering: pixelated;" +
		"width:" + Math.round(canvasWidth*drawScale) + "px; height:" + Math.round(canvasHeight*drawScale) + "px;");
	$("#canvas-shell").append(canvas);
}

canvas.addEventListener('mousemove', function(evt) {
	let x = evt.offsetX;
	let y = evt.offsetY;
	var pos = x + ', ' + y;
	var rawRGB = ctx.getImageData(x, y, 1, 1).data;
	let message = pos + ' rgb(' + rawRGB[0] + ', ' + rawRGB[1] + ', ' + rawRGB[2] + ')';
	document.getElementById('cursor-pos').innerHTML = message;
}, false);
