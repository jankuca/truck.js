
global.expect = require('expect.js');

global.Truck = require('../src/truck');


global.json = function (obj) {
  return JSON.stringify(obj, null, 2);
};
