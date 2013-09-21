
exports.Compiler = require('./compiler');
exports.Serializer = require('./serializer');


exports.pass = function (name) {
  return require('./passes/' + name);
};


exports.parse = function (code) {
  var compiler = new exports.Compiler();
  compiler.parse(code);

  return compiler.run();
};
