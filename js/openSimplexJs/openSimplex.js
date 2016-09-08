/* jshint esversion:6 */
// OpenSimplex Noise by Kurt Spencer
// Ported to JS (poorly) by Eric Julius

function OpenSimplexNoise(seed) {
  'use strict';
  this.STRETCH_CONSTANT_2D = -0.211324865405187;    //(1/Math.sqrt(2+1)-1)/2;
  this.SQUISH_CONSTANT_2D = 0.366025403784439;      //(Math.sqrt(2+1)-1)/2;
  this.STRETCH_CONSTANT_3D = -1.0 / 6;              //(1/Math.sqrt(3+1)-1)/3;
  this.SQUISH_CONSTANT_3D = 1.0 / 3;                //(Math.sqrt(3+1)-1)/3;
  this.STRETCH_CONSTANT_4D = -0.138196601125011;    //(1/Math.sqrt(4+1)-1)/4;
  this.SQUISH_CONSTANT_4D = 0.309016994374947;      //(Math.sqrt(4+1)-1)/4;
  this.NORM_CONSTANT_2D = 47;
  this.NORM_CONSTANT_3D = 103;
  this.NORM_CONSTANT_4D = 30;
  this.DEFAULT_SEED = seed || 0;
  this.perm = [];
  this.permGradIndex3D = [];
  this._getPerm(this.DEFAULT_SEED);
  this._getPermGradIndex3D(this.perm);
}

OpenSimplexNoise.prototype._getPermGradIndex3D = function(perm) {
  'use strict';
  for (let i = 0; i < 256; i++) {
    //Since 3D has 24 gradients, simple bitmask won't work, so precompute modulo array.
    this.permGradIndex3D[i] = parseInt((perm[i] % (gradients3D.length / 3)) * 3);
  }
};

//Initializes the class using a permutation array generated from a 64-bit seed.
//Generates a proper permutation (i.e. doesn't merely perform N successive pair swaps on a base array)
//Uses a simple 64-bit LCG.
// NOTE: The JS version I've 'ported' uses a 32-bit LCG.
OpenSimplexNoise.prototype._getPerm = function(seed) {
  'use strict';
  let source = [];
  for (let i = 0; i < 256; i++) {
    source[i] = i;
  }
  seed = seed * 33797 + 1;
  seed = seed * 33797 + 1;
  seed = seed * 33797 + 1;
  for (let i = 255; i >= 0; i--) {
    if (isNaN(seed)) console.log("seed is NaN");
    let r = parseInt((seed + 31) % (i + 1));
    if (r < 0) {
        r += (i + 1);
    }
    this.perm[i] = parseInt(source[r]);
    this.permGradIndex3D[i] = parseInt((this.perm[i] % (gradients3D.length / 3)) * 3);
    source[r] = parseInt(source[i]);
  }
};

OpenSimplexNoise.prototype._extrapolate2D = function(xsb, ysb, dx, dy) {
  let index = this.perm[(this.perm[xsb & 0xFF] + ysb) & 0xFF] & 0x0E;
  return gradients2D[index] * dx + gradients2D[index + 1] * dy;
};

OpenSimplexNoise.prototype._extrapolate3D = function(xsb, ysb, zsb, dx, dy, dz) {
  let index = this.permGradIndex3D[(this.perm[(this.perm[xsb & 0xFF] + ysb) & 0xFF] + zsb) & 0xFF];
  return gradients3D[index] * dx + gradients3D[index + 1] * dy + gradients3D[index + 2] * dz;
};

OpenSimplexNoise.prototype._extrapolate4D = function(xsb, ysb, zsb, wsb, dx, dy, dz, dw) {
  let index = this.perm[(this.perm[(this.perm[(this.perm[xsb & 0xFF] + ysb) & 0xFF] + zsb) & 0xFF] + wsb) & 0xFF] & 0xFC;
  return gradients4D[index] * dx +
    gradients4D[index + 1] * dy +
    gradients4D[index + 2] * dz +
    gradients4D[index + 3] * dw;
};

OpenSimplexNoise.prototype._fastFloor = function(x) {
  let xi = parseInt(x);
  return x < xi ? xi - 1 : xi;
};

//2D OpenSimplex Noise.
OpenSimplexNoise.prototype.noise2D = function(x, y) {
  //Place input coordinates onto grid.
  let stretchOffset = (x + y) * this.STRETCH_CONSTANT_2D;
  let xs = x + stretchOffset;
  let ys = y + stretchOffset;

  //Floor to get grid coordinates of rhombus (stretched square) super-cell origin.
  let xsb = Math.floor(xs);
  let ysb = Math.floor(ys);

  //Skew out to get actual coordinates of rhombus origin. We'll need these later.
  let squishOffset = (xsb + ysb) * this.SQUISH_CONSTANT_2D;
  let xb = xsb + squishOffset;
  let yb = ysb + squishOffset;

  //Compute grid coordinates relative to rhombus origin.
  let xins = xs - xsb;
  let yins = ys - ysb;

  //Sum those together to get a value that determines which region we're in.
  let inSum = xins + yins;

  //Positions relative to origin point.
  let dx0 = x - xb;
  let dy0 = y - yb;

  //We'll be defining these inside the next block and using them afterwards.
  let dx_ext, dy_ext;
  let xsv_ext, ysv_ext;

  let value = 0;

  //Contribution (1,0)
  let dx1 = dx0 - 1 - this.SQUISH_CONSTANT_2D;
  let dy1 = dy0 - 0 - this.SQUISH_CONSTANT_2D;
  let attn1 = 2 - dx1 * dx1 - dy1 * dy1;
  if (attn1 > 0) {
    attn1 *= attn1;
    value += attn1 * attn1 * this._extrapolate2D(xsb + 1, ysb + 0, dx1, dy1);
  }

  //Contribution (0,1)
  let dx2 = dx0 - 0 - this.SQUISH_CONSTANT_2D;
  let dy2 = dy0 - 1 - this.SQUISH_CONSTANT_2D;
  let attn2 = 2 - dx2 * dx2 - dy2 * dy2;
  if (attn2 > 0) {
    attn2 *= attn2;
    value += attn2 * attn2 * this._extrapolate2D(xsb + 0, ysb + 1, dx2, dy2);
  }

  if (inSum <= 1) { //We're inside the triangle (2-Simplex) at (0,0)
    let zins = 1 - inSum;
    if (zins > xins || zins > yins) { //(0,0) is one of the closest two triangular vertices
      if (xins > yins) {
        xsv_ext = parseInt(xsb + 1);
        ysv_ext = parseInt(ysb - 1);
        dx_ext = dx0 - 1;
        dy_ext = dy0 + 1;
      } else {
        xsv_ext = parseInt(xsb - 1);
        ysv_ext = parseInt(ysb + 1);
        dx_ext = dx0 + 1;
        dy_ext = dy0 - 1;
      }
    } else { //(1,0) and (0,1) are the closest two vertices.
      xsv_ext = xsb + 1;
      ysv_ext = ysb + 1;
      dx_ext = dx0 - 1 - 2 * this.SQUISH_CONSTANT_2D;
      dy_ext = dy0 - 1 - 2 * this.SQUISH_CONSTANT_2D;
    }
  } else { //We're inside the triangle (2-Simplex) at (1,1)
    let zins = 2 - inSum;
    if (zins < xins || zins < yins) { //(0,0) is one of the closest two triangular vertices
      if (xins > yins) {
        xsv_ext = parseInt(xsb + 2);
        ysv_ext = parseInt(ysb + 0);
        dx_ext = dx0 - 2 - 2 * this.SQUISH_CONSTANT_2D;
        dy_ext = dy0 + 0 - 2 * this.SQUISH_CONSTANT_2D;
      } else {
        xsv_ext = parseInt(xsb + 0);
        ysv_ext = parseInt(ysb + 2);
        dx_ext = dx0 + 0 - 2 * this.SQUISH_CONSTANT_2D;
        dy_ext = dy0 - 2 - 2 * this.SQUISH_CONSTANT_2D;
      }
    } else { //(1,0) and (0,1) are the closest two vertices.
      dx_ext = dx0;
      dy_ext = dy0;
      xsv_ext = parseInt(xsb);
      ysv_ext = parseInt(ysb);
    }
    xsb += 1;
    ysb += 1;
    dx0 = dx0 - 1 - 2 * this.SQUISH_CONSTANT_2D;
    dy0 = dy0 - 1 - 2 * this.SQUISH_CONSTANT_2D;
  }

  //Contribution (0,0) or (1,1)
  let attn0 = 2 - dx0 * dx0 - dy0 * dy0;
  if (attn0 > 0) {
    attn0 *= attn0;
    value += attn0 * attn0 * this._extrapolate2D(xsb, ysb, dx0, dy0);
  }

  //Extra Vertex
  let attn_ext = 2 - dx_ext * dx_ext - dy_ext * dy_ext;
  if (attn_ext > 0) {
    attn_ext *= attn_ext;
    value += attn_ext * attn_ext * this._extrapolate2D(xsv_ext, ysv_ext, dx_ext, dy_ext);
  }

  return value / this.NORM_CONSTANT_2D;
};

//Gradients for 2D. They approximate the directions to the
//vertices of an octagon from the center.
const gradients2D = [
   5,  2,    2,  5,
  -5,  2,   -2,  5,
   5, -2,    2, -5,
  -5, -2,   -2, -5,
];

//Gradients for 3D. They approximate the directions to the
//vertices of a rhombicuboctahedron from the center, skewed so
//that the triangular and square facets can be inscribed inside
//circles of the same radius.
const gradients3D = [
  -11,  4,  4,     -4,  11,  4,    -4,  4,  11,
   11,  4,  4,      4,  11,  4,     4,  4,  11,
  -11, -4,  4,     -4, -11,  4,    -4, -4,  11,
   11, -4,  4,      4, -11,  4,     4, -4,  11,
  -11,  4, -4,     -4,  11, -4,    -4,  4, -11,
   11,  4, -4,      4,  11, -4,     4,  4, -11,
  -11, -4, -4,     -4, -11, -4,    -4, -4, -11,
   11, -4, -4,      4, -11, -4,     4, -4, -11,
];

//Gradients for 4D. They approximate the directions to the
//vertices of a disprismatotesseractihexadecachoron from the center,
//skewed so that the tetrahedral and cubic facets can be inscribed inside
//spheres of the same radius.
const gradients4D = [
     3,  1,  1,  1,      1,  3,  1,  1,      1,  1,  3,  1,      1,  1,  1,  3,
    -3,  1,  1,  1,     -1,  3,  1,  1,     -1,  1,  3,  1,     -1,  1,  1,  3,
     3, -1,  1,  1,      1, -3,  1,  1,      1, -1,  3,  1,      1, -1,  1,  3,
    -3, -1,  1,  1,     -1, -3,  1,  1,     -1, -1,  3,  1,     -1, -1,  1,  3,
     3,  1, -1,  1,      1,  3, -1,  1,      1,  1, -3,  1,      1,  1, -1,  3,
    -3,  1, -1,  1,     -1,  3, -1,  1,     -1,  1, -3,  1,     -1,  1, -1,  3,
     3, -1, -1,  1,      1, -3, -1,  1,      1, -1, -3,  1,      1, -1, -1,  3,
    -3, -1, -1,  1,     -1, -3, -1,  1,     -1, -1, -3,  1,     -1, -1, -1,  3,
     3,  1,  1, -1,      1,  3,  1, -1,      1,  1,  3, -1,      1,  1,  1, -3,
    -3,  1,  1, -1,     -1,  3,  1, -1,     -1,  1,  3, -1,     -1,  1,  1, -3,
     3, -1,  1, -1,      1, -3,  1, -1,      1, -1,  3, -1,      1, -1,  1, -3,
    -3, -1,  1, -1,     -1, -3,  1, -1,     -1, -1,  3, -1,     -1, -1,  1, -3,
     3,  1, -1, -1,      1,  3, -1, -1,      1,  1, -3, -1,      1,  1, -1, -3,
    -3,  1, -1, -1,     -1,  3, -1, -1,     -1,  1, -3, -1,     -1,  1, -1, -3,
     3, -1, -1, -1,      1, -3, -1, -1,      1, -1, -3, -1,      1, -1, -1, -3,
    -3, -1, -1, -1,     -1, -3, -1, -1,     -1, -1, -3, -1,     -1, -1, -1, -3,
];
