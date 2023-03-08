var logger = require('winston');
var errors = require('./errors');

/**
 * Translates image validation errors to human readable messages
 * @param {object} messages Message map
 */
function ImageErrorTranslator (messages) {
	this._messages = normalizeMessages(messages);	
}

/**
 * Translates the given image validation error
 * @param  {ImageValidationError} error error
 * @return {string}       Message
 */
ImageErrorTranslator.prototype.translate = function (error) {
	if (!(error instanceof errors.ImageValidationError)) {
		var msg = 'Error is not an ImageValidationError instance';
		logger.error(msg, error.stack || error);
		throw new Error(msg);
	}

	var msgs = this._messages;
	var defaultMsgs = kDefaultMessages;

	// Validation process could not complete because of an error
	if (error.innerError || !error.result) {
		return msgs.error || defaultMsgs.error;
	}

	var result = error.result || {};
	var reasons = result.reasons || [];

	if (reasons.indexOf('maxFileSize') > -1) {
		return msgs.maxFileSize || defaultMsgs.maxFileSize;
	}

	if (reasons.indexOf('mimeType') > -1) {
		return msgs.mimeType || defaultMsgs.mimeType;
	}
	
	if (reasons.indexOf('minWidth') > -1 || reasons.indexOf('minHeight') > -1) {
		return msgs.dimensions.minimum || defaultMsgs.dimensions.minimum;
	}

	logger.warn('Untranslatable error', error);
	return kMsgUntranslatableError;
}

/**
 * Fills missing optional entries on custom user messages object
 * @param  {object} userMessages User messages
 * @return {object} Normalized messages object
 */
function normalizeMessages (userMessages) {
	var msgs = userMessages || {};
	msgs.dimensions = msgs.dimensions || {};
	return msgs;
}

var kMsgUntranslatableError = 'Untranslatable error';

var kDefaultMessages = {
	error: 'Unsupported image',
	dimensions: {
		minimum: 'Image does not meet minimum required size'
	},
	mimeType: 'Unsupported mime type',
	maxFileSize: 'Image file size is greater than maximum allowed'
}

/* 
 * For compliance with wire module
 */
module.exports = function () {
	var translator = Object.create(ImageErrorTranslator.prototype);
	ImageErrorTranslator.apply(translator, arguments);
	return translator;
}; 

module.exports.defaultMessages = kDefaultMessages;

module.exports.ImageErrorTranslator = ImageErrorTranslator;
