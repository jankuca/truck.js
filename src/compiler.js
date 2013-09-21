var esprima = require('esprima');
var fs = require('fs');


var Compiler = function () {
  this.running_ = false;
  this.ast_ = { type: 'Program', body: [] };
  this.passes_ = [];
};

Compiler.prototype.use = function (pass) {
  if (this.running_) {
    throw new Error('New compiler passes cannot be added during compilation');
  }

  this.passes_.push(pass);
};

Compiler.prototype.parseFile = function (filename) {
  var code = fs.readFileSync(filename, 'utf8');
  this.parse(code);
};

Compiler.prototype.parse = function (code) {
  if (this.running_) {
    throw new Error('New source code cannot be added during compilation');
  }

  var ast_part = esprima.parse(code);
  this.extendAst_(ast_part);
};

Compiler.prototype.extendAst_ = function (ast_part) {
  this.ast_.body = this.ast_.body.concat(ast_part.body);
};

Compiler.prototype.run = function () {
  this.running_ = true;

  var ast = this.ast_;
  this.passes_.forEach(function (pass) {
    ast = pass(ast) || ast;
  });

  return ast;
};


module.exports = Compiler;
