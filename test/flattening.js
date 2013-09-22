var flatten = Truck.pass('flatten');

describe('flattening', function () {
  it('should flatten properties of global object literals', function () {
    var code = 'var a; a = { b: function () {} }; a.b(true);';
    var ast = Truck.parse(code);

    flatten(ast);

    expect(ast.body.length).to.be(4);

    var declarations = ast.body[0].declarations;
    expect(declarations[0].id.name).to.be('a');
    expect(declarations[1].id.name).to.be('a$b');

    var assignment_flattened = ast.body[1].expression;
    expect(assignment_flattened.left.type).to.be('Identifier');
    expect(assignment_flattened.left.name).to.be('a$b');
    expect(assignment_flattened.right.type).to.be('FunctionExpression');

    var assignment = ast.body[2].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a');
    expect(assignment.right.type).to.be('ObjectExpression');
    expect(assignment.right.properties.length).to.be(1);
    expect(assignment.right.properties[0].key.name).to.be('b');
    expect(assignment.right.properties[0].value.type).to.be('Identifier');
    expect(assignment.right.properties[0].value.name).to.be('a$b');

    var call = ast.body[3].expression;
    expect(call.callee.type).to.be('Identifier');
    expect(call.callee.name).to.be('a$b');
  });


  it('should flatten properties added to global object literals', function () {
    var code = 'var a; a = {}; a.b = function () {}; a.b(true);';
    var ast = Truck.parse(code);

    flatten(ast);

    expect(ast.body.length).to.be(4);

    var declarations = ast.body[0].declarations;
    expect(declarations[0].id.name).to.be('a');
    expect(declarations[1].id.name).to.be('a$b');

    var assignment = ast.body[1].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a');
    expect(assignment.right.type).to.be('ObjectExpression');

    var assignment = ast.body[2].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a$b');
    expect(assignment.right.type).to.be('FunctionExpression');

    var call = ast.body[3].expression;
    expect(call.callee.type).to.be('Identifier');
    expect(call.callee.name).to.be('a$b');
  });


  it('should flatten deeper object stuctures on the global scope', function () {
    var code = 'var a; a = {}; a.b = {}; a.b.c = function () {}; a.b.c(true);';
    var ast = Truck.parse(code);

    flatten(ast);

    expect(ast.body.length).to.be(5);

    var declarations = ast.body[0].declarations;
    expect(declarations[0].id.name).to.be('a');
    expect(declarations[1].id.name).to.be('a$b');
    expect(declarations[2].id.name).to.be('a$b$c');

    var assignment = ast.body[1].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a');
    expect(assignment.right.type).to.be('ObjectExpression');

    var assignment = ast.body[2].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a$b');
    expect(assignment.right.type).to.be('ObjectExpression');

    var assignment = ast.body[3].expression;
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a$b$c');
    expect(assignment.right.type).to.be('FunctionExpression');

    var call = ast.body[4].expression;
    expect(call.callee.type).to.be('Identifier');
    expect(call.callee.name).to.be('a$b$c');
  });


  it('should flatten references to flattened structures in child scopes', function () {
    var code = 'var a; a = {}; a.b = 4; function x() { a.b = 5; }';
    var ast = Truck.parse(code);

    flatten(ast);

    expect(ast.body[0].type).to.be('VariableDeclaration');
    expect(ast.body[1].type).to.be('ExpressionStatement');
    expect(ast.body[1].expression.type).to.be('AssignmentExpression');
    expect(ast.body[2].type).to.be('ExpressionStatement');
    expect(ast.body[2].expression.type).to.be('AssignmentExpression');
    expect(ast.body[3].type).to.be('FunctionDeclaration');

    var fn_body = ast.body[3].body.body;
    expect(fn_body.length).to.be(1);
    expect(fn_body[0].type).to.be('ExpressionStatement');

    var assignment = fn_body[0].expression;
    expect(assignment.type).to.be('AssignmentExpression');
    expect(assignment.left.type).to.be('Identifier');
    expect(assignment.left.name).to.be('a$b');
    expect(assignment.right.type).to.be('Literal');
    expect(assignment.right.value).to.be(5);
  });
});
