
module.exports = function (ast) {
  var validator = new Validator();
  validator.validate(ast);
};


var Validator = function () {
  this.global_scope = {};
  this.scope = this.global_scope;
};

Validator.prototype.validate = function (ast) {
  this.validateBlock_(ast);
};


Validator.prototype.validateBlock_ = function (block) {
  if (!block.body) return;
  if (!Array.isArray(block.body) && block.body.type === 'BlockStatement') {
    return this.validateBlock_(block.body);
  }

  var parent_scope = this.scope;
  var scope = Object.create(parent_scope);

  block.body.forEach(function (statement) {
    switch (statement.type) {
    case 'ExpressionStatement':
      this.validateExpression_(statement.expression);
      break;

    case 'Identifier':
      this.validateScopeKey_(statement.name);
      break;

    case 'IfStatement':
      if (statement.consequent) {
        this.validateBlock_(statement.consequent);
      }
      if (statement.alternate) {
        this.validateBlock_(statement.alternate);
      }
      break;

    case 'VariableDeclaration':
      statement.declarations.forEach(function (declaration) {
        this.scope[declaration.id.name] = true;
      }, this);
      break;

    case 'WithStatement':
      throw new SyntaxError('The with statement is not allowed');

    default:
      throw new Error('Unknown statement type: ' + statement.type);
    }
  }, this);

  this.scope = parent_scope;
};

Validator.prototype.validateExpression_ = function (expression) {
  var key;

  switch (expression.type) {
  case 'AssignmentExpression':
    this.validateLeftExpressionSide_(expression.left);
    break;

  case 'CallExpression':
    expression.arguments.forEach(function (arg) {
      this.validateExpression_(arg);
    }, this);
    this.validateCalleeExpression_(expression.callee);
    break;

  case 'Identifier':
      this.validateScopeKey_(expression.name);
      break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};

Validator.prototype.validateLeftExpressionSide_ = function (expression) {
  switch (expression.type) {
  case 'Identifier':
    this.validateScopeKey_(expression.name);
  }
};

Validator.prototype.validateCalleeExpression_ = function (callee) {
  switch (callee.type) {
  case 'FunctionExpression':
    var child_scope = Object.create(this.scope);
    callee.params.forEach(function (param) {
      if (param.type !== 'Identifier') {
        throw new Error('Unknown function argument type: ' + param.type);
      }
      child_scope[param.name] = true;
    });

    var parent_scope = this.scope;
    this.scope = child_scope;
    this.validateBlock_(callee);
    this.scope = parent_scope;
    break;

  case 'Identifier':
    this.validateScopeKey_(callee.name);
    break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};

Validator.prototype.validateScopeKey_ = function (key) {
  if (!this.scope[key]) {
    throw new ReferenceError(key + ' is not defined');
  }
};
