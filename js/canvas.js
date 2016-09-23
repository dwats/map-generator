/* jshint esversion:6 */
let resolutionScale;
let canvasData;
/*
let scene;
let renderer;
let camera;
let container;
let controls;
let geoGround;
*/
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

  try {
    const message = `${pos}<br/>e: ${mapGen.maps.height.map[x][y]}
      <br/>st: ${mapGen.maps.subTemperature.map[x][y]}
      <br/>m: ${mapGen.maps.moisture.map[x][y]}
      <br/>b: ${mapGen.maps.biome.map[x][y][3]}`;
    $('#cursor-pos').html(message);
  }
  catch (e) {}

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

function Create3dObject(settings) { // eslint-disable-line no-unused-vars
  const create3dObject = {
    settings: {
      screenHeight: settings.screenHeight || 512,
      screenWidth: settings.screenWidth || 512,
      viewAngle: settings.viewAngle || 75,
      aspect: settings.aspect || 1,
      near: settings.near || 0.1,
      far: settings.far || 20000
    },
    renderers: [],
    controls: [],
    containers: [],
    cameras: [],
    scene: {
      scenes: [],
      geometries: [],
      materials: [],
      planes: [],
      lights: [],
    }
  };
  create3dObject.newContainer = (d, r) => {
    const self = create3dObject;
    d.html(r);
    self.containers.push(d);
    return self;
  };
  create3dObject.newRenderer = (options) => {
    const self = create3dObject;
    const s = self.settings;
    const r = self.renderers;
    const out = new THREE.WebGLRenderer(options || {});
    out.setSize(s.screenWidth, s.screenHeight);
    r.push(out);
    return self;
  };
  create3dObject.newCamera = (options) => {
    const self = create3dObject;
    const c = self.cameras;
    const o = options;
    const out = new THREE.PerspectiveCamera(o.viewAngle, o.aspect, o.near, o.far);
    if (o.pos) {
      out.position.x = o.pos.x || 0;
      out.position.y = o.pos.y || 0;
      out.position.z = o.pos.z || 0;
    }
    c.push(out);
    return self;
  };
  create3dObject.newControl = (cam, rde) => {
    const self = create3dObject;
    const c = self.controls;
    const out = new THREE.OrbitControls(cam, rde);
    c.push(out);
    return self;
  };
  create3dObject.newGeometry = (options, vertexArr) => {
    const self = create3dObject;
    const g = self.scene.geometries;
    const o = options;
    const v = vertexArr;
    const out = new THREE.PlaneGeometry(
      o.width,
      o.height,
      o.segmentHeight || 10,
      o.segmentWidth || 10
    );
    if (v) {
      for (let i = 0, l = out.vertices.length; i < l; i++) {
        const val = v[i] / 255;
        out.vertices[i].z += (val * 25);
      }
      out.computeFaceNormals();
      out.computeVertexNormals();
    }
    g.push(out);
    return self;
  };
  create3dObject.newMaterial = (material, options) => {
    const self = create3dObject;
    const m = self.scene.materials;
    const o = options;
    const out = new THREE[material](o);
    m.push(out);
    return self;
  };
  create3dObject.newPlane = (g, m, options, hasQ) => {
    const self = create3dObject;
    const p = self.scene.planes;
    const o = options;
    const out = new THREE.Mesh(g, m);
    out.position = new THREE.Vector3(0, 0, 0);
    if (hasQ) {
      // TODO Gain a deeper understanding of Quaternions.
      const q = new THREE.Quaternion();
      q.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), (90 * Math.PI) / 180);
      out.quaternion.multiplyQuaternions(q, out.quaternion);
    }
    if (o.rotate) {
      out.rotateX(o.rotate.x || 0);
      out.rotateY(o.rotate.y || 0);
      out.rotateZ(o.rotate.z || 0);
    }
    if (o.position) {
      out.position.x = o.position.x || 0;
      out.position.y = o.position.y || 0;
      out.position.z = o.position.z || 0;
    }
    p.push(out);
    return self;
  };
  create3dObject.newLight = (type, options) => {
    const self = create3dObject;
    const l = self.scene.lights;
    const o = options;
    const out = new THREE[type](o.color);
    out.intensity = o.intensity || 1.0;
    if (o.position) {
      out.position.set(
        o.position.x || 0,
        o.position.y || 0,
        o.position.z || 0
      ).normalize();
    }
    l.push(out);
    return self;
  };
  create3dObject.newScene = () => {
    const self = create3dObject;
    const p = self.scene.planes;
    const l = self.scene.lights;
    const s = self.scene.scenes;
    const out = new THREE.Scene();
    for (let i = 0; i < p.length; i++) {
      out.add(p[i]);
    }
    for (let i = 0; i < l.length; i++) {
      out.add(l[i]);
    }
    s.push(out);
    return self;
  };
  create3dObject.cameraLookAt = (cam, pos) => {
    const self = create3dObject;
    cam.lookAt(new THREE.Vector3(pos.x, pos.y, pos.z));
    return self;
  };
  create3dObject.updateGeometry = (index, options, vertexArr) => {
    const self = create3dObject;
    const g = self.scene.geometries;
    const v = vertexArr;
    const out = g[index];
    if (v) {
      for (let i = 0, l = out.vertices.length; i < l; i++) {
        const val = v[i] / 255;
        out.vertices[i].z = (val * 255);
      }
      out.computeFaceNormals();
      out.computeVertexNormals();
      out.verticesNeedUpdate = true;
      out.normalsNeedUpdate = true;
    }
    g[index] = out;
    return self;
  };
  create3dObject.render = (scene, cam) => {
    const self = create3dObject;
    const r = self.renderers;
    for (let i = 0; i < r.length; i++) {
      r[i].render(scene, cam);
    }
    return create3dObject;
  };
  return create3dObject;
}

function getTerrainFromCanvas() {
  const data = ctx.getImageData(0, 0, canvas.get(0).width, canvas.get(0).width).data;
  const normPixels = [];

  for (let i = 0, n = data.length; i < n; i += 4) {
    normPixels.push((data[i] + data[i + 1] + data[i + 2]) / 3);
  }

  return normPixels;
}

function getTerrainFromArray(arr) {
  if (!Array.isArray(arr)) throw new Error('Argument type not an array.');
  const output = [];

  for (let x = 0; x < arr.length; x++) {
    for (let y = 0; y < arr[x].length; y++) {
      output.push(((arr[y][x] + 1) / 2.0) * 255);
    }
  }

  return output;
}
