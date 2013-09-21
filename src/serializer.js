
var Serializer = function () {
  this.tokens = [];
};


Serializer.serialize = function (ast) {
  var serializer = new Serializer();
  return serializer.serialize(ast);
};


Serializer.prototype.serialize = function (ast) {
  this.processBlock_(ast);

  return this.tokens.join('');
};


Serializer.prototype.processBlock_ = function (block) {
  if (!block.body) return;

  block.body.forEach(function (statement) {
    switch (statement.type) {
    case 'ExpressionStatement':
      this.processExpression_(statement.expression);
      this.tokens.push(';');
      break;

    case 'FunctionDeclaration':
      this.processFunctionDeclaration_(statement);
      break;

    case 'VariableDeclaration':
      this.processVariableDeclaration_(statement);
      this.tokens.push(';');
      break;

    default:
      throw new Error('Unknown statement type: ' + statement.type);
    }
  }, this);
};


Serializer.prototype.processVariableDeclaration_ = function (statement) {
  this.tokens.push(statement.kind, ' ');

  statement.declarations.forEach(function (declaration, i) {
    this.tokens.push(declaration.id.name);

    if (declaration.init) {
      this.tokens.push('=');
      this.processExpression_(declaration.init);
    }

    if (i !== statement.declarations.length - 1) {
      this.tokens.push(',');
    }
  }, this);
};


Serializer.prototype.processFunctionDeclaration_ = function (statement) {
  this.tokens.push('function', ' ', statement.id.name);

  this.tokens.push('(');
  statement.params.forEach(function (param, i) {
    this.tokens.push(param.name);

    if (i !== statement.params.length - 1) {
      this.tokens.push(',');
    }
  }, this);
  this.tokens.push(')');

  this.tokens.push('{');
  this.processBlock_(statement.body);
  this.tokens.push('}');
};


Serializer.prototype.processExpression_ = function (expression) {
  switch (expression.type) {
  case 'AssignmentExpression':
    this.processAssignmentExpression_(expression);
    break;

  case 'CallExpression':
    this.processCallExpression_(expression);
    break;

  case 'Identifier':
    this.tokens.push(expression.name);
    break;

  case 'Literal':
    this.processLiteral_(expression);
    break;

  case 'MemberExpression':
    this.processMemberExpression_(expression);
    break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};


Serializer.prototype.processAssignmentExpression_ = function (expression) {
  this.processExpression_(expression.left);
  this.tokens.push(expression.operator);
  this.processExpression_(expression.right);
};


Serializer.prototype.processCallExpression_ = function (expression) {
  this.processExpression_(expression.callee);

  this.tokens.push('(');
  expression.arguments.forEach(function (argument, i) {
    this.processExpression_(argument);

    if (i !== expression.arguments.length - 1) {
      this.tokens.push(',');
    }
  }, this);
  this.tokens.push(')');
};


Serializer.prototype.processLiteral_ = function (literal) {
  switch (typeof literal.value) {
  case 'number':
    this.tokens.push(literal.value);
    break;

  case 'string':
    this.tokens.push('"');
    this.processStringLiteralValue_(literal.value);
    this.tokens.push('"');
    break;

  case 'boolean':
    this.tokens.push(literal.value ? '!0' : '!1');
    break;

  default:
    throw new Error('Unknown literal type: ' + (typeof literal.value));
  }
};


Serializer.prototype.processMemberExpression_ = function (expression) {
  this.processExpression_(expression.object);

  var array_access = (expression.computed
      && expression.property.type !== 'Literal'
      && typeof expression.property.value !== 'string');

  if (array_access) {
    this.tokens.push('[');
    this.processExpression_(expression.property);
    this.tokens.push(']');
  } else {
    this.tokens.push('.');
    if (expression.property.type === 'Literal'
        && typeof expression.property.value === 'string') {
      this.processStringLiteralValue_(expression.property.value);
    } else {
      this.processExpression_(expression.property);
    }
  }
};


Serializer.prototype.processStringLiteralValue_ = function (value) {
  this.tokens.push(value.replace(/"/, '\\"'));
};


module.exports = Serializer;
