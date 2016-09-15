/* jshint esversion:6 */
let resolutionScale, canvasData;
let canvas = $('<canvas></canvas>').attr('id', 'canvas');
let ctx = canvas.get(0).getContext('2d');

function setupCanvas() {
  resolutionScale = $('#scale').val() || 1;
  canvas.prop({
    width: $('#width').val(),
    height: $('#height').val()
  }).css({
    'border-style': 'solid',
    'border-width': '1px',
    'image-rendering': 'pixelated'
  });
  canvas
    .width($('#width').val() * resolutionScale)
    .height($('#height').val() * resolutionScale);
  canvasData = ctx.getImageData(0, 0, canvas.get(0).width, canvas.get(0).height);
  $('#canvas-shell').append(canvas);
}

canvas.mousemove((evt) => {
  const x = Math.round(evt.offsetX / resolutionScale);
  const y = Math.round(evt.offsetY / resolutionScale);
  const pos = `(${x}, ${y})`;
  // const rawRGB = ctx.getImageData(x / resolutionScale, y / resolutionScale, 1, 1).data;
  const message = `${pos}<br/>e: ${mapGen.maps.height.map[x][y]}
    <br/>st: ${mapGen.maps.subTemperature.map[x][y]}
    <br/>m: ${mapGen.maps.moisture.map[x][y]}
    <br/>b: ${mapGen.maps.biome.map[x][y][3]}`;
  $('#cursor-pos').html(message);
});


// Monochrome Draw
function drawMonoArray(frame) {
  'use strict';
  for (let x = 0; x < frame.length; x++) {
    for (let y = 0; y < frame[x].length; y++) {
      const index = (x + y * canvas.get(0).width) * 4;
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
