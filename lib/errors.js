var util = require('util');
var logger = require('winston');

/**
 * Generated when a submited image does 
 * not meet the minimum requirements (file size, 
 * dimensions, mime type) to be processed.
 * Or when the validation process itself 
 * could not complete.
 * 
 * @param {string} message          Error message
 * @param {object|Error} resultOrErr Result object 
 *     generated by 
 *     validation engine (or error object
 *     if validation process could
 *     not complete)
 */
function ImageValidationError (message, resultOrErr) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.message = message;
	this.name = 'ImageValidationError';

	if (resultOrErr instanceof Error) {
		this.result = null;
		this.innerError = resultOrErr;	

	} else {
		this.result = resultOrErr;
		this.innerError = null;	
	}	
};

ImageValidationError.prototype.__proto__ = Error.prototype;

exports.ImageValidationError = ImageValidationError;

/**
 * Generated when a submited form data 
 * does not meet the minimum
 * requirements (required fields, field types) 
 * to be processed, or when the validation 
 * process itself could not complete.
 * 
 * @param {string} message          Error message
 * @param {object|Error} resultOrErr 	Result object 
 *     generated by 
 *     validation engine (or error object
 *     if validation process could
 *     not complete)
 */
function ValidationError (key, resultOrErr) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.message = '';
	this.key = key;
	this.name = 'ValidationError';	

	if (resultOrErr instanceof Error) {
		this.result = null;
		this.innerError = resultOrErr;	

	} else {
		this.result = resultOrErr;
		this.innerError = null;	
	}
};

ValidationError.prototype.__proto__ = Error.prototype;

ValidationError.prototype.getErrorKey = function () {
	return this.key;
}

function NotFoundError (key, result) {
	ValidationError.apply(this, [ key || 'notFound', result ]);
}

util.inherits(NotFoundError, ValidationError);

function ConflictError (key, result) {
	ValidationError.apply(this, [ key || 'conflict', result ]);
}

util.inherits(ConflictError, ValidationError);

function IdMismatchError (key, result) {
	ValidationError.apply(this, [ key || 'idMismatch', result ]);
}

util.inherits(IdMismatchError, ValidationError);

function CustomError (key, result) {
	ValidationError.apply(this, [ key || 'custom', result ]);
}

util.inherits(CustomError, ValidationError);

function SchemaValidationError (key, result) {
	ValidationError.apply(this, [ key || 'schema', result ]);
}

util.inherits(SchemaValidationError, ValidationError);

exports.ValidationError = ValidationError;
exports.NotFoundError = NotFoundError;
exports.ConflictError = ConflictError;
exports.IdMismatchError = IdMismatchError;
exports.SchemaValidationError = SchemaValidationError;
exports.CustomError = CustomError;