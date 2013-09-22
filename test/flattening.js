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
});
