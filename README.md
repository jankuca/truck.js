**truck.js**

a JavaScript-to-JavaScript transpiler

---

This is an experimental node.js project trying to achieve Google Closure Compiler-like JavaScript source code optimization and minification.

## Installation

    $ npm install truck.js

## Usage

    var truck = require('truck.js');
    var compiler = new truck.Compiler();
    var serializer = new truck.Serializer();

    compiler.parseFile('./file1.js');
    compiler.parseFile('./file2.js');

    compiler.use(truck.pass('normalize'));
    compiler.use(truck.pass('validate'));

    var ast = compiler.run();
    var result = serializer.serialize(ast);

## Testing

truck.js uses [mocha](https://github.com/visionmedia/mocha) to run tests.

    $ npm test
