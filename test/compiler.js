var path = require('path');

var Compiler = require('../src/compiler');

describe('compiler', function () {
  describe('parsing', function () {
    it('should parse source files', function () {
      var compiler = new Compiler();
      compiler.parseFile(path.join(__dirname, 'fixtures', 'compiler', 'sample.js'));
    });


    it('should parse source into an AST', function () {
      var compiler = new Compiler();
      compiler.parseFile(path.join(__dirname, 'fixtures', 'compiler', 'sample.js'));

      var ast = compiler.run();

      expect(ast).to.be.ok();
      expect(ast.type).to.be('Program');
      expect(ast.body).to.be.an('array');
      expect(ast.body.length).to.be(1);
    });


    it('should parse multiple source files into one AST', function () {
      var compiler = new Compiler();
      compiler.parseFile(path.join(__dirname, 'fixtures', 'compiler', 'a.js'));
      compiler.parseFile(path.join(__dirname, 'fixtures', 'compiler', 'b.js'));

      var ast = compiler.run();

      expect(ast).to.be.ok();
      expect(ast.type).to.be('Program');
      expect(ast.body).to.be.an('array');
      expect(ast.body.length).to.be(2);
    });


    it('should not allow parsing more source code when running', function () {
      var compiler = new Compiler();
      compiler.parse('var a;');
      compiler.run();

      expect(function () {
        compiler.parse('var b;');
      }).to.throwError();
    });
  });

  describe('passes', function () {
    it('should pass the AST to each registered pass', function () {
      var log = '';

      var ast_a;
      var pass_a = function (ast_in) {
        ast_a = ast_in;
        log += 'A';
      };

      var ast_b;
      var pass_b = function (ast_in) {
        ast_b = ast_in;
        log += 'B';
      };

      var compiler = new Compiler();
      compiler.parse('var a;');
      compiler.use(pass_a);
      compiler.use(pass_b);
      expect(log).to.be.empty();

      var ast = compiler.run();
      expect(log).to.be('AB');
      expect(ast_a).to.be(ast);
      expect(ast_b).to.be(ast);
    });


    it('should replace its AST with the one a pass returns (if it does)', function () {
      var ast_out = { type: 'Program', body: [] };
      var pass_a = function (ast_in) {
        return ast_out;
      };

      var ast_b;
      var pass_b = function (ast_in) {
        ast_b = ast_in;
      };

      var compiler = new Compiler();
      compiler.parse('var a;');
      compiler.use(pass_a);
      compiler.use(pass_b);

      var ast = compiler.run();
      expect(ast).to.be(ast_out);
      expect(ast_b).to.be(ast_out);
    });


    it('should not allow pass registration when running', function () {
      var compiler = new Compiler();
      compiler.parse('var a;');
      compiler.run();

      expect(function () {
        compiler.use(function () {});
      }).to.throwError();
    });
  });
});
