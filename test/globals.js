
global.expect = require('expect.js');

global.Truck = require('../src/truck');

global.pass = function (name) {
  return require('../src/passes/' + name);
};

global.json = function (obj) {
  return JSON.stringify(obj, null, 2);
};
