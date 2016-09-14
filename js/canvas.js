/* jshint esversion:6 */
let resolutionScale, canvasData;
let canvas = $("<canvas></canvas>").attr("id", "canvas");
let ctx = canvas.get(0).getContext('2d');

function setupCanvas() {
  resolutionScale = $("#scale").val() || 1;
  canvas.prop({
    width: $("#width").val(),
    height: $("#height").val()
  }).css({
    "border-style": "solid",
    "border-width": "1px",
    "image-rendering": "pixelated"
  });
  canvas
    .width($("#width").val() * resolutionScale)
    .height($("#height").val() * resolutionScale);
  canvasData = ctx.getImageData(0, 0, canvas.get(0).width, canvas.get(0).height);
  $("#canvas-shell").append(canvas);
}

canvas.mousemove(function (evt) {
  let x = evt.offsetX;
  let y = evt.offsetY;
  var pos = x + ', ' + y;
  var rawRGB = ctx.getImageData(x / resolutionScale, y / resolutionScale, 1, 1).data;
  let message = pos + ' rgb(' + rawRGB[0] + ', ' + rawRGB[1] + ', ' + rawRGB[2] + ')';
  $("#cursor-pos").text(message);
});


// Monochrome Draw
function drawMonoArray(frame) {
  'use strict';
  for (let x = 0; x < frame.length; x++) {
    for (let y = 0; y < frame[x].length; y++) {
      let index = (x + y * canvas.get(0).width) * 4;
      let pixel = frame[x][y] * 255;
      if (pixel > 255) pixel = 255;
      for (let i = 0; i < 3; i++) {
        canvasData.data[index + i] = pixel;
      }
      canvasData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(canvasData, 0, 0);
}

// RGB Draw
function drawRgbArray(frame) {
  for (let x = 0; x < frame.length; x++) {
    for (let y = 0; y < frame[x].length; y++) {
      let index = (x + y * canvas.get(0).width) * 4;
      for (let i = 0; i < 3; i++) {
        canvasData.data[index + i] = frame[x][y][i];
      }
      canvasData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(canvasData, 0, 0);
}
