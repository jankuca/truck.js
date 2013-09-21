
module.exports = function (ast) {
  var global_scope = {};
  validateBlock(ast, global_scope);
};


var validateBlock = function (block, parent_scope) {
  if (!block.body) return;
  if (!Array.isArray(block.body) && block.body.type === 'BlockStatement') {
    return validateBlock(block.body, parent_scope);
  }

  var scope = Object.create(parent_scope);

  block.body.forEach(function (statement) {
    switch (statement.type) {
    case 'ExpressionStatement':
      validateExpression(statement.expression, scope);
      break;

    case 'Identifier':
      validateScopeKey(statement.name, scope);
      break;

    case 'IfStatement':
      if (statement.consequent) {
        validateBlock(statement.consequent, scope);
      }
      if (statement.alternate) {
        validateBlock(statement.alternate, scope);
      }
      break;

    case 'VariableDeclaration':
      statement.declarations.forEach(function (declaration) {
        scope[declaration.id.name] = true;
      });
      break;

    case 'WithStatement':
      throw new SyntaxError('The with statement is not allowed');

    default:
      throw new Error('Unknown statement type: ' + statement.type);
    }
  });
};

var validateExpression = function (expression, scope) {
  var key;

  switch (expression.type) {
  case 'AssignmentExpression':
    validateLeftExpressionSide(expression.left, scope);
    break;

  case 'CallExpression':
    expression.arguments.forEach(function (arg) {
      validateExpression(arg, scope);
    });
    validateCalleeExpression(expression.callee, scope);
    break;

  case 'Identifier':
      validateScopeKey(expression.name, scope);
      break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};

var validateLeftExpressionSide = function (expression, scope) {
  switch (expression.type) {
  case 'Identifier':
    validateScopeKey(expression.name, scope);
  }
};

var validateCalleeExpression = function (callee, scope) {
  switch (callee.type) {
  case 'FunctionExpression':
    var child_scope = Object.create(scope);
    callee.params.forEach(function (param) {
      if (param.type !== 'Identifier') {
        throw new Error('Unknown function argument type: ' + param.type);
      }
      child_scope[param.name] = true;
    });

    validateBlock(callee, child_scope);
    break;

  case 'Identifier':
    validateScopeKey(callee.name);
    break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};

var validateScopeKey = function (key, scope) {
  if (!scope[key]) {
    throw new ReferenceError(key + ' is not defined');
  }
};
