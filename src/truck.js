
exports.Compiler = require('./compiler');


exports.parse = function (code) {
  var compiler = new exports.Compiler();
  compiler.parse(code);

  return compiler.run();
};
