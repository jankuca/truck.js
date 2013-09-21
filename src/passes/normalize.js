
module.exports = function (ast) {
  var normalizer = new Normalizer();
  normalizer.normalize(ast);
};


var Normalizer = function () {
};

Normalizer.prototype.normalize = function (ast) {
  this.var_declaration = null;
  this.var_declaration_stack = [ null ];
  this.fn_declaration_list = [];
  this.fn_declaration_list_stack = [ this.fn_declaration_list ];

  this.traverseBlock_(ast);
};


Normalizer.prototype.traverseBlock_ = function (block) {
  if (!block.body) return;
  if (!Array.isArray(block.body) && block.body.type === 'BlockStatement') {
    return this.traverseBlock_(block.body);
  }

  var body = block.body;

  for (var i = 0; i < body.length; ++i) {
    var statement = body[i];

    switch (statement.type) {
    case 'ExpressionStatement':
      this.traverseExpression_(statement.expression);
      break;

    case 'FunctionDeclaration':
      var var_declaration = null;
      this.var_declaration_stack.push(var_declaration);
      var fn_declaration_list = [];
      this.fn_declaration_list_stack.push(fn_declaration_list);

      this.traverseBlock_(statement);

      this.var_declaration = this.var_declaration_stack.pop();
      this.fn_declaration_list = this.fn_declaration_list_stack.pop();
      break;

    case 'IfStatement':
      if (statement.consequent) {
        this.traverseBlock_(statement.consequent);
      }
      if (statement.alternate) {
        this.traverseBlock_(statement.alternate);
      }
      break;

    case 'VariableDeclaration':
      statement.declarations.forEach(function (declaration) {
        if (declaration.init) {
          var assignment_expression = {
            type: 'AssignmentExpression',
            left: {
              type: 'Identifier',
              id: declaration.id
            },
            right: declaration.init
          };
          body.splice(i, 0, assignment_expression);
          i += 1;
        }
      });

      body.splice(i, 1);

      if (this.var_declaration) {
        var declarations = this.var_declaration.declarations;
        this.var_declaration.declarations = declarations.concat(
          statement.declarations.map(function (declaration) {
            return {
              type: declaration.type,
              id: declaration.id,
              init: null
            };
          })
        );
      } else {
        this.var_declaration = statement;
        body.splice(0, 0, statement);
      }
      break;

    case 'WithStatement':
      break;

    default:
      throw new Error('Unknown statement type: ' + statement.type);
    }
  }
};

Normalizer.prototype.traverseExpression_ = function (expression) {
  var key;

  switch (expression.type) {
  case 'AssignmentExpression':
    break;

  case 'CallExpression':
    expression.arguments.forEach(function (arg) {
      this.traverseExpression_(arg);
    }, this);
    this.traverseCalleeExpression_(expression.callee);
    break;

  case 'Identifier':
      this.validateScopeKey_(expression.name);
      break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};

Normalizer.prototype.traverseCalleeExpression_ = function (callee) {
  switch (callee.type) {
  case 'FunctionExpression':
    var var_declaration = null;
    this.var_declaration_stack.push(var_declaration);
    var fn_declaration_list = [];
    this.fn_declaration_list_stack.push(fn_declaration_list);

    this.traverseBlock_(callee);

    this.var_declaration = this.var_declaration_stack.pop();
    this.fn_declaration_list = this.fn_declaration_list_stack.pop();
    break;

  case 'Identifier':
    break;

  default:
    throw new Error('Unknown expression type: ' + expression.type);
  }
};
