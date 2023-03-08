var async = require('async');
var path = require('path');
var logging = require('./logging');
var errors = require('../lib/errors');
var translator = require('../lib/img-error-translator');
var ImageErrorTranslator = translator.ImageErrorTranslator;
var ImageValidationError = errors.ImageValidationError;

/**
 * Test suite for image validation error translation module
 *
 * @author Ricardo Massa
 */

describe("Image validation error translation module test suite", function () {

var msgs = {
	error: 'Validation error',
	dimensions: {
		minimum: 'Minimum size'
	},
	mimeType: 'Mime type',
	maxFileSize: 'Maximum file size'
}

var errTranslator = new ImageErrorTranslator(msgs)
var defTranslator = new ImageErrorTranslator();

var defaultMessages = translator.defaultMessages; 

it("should throw if error is not a ImageValidationError", function () {
	var errors = [ null, {}, 'a string', new Error() ];

	for (var i = 0; i < errors.length; i++) {
		expect(function () { errTranslator.translate(errors[i]) }).toThrow();
		expect(function () { defTranslator.translate(errors[i]) }).toThrow();
	}
});

it("should translate an inner error", function () {
	var error = new ImageValidationError('Error', new Error());

	expect(errTranslator.translate(error)).toEqual(msgs.error);
	expect(defTranslator.translate(error)).toEqual(defaultMessages.error);
});

it("should translate a 'minimum width required' error", function () {
	var error = new ImageValidationError('Error', { reasons: ['minWidth'] });

	expect(errTranslator.translate(error)).toEqual(msgs.dimensions.minimum);
	expect(defTranslator.translate(error)).toEqual(defaultMessages.dimensions.minimum);
});

it("should translate a 'minimum height required' error", function () {
	var error = new ImageValidationError('Error', { reasons: ['minHeight'] });

	expect(errTranslator.translate(error)).toEqual(msgs.dimensions.minimum);
	expect(defTranslator.translate(error)).toEqual(defaultMessages.dimensions.minimum);
});

it("should translate a 'wrong mime type' error", function () {
	var error = new ImageValidationError('Error', { reasons: ['mimeType'] });

	expect(errTranslator.translate(error)).toEqual(msgs.mimeType);
	expect(defTranslator.translate(error)).toEqual(defaultMessages.mimeType);
});

it("should translate a 'max allowed file size' error", function () {
	var error = new ImageValidationError('Error', { reasons: ['maxFileSize'] });

	expect(errTranslator.translate(error)).toEqual(msgs.maxFileSize);
	expect(defTranslator.translate(error)).toEqual(defaultMessages.maxFileSize);
});

});