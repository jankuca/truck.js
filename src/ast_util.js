
exports.getRootObject = function (member_expression) {
  if (member_expression.type === 'Identifier') {
    return member_expression;
  }

  return exports.getRootObject(member_expression.object);
};


exports.getIdentifierChain = function (member_expression) {
  var names = [];

  var object = member_expression;
  while (object.type !== 'Identifier') {
    names.unshift(object.property);
    object = object.object;
  }
  names.unshift(object);

  return names;
};


exports.getIdentifierNameChain = function (member_expression) {
  return exports.getIdentifierChain(member_expression).map(function (id) {
    return id.name;
  });
};


exports.createIdentifier = function (data) {
  return {
    type: 'Identifier',
    name: data.name
  };
};


exports.createVariableDeclarator = function (data) {
  return {
    type: 'VariableDecorator',
    id: data.id,
    init: data.init || null
  };
};


exports.createAssignmentExpression = function (left, right, operator) {
  return {
    type: 'AssignmentExpression',
    left: left,
    right: right,
    operator: operator || '='
  };
};


exports.createExpressionStatement = function (expression) {
  return {
    type: 'ExpressionStatement',
    expression: expression
  };
};
