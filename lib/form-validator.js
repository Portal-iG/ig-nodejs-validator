var url = require('url');
var tv4 = require('tv4');
var formats = require('tv4-formats');
var logger = require('winston');

tv4.addFormat(formats);

/**
 * Generic form data validator
 *
 * @param {object} formData Form data parsed in an object
 * 
 * @author Ricardo Massa
 */
function FormValidator (keyPrefix) {
	this._keyPrefix = keyPrefix;
}

FormValidator.msgNotSchemaCompliant = 'Form fails on schema compliance test';

/**
 * Asserts form data object complies with the given JSON schema
 * @param  {object} schema JSON schema
 * @return {boolean}        Assertion result
 */
FormValidator.prototype.assertValid = function (formData, schema) {
	var result = tv4.validateMultiple(formData, schema);	
	
	if (!result.valid) {
		return result.errors;
	}
	return null;
}

/* 
 * For compliance with wire module
 */
module.exports = function () {
	var validator = Object.create(FormValidator.prototype);
	FormValidator.apply(validator, arguments);
	return validator;
}; 

module.exports.FormValidator = FormValidator;