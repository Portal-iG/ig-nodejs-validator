var logging = require('./logging');
var FormValidator = require('../lib/form-validator').FormValidator;
var errors = require('../lib/errors');
var SchemaValidationError = errors.SchemaValidationError;

/**
 * Test suite for generic form validation module
 *
 * @author Ricardo Massa
 */

describe("generic form validation module test suite", function () {

it("should handle non schema-compliant form data", function () {
	var schema = {
		$schema: 'http://www.ig.com.br/json/schema#',
		required: [ 'name' ],
		properties: {
			name: { type: 'string', minLength: 5, maxLength: 10 }
		}
	}

	var nonCompliantInputs = [ 
		{},
		{ name: 13 },
		{ name: 'Duck' },
		{ name: 'I\'m Donald Duck' }
	];

	for (var i = 0; i < nonCompliantInputs.length; i++) {
		var validator = new FormValidator();
		var error = validator.assertValid(nonCompliantInputs[i], schema);
		expect(error.length).toBeGreaterThan(0);
	}
});

it("should handle schema-compliant form data", function () {
	var schema = {
		$schema: 'http://www.ig.com.br/json/schema#',
		required: [ 'name' ],
		properties: {
			name: { type: 'string', minLength: 5, maxLength: 10 }
		}
	}

	var nonCompliantInputs = [ 
		{ name: 'Inside'}
	];

	for (var i = 0; i < nonCompliantInputs.length; i++) {
		var validator = new FormValidator();
		var error = validator.assertValid(nonCompliantInputs[i], schema);
		expect(error).toBe(null);
	}
});

});