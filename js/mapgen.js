/**
 * Procedural Map Generator
 * By Eric Julius
 */

/**
 * Determine the Biome of a given pixel based on height, moisture and temperature.
 */
function getBiomeMap(maps, w, h) {
  'use strict';
  const output = [];
  for (let x = 0; x < w; x++) {
    output.push([]);
    for (let y = 0; y < h; y++) {
      let height = Math.abs(maps.height.map[x][y]);
      const moisture = Math.abs(maps.moisture.map[x][y]);
      const temperature = Math.abs(maps.temperature.map[x][y]);
      const biome = getBiomeId(height, moisture, temperature);
      let rgb = [];

      switch (biome) {
        case 0: // 0 - Tundra
          rgb = [235, 235, 235];
          break;
        case 1: // 1 - Desert
          rgb = [224, 255, 255];
          break;
        case 2: // 2 - Grass Desert
          rgb = [238, 232, 170];
          break;
        case 3: // 3 - Savanna
          rgb = [144, 228, 144];
          break;
        case 4: // 4 - Seasonal Forest (woods)
          rgb = [128, 128, 0];
          break;
        case 5: // 5 - Taiga
          rgb = [77, 108, 99];
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
          rgb = [119, 136, 153];
          break;
        case 11: // 11 - Shallow Ocean
          rgb = [15, 70, 105];
          break;
        case 12: // 12 - Deep Ocean
          rgb = [10, 40, 255];
          break;
        default: // Error
          console.log('BiomeErr H:', height, 'M:', moisture, 'T:', temperature);
          rgb = [250, 128, 114];
      }

      height *= 255;
      // height = ((height + 0.5 ) / 2.0) * 255;
      // output[x].push(multiply([height, height, height], rgb));
      output[x].push(overlay([height, height, height], rgb));
      // output[x].push(rgb);
    }
  }
  return output;
}

function multiply(rgb1, rgb2) {
  const result = [];
  for (let i = 0; i < rgb1.length; i++) {
    result.push(Math.floor((rgb1[i] * rgb2[i]) / 255));
  }
  return result;
}

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
 * Helper function to get pixel biome.
 */
function getBiomeId(height, moisture, temperature) {

  if (height >= 0.95) {
    return 10;
  }
  else if (height < 0.95 && height >= 0.40) {
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
  else if (height < 0.40 && height >= 0.20) {
    return 11;
  }
  else if (height < 0.20) {
    return 12;
  }
  else {
    return -1;
  }
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
  'use strict';
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
    // Raw Height Map
    maps.rawHeight
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(8);
    // Derived Height Map
    maps.height
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(4);
    // Moisture Map
    maps.moisture
      .setMultiplier(0.51)
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(5)
      .setPower(1.2);
    // Temperature Map
    maps.temperature
      .setMultiplier(0.52)
      .setSeed(s.seed)
      .setFrequency(s.frequency)
      .setOctaves(4)
      .setPower(1.2);
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
  'use strict';
  const map = {
    multiplier: 1,
    power: 1,
    seed: 0,
    frequency: 0,
    octaves: 0,
    map: []
  };
  map.createMap = (w, h) => {
    map.map = [];
    const output = [];
    const simplex = new OpenSimplexNoise(map.seed);
    console.log(map.frequency);
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
        const gain = 0.65;
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
        e = Math.pow(Math.abs(e), map.power);
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
