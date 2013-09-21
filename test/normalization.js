var normalize = Truck.pass('normalize');

describe('normalization', function () {
  describe('hoisting', function () {
    it('should hoist variable declarations to the top in the global context', function () {
      var code = 'var a; fn(); var b;';
      var ast = Truck.parse(code);

      normalize(ast);

      expect(ast.body.length).to.be(2);
      var declarations = ast.body[0].declarations;
      expect(declarations.length).to.be(2);
      expect(declarations[0].id.name).to.be('a');
      expect(declarations[1].id.name).to.be('b');
    });


    it('should hoist variable declarations to the top in an enclosing function', function () {
      var code = 'function x() { var a; fn(); var b; }';
      var ast = Truck.parse(code);

      normalize(ast);

      var fn_declaration = ast.body[0];
      var block_statement = fn_declaration.body;
      var declarations = block_statement.body[0].declarations;
      expect(declarations.length).to.be(2);
      expect(declarations[0].id.name).to.be('a');
      expect(declarations[1].id.name).to.be('b');
    });


    it('should not keep assignment expressions in place of uninitialized variable declarations', function () {
      var code = 'var a; var b;';
      var ast = Truck.parse(code);

      normalize(ast);

      expect(ast.body.length).to.be(1);
    });


    it('should keep assignment expressions in place of hoisted variable declarations', function () {
      var code = 'var a; fn(); var b = 5;';
      var ast = Truck.parse(code);

      normalize(ast);

      expect(ast.body.length).to.be(3);
      var assignment_expression = ast.body[2];
      expect(assignment_expression.type).to.be('AssignmentExpression');
      expect(assignment_expression.left.type).to.be('Identifier');
      expect(assignment_expression.left.id.name).to.be('b');
      expect(assignment_expression.right.type).to.be('Literal');
      expect(assignment_expression.right.value).to.be(5);
    });


    it('should hoist function declarations to the top in the global context', function () {
      var code = 'a(); function fn1() {} b(); function fn2() {}';
      var ast = Truck.parse(code);

      normalize(ast);

      expect(ast.body.length).to.be(4);
      expect(ast.body[0].type).to.be('FunctionDeclaration');
      expect(ast.body[0].id.name).to.be('fn1');
      expect(ast.body[1].type).to.be('FunctionDeclaration');
      expect(ast.body[1].id.name).to.be('fn2');
    });



    it('should hoist function declarations to the top in the global context', function () {
      var code = 'function x() { a(); function fn1() {} b(); function fn2() {} }';
      var ast = Truck.parse(code);

      normalize(ast);

      var fn_declaration = ast.body[0];
      var block_statement = fn_declaration.body;
      expect(block_statement.body.length).to.be(4);
      expect(block_statement.body[0].type).to.be('FunctionDeclaration');
      expect(block_statement.body[0].id.name).to.be('fn1');
      expect(block_statement.body[1].type).to.be('FunctionDeclaration');
      expect(block_statement.body[1].id.name).to.be('fn2');
    });
  });
});
