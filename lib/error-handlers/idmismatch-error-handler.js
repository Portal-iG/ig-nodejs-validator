var IdMismatchError = require('../errors').IdMismatchError;
var objectPath = require('object-path');

function IdMismatchErrorHandler (messages) {
	if (!(this instanceof IdMismatchErrorHandler))
		return new IdMismatchErrorHandler(messages);

	this._messages = messages;
}

IdMismatchErrorHandler.prototype.handleError = function (err, req, res, next) {
	if (!(err instanceof IdMismatchError)) {
		next(err);
		return;
	}

	var report = {
		code: err.getErrorKey(),
		message: objectPath.get(this._messages, err.getErrorKey(), 
				'Untranslated ID mismatch error')
	}

	res.status(400).json(report);
}

module.exports = IdMismatchErrorHandler