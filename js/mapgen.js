/* jshint esversion:6 */
const tempMult = 1.25;
const moistMult = 1.25;

/**
 * @constructor
 * @param {Object} settings Object containing width, height, frequency and seed data
 */
function TerrainGenerator(settings) {
	'use strict';
	console.log(settings);
	this.width = Number(settings.width) || 512;
	this.height = Number(settings.height) || 512;
	this.frequency = Number(settings.frequency) || 0.0009;
	this.seed = Number(settings.seed) || Math.random();
	this.moistureFrequency = this.frequency * moistMult;
	this.temperatureFrequency = this.frequency * tempMult;
	this.map = {
		height : [],
		moisture : [],
		temperature : [],
		biome : []
	};
}
/**
 * Start new map generation
 */
TerrainGenerator.prototype.makeMap = function() {
	'use strict';
	console.log("seed", this.seed );

	this.map.height = this._getNoise(this.frequency);
	this.seed *= 0.25;
	this.map.moisture = this._getNoise(this.moistureFrequency);
	this.seed *= 0.45;
	this.map.temperature = this._getNoise(this.temperatureFrequency);
	this.map.biome = this._getBiomeMap();
};

/**
 * Draw various 2D arrays to canvas.
 * @param {Boolean} showBiome If true map, mMap and tMap are drawn to canvas, else only map.
 * @param {Array} map Terrain 2D array
 * @param {Array} mMap Moisture 2D array
 * @param {Array} tMap Temperature 2D array
 */
function drawMap(showBiome, map, mMap, tMap) {
	'use strict';
	if (showBiome) {
		drawFrame(map, mMap, tMap);
	} else {
		drawMonoArray(map);
	}
	updateCanvas();
}

/**
 * Return array of a specified size filled with RND values or zeros.
 * @param {Number} dimX Integer width of noise array
 * @param {Number} dimY Integer height of noise array
 * @param {Boolean} canFBM Should the output be run through fractional brownian motion
 * @param {Number} freq Double Determines frequency of returned noise array
 * @return {Array} Starting array, but now filled with RND values
 */
TerrainGenerator.prototype._getNoise = function(frequency) {
	'use strict';
	let arr = [];
	let Simplex = new OpenSimplexNoise(this.seed || Math.random());

	for (let x = 0; x < this.width; x++) {
		arr.push([]);
		for (let y = 0; y < this.height; y++) {
			let nx = x / this.width;
			let ny = y / this.height;
			let brownNoise = this._brownianMotion(16, Simplex, nx, ny, frequency);
			let maskedNoise = this._terrainMask(nx, ny, brownNoise);

			if (x === 128 && y === 128) {
				console.log("brown", brownNoise);
				console.log("masked", maskedNoise);
			}
			arr[x].push(maskedNoise);
		}
	}

	return arr;
};

/**
 * Run a noise value through fractional Brownian Moition for a given number of octaves (iterations)
 */
TerrainGenerator.prototype._brownianMotion = function(octaves, Simplex, x, y, frequency) {
	'use strict';
	let freq = frequency;
	let gain = 0.65;
	let amplitude = gain;
	let lacunarity = 2.1042;
	let noise = 0;

	for (let i = 0; i < octaves; i++) {
		noise += Simplex.noise2D(x * freq, y * freq) * amplitude;
		freq *= lacunarity;
		amplitude *= gain;
	}

	return noise;
};

/**
 * Provide a masked result given X and Y coordinates as well as X and Y dimensions.
 */
 //TODO figure out why this isn't masking correctly.
TerrainGenerator.prototype._terrainMask = function(x, y, noise) {
	'use strict';
	let a = 0.05; // "Height" modifier
	let b = 1.5; // "Edge" modifier
	let c = 2; // "Drop off" modifier
	let nx = (x / this.width) - 0.5;
	let ny = (y / this.height) - 0.5;
	let d = 2 * Math.sqrt(nx * nx + ny * ny);
	noise = Math.max((noise + a) * (1 - b * Math.pow(d, c)), 0);
	return noise;

	// let distance = Math.sqrt(this.width * this.width + this.height * this.height);
	//
	// let maxWidth = Math.min(this.width, this.height) * 0.5 - 10.0;
	// let delta = distance / maxWidth;
	// let gradient = delta * delta;
	// noise *= Math.max(0, 1.0 - gradient);
	//
	// return noise;
};

/**
 * A poor attempt at 'scaling' a given value
 */
TerrainGenerator.prototype._scaleValue = function(input, min, max) {
	'use strict';
	return Math.min(Math.max(min, input * max), max);
};

/**
 * Determine the Biome of a given pixel based on height, moisture and temperature.
 */
TerrainGenerator.prototype._getBiomeMap = function() {
	'use strict';
	for (let x = 0; x < this.width; x++) {
		this.map.biome.push([]);
		for (let y = 0; y < this.height; y++) {
			let sHeight = this._scaleValue(this.map.height[x][y], 0, 255);
			let sMoisture = this._scaleValue(this.map.moisture[x][y], 0, 100);
			let sTemperature = this._scaleValue(this.map.temperature[x][y], 0, 100);
			let biomeId = this._getBiomeId(sHeight, sMoisture, sTemperature);
			let rgb = [];

			switch(biomeId) {
				case 0: //0 - Tundra
					rgb = [235,235,235];
					break;
				case 1: //1 - Desert
					rgb = [224,255,255];
					break;
				case 2: //2 - Grass Desert
					rgb = [238,232,170];
					break;
				case 3: //3 - Savanna
					rgb = [144,238,144];
					break;
				case 4: //4 - Seasonal Forest (woods)
					rgb = [128,128,0];
					break;
				case 5: //5 - Taiga
					rgb = [107,142,35];
					break;
				case 6: //6 - Temperate Forest (seasonal forest)
					rgb = [85,107,47];
					break;
				case 7: //7 - Temperate Rain Forest (forest)
					rgb = [34,139,34];
					break;
				case 8: //8 - Swamp (rain forest)
					rgb = [46,139,87];
					break;
				case 9: //9 - Tropical Rain Forest (swamp)
					rgb = [0,100,0];
					break;
				case 10: //10 - Barren
					rgb = [119,136,153];
					break;
				case 11: //11 - Shallow Ocean
					rgb = [15,30,125];
					break;
				case 12: //12 - Deep Ocean
					rgb = [10,30,100];
					break;
				default: // Error
					console.log("BiomeErr H:", sHeight, "M:", sMoisture, "T:", sTemperature);
					rgb = [250,128,114];
			}
			this.map.biome[x].push(rgb);
		}
	}
};

/**
 * Helper function to get pixel biome.
 */
TerrainGenerator.prototype._getBiomeId = function(height, moisture, temperature) {

	if (height >= 225 || (moisture < 50 && temperature < 25 && height >= 75)) {
		return 0;
	} else if ((moisture < 25 && temperature >= 65) && (height >= 75 && height < 225)) {
		return 1;
	} else if ((moisture < 25 && temperature >= 25 && temperature < 65) && (height >= 75 && height < 150)) {
		return 2;
	} else if ((moisture < 50 && moisture >= 25 && temperature >= 75) && (height >= 75 && height < 150)) {
		return 3;
	} else if ((moisture < 50 && moisture >= 25 && temperature >= 50 && temperature < 75) && (height >= 75 && height < 225)) {
		return 4;
	} else if ((moisture < 75 && moisture >= 25 && temperature >= 25 && temperature < 50) && (height >= 75 && height < 225)) {
		return 5;
	} else if ((moisture < 75 && moisture >= 50 && temperature >= 75) && (height >= 75 && height < 225)) {
		return 6;
	} else if ((moisture < 75 && moisture >= 50 && temperature >= 50 && temperature < 75) && (height >= 75 && height < 225)) {
		return 7;
	} else if ((moisture >= 75 && temperature >= 75) && (height >= 75 && height < 100)) {
		return 8;
	} else if ((moisture >= 75 && temperature >= 50) && (height >= 75 && height < 225)) {
		return 9;
	} else if (height >= 150 && height < 225) {
		return 10;
	} else if (height < 75 && height >= 50) {
		return 11;
	} else if (height < 50) {
		return 12;
	} else {
		return -1;
	}

};
