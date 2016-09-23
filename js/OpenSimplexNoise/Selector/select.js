'use strict';
try {
  var createInterpolation = require('../interpolation.js');
}
catch (e) {}

function createSelect(sources, control, falloff, lower, upper) {
  const select = {
    sourceModules: sources || [],
    controlModule: control || null,
    edge: falloff || 0.0,
    lowerBound: lower || -1.0,
    upperBound: upper || 1.0,
    Interpolation: createInterpolation()
  }

  select.setEdge = (value) => {
    const s = select;
    // Make Sure that the edge falloff curves do not overlap.
    const size = s.upperBound - s.lowerBound;
    const half = size / 2;

    s.edge = (value > half) ? half : value;
    return s;
  };

  select.setLowerBound = (value) => {
    const s = select;
    if (value > s.upperBound) {
      throw new Error('Lower bound cannot exceed upper bound!');
    }

    s.lowerBound = value;
    return s;
  };

  select.setUpperBound = (value) => {
    const s = select;
    if (value < s.lowerBound) {
      throw new Error('Upper bound cannot be less than lower bound!');
    }

    s.upperBound = value;
    return s;
  };

  select.setBounds = (l, u) => {
    const s = select;
    if (l > u) {
      throw new Error('Lower bound cannot exceed upper bound!');
    }
    s.lowerBound = l;
    s.upperBound = u;
  };

  select.getValue = (x, y) => {
    const s = select;
    if (s.sourceModules.length < 2) {
      throw new Error('Invalid or missing source module(s)!');
    }
    if (!s.controlModule) {
      throw new Error('Invalid or missing control module!');
    }

    let lowerCurve;
    let upperCurve;
    const controlValue = s.controlModule[x][y];

    if (s.edge > 0.0) {

      if (controlValue < (s.lowerBound - s.edge)) {
        // The output value from the control module is below the selector
        // threshold; return the output value from the first source module.
        return s.sourceModules[0][x][y];
      }
      else if (controlValue < (s.lowerBound + s.edge)) {
        // The output value from the control module is near the lower end of the
        // selector threshold and within the smooth curve. Interpolate between
        // the output values from the first and second source modules.
        lowerCurve = parseFloat(s.lowerBound - s.edge);
        upperCurve = parseFloat(s.lowerBound + s.edge);

        return s.Interpolation.linear(
          s.sourceModules[0][x][y],
          s.sourceModules[1][x][y],
          s.Interpolation.cubicSCurve((controlValue - lowerCurve) / (upperCurve - lowerCurve))
        );
      }
      else if (controlValue < (s.upperBound - s.edge)) {
        // The output value from the control module is within the selector
        // threshold; return the output value from the second source module.
        return s.sourceModules[1][x][y];
      }
      else if (controlValue < (s.upperBound + s.edge)) {
        // The output value from the control module is near the upper end of the
        // selector threshold and within the smooth curve. Interpolate between
        // the output values from the first and second source modules.
        lowerCurve = parseFloat(s.upperBound - s.edge);
        upperCurve = parseFloat(s.upperBound + s.edge);

        return s.Interpolation.linear(
          s.sourceModules[1][x][y],
          s.sourceModules[0][x][y],
          s.Interpolation.cubicSCurve((controlValue - lowerCurve) / (upperCurve - lowerCurve))
        );
      }
    }
    return (controlValue < s.lowerBound || controlValue > s.upperBound)
      ? s.sourceModules[0][x][y]
      : s.sourceModules[1][x][y];
  };

  return select;
}
