var async = require('async');
var path = require('path');
var logging = require('./logging');
var Validator = require('../lib/img-validator').ImageValidator;
var errors = require('../lib/errors');
var ImageErrorTranslator = require('../lib/img-error-translator').ImageErrorTranslator;
var ImageValidationError = errors.ImageValidationError;

/**
 * Test suite for image validation module
 *
 * @author Ricardo Massa
 */

describe("Image validation module test suite", function () {

var resourcePath = path.join(__dirname, 'resources', 'img-validator')

var msgs = {
	error: 'Error validating image',
	dimensions: {
		minimum: 'Image has not minimum size'
	},
	mimeType: 'Image has wrong mime type',
	maxFileSize: 'Image exceeds maximum allowed file size'
}

var errTranslator = new ImageErrorTranslator(msgs)

it("should refuse invalid file paths", function (done) {
	var invalidPaths = [ 
		null, 
		undefined, 
		path.join(__dirname, 'inexistent_image_file') 
	];

	async.map(invalidPaths,
		function (badPath, cb) {
			var validator = new Validator(badPath);
			validator.assertFileConstraints({maxSize: 1000000}, 
					function (err) {
						expect(err).toEqual(any(ImageValidationError));
						expect(err.innerError).not.toBeNull();
						expect(errTranslator.translate(err)).toEqual(msgs.error);
						cb(null);
					});		
		},
		function (err, results) {
			expect(results.length).toEqual(invalidPaths.length);
			done();
		});
});

it("should invalidate files which exceeds max allowed file size", function (done) {
	var filePath = path.join(resourcePath, '2000b.txt');
	var validator = new Validator(filePath);
	validator.assertFileConstraints({maxSize: 1000}, 
			function (err) {
				expect(err).toEqual(any(ImageValidationError));
				expect(err.result.reasons.length).toEqual(1);
				expect(err.result.reasons.indexOf('maxFileSize')).toBeGreaterThan(-1);
				expect(errTranslator.translate(err)).toEqual(msgs.maxFileSize);
				done();
			});		
});

it("should validate files which are in the allowed file size range", function (done) {
	var filePath = path.join(resourcePath, '2000b.txt');
	var validator = new Validator(filePath);
	validator.assertFileConstraints({maxSize: 2000}, 
			function (err) {
				expect(err).toBeNull();
				done();
			});		
});

it("should invalidate an invalid image for attribute validation", function (done) {
	var filePath = path.join(resourcePath, 'inexistent_image_file');
	var validator = new Validator(filePath);
	validator.assertAttributeConstraints({mimeTypes: ['image/png']}, 
			function (err) {
				expect(err).toEqual(any(ImageValidationError));
				expect(err.innerError).not.toBeNull();
				expect(errTranslator.translate(err)).toEqual(msgs.error);
				done();
			});		
});

it("should invalidate an image if its type isn't allowed", function (done) {
	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
	var validator = new Validator(filePath);
	validator.assertAttributeConstraints({mimeTypes: ['image/png']}, 
			function (err) {
				expect(err).toEqual(any(ImageValidationError));
				expect(err.result.reasons.length).toEqual(1);
				expect(err.result.reasons.indexOf('mimeType')).toBeGreaterThan(-1);
				expect(errTranslator.translate(err)).toEqual(msgs.mimeType);
				done();
			});		
});

// it("should validate an image if its type is allowed", function (done) {
// 	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
// 	var validator = new Validator(filePath);
// 	validator.assertAttributeConstraints({mimeTypes: ['image/jpeg', 'image/png']}, 
// 			function (err, result) {
// 				expect(err).toBeNull();
// 				expect(result.isValid).toEqual(true);
// 				expect(result.reasons.length).toEqual(0);				
// 				expect(result.metadata.mimeType).toEqual('image/jpeg');
// 				done();
// 			});		
// });

// it("should invalidate an image if it doesn't meet the minimum width requirements", function (done) {
// 	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
// 	var validator = new Validator(filePath);
// 	validator.assertAttributeConstraints({dimensions: {minWidth: 1024, minHeight: 500}}, 
// 			function (err) {
// 				expect(err).toEqual(any(ImageValidationError));
// 				expect(err.result.reasons.length).toEqual(1);
// 				expect(err.result.reasons.indexOf('minWidth')).toBeGreaterThan(-1);
// 				expect(errTranslator.translate(err)).toEqual(msgs.dimensions.minimum);
// 				done();
// 			});		
// });

// it("should invalidate an image if it doesn't meet the minimum height requirements", function (done) {
// 	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
// 	var validator = new Validator(filePath);
// 	validator.assertAttributeConstraints({dimensions: {minWidth: 400, minHeight: 1000}}, 
// 			function (err) {
// 				expect(err).toEqual(any(ImageValidationError));
// 				expect(err.result.reasons.length).toEqual(1);
// 				expect(err.result.reasons.indexOf('minHeight')).toBeGreaterThan(-1);
// 				expect(errTranslator.translate(err)).toEqual(msgs.dimensions.minimum);
// 				done();
// 			});		
// });

// it("should invalidate an image if it doesn't meet the minimum size requirements", function (done) {
// 	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
// 	var validator = new Validator(filePath);
// 	validator.assertAttributeConstraints({dimensions: {minWidth: 1024, minHeight: 768}}, 
// 			function (err) {
// 				expect(err).toEqual(any(ImageValidationError));
// 				expect(err.result.reasons.length).toEqual(2);
// 				expect(err.result.reasons.indexOf('minWidth')).toBeGreaterThan(-1);
// 				expect(err.result.reasons.indexOf('minHeight')).toBeGreaterThan(-1);
// 				expect(errTranslator.translate(err)).toEqual(msgs.dimensions.minimum);
// 				done();
// 			});		
// });

// it("should validate an image if it meets the minimum size requirements", function (done) {
// 	var filePath = path.join(resourcePath, 'guitar_800x600.jpg');
// 	var validator = new Validator(filePath);
// 	validator.assertAttributeConstraints({dimensions: {minWidth: 640, minHeight: 480}}, 
// 			function (err, result) {
// 				expect(err).toBeNull();
// 				expect(result.isValid).toEqual(true);
// 				expect(result.reasons.length).toEqual(0);
// 				expect(result.metadata.size.width).toEqual(800);
// 				expect(result.metadata.size.height).toEqual(600);
// 				done();
// 			});		
// });

});