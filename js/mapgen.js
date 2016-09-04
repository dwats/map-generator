/* jshint esversion:6 */
'use strict';
let frequency;

/**
 * Start new map generation
 */
function startGen() {
	let showBiomes = document.getElementById('showBiomes').checked;
	let seed = Number(document.getElementById('mapSeed').value);
	setStartingValues();
	initFrame(showBiomes, seed);
}

/**
 * Initialize terrain, moisture and temperature arrays then pass them to `drawMap` be drawn to canvas.
 * @param {Boolean} showBiomes If true map, mMap and tMap are drawn to canvas, else only map.
 * @param {Number} userSeed A number seed used in the 32-bit OpenSimplex LCG
 */
function initFrame(showBiomes, userSeed) {
	let seed = userSeed || Math.random();
	document.getElementById('mapSeed').value = seed;
	console.log("seed",seed);

	let moistureFreq = frequency * 1.25;
	let temperatureFreq = frequency * 1.25;
	let terrainMap = getArrayOfNoise(gridX, gridY, true, frequency, seed);
	let moistureMap = getArrayOfNoise(gridX, gridY, false, moistureFreq, seed);
	let temperatureMap = getArrayOfNoise(gridX, gridY, false, temperatureFreq, seed);

	//console.log("temp", temperatureMap);
	//console.log("moist", moistureMap);
	//drawMap(false, moistureMap);
	//drawMap(false, temperatureMap);
	drawMap(showBiomes, terrainMap, moistureMap, temperatureMap);
}

/**
 * Draw various 2D arrays to canvas.
 * @param {Boolean} showBiome If true map, mMap and tMap are drawn to canvas, else only map.
 * @param {Array} map Terrain 2D array
 * @param {Array} mMap Moisture 2D array
 * @param {Array} tMap Temperature 2D array
 */
function drawMap(showBiome, map, mMap, tMap) {
	if (showBiome) {
		drawFrame(map, mMap, tMap);
	} else {
		frameDraw(map);
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
function getArrayOfNoise(dimX, dimY, canFBM, freq, seed) {
	let arr = [];
	let Simplex = new OpenSimplexNoise(seed || Math.random());

	for (let x = 0; x < dimX; x++) {
		arr.push([]);
		for (let y = 0; y < dimY; y++) {
			if (canFBM) {
				arr[x].push(terrainMask(dimX, dimY, x, y, fracBrownianMotion(16, Simplex, x, y, freq)));
			} else {
				arr[x].push(terrainMask(dimX, dimY, x, y, fracBrownianMotion(8, Simplex, x, y, freq)));
			}
		}
	}

	return arr;
}

/**
 * Run a noise value through fractional Brownian Moition for a given number of octaves (iterations)
 */
function fracBrownianMotion(octaves, Simplex, x, y, inFreq) {
	let freq = Number(inFreq);
	let gain = 0.65;
	let amplitude = gain;
	let lacunarity = 2.1042;
	let noise = 0;

	for (let i = 0; i < octaves; i++) {
		noise += Simplex.noise2D(x * freq, y * freq) * amplitude;
		freq *= lacunarity;
		amplitude *= gain;
	}
	return noise ;
}

/**
 * Provide a masked result given X and Y coordinates as well as X and Y dimensions.
 */
function terrainMask(dimX, dimY, x, y, noise) {
	let distX = Math.abs(x - dimX * 0.5);
	let distY = Math.abs(y - dimY * 0.5);
	let distance = Math.sqrt(distX * distX + distY * distY);

	let maxWidth = Math.min(dimX, dimY) * 0.5 - 10.0;
	let delta = distance / maxWidth;
	let gradient = delta * delta;
	noise *= Math.max(0, 1.0 - gradient);

	return noise;
}

/**
 * A poor attempt at 'scaling' a given value
 */
function scaleValue(value, multiplier, max) {
	let output = Math.abs(value) * multiplier & max;
	return output;
}

/**
 * Given a 2D array, draw to canvas using a homemade canvas drawing function
 */
function drawFrame(terrain, moisture, temperature) {
	for (let x = 0; x < gridX; x++) {
		for (let y = 0; y < gridY; y++) {
			rgbPixelDraw(x, y, getPixelRGB(terrain[x][y], moisture[x][y], temperature[x][y]));
		}
	}
}

/**
 * Determine the Biome of a given pixel based on height, moisture and temperature.
 */
function getPixelRGB(height, moisture, temperature) {
	let sHeight = scaleValue(height, 200, 255);
	let sMoisture = scaleValue(moisture, 200, 100);
	let sTemperature = scaleValue(temperature, 200, 100);
	let biome = getBiome(sHeight, sMoisture, sTemperature);
	let rgb = [];
	//console.log("h", height, "m", sMoisture, "t", sTemperature, "b", biome);

		/**
		 * 0 - Tundra
		 * 1 - Desert
		 * 2 - Grass Desert
		 * 3 - Savanna
		 * 4 - Seasonal Forest (woods)
		 * 5 - Taiga
		 * 6 - Temperate Forest (seasonal forest)
		 * 7 - Temperate Rain Forest (forest)
		 * 8 - Swamp (rain forest)
		 * 9 - Tropical Rain Forest (swamp)
		 * 10 - Barren
		 * 11 - Shallow Ocean
		 * 12 - Deep Ocean
		 * -1 - Error
		 */

	switch(biome) {
		case 0:
			rgb = [235,235,235];
			break;
		case 1:
			rgb = [224,255,255];
			break;
		case 2:
			rgb = [238,232,170];
			break;
		case 3:
			rgb = [144,238,144];
			break;
		case 4:
			rgb = [128,128,0];
			break;
		case 5:
			rgb = [107,142,35];
			break;
		case 6:
			rgb = [85,107,47];
			break;
		case 7:
			rgb = [34,139,34];
			break;
		case 8:
			rgb = [46,139,87];
			break;
		case 9:
			rgb = [0,100,0];
			break;
		case 10:
			rgb = [119,136,153];
			break;
		case 11:
			rgb = [15,30,125];
			break;
		case 12:
			rgb = [10,30,100];
			break;
		default:
			console.log("BiomeErr H:", sHeight, "M:", sMoisture, "T:", sTemperature);
			rgb = [250,128,114];
	}

	for (let i = 0; i < rgb.length; i++) {
		rgb[i] = (rgb[i]/1.25) + scaleValue(height, 100, 75);
	}
	return rgb;

}

/**
 * Helper function to get pixel biome.
 */
function getBiome(height, moisture, temperature) {

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

}
