/* jshint esversion:6 */
let resolutionScale;
let canvasData;
let scene;
let renderer;
let camera;
let container;
let controls;
let geoGround;
const canvas = $('<canvas></canvas>').attr('id', 'canvas2d');
const ctx = canvas.get(0).getContext('2d');

function setupCanvas() { // eslint-disable-line no-unused-vars
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
function drawMonoArray(frame) { // eslint-disable-line no-unused-vars
  'use strict';
  for (let x = 0; x < frame.length; x++) {
    for (let y = 0; y < frame[x].length; y++) {
      const index = (x + (y * canvas.get(0).width)) * 4;
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
function drawRgbArray(frame) { // eslint-disable-line no-unused-vars
  for (let x = 0; x < frame.length; x++) {
    for (let y = 0; y < frame[x].length; y++) {
      const index = (x + (y * canvas.get(0).width)) * 4;
      for (let i = 0; i < 3; i++) {
        canvasData.data[index + i] = frame[x][y][i];
      }
      canvasData.data[index + 3] = 255;
    }
  }

  ctx.putImageData(canvasData, 0, 0);
}

function Create3dObject() { // eslint-disable-line no-unused-vars
  const create3dObject = {
    settings: {
      screenHeight: 512,
      screenWidth: 512,
      viewAngle: 75,
      aspect: this.settings.screenWidth / this.settings.screenHeight,
      near: 0.1,
      far: 20000
    },
    renderers: [],
    controls: [],
    containers: [],
    scene: {
      cameras: [],
      scenes: [],
      geometries: [],
      materials: [],
      planes: [],
      lights: [],
    }
  };
  create3dObject.newRenderer = () => {};
  create3dObject.newContainer = () => {};
  create3dObject.newCamera = () => {};
  create3dObject.newControl = () => {};
  create3dObject.newGeometry = () => {};
  create3dObject.newMaterial = () => {};
  create3dObject.newPlane = () => {};
  create3dObject.newLight = () => {};
  create3dObject.newScene = () => {};
  create3dObject.updateGeometry = () => {};
  create3dObject.render = () => {};
  create3dObject.animate = () => {};
  return create3dObject;
}

function draw3d() { // eslint-disable-line no-unused-vars
  // TODO refactor this.
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

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(screenWidth, screenHeight);
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  camera.lookAt(new THREE.Vector3(0, 0, 0));
  container = $('#canvas-shell-3d');
  container.html(renderer.domElement);

  // Geometry Ground
  geoGround = new THREE.PlaneGeometry(1024, 1024, 255, 255);
  const matGround = new THREE.MeshLambertMaterial({
    color: 0xccccff,
    wireframe: false
  });
  const terrain = getTerrainFromCanvas();
  for (let i = 0, l = geoGround.vertices.length; i < l; i++) {
    const terrainValue = terrain[i] / 255;
    geoGround.vertices[i].z += (terrainValue * 200);
  }
  geoGround.computeFaceNormals();
  geoGround.computeVertexNormals();

  // Geometry Water
  const geoWater = new THREE.PlaneGeometry(1000, 1000, 11, 11);
  const matWater = new THREE.MeshLambertMaterial({
    color: 0x00ccff,
    wireframe: false,
    transparent: true,
    opacity: 0.7
  });

  // Plane Ground
  const planeGround = new THREE.Mesh(geoGround, matGround);
  planeGround.position = new THREE.Vector3(0, 0, 0);
  const q = new THREE.Quaternion();
  q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), (90 * Math.PI) / 180);
  planeGround.quaternion.multiplyQuaternions(q, planeGround.quaternion);
  scene.add(planeGround);

  // Plane Water
  const planeWater = new THREE.Mesh(geoWater, matWater);
  planeWater.position = new THREE.Vector3(0, 0, 0);
  planeWater.rotateX(-Math.PI / 2);
  planeWater.position.y = 60;
  scene.add(planeWater);

  addLights();
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
  const ambientLight = new THREE.AmbientLight(0x444444);
  const directionalLight = new THREE.DirectionalLight(0xffffff);

  ambientLight.intensity = 0.0;
  directionalLight.position.set(900, 400, 0).normalize();

  scene.add(ambientLight);
  scene.add(directionalLight);
}
