'use strict';
/**
 * Procedural Map Generator
 * By Eric Julius
 */

/**
 * TODO Comment
 */
function subtract(t, b) { // eslint-disable-line no-unused-vars
  const result = [];
  for (let x = 0; x < t.length; x++) {
    result.push([]);
    for (let y = 0; y < t[x].length; y++) {
      result[x].push(Math.max(t[x][y] - (b[x][y] * 0.5), 0));
    }
  }
  return result;
}

/**
 * Given a `t`arget and `b`lend values perform overlay color blending and return RGB array.
 * @param {Array} `t`arget RGB array
 * @param {Array} `b`lend RGB array
 * @return {Array}
 */
function overlay(t, b) {
  const result = [];
  for (let i = 0; i < t.length; i++) {
    let val = 0;
    let min = 0;
    if (t[i] < 128) {
      val = t[i] / 128;
      val *= b[i];
      result.push(val);
    }
    else {
      val = (255 - t[i]) / 128;
      min = t[i] - (255 - t[i]);
      val = (b[i] * val) + min;
      result.push(val);
    }
  }
  return result;
}

/**
 * Given height, moisture, and temperature map arrays generate a biome array.
 * @param {Object} maps
 */
function getBiomeMap(maps) {
  const biomeNames = ['Tundra', 'Desert', 'Grass Desert', 'Savanna', 'Seasonal Forest', 'Taiga', 'Temperate Forest', 'Temperate Rain Forest', 'Swamp', 'Tropical Rain Forest', 'Barren', 'Shallow Ocean', 'Deep Ocean', 'error'];
  const output = [];
  const mapHeight = maps.height.map;
  const mapMoisture = maps.moisture.map;
  const mapTemperature = maps.subTemperature.map;

  for (let x = 0; x < mapHeight.length; x++) {
    output.push([]);
    for (let y = 0; y < mapHeight[x].length; y++) {
      let h = Math.abs(mapHeight[x][y]);
      const m = Math.abs(mapMoisture[x][y]);
      const t = Math.abs(mapTemperature[x][y]);
      let biome = getBiomeId(h, m, t);
      let rgb = [];

      switch (biome) {
        case 0: // 0 - Tundra
          rgb = [200, 200, 200];
          break;
        case 1: // 1 - Desert
          rgb = [224, 255, 255];
          break;
        case 2: // 2 - Grass Desert
          rgb = [153, 153, 0];
          break;
        case 3: // 3 - Savanna
          rgb = [144, 228, 144];
          break;
        case 4: // 4 - Seasonal Forest (woods)
          rgb = [128, 128, 0];
          break;
        case 5: // 5 - Taiga
          rgb = [40, 90, 20];
          break;
        case 6: // 6 - Temperate Forest (seasonal forest)
          rgb = [85, 107, 47];
          break;
        case 7: // 7 - Temperate Rain Forest (forest)
          rgb = [34, 139, 34];
          break;
        case 8: // 8 - Swamp (rain forest)
          rgb = [46, 139, 87];
          break;
        case 9: // 9 - Tropical Rain Forest (swamp)
          rgb = [0, 100, 0];
          break;
        case 10: // 10 - Barren
          rgb = [204, 204, 204];
          break;
        case 11: // 11 - Shallow Ocean
          rgb = [15, 70, 105];
          break;
        case 12: // 12 - Deep Ocean
          rgb = [10, 40, 255];
          break;
        default: // Error
          console.log('BiomeErr H:', h, 'M:', m, 'T:', t);
          rgb = [250, 128, 114];
      }
      h *= 255;
      if (biome === -1) biome = 13;
      const rgbOut = overlay([h, h, h], rgb);
      rgbOut.push(biomeNames[biome]);
      output[x].push(rgbOut);
    }
  }
  return output;
}

/**
 * Given height, moisture, and temperature return a biome id.
 * @param {Number} height Between 0 and 1
 * @param {Number} moisture Between 0 and 1
 * @param {Number} temperature Between 0 and 1
 * @return {Number} integer
 */
function getBiomeId(height, moisture, temperature) {
  if (height >= 0.98) {
    if (moisture < 0.25) {
      return 10;
    }
    else if (moisture >= 0.25) {
      return 0;
    }
  }
  else if (height < 0.98 && height >= 0.30) {
    if (temperature < 0.25) {
      return 0;
    }
    else if (temperature >= 0.25 && temperature < 0.50) {
      if (moisture < 0.25) {
        return 2;
      }
      else if (moisture >= 0.25) {
        return 5;
      }
    }
    else if (temperature >= 0.50 && temperature < 0.75) {
      if (moisture < 0.25) {
        return 2;
      }
      else if (moisture >= 0.25 && moisture < 0.50) {
        return 4;
      }
      else if (moisture >= 0.50 && moisture < 0.75) {
        return 7;
      }
      else if (moisture >= 0.75) {
        return 8;
      }
    }
    else if (temperature >= 0.75) {
      if (moisture < 0.25) {
        return 1;
      }
      else if (moisture >= 0.25 && moisture < 0.50) {
        return 3;
      }
      else if (moisture >= 0.50 && moisture < 0.75) {
        return 6;
      }
      else if (moisture >= 0.75) {
        return 9;
      }
    }
  }
  else if (height < 0.30 && height >= 0.15) {
    return 11;
  }
  else if (height < 0.15) {
    return 12;
  }
  return -1;
}

function getContourMap(height) {
  const step = 0.03;
  const h = height;
  const output = [];
  for (let x = 0; x < h.length; x++) {
    output.push([]);
    for (let y = 0; y < h[x].length; y++) {
      for (let e = 0; e < 1; e += step) {
        if (h[x][y] <= e && h[x][y] > e - step) {
          const color = (e * 2) * 255;
          output[x].push([color, color, color]);
          break;
        }
      }
    }
  }
  return output;
}

/**
 * Terrain Generator Factory
 * @param {Object} settings initial starting parameters
 * @param {Number} settings.width
 * @param {Number} settings.height
 * @param {Number} settings.seed
 * @param {Number} settings.frequency
 * @param {Object} settings.mask mask parameters
 * @param {Number} settings.mask.a
 * @param {Number} settings.mask.b
 * @param {Number} settings.mask.c
 */
function createTerrainGenerator(settings) { // eslint-disable-line no-unused-vars
  const generator = {
    settings,
    maps: {
      mask: {
        a: settings.mask.a,
        b: settings.mask.b,
        c: settings.mask.c
      }
    }
  };
  generator.createBlankMaps = () => {
    const s = generator.settings;
    const maps = generator.maps;
    maps.rawHeight = createMap();
    maps.height = createMap();
    maps.moisture = createMap();
    maps.temperature = createMap();
    maps.subTemperature = {};
    maps.contour = {};
    maps.subTemperature.map = [];
    maps.contour.map = [];
    // Raw Height Map
    maps.rawHeight
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setPower(2)
      .setOctaves(12);
    // Derived Height Map
    maps.height
      .setSeed(s.seed)
      .setFrequency(s.frequency);
    // Moisture Map
    maps.moisture
      .setMultiplier(3)
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(6)
      .setPower(0.9);
    // Temperature Map
    maps.temperature
      .setMultiplier(2)
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(6)
      .setPower(0.9);
    // Biome Map
    maps.biome = {
      map: [],
      getBiomes: getBiomeMap
    };
    return generator;
  };
  generator.fillMaps = () => {
    _.forOwn(generator.maps, (map) => {
      if ({}.hasOwnProperty.call(map, 'createMap')) {
        const s = generator.settings;
        map.createMap(s.width, s.height);
      }
    });
    return generator;
  };
  generator.setFrequencies = (frequency) => {
    _.forOwn(generator.maps, (map) => {
      if ({}.hasOwnProperty.call(map, 'createMap')) {
        const s = generator.settings;
        map.setFrequency(frequency)
          .createMap(s.width, s.height);
      }
    });
    return generator;
  };
  generator.setSeeds = (seed) => {
    _.forOwn(generator.maps, (map) => {
      if ({}.hasOwnProperty.call(map, 'createMap')) {
        const s = generator.settings;
        map.setSeed(seed)
          .createMap(s.width, s.height);
      }
    });
    return generator;
  };
  generator.setMask = (mask) => {
    const m = settings.mask;
    m.a = Number(mask.a);
    m.b = Number(mask.b);
    m.c = Number(mask.c);
    return generator;
  };
  return generator;
}

/**
 * Map Factory
 * TODO expand arguments so the createTerrainGenerator factory doesn't work so hard.
 */
function createMap() {
  const map = {
    multiplier: 1,
    power: 1,
    seed: 0,
    frequency: 0,
    octaves: 0,
    map: []
  };
  map.createMap = (w, h) => {
    const output = [];
    const simplex = new OpenSimplexNoise(map.seed);
    for (let x = 0; x < w; x++) {
      output.push([]);
      for (let y = 0; y < h; y++) {
        const nx = x / (w / 2.0);
        const ny = y / (h / 2.0);
        const e = simplex.noise2D(nx * map.frequency, ny * map.frequency);
        output[x].push(e);
      }
    }
    map.map = output;
    return map;
  };
  map.applyFBM = (w, h) => {
    const s = map;
    const simplex = new OpenSimplexNoise(s.seed);
    const output = [];
    for (let x = 0; x < w; x++) {
      output.push([]);
      for (let y = 0; y < h; y++) {
        const gain = 0.45;
        const lacunarity = 2.1042;
        const nx = x / (w / 2.0);
        const ny = y / (h / 2.0);
        let frequency = s.frequency;
        let amplitude = gain;
        let e = 0;

        for (let i = 0; i < s.octaves; i++) {
          e += simplex.noise2D(nx * frequency, ny * frequency) * amplitude;
          frequency *= lacunarity;
          amplitude *= gain;
        }
        e = (e + 1) / 2.0;
        e = Math.pow(e, map.power);
        output[x].push(e);
      }
    }

    map.map = output;
    return map;
  };
  map.applyMask = (refMap, a, b, c) => {
    const w = refMap.length;
    const h = refMap[0].length;
    const output = [];
    for (let x = 0; x < w; x++) {
      output.push([]);
      for (let y = 0; y < h; y++) {
        const nx = (x / w) - 0.5;
        const ny = (y / h) - 0.5;
        let e = refMap[x][y];
        // e = Math.pow(Math.abs(e), 0.5);
        const d = 2 * Math.sqrt((nx * nx) + (ny * ny));
        e = (e + a) - (b * Math.pow(d, c));
        if (e < 0.0) e = 0.0;
        if (e > 1.0) e = 1.0;
        e = Number(e.toFixed(4));
        output[x].push(e);
      }
    }
    map.map = output;
    return map;
  };
  map.setMultiplier = (a) => {
    map.multiplier = Number(a);
    return map;
  };
  map.setFrequency = (a) => {
    map.frequency = Number(a) * map.multiplier;
    return map;
  };
  map.setSeed = (a) => {
    map.seed = Number(a) * map.multiplier;
    return map;
  };
  map.setOctaves = (a) => {
    map.octaves = Number(a) / map.multiplier;
    return map;
  };
  map.setPower = (a) => {
    map.power = Number(a);
    return map;
  };
  return map;
}
