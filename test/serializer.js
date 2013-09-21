var Serializer = require('../src/serializer');

describe('serializer', function () {
  it('should serialize and empty AST', function () {
    var ast = Truck.parse('');

    var output = Serializer.serialize(ast);
    expect(output).to.be('');
  });


  it('should serialize a variable declaration', function () {
    var ast = Truck.parse('var a, b, c;');

    var output = Serializer.serialize(ast);
    expect(output).to.be('var a,b,c;');
  });


  it('should serialize a variable declaration with initialization', function () {
    var ast = Truck.parse('var a = 1, b = 2;');

    var output = Serializer.serialize(ast);
    expect(output).to.be('var a=1,b=2;');
  });


  it('should serialize assignment statements', function () {
    var ast = Truck.parse('a = 1; b = 2;');

    var output = Serializer.serialize(ast);
    expect(output).to.be('a=1;b=2;');
  });


  it('should serialize assignments with member expressions of the left', function () {
    var ast = Truck.parse('a.b.c = 1;');

    var output = Serializer.serialize(ast);
    expect(output).to.be('a.b.c=1;');
  });


  it('should serialize assignments with array-access member expressions of the left', function () {
    var ast = Truck.parse('a[b]["c"] = 1;');

    var output = Serializer.serialize(ast);
    expect(output).to.be('a[b].c=1;');
  });
});