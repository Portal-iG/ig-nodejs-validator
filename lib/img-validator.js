var fs = require('fs');
var path = require('path');
var logger = require('winston');
var im = require('./im');
var errors = require('./errors');
var ImageValidationError = errors.ImageValidationError;

/**
 * Checks if a image file meets application requirements
 * (about size, mime type etc)
 *
 * @param {string} filePath Path of image to be validated
 * 
 * @author Ricardo Massa
 */
function ImageValidator (filePath) {
	this._filePath = filePath;
	this._fileName = path.basename(filePath);
}

/**
 * Checks if image file attributes are compatible with given conditions
 * @param {object} conditions	Conditions for a valid image file 
 *     @param {number} maxSize 		Maximum file size for image to be considered valid
 * @param  {Function} cb Callback
 * @return {void}      
 */
ImageValidator.prototype.assertFileConstraints = function (conditions, cb) {
	var self = this;
	logger.debug('Retrieving stats for file', this._filePath);

	try {
		fs.stat(this._filePath, handleStatResult)		

	} catch (e) {	// catches TypeErrors
		handleStatResult(e, null);
	}

	function handleStatResult (err, stats) {
		if (err) {
			var msg = 'Error while retrieving stats for file ' +
					self._filePath;
			logger.error(msg, err)
			var error = new ImageValidationError(msg, err);
			cb(error);
			return;
		}

		var result = {
			isValid: true,
			reasons: []
		}

		if (stats.size > conditions.maxSize) {
			result.isValid = false;
			result.reasons.push('maxFileSize');
		}

		if (!result.isValid) {
			var error = new ImageValidationError(
				'Image file does not meet given file constraints',
				result);
			cb(error);
			return;
		}

		cb(null, stats.size);
	}
}

/**
 * Checks whether image attributes match the ones on the given conditions
 * @param  {object}   conditions Conditions for a valid image
 *     @param {array<string>=} mimeTypes	Allowed mime types
 *     @param {object} dimensions 			Conditions for image dimensions
 *         @param {number=} minWidth 		Minimum allowed width (pixels)
 *         @param {number=} minHeight		Minumum allowed height (pixels)
 * @param  {Function} cb         Callback		
 * @return {void}
 */
ImageValidator.prototype.assertAttributeConstraints = function (conditions, cb) {
	var self = this;

	im(this._filePath).identify(function (err, metadata) {
		if (err) {
			var msg = 'Unable to retrieve image metadata for file' +
					self._filePath;
			logger.error(msg, err.stack || err);
			var error = new ImageValidationError(msg, err);
			cb(error);
			return;
		}

		var result = {
			isValid: true,
			metadata: {},
			conditions: conditions,
			reasons: []
		}

		if (conditions.mimeTypes) {
			logger.debug('Validating mime type of image', self._filePath);
			var mimeType = metadata['Mime type'];

			if (!mimeType)
				mimeType = 'image/' + metadata['format'].toLowerCase();

			result.metadata.mimeType = mimeType;

			self._validateMimeType(metadata, 
					conditions.mimeTypes, result.reasons);			
		}

		if (conditions.dimensions) {
			logger.debug('Validating dimensions of image', self._filePath);
			result.metadata.size = metadata.size;
			self._validateDimensions(metadata, 
					conditions.dimensions, result.reasons);			
		}

		result.isValid = (result.reasons.length == 0);

		if (!result.isValid) {
			var error = new ImageValidationError('Image attributes ' +
					'does not match given constraints', 
					result);
			cb(error);
			return;
		}

		cb(null, result);
	})
}

/**
 * Checks whether the passed image metadata is compatible with the 
 * given list of allowed mime types. 
 * Appends an reason to the `reasons` array in case of incompatibility.	
 * @param  {object} metadata     	Image metadata returned by `im.identify`
 * @param  {array<string>} allowedTypes Allowed mime types
 * @param  {array} reasons      	Array to append an incompatibility reason
 * @return {boolean}              	Whether the image is compatible
 */
ImageValidator.prototype._validateMimeType = function (metadata, allowedTypes, reasons) {
	var type = metadata['Mime type'] || ( 'image/' + metadata['format'].toLowerCase() );

	if (typeof type == 'undefined') {
		logger.debug('Unable to identify mime type from metadata', metadata)
		reasons.push('mimeType');
		return false;
	}

	if (allowedTypes.indexOf(type) == -1) {
		logger.debug('Incompatible image mime type detected:', 
			'type:', type,
			'allowed:', allowedTypes);
		reasons.push('mimeType');
		return false;
	}

	logger.debug('Image mime type is compatible');

	return true;
}

/**
 * Checks whether the passed image metadata is compatible with the 
 * given dimension constraints. 
 * Appends an reason to the `reasons` array in case of incompatibility.	
 * @param  {object} metadata     	Image metadata
 * @param {object} conditions 			Image size conditions
 *     @param {number=} minWidth 		Min allowed width (pixels)
 *     @param {number=} minHeight		Min allowed height (pixels)
 * @param  {array} reasons      	Array to append an incompatibility reason
 * @return {boolean}            	Whether the image is compatible
 */
ImageValidator.prototype._validateDimensions = function (metadata, conditions, reasons) {
	var size = metadata.size;

	if (typeof size != 'object') {
		logger.debug('Unable to identify image dimensions from metadata', metadata)
		reasons.push('dimensions');
		return false;
	}

	var valid = true;

	if (typeof conditions.minWidth != 'undefined') {
		if (typeof size.width == 'undefined' ||
				size.width < conditions.minWidth) {
			logger.debug('Image width is less than minimum allowed:', 
				'size:', size,
				'minimum width:', conditions.minWidth);
			reasons.push('minWidth');
			valid = false;
		}
	}

	if (typeof conditions.minHeight != 'undefined') {
		if (typeof size.height == 'undefined' ||
				size.height < conditions.minHeight) {
			logger.debug('Image height is less than minimum allowed:', 
				'size:', size,
				'minimum height:', conditions.minHeight);
			reasons.push('minHeight');
			valid = false;
		}
	}

	if (valid) {
		logger.debug('Image dimensions meet the minimum dimension requirements');
	}

	return valid;
}

/* 
 * For compliance with wire module
 */
module.exports = function () {
	var validator = Object.create(ImageValidator.prototype);
	ImageValidator.apply(validator, arguments);
	return validator;
}; 

module.exports.ImageValidator = ImageValidator;