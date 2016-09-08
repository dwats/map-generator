/**
 * Procedural Map Generator
 * By Eric Julius
 */
/* jshint esversion:6 */
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
function createTerrainGenerator(settings) {
    'use strict';
    let generator = {
        settings: settings,
        maps: {
            mask: {
                a: settings.mask.a,
                b: settings.mask.b,
                c: settings.mask.c
            }
        }
    };
    generator.createBlankMaps = function() {
        let settings = this.settings;
        let maps = this.maps;
        maps.rawHeight = createMap();
        maps.height = createMap();
        maps.moisture = createMap();
        maps.temperature = createMap();
        // Raw Height Map
        maps.rawHeight
            .setSeed(settings.seed)
            .setFrequency(settings.frequency)
            .setOctaves(8);
        // Derived Height Map
        maps.height
            .setSeed(settings.seed)
            .setFrequency(settings.frequency)
            .setOctaves(8)
            .lock = true;
        // Moisture Map
        maps.moisture
            .setMultiplier(1.75)
            .setSeed(settings.seed)
            .setFrequency(settings.frequency)
            .setOctaves(4);
        // Temperature Map
        maps.temperature
            .setMultiplier(2)
            .setSeed(settings.seed)
            .setFrequency(settings.frequency)
            .setOctaves(4);
        // Biome Map
        maps.biome = [];
        return this;
    };
    generator.fillMaps = function() {
        _.forOwn(this.maps, (map, key) => {
            if (map.hasOwnProperty("createMap")) {
                let s = this.settings;
                map.createMap(s.width, s.height);
            }
        });
        return this;
    };
    generator.setFrequencies = function(frequency) {
        _.forOwn(this.maps, (map, key) => {
            if (map.hasOwnProperty("createMap")) {
                let s = this.settings;
                map.setFrequency(frequency)
                    .createMap(s.width, s.height);
            }
        });
        return this;
    };
    generator.setSeeds = function(seed) {
        _.forOwn(this.maps, (map, key) => {
            if (map.hasOwnProperty("createMap")) {
                let s = this.settings;
                map.setSeed(seed)
                    .createMap(s.width, s.height);
            }
        });
        return this;
    };
    generator.setMask = function(mask) {
        let m = settings.mask;
        m.a = Number(mask.a);
        m.b = Number(mask.b);
        m.c = Number(mask.c);
        return this;
    };
    return generator;
}

/**
 * Map Factory
 * TODO expand arguments so the createTerrainGenerator factory doesn't work so hard.
 */
function createMap() {
    'use strict';
    var map = {
        multiplier: 1,
        seed: 0,
        frequency: 0,
        octaves: 0,
        map: []
    };
    map.createMap = function(w, h) {
        let output = [];
        let simplex = new OpenSimplexNoise(this.seed);
        for (let x = 0; x < w; x++) {
            output.push([]);
            for (let y = 0; y < h; y++) {
                let nx = x / (w / 2.0);
                let ny = y / (h / 2.0);
                let e = simplex.noise2D(nx * this.frequency, ny * this.frequency);
                output[x].push(e);
            }
        }
        this.map = output;
        return this;
    };
    map.applyFBM = function(w, h) {
        let s = this;
        let simplex = new OpenSimplexNoise(s.seed);
        let output = [];
        for (let x = 0; x < w; x++) {
            output.push([]);
            for (let y = 0; y < h; y++) {
                let frequency = s.frequency;
                let gain = 0.65;
                let amplitude = gain;
                let lacunarity = 2.1042;
                let e = 0;
                let nx = x / (w / 2.0);
                let ny = y / (h / 2.0);
                for (let i = 0; i < s.octaves; i++) {
                    e += simplex.noise2D(nx * frequency, ny * frequency) * amplitude;
                    frequency *= lacunarity;
                    amplitude *= gain;
                }
                output[x].push(e);
            }
        }
        this.map = output;
        return this;
    };
    map.applyMask = function(map, a, b, c) {
        let s = this;
        let w = map.length;
        let h = map[0].length;
        let output = [];
        for (let x = 0; x < w; x++) {
            output.push([]);
            for (let y = 0; y < h; y++) {
                let nx = (x / w) - 0.5;
                let ny = (y / h) - 0.5;
                let e = map[x][y];
                //e = Math.pow(Math.abs(e), 2);
                let d = 2 * Math.sqrt(nx * nx + ny * ny);
                e += a - b * Math.pow(d, c);
                output[x].push(e);
            }
        }
        this.map = output;
        return this;
    };
    map.setMultiplier = function(a) {
        this.multiplier = Number(a);
        return this;
    };
    map.setFrequency = function(a) {
        this.frequency = Number(a) * this.multiplier;
        return this;
    };
    map.setSeed = function(a) {
        this.seed = Number(a) * this.multiplier;
        return this;
    };
    map.setOctaves = function(a) {
        this.octaves = Number(a) / this.multiplier;
        return this;
    };
    return map;
}

// TODO Move to generators
// /**
//  * A poor attempt at 'scaling' a given value
//  */
// TerrainGenerator.prototype._scaleValue = function(input, min, max) {
//     'use strict';
//     return Math.min(Math.max(min, input * max), max);
// };
//
// /**
//  * Determine the Biome of a given pixel based on height, moisture and temperature.
//  */
// TerrainGenerator.prototype._getBiomeMap = function() {
//     'use strict';
//     let output = [];
//     for (let x = 0; x < this.width; x++) {
//         output.push([]);
//         for (let y = 0; y < this.height; y++) {
//             let height = this.map.height[x][y];
//             let moisture = this.map.moisture[x][y];
//             let temperature = this.map.temperature[x][y];
//             let biome = this._getBiomeId(height, moisture, temperature);
//             let rgb = [];
//
//             switch (biome) {
//                 case 0: //0 - Tundra
//                     rgb = [235, 235, 235];
//                     break;
//                 case 1: //1 - Desert
//                     rgb = [224, 255, 255];
//                     break;
//                 case 2: //2 - Grass Desert
//                     rgb = [238, 232, 170];
//                     break;
//                 case 3: //3 - Savanna
//                     rgb = [144, 228, 144];
//                     break;
//                 case 4: //4 - Seasonal Forest (woods)
//                     rgb = [128, 128, 0];
//                     break;
//                 case 5: //5 - Taiga
//                     rgb = [90, 102, 95];
//                     break;
//                 case 6: //6 - Temperate Forest (seasonal forest)
//                     rgb = [85, 107, 47];
//                     break;
//                 case 7: //7 - Temperate Rain Forest (forest)
//                     rgb = [34, 139, 34];
//                     break;
//                 case 8: //8 - Swamp (rain forest)
//                     rgb = [46, 139, 87];
//                     break;
//                 case 9: //9 - Tropical Rain Forest (swamp)
//                     rgb = [0, 100, 0];
//                     break;
//                 case 10: //10 - Barren
//                     rgb = [119, 136, 153];
//                     break;
//                 case 11: //11 - Shallow Ocean
//                     rgb = [15, 30, 125];
//                     break;
//                 case 12: //12 - Deep Ocean
//                     rgb = [10, 30, 100];
//                     break;
//                 default: // Error
//                     console.log("BiomeErr H:", sHeight, "M:", sMoisture, "T:", sTemperature);
//                     rgb = [250, 128, 114];
//             }
//             for (let i = 0; i < rgb.length; i++) {
//                 rgb[i] = height * rgb[i] / 1.5;
//             }
//             output[x].push(rgb);
//         }
//     }
//     return output;
// };
//
//
// function multiply(rgb1, rgb2) {
//     var result = [],
//         i = 0;
//     for (; i < rgb1.length; i++) {
//         result.push(Math.floor(rgb1[i] * rgb2[i] / 255));
//     }
//     return result;
// }
//
// /**
//  * Helper function to get pixel biome.
//  */
// TerrainGenerator.prototype._getBiomeId = function(height, moisture, temperature) {
//
//     if (height >= 225 || (moisture < 50 && temperature < 25 && height >= 75)) {
//         return 0;
//     } else if ((moisture < 25 && temperature >= 65) && (height >= 75 && height < 225)) {
//         return 1;
//     } else if ((moisture < 25 && temperature >= 25 && temperature < 65) && (height >= 75 && height < 150)) {
//         return 2;
//     } else if ((moisture < 50 && moisture >= 25 && temperature >= 75) && (height >= 75 && height < 150)) {
//         return 3;
//     } else if ((moisture < 50 && moisture >= 25 && temperature >= 50 && temperature < 75) && (height >= 75 && height < 225)) {
//         return 4;
//     } else if ((moisture < 75 && moisture >= 25 && temperature >= 0 && temperature < 50) && (height >= 75 && height < 225)) {
//         return 5;
//     } else if ((moisture < 75 && moisture >= 50 && temperature >= 75) && (height >= 75 && height < 225)) {
//         return 6;
//     } else if ((moisture < 75 && moisture >= 50 && temperature >= 50 && temperature < 75) && (height >= 75 && height < 225)) {
//         return 7;
//     } else if ((moisture >= 75 && temperature >= 25) && (height >= 75 && height < 100)) {
//         return 8;
//     } else if ((moisture >= 75 && temperature >= 50) && (height >= 75 && height < 225)) {
//         return 9;
//     } else if (height >= 150 && height < 225) {
//         return 10;
//     } else if (height < 75 && height >= 50) {
//         return 11;
//     } else if (height < 50) {
//         return 12;
//     } else {
//         return -1;
//     }
//
// };
