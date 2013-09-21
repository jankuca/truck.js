
describe('validation', function () {
  describe('strict mode', function () {
    it('should treat with statements as errors', function () {
      var code_a = 'var a; var obj = {}; with (obj) { }';
      var code_b = 'var obj = {}; if (obj) { with (obj) { } }';

      var ast_a = Truck.parse(code_a);
      var ast_b = Truck.parse(code_b);

      expect(function () {
        Truck.validate(ast_a);
      }).to.throwError(/with/);

      expect(function () {
        Truck.validate(ast_b);
      }).to.throwError(/with/);
    });
  });

  describe('scope', function () {
    it('should treat possible global leaks as reference errors', function () {
      var code = 'a = 4; a.x = a; b=5,c=6;';
      var ast = Truck.parse(code);

      expect(function () {
        Truck.validate(ast);
      }).to.throwError(ReferenceError);
    });

    it('should track scope inheritance', function () {
      var code = 'var a; (function (x) { a = 4; b = 3; }());'
      var ast = Truck.parse(code);

      expect(function () {
        Truck.validate(ast);
      }).to.throwError(/\bb\b/);
    });
  });
});
