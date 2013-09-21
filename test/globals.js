
global.expect = require('expect.js');

global.Truck = require('../src/truck');

global.pass = function (name) {
  return require('../src/passes/' + name);
};
