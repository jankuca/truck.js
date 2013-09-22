var ast_util = require('../ast_util');


module.exports = function (ast) {
  var flattener = new Flattener();
  flattener.flatten(ast);
};


var Flattener = function () {
  this.depth = 0;
  this.declarations = null;
  this.scope = {};
  this.renames = {};
};


Flattener.prototype.flatten = function (ast) {
  this.depth = 0;
  this.processBlock_(ast);
};


Flattener.prototype.processBlock_ = function (block) {
  var scope = this.scope;
  var renames = this.renames;
  var declarations = this.declarations;

  var body = block.body;
  for (var i = 0; i < body.length; ++i) {
    var statement = body[i];

    switch (statement.type) {
    case 'ExpressionStatement':
      var expression = statement.expression;
      switch (expression.type) {
      case 'AssignmentExpression':
        var left_id = expression.left;
        if (left_id.type === 'MemberExpression') {
          left_id = ast_util.getRootObject(expression.left);

          if (scope.hasOwnProperty(left_id.name)) {
            var id_names = ast_util.getIdentifierNameChain(expression.left);
            var scope_key = id_names.join('.');
            var flattened_name = renames.hasOwnProperty(scope_key)
              ? renames[scope_key]
              : id_names.join('$');

            left_id = ast_util.createIdentifier({ name: flattened_name });
            expression.left = left_id;

            if (!renames.hasOwnProperty(scope_key)) {
              renames[scope_key] = flattened_name;
              declarations.push(ast_util.createVariableDeclarator({
                id: ast_util.createIdentifier({ name: flattened_name })
              }));
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
              body.splice(i++, 0, ast_util.createExpressionStatement(assignment));
              property.value = ast_util.createIdentifier({ name: flattened_name });

              if (!renames.hasOwnProperty(scope_key)) {
                renames[scope_key] = flattened_name;
                declarations.push(ast_util.createVariableDeclarator({
                  id: ast_util.createIdentifier({ name: flattened_name })
                }));
              }
            }

            // TODO: process (original) property value
          }, this);
        }
        break;

      case 'CallExpression':
        var expression = statement.expression;
        var callee = expression.callee;
        if (callee.type === 'MemberExpression') {
          var id_names = ast_util.getIdentifierNameChain(callee);
          var scope_key = id_names.join('.');
          if (renames.hasOwnProperty(scope_key)) {
            var flattened_name = renames[scope_key];
            expression.callee = ast_util.createIdentifier({ name: flattened_name });
          }
        }
        break;
      }
      break;

    case 'FunctionDeclaration':
      var fn_body = statement.body;
      this.processBlock_(fn_body);
      break;

    case 'VariableDeclaration':
      declarations = statement.declarations;
      declarations.forEach(function (declaration) {
        scope[declaration.id.name] = true;
      });
      this.declarations = declarations;
      break;
    }
  }
};