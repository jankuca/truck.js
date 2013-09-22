var ast_util = require('../ast_util');


module.exports = function (ast) {
  var flattener = new Flattener();
  flattener.flatten(ast);
};


var Flattener = function () {
  this.depth = 0;
  this.body = null;
  this.index = -1;

  this.declarations = null;
  this.scope = {};
  this.renames = {};
};


Flattener.prototype.flatten = function (ast) {
  this.depth = 0;
  this.index = 0;
  this.processBlock_(ast);
};


Flattener.prototype.addVariableDeclarationForIdentifier_ = function (id) {
  var declaration = ast_util.createVariableDeclarator({
    id: id
  });

  this.declarations.push(declaration);
};


Flattener.prototype.processBlock_ = function (block) {
  var parent_body = this.body;
  var parent_index = this.index;

  var body = block.body;
  this.body = body;

  for (this.index = 0; this.index < body.length; ++this.index) {
    var statement = body[this.index];

    switch (statement.type) {
    case 'ExpressionStatement':
      this.processExpressionStatement_(statement);
      break;

    case 'FunctionDeclaration':
      this.processBlock_(statement.body);
      break;

    case 'VariableDeclaration':
      declarations = statement.declarations;
      declarations.forEach(function (declaration) {
        this.scope[declaration.id.name] = true;
      }, this);
      this.declarations = declarations;
      break;
    }
  }

  this.body = parent_body;
  this.index = parent_index;
};


Flattener.prototype.processExpressionStatement_ = function (statement) {
  var expression = statement.expression;
  switch (expression.type) {
  case 'AssignmentExpression':
    this.processAssignmentExpression_(statement.expression);
    break;

  case 'CallExpression':
    this.processCallExpression_(statement.expression);
    break;
  }
};


Flattener.prototype.processAssignmentExpression_ = function (expression) {
  var left_id = expression.left;
  if (left_id.type === 'MemberExpression') {
    left_id = ast_util.getRootObject(expression.left);

    if (this.scope.hasOwnProperty(left_id.name)) {
      var id_names = ast_util.getIdentifierNameChain(expression.left);
      var scope_key = id_names.join('.');
      var flattened_name = this.renames.hasOwnProperty(scope_key)
        ? this.renames[scope_key]
        : id_names.join('$');

      left_id = ast_util.createIdentifier({ name: flattened_name });
      expression.left = left_id;

      if (!this.renames.hasOwnProperty(scope_key)) {
        this.renames[scope_key] = flattened_name;
        this.addVariableDeclarationForIdentifier_(
            ast_util.createIdentifier({ name: flattened_name }));
      }
    }
  }

  if (this.depth === 0 && expression.right.type === 'ObjectExpression') {
    expression.right.properties.forEach(function (property) {
      if (this.depth === 0) {
        var scope_key = left_id.name + '.' + property.key.name;
        var flattened_name = left_id.name + '$' + property.key.name;

        var id = ast_util.createIdentifier({ name: flattened_name });
        var assignment = ast_util.createAssignmentExpression(id, property.value);
        this.body.splice(this.index++, 0, ast_util.createExpressionStatement(assignment));
        property.value = ast_util.createIdentifier({ name: flattened_name });

        if (!this.renames.hasOwnProperty(scope_key)) {
          this.renames[scope_key] = flattened_name;
          this.addVariableDeclarationForIdentifier_(
              ast_util.createIdentifier({ name: flattened_name }));
        }
      }

      // TODO: process (original) property value
    }, this);
  }
};


Flattener.prototype.processCallExpression_ = function (expression) {
  var callee = expression.callee;
  if (callee.type === 'MemberExpression') {
    var id_names = ast_util.getIdentifierNameChain(callee);
    var scope_key = id_names.join('.');
    if (this.renames.hasOwnProperty(scope_key)) {
      var flattened_name = this.renames[scope_key];
      expression.callee = ast_util.createIdentifier({ name: flattened_name });
    }
  }
};
