
var JSDocParser = function () {

};


var JSDocAnnotationTypes = {
  'type': 'type',
  'abstract': true,
  'constructor': true,
  'extends': 'type',
  'param': 'array: type id string',
  'returns': 'type string'
};

var JSDocAnnotationProcess = {
  'param': function (parts) {
    return {
      type: parts[0],
      name: parts[1],
      description: parts[2]
    };
  },
  'returns': function (parts) {
    return {
      type: parts[0],
      description: parts[1]
    };
  }
};

var JSDocAnnotationRewrite = {
  'param': 'params'
};


JSDocParser.parse = function (input) {
  if (input[0] !== '*' || input[1] !== '\n') return null;
  input = input.substr(2);

  var description = /\*\s@/.test(input) ? input.match(/(.*?)\s*\*/)[1] : input;
  input = input.substr(description.length);

  description = description.replace(/^\s+\*\s/gm, '').trim();

  var annotations = {};
  var annotation_match;
  while (annotation_match = input.match(/^\s+\*\s@(\w+)(?:\s(.*?))?\s*(\*|$)/)) {
    var annotation_name = annotation_match[1];
    var annotation_raw_value = annotation_match[2];
    JSDocParser.addAnnotation_(annotations, annotation_name, annotation_raw_value);

    input = input.substr(annotation_match[0].length - 2);
  }

  return {
    annotations: annotations,
    description: description
  };
};


JSDocParser.addAnnotation_ = function (annotations, name, raw_value) {
  var rewritten_name = JSDocAnnotationRewrite.hasOwnProperty(name)
    ? JSDocAnnotationRewrite[name]
    : name;

  var value = this.interpolateAnnotationValue_(name, raw_value);
  if (JSDocAnnotationProcess.hasOwnProperty(name)) {
    value = JSDocAnnotationProcess[name].call(null, value);
  }

  if (/^array: /.test(JSDocAnnotationTypes[name])) {
    if (typeof annotations[rewritten_name] === 'undefined') {
      annotations[rewritten_name] = [];
    }
    annotations[rewritten_name].push(value);
  } else {
    annotations[rewritten_name] = value;
  }
};


JSDocParser.interpolateAnnotationValue_ = function (name, raw_value) {
  var syntax = JSDocAnnotationTypes[name];
  if (!syntax) return raw_value;

  var parts = (typeof syntax === 'string')
    ? syntax.replace(/^.*?:\s*/, '').split(' ')
    : [ syntax ];

  var results = parts.map(function (part) {
    var value;
    switch (part) {
    case true: return true;
    case false: return false;
    case null: return null;

    case 'number':
      value = parseInt(raw_value, 10);
      raw_value = raw_value.substr(value.length + 1);
      return value;

    case 'string':
      value = raw_value;
      raw_value = '';
      return value;

    case 'type':
      value = '';
      var depth = 0;
      while (raw_value.length !== 0) {
        switch (raw_value[0]) {
        case '{':
          depth += 1;
          break;
        case '}':
          depth -= 1;
          break;
        }

        value += raw_value[0];
        raw_value = raw_value.substr(1).trimLeft();
        if (depth === 0) {
          return value;
        }
      }
      return null;

    case 'id':
      value = raw_value.split(/\s/)[0];
      raw_value = raw_value.replace(/^.*?\s/, '');
      return value;
    }
  });

  return (parts.length === 1) ? results[0] : results;
};


module.exports = JSDocParser;
