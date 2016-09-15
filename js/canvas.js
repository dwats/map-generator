/* jshint esversion:6 */
let resolutionScale, canvasData, scene, renderer, camera, container, controls;
let canvas = $('<canvas></canvas>').attr('id', 'canvas2d');
let canvas2 = $('<canvas></canvas>').attr('id', 'canvas3d');
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
  $('#canvas-shell-2d').append(canvas);
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

function draw3d() {
  scene = new THREE.Scene();
  const screenWidth = 512;
  const screenHeight = 512;
  const viewAngle = 75;
  const aspect = screenWidth / screenHeight;
  const near = 0.1;
  const far = 20000;
  camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);
  camera.position.z = 1000;
  camera.position.y = 240;
  camera.position.x = 0;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(screenWidth, screenHeight);
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  const geom = new THREE.PlaneGeometry(1000, 1000, 255, 255);
  const material = new THREE.MeshLambertMaterial({
    color: 0xccccff,
    wireframe: false
  });
  const terrain = getTerrainFromCanvas();
  for (let i = 0, l = geom.vertices.length; i < l; i++) {
    const terrainValue = terrain[i] / 255;
    geom.vertices[i].z += (terrainValue * 200);
  }
  geom.computeFaceNormals();
  geom.computeVertexNormals();

  addLights();

  let plane = new THREE.Mesh(geom, material);
  plane.position = new THREE.Vector3(0, 0, 0);
  let q = new THREE.Quaternion();
  q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), 90 * Math.PI / 180);
  plane.quaternion.multiplyQuaternions(q, plane.quaternion);
  scene.add(plane);

  container = canvas2;
  container = $('#canvas-shell-3d');
  container.html(renderer.domElement);

  render();
}

function render() {
  requestAnimationFrame(render);
  renderer.render(scene, camera);
}

function getTerrainFromCanvas() {
  const data = ctx.getImageData(0, 0, canvas.get(0).width, canvas.get(0).width).data;
  const normPixels = [];

  for (let i = 0, n = data.length; i < n; i += 4) {
    normPixels.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  }

  return normPixels;
}

function addLights() {
  var ambientLight = new THREE.AmbientLight(0x444444);
  ambientLight.intensity = 0.0;
  scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);

  directionalLight.position.set(900, 400, 0).normalize();
  scene.add(directionalLight);
}
