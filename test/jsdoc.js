var JSDocParser = require('../src/jsdoc-parser');

describe('JSDoc', function () {
  describe('parser', function () {
    it('should parse descriptions', function () {
      var comment = '*\n' +
        ' * This is the description.\n' +
        ' * Lorem ipsum.\n' +
        ' ';
      var jsdoc = JSDocParser.parse(comment);

      expect(jsdoc).not.to.be(null);
      expect(jsdoc.description).to.be('This is the description.\nLorem ipsum.');
    });


    it('should parse boolean annotations', function () {
      var comment = '*\n' +
        ' * @abstract\n' +
        ' * @constructor\n' +
        ' ';
      var jsdoc = JSDocParser.parse(comment);

      expect(jsdoc).not.to.be(null);
      expect(jsdoc.annotations.abstract).to.be(true);
      expect(jsdoc.annotations.constructor).to.be(true);
    });


    it('should parse type annotations', function () {
      var comment = '*\n' +
        ' * @type {number}\n' +
        ' * @extends {general}\n' +
        ' ';
      var jsdoc = JSDocParser.parse(comment);

      expect(jsdoc).not.to.be(null);
      expect(jsdoc.annotations.type).to.be('{number}');
      expect(jsdoc.annotations.extends).to.be('{general}');
    });


    it('should parse function parameter list', function () {
      var comment = '*\n' +
        ' * @param {{ src: string }} desc Descriptor.\n' +
        ' * @param {!Array.<number>} flags Flag list.\n' +
        ' ';
      var jsdoc = JSDocParser.parse(comment);

      expect(jsdoc).not.to.be(null);
      expect(jsdoc.annotations.params).to.be.an('array');
      expect(jsdoc.annotations.params[0]).to.eql({
        type: '{{src:string}}',
        name: 'desc',
        description: 'Descriptor.'
      });
      expect(jsdoc.annotations.params[1]).to.eql({
        type: '{!Array.<number>}',
        name: 'flags',
        description: 'Flag list.'
      });
    });


    it('should parse return value type', function () {
      var comment = '*\n' +
        ' * @returns {!Array.<string>} An array of strings.\n' +
        ' ';
      var jsdoc = JSDocParser.parse(comment);

      expect(jsdoc).not.to.be(null);
      expect(jsdoc.annotations.returns).to.eql({
        type: '{!Array.<string>}',
        description: 'An array of strings.'
      });
    });
  });
});
