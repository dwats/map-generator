'use strict';
const assert = require('assert');
const mapgen = require('../js/mapgen.js');
const OpenSimplexNoise = require('../js/OpenSimplexNoise/opensimplex.js');

const createMap = mapgen.createMap;

describe('Map', function () {
  let dim;
  let testMap;
  const w = 100;
  const h = 100;
  describe('#makeMap()', function () {
    beforeEach(function () {
      dim = 1;
      testMap = createMap()
        .setSeed(Math.random())
        .makeMap(w, h)
        .map;
    });
    it('should return an array', function () {
      assert.equal(true, Array.isArray(testMap));
    });
    it('should return an array with 2 dimensions', function () {
      getArrayDimCount(testMap);
      assert.equal(2, dim);
    });
    it('should not return array with x-dimension that does not match w arg', function () {
      assert.equal(true, w === testMap.length);
    });
    it('should not return array with y-dimension that does not match h arg', function () {
      assert.equal(true, h === testMap[0].length);
    });
    it('should not output array with NaN values', function () {
      let nanCount = 0;
      for (let x = 0; x < testMap.length; x++) {
        for (let y = 0; y < testMap[x].length; y++) {
          if (isNaN(testMap[x][y])) {
            nanCount += 1;
          }
        }
      }
      assert.equal(0, nanCount);
    });
    it('should not output array with Infinity values', function () {
      let infCount = 0;
      for (let x = 0; x < testMap.length; x++) {
        for (let y = 0; y < testMap[x].length; y++) {
          if (testMap[x][y] === Infinity) {
            infCount += 1;
          }
        }
      }
      assert.equal(0, infCount);
    });
    it('should not output array with String values', function () {
      let strCount = 0;
      for (let x = 0; x < testMap.length; x++) {
        for (let y = 0; y < testMap[x].length; y++) {
          if (typeof testMap[x][y] === 'string') {
            strCount += 1;
          }
        }
      }
      assert.equal(0, strCount);
    });
    it('should throw when createMap().octaves === 0', function () {
      assert.throws(() => {
        testMap = createMap()
          .setOctaves(0)
          .makeMap(w, h)
          .applyFBM(w, h)
          .map;
      }, /0 octaves/, 'Expected "0 octaves"');
    });
  });
  // Not sure where to put these testing functions, but they "work" here.
  function getArrayDimCount(arr) {
    if (Array.isArray(arr[0])) {
      dim += 1;
      getArrayDimCount(arr[0]);
    }
  }
});
