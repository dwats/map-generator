/* jshint esversion:6 */
let canvasWidth, canvasHeight, drawScale, chokecanvasData;
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

// Monochrome
function drawMonoArray(frame) {
	let index;

	for (let x = 0; x < gridX; x++) {
		for (let y = 0; y < gridY; y++) {
			index = (x + y * canvasWidth) * 4;
			let pixel = Math.max(frame[x][y] * 255, 0);

			canvasData.data[index + 0] = pixel;
			canvasData.data[index + 1] = pixel;
			canvasData.data[index + 2] = pixel;
			canvasData.data[index + 3] = 255;
		}
	}
}

function drawRgbPixel(x, y, rgb) {
	let index = (x + y * canvasWidth) * 4;
	canvasData.data[index + 0] = rgb[0];
	canvasData.data[index + 1] = rgb[1];
	canvasData.data[index + 2] = rgb[2];
	canvasData.data[index + 3] = 255;
}

let updateCanvas = function() {
	ctx.putImageData(canvasData, 0,0);
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

	gridY = canvasHeight;
	gridX = canvasWidth;
	canvas.addEventListener('mousemove', function(evt) {
		let x = (evt.clientX - canvas.offsetLeft) / drawScale;
		let y = (evt.clientY - canvas.offsetTop) / drawScale;
	  var pos = x + ', ' + y;
		var rawRGB = ctx.getImageData(x, y, 1, 1).data;
		let message = pos + ' rgb(' + rawRGB[0] + ', ' + rawRGB[1] + ', ' + rawRGB[2] + ')';
	  document.getElementById('cursor-pos').innerHTML = message;
	}, false);
}
