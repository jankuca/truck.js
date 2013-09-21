
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
    case 'VariableDeclaration':
      this.processVariableDeclaration_(statement);
      break;

    case 'ExpressionStatement':
      this.processExpression_(statement.expression);
      break;

    default:
      throw new Error('Unknown statement type: ' + statement.type);
    }

    this.tokens.push(';');
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


Serializer.prototype.processExpression_ = function (expression) {
  switch (expression.type) {
  case 'AssignmentExpression':
    this.processExpression_(expression.left);
    this.tokens.push(expression.operator);
    this.processExpression_(expression.right);
    break;

  case 'Identifier':
    this.tokens.push(expression.name);
    break;

  case 'Literal':
    switch (typeof expression.value) {
    case 'number':
      this.tokens.push(expression.value);
      break;

    case 'string':
      this.tokens.push('"');
      this.processStringLiteralValue_(expression.value);
      this.tokens.push('"');
      break;

    case 'boolean':
      this.tokens.push(expression.value ? '!0' : '!1');
      break;
    }
    break;

  case 'MemberExpression':
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
    break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};


Serializer.prototype.processStringLiteralValue_ = function (value) {
  this.tokens.push(value.replace(/"/, '\\"'));
};


module.exports = Serializer;
